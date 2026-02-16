import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>© {new Date().getFullYear()} NomDuProjet. Tous droits réservés.</p>
    </footer>
  );
};

const styles = {
  footer: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#333',
    color: '#fff',
    textAlign: 'center',
  },
};

export default Footer;
