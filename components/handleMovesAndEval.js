const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://192.168.1.119:8001";

export const handleMove = async (
    source,
    target,
    game,
    setMoves,
    setEvaluation,
    getGameEval,
    setGameOverMessage,
    setIsGameOver,
    setLastMove,
    setIsCheck,
    setCheckmate,
    setStockfishLastMove,
    setIllegalMoveMessage,
    setCapturedPiecesPlayer1,
    setCapturedPiecesPlayer2
  ) => {
  try {
    // Check if the move is valid before attempting to make it
    const legalMoves = game.moves({ square: source, verbose: true });
    const isValidMove = legalMoves.some(move => move.to === target);

    if (!isValidMove) {
      setIllegalMoveMessage('Illegal move');
      return false;
    }

    const move = game.move({ from: source, to: target, promotion: "q" });
    if (move === null) {
      setIllegalMoveMessage('Illegal move');
      return false;
    }

    handleCapture(move, game.turn(), setCapturedPiecesPlayer1, setCapturedPiecesPlayer2);

    setIllegalMoveMessage(null); // Clear any previous illegal move message
    setLastMove({ from: source, to: target });

    updateGameStatus(game, setIsCheck, setCheckmate);

    const moveNumber = Math.floor(game.history().length / 2) + 1;
    const moveNotation = `${moveNumber}. ${game.turn() === "b" ? "w" : "b"}: ${getPieceName(move.piece)} - ${move.san}`;
    setMoves((prevMoves) => [...prevMoves, moveNotation]);

    const evaluation = await getGameEval(game.fen());
    setEvaluation(-evaluation);

    if (game.isGameOver()) {
      setGameOverMessage(getGameOverMessage(game));
      setIsGameOver(true);
      return true;
    }

    await makeStockfishMove(game, setMoves, setEvaluation, getGameEval, setStockfishLastMove, setCapturedPiecesPlayer1, setCapturedPiecesPlayer2, moveNumber);

    if (game.isGameOver()) {
      setGameOverMessage(getGameOverMessage(game));
      setIsGameOver(true);
    }

    return true;
  } catch (error) {
    console.error("Error handling move:", error);
    setIllegalMoveMessage('Illegal move');
    return false;
  }
};

const handleCapture = (move, turn, setCapturedPiecesPlayer1, setCapturedPiecesPlayer2) => {
  if (move.captured) {
    if (turn === "w") {
      setCapturedPiecesPlayer1((prev) => [...prev, move.captured]);
    } else {
      setCapturedPiecesPlayer2((prev) => [...prev, move.captured]);
    }
  }
};

const updateGameStatus = (game, setIsCheck, setCheckmate) => {
  setIsCheck(game.inCheck());
  setCheckmate(game.isCheckmate());
};

const getGameOverMessage = (game) => {
  if (game.isCheckmate()) {
    return game.turn() === "w" ? "Black wins by checkmate" : "White wins by checkmate";
  } else if (game.isStalemate()) {
    return "It's a draw (stalemate)";
  } else if (game.isDraw()) {
    return "It's a draw (insufficient material, threefold repetition, or 50-move rule)";
  } else {
    return "Game Over (unknown reason)";
  }
};

const makeStockfishMove = async (
    game,
    setMoves,
    setEvaluation,
    getGameEval,
    setStockfishLastMove,
    setCapturedPiecesPlayer1,
    setCapturedPiecesPlayer2,
    moveNumber
  ) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/stockfish-move/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen: game.fen() }),
    });

    if (!response.ok) throw new Error("Stockfish request failed");

    const data = await response.json();
    const stockfishMove = game.move(data.move);

    if (stockfishMove) {
      setStockfishLastMove({ from: stockfishMove.from, to: stockfishMove.to });
      handleCapture(stockfishMove, game.turn(), setCapturedPiecesPlayer1, setCapturedPiecesPlayer2);

      const stockfishMoveNotation = `${moveNumber}. ${game.turn() === "b" ? "w" : "b"}: ${getPieceName(stockfishMove.piece)} - ${stockfishMove.san}`;
      setMoves((prevMoves) => [...prevMoves, stockfishMoveNotation]);

      const newEvaluation = await getGameEval(game.fen());
      setEvaluation(newEvaluation);
    }
  } catch (error) {
    console.error("Stockfish error:", error);
    alert("Error getting computer move");
  }
};

const getPieceName = (piece) => {
  const names = { p: "Pawn", n: "Knight", b: "Bishop", r: "Rook", q: "Queen", k: "King" };
  return names[piece.toLowerCase()] || "Unknown";
};

export const getGameEval = async (fen) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/eval-position/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen }),
    });

    if (!response.ok) throw new Error("Failed to fetch game evaluation");

    const data = await response.json();
    return data.score;
  } catch (error) {
    console.error("Error fetching game evaluation:", error);
    return null;
  }
};
