from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chess
import chess.engine
import os

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to Stockfish engine
ENGINE_PATH = r".\engines\stockfish\stockfish-windows-x86-64-avx2.exe"

# Add after BaseModel import
class FenRequest(BaseModel):
    fen: str

@app.get("/")
async def root():
    return {"message": "ChessCoachBackend is working!"}

# Add after CORS middleware setup
@app.post("/api/stockfish-move/")
async def get_stockfish_move(request: FenRequest):
    try:
        # Initialize Stockfish engine
        transport, engine = await chess.engine.popen_uci(ENGINE_PATH)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to initialize Stockfish engine: {str(e)}"
        )
    
    try:
        board = chess.Board(request.fen)
        
        # Configure engine settings
        await engine.configure({"Skill Level": 20})
        
        # Get best move with 1 second limit
        result = await engine.play(
            board, 
            chess.engine.Limit(time=1.0),
            info=chess.engine.INFO_ALL
        )
        
        # Convert to SAN notation
        san_move = board.san(result.move)
        
        return {"move": san_move}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid FEN: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await engine.quit()

print([route.path for route in app.routes])