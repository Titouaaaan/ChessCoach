from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chess
import chess.engine
import logging
import traceback
from langchain_google_genai import ChatGoogleGenerativeAI 
from langgraph.graph import StateGraph, START, END
#from ai_agents.agents import old_model
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages 
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import AIMessage
import os

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

class FenRequest(BaseModel):
    fen: str

class StockfishLevelRequest(BaseModel):
    level: int

def get_engine_limits(level: int):
    """
    Define engine limits based on the skill level.
    """
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

        # Use 'await' for the asynchronous operation
        transport, engine = await chess.engine.popen_uci(ENGINE_PATH)

        try:
            board = chess.Board(request.fen)

            # Set the engine's skill level
            await engine.configure({"Skill Level": stockfish_level})

            # Get engine limits based on the current level
            limits = get_engine_limits(stockfish_level)
            logger.info(f"Applying engine limits: {limits}")

            # Apply the limits when requesting a move
            result = await engine.play(board, limits)
            san_move = board.san(result.move)
            return {"move": san_move}

        finally:
            # Ensure the engine is closed after the operation
            await engine.quit()

    except ValueError as e:
        logger.error(f"Invalid FEN: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid FEN: {str(e)}")

    except FileNotFoundError as e:
        logger.error(f"Stockfish binary not found: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Stockfish binary not found: {str(e)}")

    except Exception as e:
        error_trace = traceback.format_exc()  # Get full traceback
        logger.error(f"Unexpected error:\n{error_trace}")  # Log the full traceback
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    
@app.post("/api/eval-position/")
async def eval_position(request: FenRequest):
    try:
        # Log the incoming FEN to see what was sent
        logger.info(f"Received FEN: {request.fen}")
        transport, engine = await chess.engine.popen_uci(ENGINE_PATH)

        try:
            board = chess.Board(request.fen)
            info = await engine.analyse(board, chess.engine.Limit(time=0.1, depth=20))

            # Adjust the mate_score to a more reasonable value
            score = info["score"].relative.score(mate_score=1000) / 100.0 if "score" in info else None

            # Log the score result
            logger.info(f"Evaluated position: {score}")

            return {"score": score}

        finally:
            # Ensure the engine is closed after the operation
            await engine.quit()

    except ValueError as e:
        logger.error(f"Invalid FEN: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid FEN: {str(e)}")

    except FileNotFoundError as e:
        logger.error(f"Stockfish binary not found: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Stockfish binary not found: {str(e)}")

    except Exception as e:
        error_trace = traceback.format_exc()  # Get full traceback
        logger.error(f"Unexpected error:\n{error_trace}")  # Log the full traceback
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    
# ========================================================================================
# CHATBOT RELEVANT STUFF
# Here we use a langgraph graph to stream through events to interact with ai and human messages

# Old testing method
""" @app.post("/api/receive-user-input/")
async def receive_user_input(input: UserInput):
    try:
        # Generate AI response
        response = old_model.generate_content(input.message)
        return AIResponse(response=response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
 """

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
        # Process the FEN position as needed
        # For example, you can pass it to the AI agent for move suggestions
        return {"message": "FEN position received successfully"}
    except Exception as e:
        logger.error(f"Error processing FEN position: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing FEN position")

def chatbot(state: State) -> State:
    response = model.invoke(state["messages"])  # Generate AI response
    return {"messages": response}

memory = MemorySaver() # memory of the chat

#instantiation of the chatbot
credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if not credentials_path:
    raise ValueError("GOOGLE_APPLICATION_CREDENTIALS environment variable not set")
print(f"Credentials path: {credentials_path}")  # Debug statement
model_name = "gemini-2.0-flash"
model = ChatGoogleGenerativeAI(model=model_name)

# creation of the graph
# Will be extend and ported to another file for it to be more practical
graph_builder = StateGraph(State)
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_edge(START, "chatbot")
graph_builder.add_edge("chatbot", END)
graph = graph_builder.compile(checkpointer=memory)  # Compile the graph with memory
config = {"configurable": {"thread_id": "1"}} # Eventually add a unique thread id to users? Need to look into how this works

# generate a response using the user input that is fetched from the front end
@app.post('/api/generate-ai-response')
async def generate_ai_response(input: UserInput):
    try:
        logger.info("Starting AI response generation.")
        ai_response = ""  # Initialize response

        # Pass user input through graph
        for event in graph.stream(
            {"messages": [{"role": "user", "content": input.message}]},
            config=config,
            stream_mode="values"
        ):
            logger.info("Processing event.")
            for message in event["messages"]:
                # logger.info("Message type:", type(message).__name__)
                message.pretty_print() # just to display in the terminal for debugging purposes

                # Check if the message is an AIMessage
                if isinstance(message, AIMessage):
                    ai_response = str(message.content)  # Capture AI response content
                    # logger.info(f"AI Response captured: {ai_response}")

        if not ai_response:
            raise HTTPException(status_code=500, detail="No AI response generated.")

        logger.info(f"Final AI Response: {ai_response}")
        return {"response": ai_response}  # Return the final AI response after processing all events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")