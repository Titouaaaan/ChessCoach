import { useSession, signOut } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>Access Denied</p>;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>You are logged in!</p>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
}
