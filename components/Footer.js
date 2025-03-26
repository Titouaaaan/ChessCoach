import React from 'react';
import { signOut } from 'next-auth/react';

const Footer = () => {
  return (
    <footer className='footer'>
      <p>&copy; {new Date().getFullYear()} Chess Coach App.</p>
      <button onClick={() => signOut()}>Logout</button>
    </footer>
  );
};

export default Footer;