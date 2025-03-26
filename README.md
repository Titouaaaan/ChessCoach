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

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Titouaaaan/ChessCoach.git
   cd ChessCoach
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up the environment variables:
   - Create a `.env` file in the root directory.
   - Add the necessary variables, such as database URL and authentication secrets.

4. Initialize the database:
   ```sh
   npx prisma migrate dev
   ```

5. Open Prisma Studio (optional, for database inspection):
   ```sh
   npx prisma studio
   ```

### Running the App

#### Development Mode
```sh
npm run dev
```

#### Production Mode
```sh
npm run build
npm start
```

## To do list

Phase 1 (before AI stuff)
- [x] add stockfish
- [ ] add a button to start playing to not always have the board displayed
- [ ] change the difficulty of stockfish based on the saved rating of the user (if there is one)
- [ ] change the difficulty of stockfish manually (choose after clicking play)
- [ ] add button to change difficulty during the game
- [ ] add a text box to print the winning odds of the game (advantage)
- [ ] make the website pretty (oh lord that will take forever)

very useful [stockfish documentation](https://python-chess.readthedocs.io/en/latest/engine.html)