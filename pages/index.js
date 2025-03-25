import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Welcome to the App</h1>
      <p>Please <Link href="/login">login</Link> to continue.</p>
      <p>Or <Link href="/register">register</Link> to continue.</p>
    </div>
  );
}
