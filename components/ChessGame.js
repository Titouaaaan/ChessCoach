import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import GameOverModal from "./GameOverModal";

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (game.isGameOver()) {
      setIsGameOver(true);
    }
  }, [game]);

  const handleStockfishMove = async (source, target) => {
    const newGame = new Chess(game.fen());
    const move = newGame.move({ from: source, to: target, promotion: "q" });

    if (move === null) return false;
    setGame(newGame);

    if (newGame.isGameOver()) {
      setIsGameOver(true);
      return true;
    }

    try {
      const response = await fetch("http://localhost:8001/api/stockfish-move/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen: newGame.fen() }),
      });

      if (!response.ok) throw new Error("Stockfish request failed");

      const data = await response.json();
      const stockfishGame = new Chess(newGame.fen());
      stockfishGame.move(data.move);
      setGame(stockfishGame);

      if (stockfishGame.isGameOver()) setIsGameOver(true);
    } catch (error) {
      console.error("Stockfish error:", error);
      alert("Error getting computer move");
    }

    return true;
  };

  const resetGame = () => {
    if (window.confirm("Are you sure you want to reset the game?")) {
      setGame(new Chess());
      setIsGameOver(false);
    }
  };

  return (
    <div className="chessContainer">
      <div className="chessSidebar">
        <button className="chessMenuButton" onClick={resetGame}> Reset Game</button>
      </div>
      <div className="chessBoardContainer">
        <Chessboard
          position={game.fen()}
          onPieceDrop={handleStockfishMove}
          boardWidth={Math.min(window.innerWidth * 0.7, window.innerHeight * 0.7)}
        />
      </div>
      {isGameOver && <GameOverModal onClose={() => setIsGameOver(false)} />}
    </div>
  );
};

export default ChessGame;
