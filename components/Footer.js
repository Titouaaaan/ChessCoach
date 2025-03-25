import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>&copy; {new Date().getFullYear()} Chess Coach App.</p>
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
