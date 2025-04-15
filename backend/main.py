from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chess
import chess.engine
import logging
import traceback
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import AIMessage, ToolMessage
import os
import json
from dotenv import load_dotenv
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import BaseTool, tool
from tools import LLMAnalyzeFENPositionTool

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "ChessCoachBackend is working!"}

# ========================================================================================
# Stockfish relevant stuff

# Path to Stockfish engine
ENGINE_PATH = r"./engines/Stockfish-sf_15/src/stockfish"

# Global variable to store Stockfish level
stockfish_level = 1

# Global variable to store the current chessboard state
current_board = chess.Board()

class FenRequest(BaseModel):
    fen: str

class StockfishLevelRequest(BaseModel):
    level: int

def get_engine_limits(level: int):
    """Define engine limits based on the skill level."""
    if level == 0:
        return chess.engine.Limit(time=0.1, depth=1, nodes=1000)
    elif level <= 5:
        return chess.engine.Limit(time=0.5, depth=3, nodes=5000)
    elif level <= 10:
        return chess.engine.Limit(time=1.0, depth=5, nodes=10000)
    elif level <= 15:
        return chess.engine.Limit(time=2.0, depth=10, nodes=50000)
    else:
        return chess.engine.Limit(time=5.0, depth=20, nodes=100000)

@app.post("/api/set-stockfish-level/")
async def set_stockfish_level(request: StockfishLevelRequest):
    global stockfish_level
    if not (0 <= request.level <= 20):
        raise HTTPException(status_code=400, detail="Stockfish level must be between 0 and 20")
    stockfish_level = request.level
    logger.info(f"Stockfish level set to {stockfish_level}")
    return {"message": f"Stockfish level set to {stockfish_level}"}

@app.get("/api/get-stockfish-level/")
async def get_stockfish_level():
    logger.info(f"Current Stockfish level: {stockfish_level}")
    return {"level": stockfish_level}

@app.post("/api/stockfish-move/")
async def get_stockfish_move(request: FenRequest):
    try:
        logger.info(f"Stockfish path: {ENGINE_PATH}")
        logger.info(f"Current Stockfish level: {stockfish_level}")
        logger.info(f"Received FEN: {request.fen}")

        transport, engine = await chess.engine.popen_uci(ENGINE_PATH)

        try:
            board = chess.Board(request.fen)
            await engine.configure({"Skill Level": stockfish_level})
            limits = get_engine_limits(stockfish_level)
            logger.info(f"Applying engine limits: {limits}")
            result = await engine.play(board, limits)
            san_move = board.san(result.move)

            # Update the global board state
            global current_board
            current_board = request.fen

            return {"move": san_move}
        finally:
            await engine.quit()

    except ValueError as e:
        logger.error(f"Invalid FEN: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid FEN: {str(e)}")
    except FileNotFoundError as e:
        logger.error(f"Stockfish binary not found: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Stockfish binary not found: {str(e)}")
    except Exception as e:
        error_trace = traceback.format_exc()
        logger.error(f"Unexpected error:\n{error_trace}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/api/eval-position/")
async def eval_position(request: FenRequest):
    try:
        logger.info(f"Received FEN: {request.fen}")
        transport, engine = await chess.engine.popen_uci(ENGINE_PATH)

        try:
            board = chess.Board(request.fen)
            info = await engine.analyse(board, chess.engine.Limit(time=0.1, depth=20))
            score = info["score"].relative.score(mate_score=1000) / 100.0 if "score" in info else None
            logger.info(f"Evaluated position: {score}")

            # Update the global board state
            global current_board
            current_board = request.fen

            return {"score": score}
        finally:
            await engine.quit()

    except ValueError as e:
        logger.error(f"Invalid FEN: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid FEN: {str(e)}")
    except FileNotFoundError as e:
        logger.error(f"Stockfish binary not found: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Stockfish binary not found: {str(e)}")
    except Exception as e:
        error_trace = traceback.format_exc()
        logger.error(f"Unexpected error:\n{error_trace}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# ========================================================================================
# CHATBOT RELEVANT STUFF

online_search = TavilySearchResults(max_results=2)

class UserInput(BaseModel):
    message: str

class State(TypedDict):
    messages: Annotated[list, add_messages]

class FenPositionRequest(BaseModel):
    fen: str

@app.post("/api/send-fen")
async def receive_fen_position(request: FenPositionRequest):
    try:
        logger.info(f"Received FEN position: {request.fen}")
        # Update the global board state
        global current_board
        current_board = request.fen
        return {"message": "FEN position received successfully"}
    except Exception as e:
        logger.error(f"Error processing FEN position: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing FEN position")

def chatbot(state: State) -> State:
    response = model.invoke(state["messages"])
    return {"messages": response}

memory = MemorySaver()


class BasicToolNode:
    """A node that runs the tools requested in the last AIMessage."""

    def __init__(self, tools: list) -> None:
        self.tools_by_name = {tool.name: tool for tool in tools}

    def __call__(self, inputs: dict):
        if messages := inputs.get("messages", []):
            message = messages[-1]
        else:
            raise ValueError("No message found in input")

        if not isinstance(message, AIMessage):
            raise ValueError("Last message must be an AIMessage with tool_calls")

        outputs = []
        for tool_call in message.tool_calls:
            tool_result = self.tools_by_name[tool_call["name"]].invoke(tool_call.get("args"))
            outputs.append(
                ToolMessage(
                    content=json.dumps(tool_result),
                    name=tool_call["name"],
                    tool_call_id=tool_call["id"],
                )
            )
        return {"messages": outputs}

analyze_fen_tool = LLMAnalyzeFENPositionTool()
tool_node_tools = [online_search, analyze_fen_tool]
tool_node = BasicToolNode(tools=tool_node_tools)

# Initialize tools for the model separately if needed
model_tools = [online_search, analyze_fen_tool]  # Add other compatible tools here

def route_tools(state: State):
    """Use in the conditional_edge to route to the ToolNode if the last message has tool calls. Otherwise, route to the end."""
    if isinstance(state, list):
        ai_message = state[-1]
    elif messages := state.get("messages", []):
        ai_message = messages[-1]
    else:
        raise ValueError(f"No messages found in input state to tool_edge: {state}")
    if hasattr(ai_message, "tool_calls") and len(ai_message.tool_calls) > 0:
        return "tools"
    return END

model_name = "gemini-2.0-flash"
model = ChatGoogleGenerativeAI(model=model_name)
model = model.bind_tools(model_tools)  # Bind only compatible tools

graph_builder = StateGraph(State)
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_node("tools", tool_node)
graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")
graph_builder.add_conditional_edges("chatbot", route_tools, {"tools": "tools", END: END})

graph = graph_builder.compile(checkpointer=memory)
config = {"configurable": {"thread_id": "1"}}

@app.post('/api/generate-ai-response')
async def generate_ai_response(input: UserInput):
    try:
        logger.info("Starting AI response generation.")
        ai_response = ""
        user_message = f"Use your tools to answer the following: {input.message}"
        for event in graph.stream(
            {"messages": [{"role": "user", "content": user_message}]},
            config=config,
            stream_mode="values"
        ):
            logger.info("Processing event.")
            for message in event["messages"]:
                message.pretty_print()
                if isinstance(message, AIMessage):
                    ai_response = str(message.content)
        if not ai_response:
            raise HTTPException(status_code=500, detail="No AI response generated.")
        logger.info(f"Final AI Response: {ai_response}")
        return {"response": ai_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
