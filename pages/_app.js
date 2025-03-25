import { SessionProvider } from 'next-auth/react';
import Layout from '../components/layout';
import '../styles/globals.css'; // Import global styles if any

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}

export default MyApp;
