import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import GameOverModal from "./GameOverModal";

const ChessGame = () => {
  const [game, setGame] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [stockfishLevel, setStockfishLevel] = useState(null);
  const [levelMessage, setLevelMessage] = useState("Loading...");
  const [evaluation, setEvaluation] = useState(null);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [moves, setMoves] = useState([]);

  const getPieceName = (piece) => {
    const names = { p: "Pawn", n: "Knight", b: "Bishop", r: "Rook", q: "Queen", k: "King" };
    return names[piece.toLowerCase()] || "Unknown";
  };

  useEffect(() => {
    const fetchStockfishLevel = async () => {
      try {
        const response = await fetch("http://localhost:8001/api/get-stockfish-level/");
        if (!response.ok) throw new Error("Failed to fetch Stockfish level");
        const data = await response.json();
        setStockfishLevel(data.level);
        setLevelMessage(`Current Level: ${data.level}`);
      } catch (error) {
        console.error("Error fetching Stockfish level:", error);
        setLevelMessage("No engine created for playing yet");
      }
    };

    fetchStockfishLevel();
  }, []);

  const handleMove = async (source, target) => {
    const move = game.move({ from: source, to: target, promotion: "q" });
    if (move === null) return false;

    const moveNumber = Math.floor(game.history().length / 2) + 1;
    const moveNotation = `${moveNumber}. ${game.turn() === "b" ? "w" : "b"}: ${getPieceName(move.piece)} - ${move.san}`;

    setMoves((prevMoves) => [...prevMoves, moveNotation]);

    if (game.isGameOver()) {
      let resultMessage = "";

      if (game.isCheckmate()) {
        resultMessage = game.turn() === "w" ? "Black wins by checkmate" : "White wins by checkmate";
      } else if (game.isStalemate()) {
        resultMessage = "It's a draw (stalemate)";
      } else if (game.isDraw()) {
        resultMessage = "It's a draw (insufficient material, threefold repetition, or 50-move rule)";
      } else {
        resultMessage = "Game Over (unknown reason)";
      }

      setGameOverMessage(resultMessage);
      setIsGameOver(true);
      return true;
    }

    try {
      const response = await fetch("http://localhost:8001/api/stockfish-move/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen: game.fen() }),
      });

      if (!response.ok) throw new Error("Stockfish request failed");

      const data = await response.json();
      const stockfishMove = game.move(data.move);

      const stockfishMoveNotation = `${moveNumber}. ${game.turn() === "b" ? "w" : "b"}: ${getPieceName(stockfishMove.piece)} - ${stockfishMove.san}`;
      setMoves((prevMoves) => [...prevMoves, stockfishMoveNotation]);

      if (game.isGameOver()) {
        let resultMessage = "";

        if (game.isCheckmate()) {
          resultMessage = game.turn() === "w" ? "Black wins by checkmate" : "White wins by checkmate";
        } else if (game.isStalemate()) {
          resultMessage = "It's a draw (stalemate)";
        } else if (game.isDraw()) {
          resultMessage = "It's a draw (insufficient material, threefold repetition, or 50-move rule)";
        } else {
          resultMessage = "Game Over (unknown reason)";
        }

        setGameOverMessage(resultMessage);
        setIsGameOver(true);
      }
    } catch (error) {
      console.error("Stockfish error:", error);
      alert("Error getting computer move");
    }

    return true;
};


  const changeStockfishLevel = async (event) => {
    const newLevel = parseInt(event.target.value, 10);
    setStockfishLevel(newLevel);
    setLevelMessage(`Current Level: ${newLevel}`);

    try {
      await fetch("http://localhost:8001/api/set-stockfish-level/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: newLevel }),
      });
    } catch (error) {
      console.error("Error setting Stockfish level:", error);
    }
  };

  const getGameEval = async (fen) => {
    try {
      const response = await fetch("http://localhost:8001/api/eval-position/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen }),
      });

      if (!response.ok) throw new Error("Failed to fetch game evaluation");

      const data = await response.json();
      setEvaluation(data.score);
    } catch (error) {
      console.error("Error fetching game evaluation:", error);
    }
  };

  const startNewGame = () => {
    setGame(new Chess());
    setMoves([]);
    setIsGameOver(false);
    setGameOverMessage("");
    setEvaluation(null);
  };

  return (
    <div className="chessContainer">
      <div className="chessSidebar">
        <button className="chessMenuButton" onClick={startNewGame}>
          Start Game
        </button>
        <div>
          <label htmlFor="stockfish-level">Stockfish Level:</label>
          <select id="stockfish-level" value={stockfishLevel} onChange={changeStockfishLevel}>
            {Array.from({ length: 21 }, (_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div>
          <strong>Position Evaluation:</strong> {evaluation !== null ? evaluation : "N/A"}
        </div>
      </div>
      <div className="chessBoardContainer">
        {game && (
          <Chessboard
            position={game.fen()}
            onPieceDrop={handleMove}
            boardWidth={Math.min(window.innerWidth * 0.7, window.innerHeight * 0.7)}
          />
        )}
      </div>
      <div className="moveHistory">
        <h3>Move History</h3>
        <ul>
          {moves.map((move, index) => (
            <li key={index} style={{ backgroundColor: index % 2 === 0 ? "lightgray" : "darkgray", padding: "5px", borderRadius: "3px" }}>
              {move}
            </li>
          ))}
        </ul>
      </div>
      {isGameOver && <GameOverModal message={gameOverMessage} onClose={() => setIsGameOver(false)} />}
    </div>
  );
};

export default ChessGame;