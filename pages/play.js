import { useSession } from 'next-auth/react';
import ChessGame from '../components/ChessGame';
import ChatComponent from '../components/Chat';

export default function Play() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="play-container">
        <p className="login-message">
          Please <a href="/auth">login or register</a> to play chess.
        </p>
      </div>
    );
  }

  return (
    <div className="play-container">
      <h1 className="play-title">Play Chess</h1>
      <ChatComponent />
      <div className="chess-game-container">
        <ChessGame />
      </div>
    </div>
  );
}
