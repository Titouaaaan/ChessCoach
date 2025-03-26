const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const isWindows = process.platform === "win32";

// Backend paths
const backendPath = path.join(__dirname, "backend");
const venvPath = path.join(backendPath, "backendvenv");

// Frontend paths (root folder since there's no separate frontend folder)
const rootPath = __dirname;
const nodeModulesPath = path.join(rootPath, "node_modules");

// Prisma paths
const prismaFolderPath = path.join(rootPath, "prisma");
const prismaGeneratedPath = path.join(nodeModulesPath, ".prisma");

// Check if the virtual environment exists
const venvExists = fs.existsSync(venvPath);

// Check if node_modules exists (i.e., frontend dependencies are installed)
const frontendDepsExist = fs.existsSync(nodeModulesPath);

// Check if Prisma is initialized (prisma folder exists & generated client is available)
const prismaInitialized = fs.existsSync(prismaFolderPath) && fs.existsSync(prismaGeneratedPath);

// Backend commands (create & activate venv, install requirements, start FastAPI)
const createAndRunVenvWindows = `cd ${backendPath} && python -m venv backendvenv && backendvenv\\Scripts\\activate && pip install -r requirements.txt && uvicorn main:app --port 8001`;
const createAndRunVenvUnix = `cd ${backendPath} && python3 -m venv backendvenv && source backendvenv/bin/activate && pip install -r requirements.txt; uvicorn main:app --port 8001`;

const activateAndRunWindows = `cd ${backendPath} && backendvenv\\Scripts\\activate && uvicorn main:app --port 8001`;
const activateAndRunUnix = `cd ${backendPath} && source backendvenv/bin/activate && uvicorn main:app --port 8001`;

const backendCmd = isWindows
  ? `start cmd /k "${venvExists ? activateAndRunWindows : createAndRunVenvWindows}"`
  : `osascript -e 'tell application "Terminal" to do script "${venvExists ? activateAndRunUnix : createAndRunVenvUnix}"'`;

// Frontend & Prisma commands
const installAndRunFrontendWindows = `cd ${rootPath} && npm install && ${
  prismaInitialized ? "" : "npx prisma init && npx prisma generate && npx prisma migrate dev --name init &&"
} npm run dev`;

const installAndRunFrontendUnix = `cd ${rootPath} && npm install; ${
  prismaInitialized ? "" : "npx prisma init && npx prisma generate && npx prisma migrate dev --name init;"
} npm run dev`;

const runFrontendWindows = `cd ${rootPath} && npm run dev`;
const runFrontendUnix = `cd ${rootPath} && npm run dev`;

const frontendCmd = isWindows
  ? `start cmd /k "${frontendDepsExist ? runFrontendWindows : installAndRunFrontendWindows}"`
  : `osascript -e 'tell application "Terminal" to do script "${frontendDepsExist ? runFrontendUnix : installAndRunFrontendUnix}"'`;

// Start both servers
exec(backendCmd);
exec(frontendCmd);
