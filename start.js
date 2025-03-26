const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const isWindows = process.platform === "win32";

// Backend paths
const backendPath = path.join(__dirname, "backend");
const venvPath = path.join(backendPath, "backendvenv");

// Frontend paths (now in the root folder)
const rootPath = __dirname;
const nodeModulesPath = path.join(rootPath, "node_modules");

// Check if the virtual environment exists
const venvExists = fs.existsSync(venvPath);

// Check if node_modules exists (i.e., frontend dependencies are installed)
const frontendDepsExist = fs.existsSync(nodeModulesPath);

// Backend commands (create & activate venv, install requirements, start FastAPI)
const createAndRunVenvWindows = `cd ${backendPath} && python -m venv backendvenv && backendvenv\\Scripts\\activate && pip install -r requirements.txt && uvicorn main:app --port 8001`;
const createAndRunVenvUnix = `cd ${backendPath} && python3 -m venv backendvenv && source backendvenv/bin/activate && pip install -r requirements.txt; uvicorn main:app --port 8001`;

const activateAndRunWindows = `cd ${backendPath} && backendvenv\\Scripts\\activate && uvicorn main:app --port 8001`;
const activateAndRunUnix = `cd ${backendPath} && source backendvenv/bin/activate && uvicorn main:app --port 8001`;

const backendCmd = isWindows
  ? `start cmd /k "${venvExists ? activateAndRunWindows : createAndRunVenvWindows}"`
  : `osascript -e 'tell application "Terminal" to do script "${venvExists ? activateAndRunUnix : createAndRunVenvUnix}"'`;

// Frontend commands (install dependencies if missing, then start Next.js)
const installAndRunFrontendWindows = `cd ${rootPath} && npm install && npm run dev`;
const installAndRunFrontendUnix = `cd ${rootPath} && npm install; npm run dev`;

const runFrontendWindows = `cd ${rootPath} && npm run dev`;
const runFrontendUnix = `cd ${rootPath} && npm run dev`;

const frontendCmd = isWindows
  ? `start cmd /k "${frontendDepsExist ? runFrontendWindows : installAndRunFrontendWindows}"`
  : `osascript -e 'tell application "Terminal" to do script "${frontendDepsExist ? runFrontendUnix : installAndRunFrontendUnix}"'`;

// Start both servers
exec(backendCmd);
exec(frontendCmd);
