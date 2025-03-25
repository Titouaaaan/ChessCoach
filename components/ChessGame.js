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

  const handleMove = (source, target) => {
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
    <div style={styles.container}>
        <div style={styles.sidebar}>
        <button style={styles.menuButton} onClick={resetGame}>
          Reset Game
        </button>
      </div>
      <div style={styles.boardContainer}>
        <Chessboard position={game.fen()} onPieceDrop={handleMove} boardWidth={Math.min(600, window.innerWidth - 20)} />
      </div>
      {isGameOver && <GameOverModal onClose={closeModal} />}
    </div>
  );
};

const styles = 
    {
        container: {
        display: 'flex',
        width : '170vh',
        height: '100vh',
        padding: '20px',
        backgroundColor: 'white'
        },

        sidebar: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '150px',
        padding: '20px',
        backgroundColor: 'white',
        borderRight: '1px solid #ddd',
        },

        boardContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        },

        menuButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        marginBottom: '10px',
        },
    };

export default ChessGame;