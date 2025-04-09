import { Chess } from "chess.js";
import React, { useState, useEffect, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import GameOverModal from "./GameOverModal";
import { handleMove, getGameEval } from "./handleMovesAndEval";
import { fetchStockfishLevel, changeStockfishLevel } from "./fetchStockfishLevel";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://192.168.1.119:8001";
const STOCKFISH_LEVELS = 21;

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
  const [isBoardInteractable, setIsBoardInteractable] = useState(true);
  const [capturedPiecesPlayer1, setCapturedPiecesPlayer1] = useState([]);
  const [capturedPiecesPlayer2, setCapturedPiecesPlayer2] = useState([]);

  useEffect(() => {
    fetchStockfishLevel(setStockfishLevel, setLevelMessage);
  }, []);

  useEffect(() => {
    if (illegalMoveMessage) {
      const timer = setTimeout(() => {
        setIllegalMoveMessage(null);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [illegalMoveMessage]);

  useEffect(() => {
    if (game.isCheckmate()) {
      setIsBoardInteractable(false);
      setIsGameOver(true);
      setGameOverMessage("Checkmate!");
    }
  }, [game]);

  useEffect(() => {
    if (hasGameStarted) {
      sendFenPositionToBackend(game.fen());
    }
  }, [game, hasGameStarted]);

  const startNewGame = () => {
    setGame(new Chess());
    setMoves([]);
    setIsGameOver(false);
    setGameOverMessage("");
    setEvaluation(null);
    setHasGameStarted(true);
    setIllegalMoveMessage(null);
    setIsBoardInteractable(true);
    setCapturedPiecesPlayer1([]);
    setCapturedPiecesPlayer2([]);
  };

  const sendFenPositionToBackend = async (fen) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/send-fen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('FEN position sent successfully:', data);
      } else {
        console.error('Error sending FEN position:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getPieceSymbol = (piece) => {
    const symbols = {
      p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔",
      P: "♟", N: "♞", B: "♝", R: "♜", Q: "♛", K: "♚"
    };
    return symbols[piece] || "?";
  };

  const getSquareStyles = useMemo(() => {
    const styles = {};
    const currentTurn = game.turn();

    if (lastMove && currentTurn === "b") {
      styles[lastMove.from] = { backgroundColor: "lightyellow" };
      styles[lastMove.to] = { backgroundColor: "lightyellow" };
    }

    if (stockfishLastMove && currentTurn === "w") {
      styles[stockfishLastMove.from] = { backgroundColor: "lightblue" };
      styles[stockfishLastMove.to] = { backgroundColor: "lightblue" };
    }

    if (game.inCheck()) {
      const kingSquare = game.board().flat().find(piece => piece && piece.type === "k" && piece.color === currentTurn)?.square;
      if (kingSquare) {
        styles[kingSquare] = { backgroundColor: "red" };
      }
    }

    if (game.isCheckmate()) {
      const kingSquare = game.board().flat().find(piece => piece && piece.type === "k" && piece.color === currentTurn)?.square;
      if (kingSquare) {
        styles[kingSquare] = { backgroundColor: "darkred" };
      }
    }
    return styles;
  }, [game, lastMove, stockfishLastMove]);

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
              {Array.from({ length: STOCKFISH_LEVELS }, (_, i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <strong>Position Evaluation:</strong> {evaluation !== null ? evaluation : "N/A"}
          </div>
        </div>
        <div className="chessBoardContainer" style={{ position: "relative" }}>
          <div className="capturedPieces">
            <strong>Engine captures:</strong>
            <div>{capturedPiecesPlayer2.map((piece, index) => (
              <span key={index} style={{ fontSize: "24px" }}>{getPieceSymbol(piece)}</span>
            ))}</div>
          </div>
          {game && (
            <>
              <Chessboard
                position={hasGameStarted ? game.fen() : "8/8/8/8/8/8/8/8 w - - 0 1"}
                onPieceDrop={
                  isBoardInteractable && hasGameStarted && !isGameOver ? (source, target) =>
                      handleMove(source, target, game, setMoves, setEvaluation, getGameEval,
                      setGameOverMessage, setIsGameOver, setLastMove, setIsCheck, setCheckmate,
                      setStockfishLastMove, setIllegalMoveMessage,
                      setCapturedPiecesPlayer1, setCapturedPiecesPlayer2) : undefined}
                boardWidth={Math.min(window.innerWidth * 0.7, window.innerHeight * 0.7)}
                customSquareStyles={getSquareStyles}
              />
              {!isBoardInteractable && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "transparent",
                    zIndex: 10,
                  }}
                />
              )}
            </>
          )}
          <div className="capturedPieces">
            <strong>Player captures:</strong>
            <div>{capturedPiecesPlayer1.map((piece, index) => (
              <span key={index} style={{ fontSize: "24px" }}>{getPieceSymbol(piece)}</span>
            ))}</div>
          </div>
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
      {isGameOver && <GameOverModal message={gameOverMessage} onClose={() => { setIsGameOver(false); setIsBoardInteractable(false); }} />}
    </div>
  );
};

export default ChessGame;
