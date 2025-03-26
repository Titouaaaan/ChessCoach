import Link from 'next/link';

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to ChessCoach</h1>
      <div className="home-description">
        <p>
          ChessCoach is a Next.js application that serves as a personal chess coach. 
          The app integrates a chess bot for gameplay and uses an AI-powered assistant to analyze 
          and comment on games in real-time.
        </p>
      </div>
      
      <div className="home-features">
        <h2>Features</h2>
        <ul className="feature-list">
          <li>Play Against a Bot: Challenge a chess bot that adapts to your skill level.</li>
          <li>AI Game Commentary: The AI assistant provides insights during the game, such as openings, tactics, and key moments.</li>
          <li>Move Suggestions: Get coaching advice based on your gameplay.</li>
          <li>Game Review: Analyze completed games with AI-generated feedback.</li>
        </ul>
        
        <h2>Tech Stack</h2>
        <ul className="tech-stack-list">
          <li>Next.js: React-based framework for building web applications.</li>
          <li>NextAuth.js: Authentication for user login and session management.</li>
          <li>Prisma: ORM for managing the database.</li>
          <li>LangGraph: AI agent orchestration for game analysis and commentary.</li>
          <li>Chess Bot API / Local Engine: Integration for adaptive gameplay.</li>
        </ul>
      </div>
    </div>
  );
}
