import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'client',
  });

  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
       ...formData,
       [e.target.name]: e.target.value
     });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    // Validation côté client
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setLoading(false);
      return;
    }

    try {
      console.log('Données envoyées:', formData); // Debug

      const response = await axios.post(
        'http://localhost:8000/api/auth/register',
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          role: formData.role, // S'assurer que le rôle est bien envoyé
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('Réponse du serveur:', response.data); // Debug

      setMessage(`Inscription réussie avec le rôle ${formData.role}. Vous pouvez maintenant vous connecter.`);
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'client',
      });

    } catch (err) {
      console.error('Erreur complète:', err.response); // Debug
      
      if (err.response?.data?.errors) {
        // Gérer les erreurs de validation Laravel
        const errors = err.response.data.errors;
        const errorMessages = [];
        
        Object.keys(errors).forEach(key => {
          if (Array.isArray(errors[key])) {
            errorMessages.push(...errors[key]);
          } else {
            errorMessages.push(errors[key]);
          }
        });
        
        setError(errorMessages.join(', '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 422) {
        setError('Données invalides. Vérifiez tous les champs.');
      } else {
        setError("Une erreur s'est produite lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form" style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Créer un compte</h2>
      
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffebee', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '15px' 
        }}>
          {error}
        </div>
      )}
      
      {message && (
        <div style={{ 
          color: 'green', 
          backgroundColor: '#e8f5e8', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '15px' 
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nom :</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email :</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Téléphone :</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Mot de passe :</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Confirmer mot de passe :</label>
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Rôle : <span style={{ fontSize: '12px', color: '#666' }}>(Sélection actuelle: {formData.role})</span>
          </label>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="client">Client</option>
            <option value="receptionist">Réceptionniste</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: loading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>

      {/* Section de debug - à retirer en production */}
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', fontSize: '12px' }}>
        <strong>Debug - Données actuelles:</strong>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Register;