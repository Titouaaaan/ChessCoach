import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import GameOverModal from './GameOverModal';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (game.isGameOver()) {
      setIsGameOver(true);
    }
  }, [game]);

  const handleRandomMove = (source, target) => {
    const newGame = new Chess(game.fen()); // Clone game state
    const move = newGame.move({
      from: source,
      to: target,
      promotion: "q", // Auto-promote to queen
    });

    if (move === null) return false; // Invalid move

    setGame(newGame);

    // Bot move
    if (!newGame.isGameOver()) {
      setTimeout(() => {
        const moves = newGame.moves();
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          newGame.move(randomMove);
          setGame(new Chess(newGame.fen()));
        }
      }, 500);
    }
  }; 

  const handleStockfishMove = async (source, target) => {
    // Clone current game state
    const newGame = new Chess(game.fen());
    
    // Attempt user move
    const move = newGame.move({
      from: source,
      to: target,
      promotion: "q",
    });
  
    if (move === null) return false;
  
    // Update state with user move
    setGame(newGame);
  
    // Check game over after user move
    if (newGame.isGameOver()) {
      setIsGameOver(true);
      return true;
    }
  
    try {
      // Get Stockfish move from backend
      const response = await fetch("http://localhost:8001/api/stockfish-move/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fen: newGame.fen() }),
      });
  
      if (!response.ok) throw new Error("Stockfish request failed");
  
      const data = await response.json();
      const stockfishGame = new Chess(newGame.fen());
      
      // Apply Stockfish move
      stockfishGame.move(data.move);
      setGame(stockfishGame);
  
      // Check game over after Stockfish move
      if (stockfishGame.isGameOver()) {
        setIsGameOver(true);
      }
    } catch (error) {
      console.error("Stockfish error:", error);
      alert("Error getting computer move");
    }
  
    return true;
  };  

  const resetGame = () => {
    const confirmReset = window.confirm("Are you sure you want to reset the game?");
    if (confirmReset) {
      setGame(new Chess()); // Reset to initial position
      setIsGameOver(false); // Reset game over state
    }
  };

  const closeModal = () => {
    setIsGameOver(false);
  };

  return (
    <div className="chessContainer">
      <div className="chessSidebar">
        <button className="chessMenuButton" onClick={resetGame}>
          Reset Game
        </button>
      </div>
      <div className="chessBoardContainer">
        <Chessboard
          position={game.fen()}
          onPieceDrop={handleStockfishMove}
          boardWidth={Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8)}
        />
      </div>
      {isGameOver && <GameOverModal onClose={closeModal} />}
    </div>
  );
};

export default ChessGame;