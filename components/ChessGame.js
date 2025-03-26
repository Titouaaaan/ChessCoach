import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import GameOverModal from "./GameOverModal";

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [isGameOver, setIsGameOver] = useState(false);
  const [stockfishLevel, setStockfishLevel] = useState(null);
  const [levelMessage, setLevelMessage] = useState("Loading...");

  useEffect(() => {
    if (game.isGameOver()) {
      setIsGameOver(true);
    }
  }, [game]);

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

  return (
    <div className="chessContainer">
      <div className="chessSidebar">
        <button className="chessMenuButton" onClick={() => setGame(new Chess())}> Reset Game</button>
        <div>
          <label htmlFor="stockfish-level">Stockfish Level:</label>
          <select id="stockfish-level" value={stockfishLevel} onChange={changeStockfishLevel}>
            {Array.from({ length: 21 }, (_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        {/* Uncomment this to see the current stock fish level (mostly for debugging */}
        {/* <div>
          <p>{levelMessage}</p>
        </div> */}
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
