import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css'; // Import global styles if any

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
