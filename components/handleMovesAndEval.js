export const handleMove = async (source, target, game, setMoves, setEvaluation, getGameEval, setGameOverMessage, setIsGameOver) => {
  const move = game.move({ from: source, to: target, promotion: "q" });
  if (move === null) return false;

  const moveNumber = Math.floor(game.history().length / 2) + 1;
  const moveNotation = `${moveNumber}. ${game.turn() === "b" ? "w" : "b"}: ${getPieceName(move.piece)} - ${move.san}`;

  setMoves((prevMoves) => [...prevMoves, moveNotation]);

  // Evaluate the position after the player's move
  const evaluation = await getGameEval(game.fen());
  console.log("Evaluation after player's move:", evaluation); // Debugging log
  setEvaluation(evaluation);

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
    const response = await fetch("http://localhost:8001/api/stockfish-move/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen: game.fen() }),
    });

    if (!response.ok) throw new Error("Stockfish request failed");

    const data = await response.json();
    const stockfishMove = game.move(data.move);

    const stockfishMoveNotation = `${moveNumber}. ${game.turn() === "b" ? "w" : "b"}: ${getPieceName(stockfishMove.piece)} - ${stockfishMove.san}`;
    setMoves((prevMoves) => [...prevMoves, stockfishMoveNotation]);

    // Evaluate the position after Stockfish's move
    const newEvaluation = await getGameEval(game.fen());
    console.log("Evaluation after Stockfish's move:", newEvaluation); // Debugging log
    setEvaluation(newEvaluation);

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
  } catch (error) {
    console.error("Stockfish error:", error);
    alert("Error getting computer move");
  }

  return true;
};

const getPieceName = (piece) => {
  const names = { p: "Pawn", n: "Knight", b: "Bishop", r: "Rook", q: "Queen", k: "King" };
  return names[piece.toLowerCase()] || "Unknown";
};

export const getGameEval = async (fen) => {
  try {
    console.log("Fetching evaluation for FEN:", fen); 
    const response = await fetch("http://localhost:8001/api/eval-position/", {
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
