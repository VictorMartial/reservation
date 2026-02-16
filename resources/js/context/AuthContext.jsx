import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/apiService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
  const [loading, setLoading] = useState(true);

  // Récupère l'utilisateur avec le token
  const fetchUser = async (authToken) => {
    if (!authToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      // S'assurer que le token est configuré dans les headers
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      const response = await api.get('/auth/user');
      setUser(response.data);
    } catch (error) {
      console.error('Erreur fetchUser:', error);
      // Si erreur 401, le token n'est plus valide
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Configurer le token dans les headers axios au démarrage
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser(token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token]);

  // Fonction login qui gère la connexion et récupère l'utilisateur
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', credentials);
      const { token: authToken, refreshToken: newRefreshToken, user: userReceived } = response.data;

      // Stocke le token et configure les headers
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      setToken(authToken);
      setRefreshToken(newRefreshToken);

      // Si l'API renvoie directement l'utilisateur, on l'utilise
      if (userReceived) {
        setUser(userReceived);
      } else {
        // Sinon, on appelle fetchUser pour récupérer l'utilisateur
        await fetchUser(authToken);
      }
      return { success: true };
    } catch (error) {
      console.error('Erreur login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur de connexion' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Envoyer la requête de déconnexion si on a un token
      if (token) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.warn('Erreur logout (ignorée)', error);
    } finally {
      // Nettoyer l'état et le localStorage dans tous les cas
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  // Fonction pour vérifier si l'utilisateur est connecté
  const isAuthenticated = () => {
    return !!(token && user);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      refreshToken,
      login, 
      logout, 
      loading, 
      isAuthenticated: isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);