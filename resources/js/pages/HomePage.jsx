import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../services/apiService'; // adapte le chemin selon ton projet

const HomePage = () => {
  const [reservations, setReservations] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Veuillez vous connecter pour accéder à cette page.');
      setLoading(false);
      return;
    }

    fetchUserAndReservations();
  }, []);

  const fetchUserAndReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const userResponse = await api.get('/auth/user');
      const userData = userResponse.data;
      setUser(userData);

      let reservationsData = [];

      if (userData.role === 'admin') {
        const res = await api.get('/reservations');
        reservationsData = res.data;
      } else if (userData.role === 'receptionist') {
        const [pendingRes, todayRes] = await Promise.all([
          api.get('/reception/reservations/pending'),
          api.get('/reception/reservations/today'),
        ]);
        reservationsData = [...pendingRes.data, ...todayRes.data].filter(
          (r, i, self) => i === self.findIndex(x => x.id === r.id)
        );
      } else if (userData.role === 'client') {
        const res = await api.get('/reservations');
        reservationsData = res.data.filter(r => r.user_id === userData.id);
      }

      setReservations(reservationsData);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || err.message || 'Erreur de récupération des données.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReservation = async (id) => {
    try {
      setActionLoading((p) => ({ ...p, [`confirm_${id}`]: true }));
      const res = await api.patch(`/reservations/${id}/confirmer`);
      setReservations((prev) => prev.map((r) => (r.id === id ? res.data : r)));
      alert('Réservation confirmée.');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Erreur lors de la confirmation');
    } finally {
      setActionLoading((p) => ({ ...p, [`confirm_${id}`]: false }));
    }
  };

  const handleCancelReservation = async (id) => {
    if (!confirm('Annuler cette réservation ?')) return;
    try {
      setActionLoading((p) => ({ ...p, [`cancel_${id}`]: true }));
      const res = await api.patch(`/reservations/${id}/annuler`);
      setReservations((prev) => prev.map((r) => (r.id === id ? res.data : r)));
      alert('Réservation annulée.');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Erreur lors de l\'annulation');
    } finally {
      setActionLoading((p) => ({ ...p, [`cancel_${id}`]: false }));
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.statut === 'en_attente';
    if (filter === 'confirmed') return r.statut === 'confirmee';
    if (filter === 'cancelled') return r.statut === 'annulee';
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return r.date_debut === today;
    }
    return true;
  });

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'confirmee': return <CheckCircle size={16} className="text-success me-1" />;
      case 'en_attente': return <AlertCircle size={16} className="text-warning me-1" />;
      case 'annulee': return <XCircle size={16} className="text-danger me-1" />;
      default: return <AlertCircle size={16} className="text-secondary me-1" />;
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'confirmee': return 'success';
      case 'en_attente': return 'warning';
      case 'annulee': return 'danger';
      default: return 'secondary';
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const canViewReservations = user && (user.role === 'receptionist' || user.role === 'admin');

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <h5>Erreur</h5>
          <p>{error}</p>
          <button onClick={fetchUserAndReservations} className="btn btn-danger">Réessayer</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center mt-5 text-muted">Veuillez vous connecter.</div>;
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2>Réservations</h2>
        <p>
          Connecté en tant que <strong>{user.name}</strong>{' '}
          <span className={`badge bg-secondary text-uppercase ms-2`}>{user.role}</span>
        </p>
      </div>

      <div className="btn-group mb-3">
        {['all', 'pending', 'confirmed', 'cancelled', 'today'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredReservations.length === 0 ? (
        <div className="alert alert-info text-center">
          <Calendar className="me-2" /> Aucune réservation à afficher.
        </div>
      ) : (
        <div className="list-group">
          {filteredReservations.map((r) => (
            <div key={r.id} className="list-group-item d-flex justify-content-between align-items-start">
              <div className="me-auto">
                <div className="fw-bold d-flex align-items-center">
                  {getStatusIcon(r.statut)}
                  <span className={`badge bg-${getStatusBadge(r.statut)} me-2`}>
                    {r.statut.replace('_', ' ').toUpperCase()}
                  </span>
                  #{r.id}
                </div>
                <div className="text-muted">
                  {r.user?.name || r.nom} — {formatDate(r.date_debut)}
                </div>
              </div>

              {r.statut === 'en_attente' && canViewReservations && (
                <div className="btn-group">
                  <button
                    className="btn btn-sm btn-success"
                    disabled={actionLoading[`confirm_${r.id}`]}
                    onClick={() => handleConfirmReservation(r.id)}
                  >
                    Confirmer
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={actionLoading[`cancel_${r.id}`]}
                    onClick={() => handleCancelReservation(r.id)}
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
