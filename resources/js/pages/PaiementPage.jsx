import React, { useState, useEffect } from 'react';
import {
  CreditCard, Smartphone, Building, DollarSign,
  CheckCircle, XCircle, Clock, AlertTriangle
} from 'lucide-react';
import '../../css/app.css';

const PaiementPage = () => {
  const [reservations, setReservations] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState('');
  const [montant, setMontant] = useState('');
  const [mode, setMode] = useState('carte');
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoadingData(true);
      try {
        const token = localStorage.getItem('authToken');
        const headers = token ? {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        } : {};

        const response = await fetch('http://localhost:8000/api/reservations', { headers });
        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response received:', text);
          throw new Error('La réponse du serveur n\'est pas au format JSON');
        }

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Reservations data:', data);
        setReservations(data);
      } catch (error) {
        console.error('Erreur lors du chargement des réservations:', error);
        setMessage({
          type: 'error',
          text: 'Impossible de charger les réservations. Données simulées utilisées.',
        });
        setReservations([
          { id: 1, numero: 'RES-001', montant_total: 150.00, statut: 'confirmee' },
          { id: 2, numero: 'RES-002', montant_total: 200.00, statut: 'confirmee' },
          { id: 3, numero: 'RES-003', montant_total: 75.00, statut: 'en_attente' },
        ]);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchReservations();

    // Paiements simulés
    setPaiements([
      {
        id: 1,
        reservation: { numero: 'RES-001' },
        montant: 150.00,
        mode: 'carte',
        statut: 'valide',
        date_paiement: '2025-06-15T10:30:00Z',
        reference_transaction: 'PAY-ABC123',
      },
      {
        id: 2,
        reservation: { numero: 'RES-004' },
        montant: 100.00,
        mode: 'paypal',
        statut: 'en_attente',
        date_paiement: '2025-06-16T14:20:00Z',
        reference_transaction: 'PAYPAL-XYZ789',
      },
    ]);
  }, []);

  const handleSubmit = async () => {
    if (!selectedReservation || !montant) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs requis' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('authToken');
      console.log('Token used for payment:', token);

      const response = await fetch('http://localhost:8000/api/paiements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          reservation_id: selectedReservation,
          montant: parseFloat(montant),
          mode: mode,
        }),
      });

      console.log('Payment response status:', response.status);
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        throw new Error('La réponse du serveur n\'est pas au format JSON');
      }

      const data = await response.json();

      if (response.ok) {
        if (mode === 'paypal' && data.paypal_redirect_url) {
          setMessage({ type: 'info', text: 'Redirection vers PayPal...' });
          setTimeout(() => {
            window.location.href = data.paypal_redirect_url;
          }, 1500);
        } else {
          setMessage({ type: 'success', text: 'Paiement créé avec succès!' });
          setSelectedReservation('');
          setMontant('');
          setMode('carte');
          setPaiements(prev => [...prev, data.paiement]);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors du paiement' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: error.message || 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'carte': return <CreditCard className="w-4 h-4 me-2" />;
      case 'mobile_money': return <Smartphone className="w-4 h-4 me-2" />;
      case 'virement': return <Building className="w-4 h-4 me-2" />;
      case 'paypal': return <DollarSign className="w-4 h-4 me-2" />;
      default: return <CreditCard className="w-4 h-4 me-2" />;
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'valide': return <CheckCircle className="w-4 h-4 text-success me-2" />;
      case 'echec': return <XCircle className="w-4 h-4 text-danger me-2" />;
      case 'en_attente': return <Clock className="w-4 h-4 text-warning me-2" />;
      case 'rembourse': return <AlertTriangle className="w-4 h-4 text-primary me-2" />;
      default: return <Clock className="w-4 h-4 text-secondary me-2" />;
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'valide': return 'bg-success-subtle text-success';
      case 'echec': return 'bg-danger-subtle text-danger';
      case 'en_attente': return 'bg-warning-subtle text-warning';
      case 'rembourse': return 'bg-primary-subtle text-primary';
      default: return 'bg-secondary-subtle text-secondary';
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h1 className="display-6 fw-bold">Gestion des Paiements</h1>
        <p className="text-muted">Effectuez vos paiements en toute sécurité</p>
      </div>

      {isLoadingData ? (
        <div className="text-center py-5">
          <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
          <p className="mt-2">Chargement des données...</p>
        </div>
      ) : (
        <div className="row g-4">
          {/* Formulaire de paiement */}
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-primary-subtle p-2 rounded-circle me-3">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="h4 mb-0">Nouveau Paiement</h2>
                </div>

                {message.text && (
                  <div className={`alert ${
                    message.type === 'success' ? 'alert-success' :
                    message.type === 'error' ? 'alert-danger' :
                    'alert-info'
                  } mb-4`} role="alert">
                    {message.text}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="reservation" className="form-label">Réservation</label>
                  <select
                    id="reservation"
                    value={selectedReservation}
                    onChange={(e) => setSelectedReservation(e.target.value)}
                    required
                    className="form-select"
                  >
                    <option value="">Sélectionner une réservation</option>
                    {reservations.map(reservation => (
                      <option key={reservation.id} value={reservation.id}>
                        {reservation.nom} - {reservation.montant_total}€
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="montant" className="form-label">Montant (€)</label>
                  <input
                    type="number"
                    id="montant"
                    value={montant}
                    onChange={(e) => setMontant(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                    className="form-control"
                    placeholder="0.00"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Mode de paiement</label>
                  <div className="row row-cols-2 g-3">
                    {[
                      { value: 'carte', label: 'Carte bancaire', icon: CreditCard },
                      { value: 'paypal', label: 'PayPal', icon: DollarSign },
                      { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
                      { value: 'virement', label: 'Virement', icon: Building }
                    ].map(({ value, label, icon: Icon }) => (
                      <div key={value} className="col">
                        <label className={`d-flex align-items-center p-3 border rounded-3 cursor-pointer ${
                          mode === value ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle'
                        }`}>
                          <input
                            type="radio"
                            value={value}
                            checked={mode === value}
                            onChange={(e) => setMode(e.target.value)}
                            className="form-check-input me-2"
                          />
                          <Icon className={`w-5 h-5 me-2 ${
                            mode === value ? 'text-primary' : 'text-secondary'
                          }`} />
                          <span className={`form-check-label ${
                            mode === value ? 'text-primary' : 'text-secondary'
                          }`}>
                            {label}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Traitement...
                    </>
                  ) : (
                    'Effectuer le paiement'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Historique des paiements */}
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center">
                    <div className="bg-success-subtle p-2 rounded-circle me-3">
                      <CheckCircle className="w-6 h-6 text-success" />
                    </div>
                    <h2 className="h4 mb-0">Historique</h2>
                  </div>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="btn btn-link text-primary"
                  >
                    {showHistory ? 'Masquer' : 'Afficher tout'}
                  </button>
                </div>

                <div className="overflow-y-auto" style={{ maxHeight: '24rem' }}>
                  {paiements.slice(0, showHistory ? paiements.length : 3).map(paiement => (
                    <div
                      key={paiement.id}
                      className="d-flex align-items-center justify-content-between p-3 border rounded-3 mb-2 hover-shadow"
                    >
                      <div className="d-flex align-items-center">
                        {getModeIcon(paiement.mode)}
                        <div>
                          <p className="fw-medium mb-1">
                            {paiement.reservation.numero}
                          </p>
                          <p className="text-muted small mb-1">
                            {new Date(paiement.date_paiement).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-muted smaller">
                            {paiement.reference_transaction}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-end">
                        <p className="fw-bold mb-1">
                          {paiement.montant.toFixed(2)}€
                        </p>
                        <div className="d-flex align-items-center justify-content-end">
                          {getStatusIcon(paiement.statut)}
                          <span className={`badge ${getStatusColor(paiement.statut)}`}>
                            {paiement.statut.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {paiements.length === 0 && (
                    <div className="text-center py-5 text-muted">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-secondary" />
                      <p>Aucun paiement pour le moment</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informations sur PayPal */}
      {mode === 'paypal' && (
        <div className="mt-4 card border-primary-subtle">
          <div className="card-body">
            <div className="d-flex align-items-start">
              <DollarSign className="w-6 h-6 text-primary mt-1 me-3" />
              <div>
                <h3 className="h5 fw-semibold text-primary mb-2">Paiement PayPal</h3>
                <p className="text-primary small">
                  Vous serez redirigé vers PayPal pour finaliser votre paiement en toute sécurité. 
                  Une fois le paiement validé, vous reviendrez automatiquement sur notre site.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaiementPage;