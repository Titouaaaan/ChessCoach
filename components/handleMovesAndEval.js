export const handleMove = async (source, target, game,
                                 setMoves, setEvaluation, getGameEval, setGameOverMessage,
                                 setIsGameOver, setLastMove, setIsCheck, setCheckmate,
                                 setStockfishLastMove, setIllegalMoveMessage,
                                 setCapturedPiecesPlayer1, setCapturedPiecesPlayer2) => {
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

  // Handle captures
  if (move.captured) {
    if (game.turn() === "w") {
      setCapturedPiecesPlayer1((prev) => [...prev, move.captured]);
    } else {
      setCapturedPiecesPlayer2((prev) => [...prev, move.captured]);
    }
  }

  setIllegalMoveMessage(null); // Clear any previous illegal move message
  setLastMove({ from: source, to: target });

  // Check if the current player's king is in check
  if (game.inCheck()) {
    setIsCheck(true);
  } else {
    setIsCheck(false);
  }

  // Check if the current player is in checkmate
  if (game.isCheckmate()) {
    setCheckmate(true);
  } else {
    setCheckmate(false);
  }

  const moveNumber = Math.floor(game.history().length / 2) + 1;
  const moveNotation = `${moveNumber}. ${game.turn() === "b" ? "w" : "b"}: ${getPieceName(move.piece)} - ${move.san}`;

  setMoves((prevMoves) => [...prevMoves, moveNotation]);

  // Evaluate the position after the player's move
  const evaluation = await getGameEval(game.fen());
  console.log("Evaluation after player's move:", evaluation); // Debugging log
  setEvaluation(-evaluation);

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
    const response = await fetch(
      "http://192.168.1.119:8001/api/stockfish-move/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen: game.fen() }),
      }
    );

  if (!response.ok) throw new Error("Stockfish request failed");

  const data = await response.json();
  const stockfishMove = game.move(data.move);

  if (stockfishMove) {
    setStockfishLastMove({ from: stockfishMove.from, to: stockfishMove.to });

  // Handle captures by Stockfish
  if (stockfishMove.captured) {
    if (game.turn() === "w") {
      setCapturedPiecesPlayer1((prev) => [...prev, stockfishMove.captured]);
    } else {
      setCapturedPiecesPlayer2((prev) => [...prev, stockfishMove.captured]);
    }
  }
  
  const stockfishMoveNotation = `${moveNumber}. ${game.turn() === "b" ? "w" : "b"}: ${getPieceName(stockfishMove.piece)} - ${stockfishMove.san}`;
  setMoves((prevMoves) => [...prevMoves, stockfishMoveNotation]);

  // Evaluate the position after Stockfish's move
  const newEvaluation = await getGameEval(game.fen());
  console.log("Evaluation after Stockfish's move:", newEvaluation);
  setEvaluation(newEvaluation);
  }

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
  } 
  catch (error) {
  console.error("Stockfish error:", error);
  alert("Error getting computer move");
  }

  return true;
  } catch (error) {
  console.error("Error handling move:", error);
  setIllegalMoveMessage('Illegal move');
  return false;
  }
};

const getPieceName = (piece) => {
  const names = { p: "Pawn", n: "Knight", b: "Bishop", r: "Rook", q: "Queen", k: "King" };
  return names[piece.toLowerCase()] || "Unknown";
};

export const getGameEval = async (fen) => {
  try {
    console.log("Fetching evaluation for FEN:", fen);
    const response = await fetch("http://192.168.1.119:8001/api/eval-position/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen }),
    });

    if (!response.ok) throw new Error("Failed to fetch game evaluation");

    const data = await response.json();
    console.log("Evaluation data received:", data);
    return data.score;
  } catch (error) {
    console.error("Error fetching game evaluation:", error);
    return null;
  }
};