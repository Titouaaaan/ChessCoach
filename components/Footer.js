import React from 'react';
import { signOut } from 'next-auth/react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>&copy; {new Date().getFullYear()} Chess Coach App.</p>
      <button onClick={() => signOut()}>Logout</button>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#ccffcc',
    padding: '10px',
    borderTop: '1px solid #ddd',
    textAlign: 'center',
  },
};

export default Footer;
