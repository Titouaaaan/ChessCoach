const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const isWindows = process.platform === "win32";
const backendPath = path.join(__dirname, "backend");
const venvPath = path.join(backendPath, isWindows ? "backendvenv\\Scripts\\activate" : "backendvenv/bin/activate");

// Check if the virtual environment exists
const venvExists = fs.existsSync(path.join(backendPath, "backendvenv"));

// Commands to create and activate the virtual environment
const createVenvWindows = `cd ${backendPath} && python -m venv backendvenv && backendvenv\\Scripts\\activate && pip install -r requirements.txt`;
const createVenvUnix = `cd ${backendPath} && python3 -m venv backendvenv && source backendvenv/bin/activate && pip install -r requirements.txt`;

const activateVenvWindows = `cd ${backendPath} && backendvenv\\Scripts\\activate && uvicorn main:app --port 8001`;
const activateVenvUnix = `cd ${backendPath} && source backendvenv/bin/activate && uvicorn main:app --port 8001`;

// Determine which command to run
const backendCmd = isWindows
  ? `start cmd /k "${venvExists ? activateVenvWindows : createVenvWindows}"`
  : `osascript -e 'tell application "Terminal" to do script "${venvExists ? activateVenvUnix : createVenvUnix}"'`;

const frontendCmd = isWindows
  ? `start cmd /k "npm run dev"`
  : `osascript -e 'tell application "Terminal" to do script "npm run dev"'`;

// Start both servers
exec(backendCmd);
exec(frontendCmd);
