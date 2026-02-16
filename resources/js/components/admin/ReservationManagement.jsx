// src/components/admin/ReservationManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const endpoint = statusFilter === 'all' 
          ? '/admin/reservations' 
          : `/admin/reservations?status=${statusFilter}`;
        
        const response = await api.get(endpoint);
        setReservations(response.data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [statusFilter]);

  const updateReservationStatus = async (id, newStatus) => {
    try {
      await api.put(`/admin/reservations/${id}`, { status: newStatus });
      setReservations(reservations.map(res => 
        res.id === id ? { ...res, status: newStatus } : res
      ));
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="reservation-management">
      <h2>Gestion des Réservations</h2>
      <div className="filters">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Toutes</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmées</option>
          <option value="cancelled">Annulées</option>
          <option value="completed">Terminées</option>
        </select>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Type</th>
            <th>Date début</th>
            <th>Date fin</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(reservation => (
            <tr key={reservation.id}>
              <td>{reservation.id}</td>
              <td>{reservation.user.name}</td>
              <td>{reservation.type === 'room' ? 'Chambre' : 'Table'}</td>
              <td>{new Date(reservation.start_date).toLocaleDateString()}</td>
              <td>{new Date(reservation.end_date).toLocaleDateString()}</td>
              <td>{reservation.status}</td>
              <td>
                {reservation.status === 'pending' && (
                  <>
                    <button onClick={() => updateReservationStatus(reservation.id, 'confirmed')}>
                      Confirmer
                    </button>
                    <button onClick={() => updateReservationStatus(reservation.id, 'cancelled')}>
                      Annuler
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationManagement;