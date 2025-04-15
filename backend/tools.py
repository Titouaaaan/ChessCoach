import chess
from langchain_core.tools import BaseTool, tool
import json

def piece_value(piece: chess.Piece) -> int:
    """Helper function to evaluate material value of a piece."""
    values = {
        chess.PAWN: 1,
        chess.KNIGHT: 3,
        chess.BISHOP: 3,
        chess.ROOK: 5,
        chess.QUEEN: 9,
        chess.KING: 0  # King value is technically infinite, but irrelevant for material
    }
    return values.get(piece.piece_type, 0)

class LLMAnalyzeFENPositionTool(BaseTool):
    name: str = "analyze_fen_tool"
    description: str = (
        "Analyze the current chess position on the board (fetched automatically). "
        "Use this tool to get a human-readable summary of the current game state. "
        "You do NOT need to provide any input like a FEN string — the tool will handle it."
    )

    def _run(self, input: str) -> str:
        try:
            from main import current_board
            fen = current_board  # Or load from somewhere else in state
            board = chess.Board(fen)

            white_material = sum([piece_value(piece) for piece in board.piece_map().values() if piece.color == chess.WHITE])
            black_material = sum([piece_value(piece) for piece in board.piece_map().values() if piece.color == chess.BLACK])

            analysis = {
                "turn": "White" if board.turn == chess.WHITE else "Black",
                "material": {
                    "white": white_material,
                    "black": black_material,
                    "advantage": "White" if white_material > black_material else "Black" if black_material > white_material else "Equal"
                },
                "castling_rights": board.castling_xfen(),
                "en_passant": board.ep_square if board.ep_square else None,
                "is_check": board.is_check(),
                "is_checkmate": board.is_checkmate(),
                "is_stalemate": board.is_stalemate(),
                "is_insufficient_material": board.is_insufficient_material(),
                "is_legal": board.is_valid()
            }

            prompt = (
                "You are a chess coach. Analyze the following position for the user:\n\n"
                f"FEN: {fen}\n\n"
                f"Board Summary: {json.dumps(analysis, indent=2)}\n\n"
                "Provide a human-readable explanation of the position, who's ahead, and what to consider next."
            )
            from main import model
            response = model.invoke([prompt])
            return response.content if hasattr(response, "content") else str(response)

        except Exception as e:
            return f"Error analyzing board position: {str(e)}"

    async def _arun(self, input: str) -> str:
        return self._run(input)
