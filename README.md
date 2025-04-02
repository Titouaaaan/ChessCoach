# ChessCoach

ChessCoach is a Next.js application that serves as a personal chess coach. The app integrates a chess bot for gameplay and uses an AI-powered assistant to analyze, comment on games in real-time and guide the player to get better. 

## Features

- **Play Against a Bot**: Challenge a chess bot that (can) adapts to your skill level.
- **AI Game Commentary**: The AI assistant provides insights during the game, such as openings, tactics, and key moments based on stockfish analysis.
- **Move Suggestions**: Get coaching advice based on your gameplay.
- **Game Review**: Analyze completed games with AI-generated feedback.

## Tech Stack

- **Next.js** - React-based framework for building web applications.
- **NextAuth.js** - Authentication for user login and session management.
- **Prisma** - ORM for managing the database.
- **LangGraph** - AI agent orchestration for game analysis and commentary.
- **Chess Bot API / Local Engine** - Classic chess engine integration for adaptive gameplay.
- **FastAPI** - High-performance API framework for Python.

## Pre-requisites

Make sure you have the following installed before proceeding:

Node.js & npm – Download and install from [nodejs.org](https://nodejs.org/en) (npm comes with Node.js).

Python (3.8 or later) – Install from [python.org](https://www.python.org/) and ensure it’s added to your system PATH.

You can check if they are installed by running:
```sh
node -v  # Should print the Node.js version
npm -v   # Should print the npm version
python --version  # Should print the Python version
```

### Installation

Clone the repository:
   ```sh
   git clone https://github.com/Titouaaaan/ChessCoach.git
   cd ChessCoach
   ```

To install all the dependencies automatically there is a script that does it for you (if you don't want to do that you can do it the old school way by following the next section)

On windows, simply run the script
```sh
run.bat
```

and on linux/mac
```sh
run.sh
```
but make sure to make it executable but running this command in the terminal first (for linux/mac users only)
```sh
chmod +x run.sh
```

After doing that go in the ```.env file``` and add your API key under GOOGLE_API_KEY="yourapikey" (you can get a free gemini key [here](https://ai.google.dev/gemini-api))

I didn't test it on linux and mac so it could act funky (please let me know if you find errors)

### Manually install dependencies (without .bat/.sh)
1. Install dependencies:
   ```sh
   npm install
   ```
   and for the backend go to the **backend** folder  and 
   ```sh
   pip install -r requirements.txt
   ```

2. Set up the environment variables:
   - Create a `.env` file in the root directory.
   - Add your API key in the file under GOOGLE_API_KEY="yourapikey" (link in previous section for free keys)

3. Initialize the database (you might need to initialize and generate it too):
   ```sh
   npx prisma init
   npx prisma generate
   npx prisma migrate dev
   ```
   If the DB is also configured and present you don't have to do all that but follow what it says in your terminal.

4. Open Prisma Studio (optional, for database inspection):
   ```sh
   npx prisma studio
   ```

### Running the App (without .bat/.sh)

#### Development Mode
```sh
npm run dev
```

#### Production Mode
```sh
npm run build
npm start
```

#### Backend
Make sure you init the venv (backendvenv for ex.) like this:
```
backendvenv\Scripts\activate
```
or this for linux/mac
```
source backendvenv/bin/activate
```

```sh
uvicorn backend.main:app --reload --port 8001
```

| Endpoint                     | Method | Description                                  |
|------------------------------|--------|----------------------------------------------|
| `/`                          | GET    | Health check                                |
| `/api/get-stockfish-level/`  | GET    | Retrieve the current Stockfish skill level  |
| `/api/set-stockfish-level/`  | POST   | Set the Stockfish skill level (0-20)       |
| `/api/stockfish-move/`       | POST   | Get the best move for a given FEN position |
| `/api/eval-position/`        | POST   | Evaluate a given chess position (FEN)      |
| `/api/generate-ai-response`  | POST   | Generate an AI prompt based on a user input |

## To do list

Phase 1 (not AI stuff)
- [x] add stockfish
- [x] add a button to start playing to not always have the board displayed
- [ ] change the difficulty of stockfish based on the saved rating of the user (if there is one)
- [x] change the difficulty of stockfish manually (choose after clicking play)
- [x] add button to change difficulty during the game
- [x] add a text box to print the winning odds of the game (advantage)
- [x] add a logging system for debugging 
- [ ] improve the user profile (elo, game history etc...)
- [ ] make the website pretty (oh lord that will take forever)
- [ ] make a proper UI when installing the project (two terminals looks fishy)

Phase 2 
- [x] create basic agent to ask questions
- [x] add memory of conversation
- [ ] tool to read info from user profile
- [ ] tool to fetch state of the board
- [ ] tool to fetch best n moves from stockfish 
- [ ] add llm guidelines for general behavior (main prompt)

very useful [stockfish documentation](https://python-chess.readthedocs.io/en/latest/engine.html)
