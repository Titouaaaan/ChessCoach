import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div style={styles.mainpage}>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

const styles = {
    mainpage: {
        backgroundColor: 'white'
    }
}

export default Layout;
