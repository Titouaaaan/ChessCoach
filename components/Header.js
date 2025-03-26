import React from 'react';

const Header = () => {
  return (
    <header className='header'>
      <h1 className='header-title'>Chess Coach</h1>
      <nav className='header-nav'>
        <a href="/" className='header-link'>Home</a>
        <a href="/play" className='header-link'>Play Chess</a>
        <a href="/dashboard" className='header-link'>Dashboard</a>
        <a href="/auth" className='header-link'>Auth</a>
      </nav>
    </header>
  );
};

export default Header;
