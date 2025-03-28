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
  const [lastMove, setLastMove] = useState(null);
  const [isCheck, setIsCheck] = useState(false);
  const [checkmate, setCheckmate] = useState(false);
  const [stockfishLastMove, setStockfishLastMove] = useState(null);
  const [illegalMoveMessage, setIllegalMoveMessage] = useState(null);

  useEffect(() => {
    fetchStockfishLevel(setStockfishLevel, setLevelMessage);
  }, []);

  useEffect(() => {
    if (illegalMoveMessage) {
      const timer = setTimeout(() => {
        setIllegalMoveMessage(null);
      }, 1000);

      // Clear the timeout if the component unmounts or the message changes
      return () => clearTimeout(timer);
    }
  }, [illegalMoveMessage]);

  const startNewGame = () => {
    setGame(new Chess());
    setMoves([]);
    setIsGameOver(false);
    setGameOverMessage("");
    setEvaluation(null);
    setHasGameStarted(true);
    setIllegalMoveMessage(null);
  };

  const getSquareStyles = () => {
    const styles = {};
    const currentTurn = game.turn(); // 'w' for White, 'b' for Black
  
    // Highlight only the last move of the player who just moved
    if (lastMove && currentTurn === "b") {
      styles[lastMove.from] = { backgroundColor: "lightyellow" };
      styles[lastMove.to] = { backgroundColor: "lightyellow" };
    }
  
    if (stockfishLastMove && currentTurn === "w") {
      styles[stockfishLastMove.from] = { backgroundColor: "lightblue" };
      styles[stockfishLastMove.to] = { backgroundColor: "lightblue" };
    }
  
    // Check for check at the beginning of the turn
    if (game.inCheck()) {
      const kingSquare = game.board().flat().find(piece => piece && piece.type === "k" && piece.color === currentTurn)?.square;
      if (kingSquare) {
        styles[kingSquare] = { backgroundColor: "red" };
      }
    }
  
    // Highlight checkmate in dark red
    if (game.isCheckmate()) {
      const kingSquare = game.board().flat().find(piece => piece && piece.type === "k" && piece.color === currentTurn)?.square;
      if (kingSquare) {
        styles[kingSquare] = { backgroundColor: "darkred" };
      }
    }
  
    return styles;
  };
  
  return (
    <div className="chessContainer">
      <div className="chessRowContainer">
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
              onPieceDrop={hasGameStarted && !isGameOver ? (source, target) => handleMove(source, target, game, setMoves, setEvaluation, getGameEval, setGameOverMessage, setIsGameOver, setLastMove, setIsCheck, setCheckmate, setStockfishLastMove, setIllegalMoveMessage) : undefined}
              boardWidth={Math.min(window.innerWidth * 0.7, window.innerHeight * 0.7)}
              customSquareStyles={getSquareStyles()} // Pass the function here
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
      </div>
      {illegalMoveMessage && <div className="illegalMoveMessage">{illegalMoveMessage}</div>}
      {isGameOver && <GameOverModal message={gameOverMessage} onClose={() => setIsGameOver(false)} />}
    </div>
  );  
};

export default ChessGame;