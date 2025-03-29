const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');

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

// .env file path
const envFilePath = path.join(rootPath, '.env');

// Generate a new secret key for NEXTAUTH_SECRET
const newSecret = crypto.randomBytes(32).toString('hex');

// Content for the .env file
const envContent = `# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=${newSecret}
`;

// Write the content to the .env file
fs.writeFileSync(envFilePath, envContent, 'utf8');

console.log('.env file created or updated with the following content:');
console.log(envContent);

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
  !prismaInitialized ? "npx prisma generate && npx prisma migrate dev --name init &&" : ""
} npm run dev`;

const installAndRunFrontendUnix = `cd ${rootPath} && npm install; ${
  !prismaInitialized ? "npx prisma generate && npx prisma migrate dev --name init;" : ""
} npm run dev`;

const runFrontendWindows = `cd ${rootPath} && npm run dev`;
const runFrontendUnix = `cd ${rootPath} && npm run dev`;

const frontendCmd = isWindows
  ? `start cmd /k "${frontendDepsExist ? runFrontendWindows : installAndRunFrontendWindows}"`
  : `osascript -e 'tell application "Terminal" to do script "${frontendDepsExist ? runFrontendUnix : installAndRunFrontendUnix}"'`;

// Start both servers
exec(backendCmd);
exec(frontendCmd);
