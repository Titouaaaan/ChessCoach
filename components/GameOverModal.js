import React from 'react';

const GameOverModal = ({ onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="chessmodal-overlay" onClick={handleOverlayClick}>
      <div className="chessmodal-modal">
        <button className="chessmodal-closeButton" onClick={onClose}>
          &times;
        </button>
        <p className="chessmodal-modalText">Game Over!</p>
      </div>
    </div>
  );
};

export default GameOverModal;