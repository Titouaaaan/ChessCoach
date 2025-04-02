import os
import getpass
from dotenv import load_dotenv
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages 
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver
import google.generativeai as genai  # google-generativeai package
from langchain_google_genai import ChatGoogleGenerativeAI 

memory = MemorySaver()

# Load API key from .env file
load_dotenv()
# Retrieve the API key
if "GOOGLE_API_KEY" not in os.environ:
    # Prompt the user to enter the API key if not set
    os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter your Google AI API key: ")

load_dotenv()
MY_API_KEY = os.getenv("GEMINI_API_KEY")

model = ChatGoogleGenerativeAI(model="gemini-1.5-pro")
genai.configure(api_key=MY_API_KEY)
old_model = genai.GenerativeModel("gemini-2.0-flash")

# Define state structure for conversation
class State(TypedDict):
    messages: Annotated[list, add_messages]  # Append messages instead of overwriting

def chatbot(state: State) -> State:
    
    response = model.invoke(state["messages"])  # Generate AI response

    # Append the AI response as a new message
    return {"messages": response}

# Build conversation flow using LangGraph
graph_builder = StateGraph(State)
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_edge(START, "chatbot")
graph_builder.add_edge("chatbot", END)
graph = graph_builder.compile(checkpointer=memory)  # Compile the graph with memory
config = {"configurable": {"thread_id": "1"}}

# Function to stream conversation updates
def stream_graph_updates(user_input: str):
    for event in graph.stream(
        {"messages": [{"role": "user", "content": user_input}]},
        config=config,
        stream_mode="values",):
        for value in event:
            event["messages"][-1].pretty_print()

# Chat loop
if __name__ == "__main__":
    try:
        while True:
            user_input = input("User: ")
            if user_input.lower() in ["quit", "exit", "q"]:
                print("Goodbye!")
                break
            stream_graph_updates(user_input)
    except KeyboardInterrupt:
        print("\nGoodbye!")