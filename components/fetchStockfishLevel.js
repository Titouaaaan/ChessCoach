// fetchStockfishLevel.js

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://192.168.1.119:8001";

/**
 * Fetches the current Stockfish level from the backend.
 * @param {Function} setStockfishLevel - State setter for the Stockfish level.
 * @param {Function} setLevelMessage - State setter for the level message.
 */
export const fetchStockfishLevel = async (setStockfishLevel, setLevelMessage) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/get-stockfish-level/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Stockfish level");
    }

    const data = await response.json();
    setStockfishLevel(data.level);
    setLevelMessage(`Current Level: ${data.level}`);
  } catch (error) {
    console.error("Error fetching Stockfish level:", error);
    setLevelMessage("Failed to retrieve engine level. Please try again later.");
  }
};

/**
 * Changes the Stockfish level on the backend.
 * @param {number} newLevel - The new Stockfish level to set.
 * @param {Function} setStockfishLevel - State setter for the Stockfish level.
 * @param {Function} setLevelMessage - State setter for the level message.
 */
export const changeStockfishLevel = async (newLevel, setStockfishLevel, setLevelMessage) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/set-stockfish-level/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: newLevel }),
    });

    if (!response.ok) {
      throw new Error("Failed to set Stockfish level");
    }

    setStockfishLevel(newLevel);
    setLevelMessage(`Current Level: ${newLevel}`);
  } catch (error) {
    console.error("Error setting Stockfish level:", error);
    setLevelMessage("Failed to update engine level. Please try again later.");
  }
};
