// src/components/reservation/ReservationForm.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ReservationForm = ({ type, itemId, checkInDate, checkOutDate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reservationData = {
        ...formData,
        type,
        item_id: itemId,
        start_date: checkInDate,
        end_date: checkOutDate
      };

      await api.post('/reservations', reservationData);
      setSuccess(true);
      setTimeout(() => navigate('/mes-reservations'), 2000);
    } catch (err) {
      setError('Erreur lors de la réservation. Veuillez réessayer.');
    }
  };

  return (
    <div className="reservation-form">
      <h2>Réserver {type === 'room' ? 'une chambre' : 'une table'}</h2>
      {error && <div className="error-message">{error}</div>}
      {success ? (
        <div className="success-message">
          Réservation confirmée! Redirection en cours...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Nom complet"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="phone"
            placeholder="Téléphone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <textarea
            name="specialRequests"
            placeholder="Demandes spéciales"
            value={formData.specialRequests}
            onChange={handleChange}
          />
          <button type="submit">Confirmer la réservation</button>
        </form>
      )}
    </div>
  );
};

export default ReservationForm;