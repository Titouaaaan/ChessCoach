import React from 'react';

const Header = () => {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Chess Coach</h1>
      <nav style={styles.nav}>
        <a href="/" style={styles.link}>Home</a>
        <a href="/play" style={styles.link}>Play Chess</a>
        <a href="/dashboard" style={styles.link}>Dashboard</a>
        <a href="/auth" style={styles.link}>Auth</a>
      </nav>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#ccffcc',
    padding: '20px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '24px',
  },
  nav: {
    display: 'flex',
    gap: '20px',
  },
  link: {
    textDecoration: 'none',
    color: '#000000',
    fontSize: '16px',
  },
};

export default Header;
