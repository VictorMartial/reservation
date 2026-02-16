import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from './AuthContext.jsx'; // adapte le chemin si besoin

export const AuthModal = ({ isOpen, onClose, mode, onToggleMode }) => {
  const { login, register, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let result;
    if (mode === 'login') {
      result = await login({ email: formData.email, password: formData.password });
    } else {
      // Pour register, on envoie tous les champs
      result = await register(formData);
    }

    if (result.success) {
      onClose();
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
      });
    } else {
      setError(result.error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            {mode === 'login' ? 'Connexion' : 'Inscription'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <input
                type="text"
                placeholder="Nom complet"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {mode === 'register' && (
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={formData.password_confirmation}
              onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onToggleMode} className="text-blue-600 hover:text-blue-800">
            {mode === 'login' ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
};
