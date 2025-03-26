# ChessCoach

ChessCoach is a Next.js application that serves as a personal chess coach. The app integrates a chess bot for gameplay and uses an AI-powered assistant to analyze and comment on games in real-time.

## Features

- **Play Against a Bot**: Challenge a chess bot that adapts to your skill level.
- **AI Game Commentary**: The AI assistant provides insights during the game, such as openings, tactics, and key moments.
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

## Stuff that will be done 

- Enhance AI analysis with deeper chess understanding.
- Implement a user ranking and tracking system.
- Add support for different chess variants.
