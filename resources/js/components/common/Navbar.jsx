import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <Link to="/" style={styles.link}>SOLIDAIRE</Link>
        </div>
        <div style={{ color: 'white' }}>Chargement...</div>
      </nav>
    );
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <Link to="/" style={styles.link}>SOLIDAIRE</Link>
      </div>
      <ul style={styles.navList}>
        <li><Link to="/" style={styles.link}>Accueil</Link></li>
        <li><Link to="/chambres" style={styles.link}>Chambres</Link></li>
        <li><Link to="/restaurant" style={styles.link}>Restaurant</Link></li>
        <li><Link to="/mes-reservations" style={styles.link}>Mes Réservations</Link></li>
        <li><Link to="/paiements" style={styles.link}>Paiements</Link></li>

        {user?.role === 'admin' && (
          <li><Link to="/admin" style={styles.link}>Admin</Link></li>
        )}

        {!user ? (
          <>
            <li><Link to="/login" style={styles.link}>Connexion</Link></li>
            <li><Link to="/register" style={styles.link}>Inscription</Link></li>
          </>
        ) : (
          <>
            <li style={styles.link}>Bonjour, {user.name}</li>
            <li>
              <button onClick={handleLogout} style={styles.logoutButton}>Déconnexion</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#333',
    color: 'white',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    gap: '1rem',
    margin: 0,
    padding: 0,
    alignItems: 'center',
  },
  link: {
    textDecoration: 'none',
    color: 'white',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default Navbar;
