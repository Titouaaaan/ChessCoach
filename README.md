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
- **Uvicorn** - ASGI server for running FastAPI.

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
but make sure to make it executable but running this command in the terminal first
```sh
chmod +x run.sh
```

I didn't test it on linux and mac so it could act funky (please let me know if you find errors)

#### Manually install dependencies if .sh/.bat doesn't work
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
   - Add the necessary variables, such as database URL and authentication secrets.

3. Initialize the database (you might need to initialize and generate it too):
   ```sh
   npx prisma init
   npx prisma generate
   npx prisma migrate dev
   ```

4. Open Prisma Studio (optional, for database inspection):
   ```sh
   npx prisma studio
   ```

### Running the App (useful if the .bat/.sh didn't work)

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

| Endpoint               | Method | Description                         |
|------------------------|--------|-------------------------------------|
| `/`                   | GET    | Health check                       |
| `/api/test`           | GET    | Engine connectivity test           |
| `/api/stockfish-move/` | POST   | Get best move for a given FEN position |


## To do list

Phase 1 (before AI stuff)
- [x] add stockfish
- [ ] add a button to start playing to not always have the board displayed
- [ ] change the difficulty of stockfish based on the saved rating of the user (if there is one)
- [ ] change the difficulty of stockfish manually (choose after clicking play)
- [ ] add button to change difficulty during the game
- [ ] add a text box to print the winning odds of the game (advantage)
- [ ] add a logging system for debugging or game review 
- [ ] make the website pretty (oh lord that will take forever)

Phase 2 
TBD

very useful [stockfish documentation](https://python-chess.readthedocs.io/en/latest/engine.html)