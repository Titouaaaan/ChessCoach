from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chess
import chess.engine
import os
import logging

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

# Path to Stockfish engine
ENGINE_PATH = r"./engines/stockfish/stockfish-windows-x86-64-avx2.exe"

# Global variable to store Stockfish level
stockfish_level = 1

class FenRequest(BaseModel):
    fen: str

class StockfishLevelRequest(BaseModel):
    level: int

@app.get("/")
async def root():
    return {"message": "ChessCoachBackend is working!"}

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
        transport, engine = await chess.engine.popen_uci(ENGINE_PATH)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize Stockfish engine: {str(e)}")

    try:
        board = chess.Board(request.fen)

        # Apply configuration after engine initialization
        await engine.configure({"Skill Level": stockfish_level})
        logger.info(f"Configured Stockfish with skill level: {stockfish_level}")

        result = await engine.play(board, chess.engine.Limit(time=1.0))
        san_move = board.san(result.move)
        return {"move": san_move}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid FEN: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await engine.quit()

