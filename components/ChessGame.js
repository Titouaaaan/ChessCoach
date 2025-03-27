import { Chess } from "chess.js";
import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import GameOverModal from "./GameOverModal";
import { handleMove, getGameEval } from "./handleMovesAndEval";
import { fetchStockfishLevel, changeStockfishLevel } from "./fetchStockfishLevel";

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [stockfishLevel, setStockfishLevel] = useState(null);
  const [levelMessage, setLevelMessage] = useState("Loading...");
  const [evaluation, setEvaluation] = useState(null);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [moves, setMoves] = useState([]);

  useEffect(() => {
    fetchStockfishLevel(setStockfishLevel, setLevelMessage);
  }, []);

  const startNewGame = () => {
    setGame(new Chess());
    setMoves([]);
    setIsGameOver(false);
    setGameOverMessage("");
    setEvaluation(null);
    setHasGameStarted(true);
  };

  return (
    <div className="chessContainer">
      <div className="chessSidebar">
        <button className="chessMenuButton" onClick={startNewGame}>
          Start Game
        </button>
        <div>
          <label htmlFor="stockfish-level">Stockfish Level:</label>
          <select
            id="stockfish-level"
            value={stockfishLevel}
            onChange={(e) => changeStockfishLevel(parseInt(e.target.value, 10), setStockfishLevel, setLevelMessage)}
          >
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
            position={hasGameStarted ? game.fen() : "8/8/8/8/8/8/8/8 w - - 0 1"}
            onPieceDrop={hasGameStarted ? (source, target) => handleMove(source, target, game, setMoves, setEvaluation, getGameEval, setGameOverMessage, setIsGameOver) : undefined}
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
