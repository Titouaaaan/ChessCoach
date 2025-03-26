from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chess
import chess.engine
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
        async with chess.engine.popen_uci(ENGINE_PATH) as engine:
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
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid FEN: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
