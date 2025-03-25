import { useSession } from 'next-auth/react';
import ChessGame from '../components/ChessGame';

export default function Play() {
  const { data: session } = useSession();

  if (!session) {
    return <p>Please <a href="/login">login</a> to play chess.</p>;
  }

  return (
    <div>
      <h1>Play Chess</h1>
      <div style={styles.chessboard}>
        <ChessGame />
      </div>
    </div>
  );
}

const styles = {
    chessboard : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
}
