import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter automatiquement le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si erreur 401 (non autorisé) et pas déjà tenté de rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tenter de rafraîchir le token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await axios.post(
          'http://localhost:8000/api/auth/refresh', 
          { refresh_token: refreshToken }
        );
        
        const { token: newToken, refreshToken: newRefreshToken } = response.data;
        
        // Mettre à jour les tokens
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        api.defaults.headers.Authorization = `Bearer ${newToken}`;
        
        // Retenter la requête originale
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);
        // Si le rafraîchissement échoue, déconnecter
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common['Authorization'];
        
        // Rediriger vers login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;