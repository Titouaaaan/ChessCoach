// fetchStockfishLevel.js

export const fetchStockfishLevel = async (setStockfishLevel, setLevelMessage) => {
  try {
    const response = await fetch("http://127.0.0.1:8001/api/get-stockfish-level/");
    if (!response.ok) throw new Error("Failed to fetch Stockfish level");
    const data = await response.json();
    setStockfishLevel(data.level);
    setLevelMessage(`Current Level: ${data.level}`);
  } catch (error) {
    console.error("Error fetching Stockfish level:", error);
    setLevelMessage("No engine created for playing yet");
  }
};

export const changeStockfishLevel = async (newLevel, setStockfishLevel, setLevelMessage) => {
  setStockfishLevel(newLevel);
  setLevelMessage(`Current Level: ${newLevel}`);

  try {
    await fetch("http://127.0.0.1:8001/api/set-stockfish-level/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: newLevel }),
    });
  } catch (error) {
    console.error("Error setting Stockfish level:", error);
  }
};
