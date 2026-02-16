import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Wifi, Car, Coffee, Tv, Wind, Users, Star, Filter, Search, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';

const RoomsPage = () => {
  const [chambres, setChambres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservationLoading, setReservationLoading] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    dateDebut: '',
    dateFin: '',
    prixMax: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadChambres = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/public/chambres');
      setChambres(response.data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des chambres:', error);
      setError('Erreur lors du chargement des chambres. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    loadChambres();
  }, []);

  const handleReservation = async (chambreId) => {
    try {
      setReservationLoading(chambreId);
      
      // Données de réservation à envoyer
      const reservationData = {
        chambre_id: chambreId,
        date_debut: filters.dateDebut || new Date().toISOString().split('T')[0],
        date_fin: filters.dateFin || new Date(Date.now() + 86400000).toISOString().split('T')[0], // +1 jour par défaut
        statut: 'en_attente', // Statut initial en attente de validation
        date_demande: new Date().toISOString()
      };

      // Appel API pour créer la réservation
      const response = await axios.post('https://localhost/api/reservations', reservationData);
      
      if (response.status === 200 || response.status === 201) {
        // Actualiser la liste des chambres après réservation
        await loadChambres();
        
        // Afficher un message de succès
        alert('Demande de réservation envoyée avec succès ! Elle sera validée par un réceptionniste.');
      }
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      alert('Erreur lors de la demande de réservation. Veuillez réessayer.');
    } finally {
      setReservationLoading(null);
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      standard: 'Standard',
      familiale: 'Familiale',
      bungalow: 'Bungalow'
    };
    return types[type] || type;
  };

  const getEquipementIcon = (equipement) => {
    const icons = {
      wifi: <Wifi className="me-1" />,
      tv: <Tv className="me-1" />,
      climatisation: <Wind className="me-1" />,
      minibar: <Coffee className="me-1" />,
      parking: <Car className="me-1" />,
      jacuzzi: <Users className="me-1" />,
      'coffre-fort': <Star className="me-1" />,
      kitchenette: <Coffee className="me-1" />,
      piscine: <Users className="me-1" />
    };
    return icons[equipement] || <Star className="me-1" />;
  };

  const getStatutReservation = (chambre) => {
    // Vérifier s'il y a une réservation en attente
    if (chambre.reservation_en_attente) {
      return {
        statut: 'en_attente',
        label: 'En attente',
        classe: 'bg-warning bg-opacity-25 text-warning'
      };
    }
    
    // Vérifier si la chambre est occupée (réservation validée)
    if (!chambre.disponible) {
      return {
        statut: 'occupee',
        label: 'Occupée',
        classe: 'bg-danger bg-opacity-25 text-danger'
      };
    }
    
    return {
      statut: 'disponible',
      label: 'Disponible',
      classe: 'bg-success bg-opacity-25 text-success'
    };
  };

  const filteredChambres = chambres.filter(chambre => {
    if (filters.type && chambre.type !== filters.type) return false;
    if (filters.prixMax && chambre.prix > parseInt(filters.prixMax)) return false;
    return true;
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      dateDebut: '',
      dateFin: '',
      prixMax: ''
    });
  };

  if (loading) {
    return (
      <div className="d-flex vh-100 bg-light justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Chargement des chambres...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex vh-100 bg-light justify-content-center align-items-center">
        <div className="text-center">
          <p className="text-danger mb-3">{error}</p>
          <button 
            onClick={loadChambres}
            className="btn btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Header */}
      <header className="bg-white border-bottom shadow-sm">
        <div className="container py-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div>
            <h1 className="h3 mb-1">Nos Chambres</h1>
            <p className="text-muted mb-0">Découvrez nos chambres disponibles et trouvez celle qui vous convient</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-primary d-flex align-items-center gap-2 mt-3 mt-md-0"
          >
            <Filter className="me-1" />
            Filtres
          </button>
        </div>
      </header>

      {/* Filtres */}
      {showFilters && (
        <section className="bg-white border-bottom shadow-sm">
          <div className="container py-4">
            <div className="row g-3">
              <div className="col-12 col-md-3">
                <label htmlFor="typeFilter" className="form-label">Type de chambre</label>
                <select
                  id="typeFilter"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="form-select"
                >
                  <option value="">Tous les types</option>
                  <option value="standard">Standard</option>
                  <option value="familiale">Familiale</option>
                  <option value="bungalow">Bungalow</option>
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label htmlFor="dateDebutFilter" className="form-label">Date d'arrivée</label>
                <input
                  type="date"
                  id="dateDebutFilter"
                  value={filters.dateDebut}
                  onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="col-12 col-md-3">
                <label htmlFor="dateFinFilter" className="form-label">Date de départ</label>
                <input
                  type="date"
                  id="dateFinFilter"
                  value={filters.dateFin}
                  onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="col-12 col-md-3">
                <label htmlFor="prixMaxFilter" className="form-label">Prix maximum (€)</label>
                <input
                  type="number"
                  id="prixMaxFilter"
                  value={filters.prixMax}
                  onChange={(e) => handleFilterChange('prixMax', e.target.value)}
                  placeholder="Ex: 150"
                  className="form-control"
                />
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={clearFilters}
                className="btn btn-link p-0"
              >
                Effacer les filtres
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Résultats */}
      <main className="container py-5">
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div className="text-muted">
            {filteredChambres.length} chambre{filteredChambres.length !== 1 ? 's' : ''} trouvée{filteredChambres.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={loadChambres}
            className="btn btn-outline-primary btn-sm"
            disabled={loading}
          >
            Actualiser
          </button>
        </div>

        {/* Grille des chambres */}
        <div className="row g-4">
        {filteredChambres.map((chambre) => {
          const statutInfo = getStatutReservation(chambre);
          return (
            <article key={chambre.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="position-relative">
                  <img
                    src={chambre.image_url || `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=300&fit=crop&seed=${chambre.id}`}
                    alt={`Chambre ${chambre.numero}`}
                    className="card-img-top"
                    style={{ height: '12rem', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=300&fit=crop&seed=${chambre.id}`;
                    }}
                  />
                    <span className={`position-absolute top-0 start-0 m-2 px-2 py-1 rounded-pill small fw-semibold ${statutInfo.classe}`}>
                      {statutInfo.statut === 'en_attente' && <Clock size={12} className="me-1" />}
                      {statutInfo.statut === 'occupee' && <CheckCircle size={12} className="me-1" />}
                      {statutInfo.label}
                    </span>
                    <span className="position-absolute top-0 end-0 m-2 px-2 py-1 rounded-pill small bg-primary text-white fw-semibold">
                      {getTypeLabel(chambre.type)}
                    </span>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h3 className="h5 mb-0">Chambre {chambre.numero}</h3>
                      <div className="text-end">
                        <div className="fs-4 fw-bold text-primary">{chambre.prix}€</div>
                        <div className="small text-muted">par nuit</div>
                      </div>
                    </div>
                    <p className="text-muted small mb-3" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {chambre.description}
                    </p>
                    
                    {/* Équipements */}
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-2">
                        {chambre.equipements?.slice(0, 4).map((equipement, index) => (
                          <div
                            key={index}
                            className="d-flex align-items-center gap-1 bg-light rounded-pill px-2 py-1 small text-capitalize text-secondary"
                            style={{ fontSize: '0.75rem' }}
                          >
                            {getEquipementIcon(equipement)}
                            <span>{equipement}</span>
                          </div>
                        ))}
                        {chambre.equipements?.length > 4 && (
                          <div className="d-flex align-items-center gap-1 bg-light rounded-pill px-2 py-1 small text-secondary" style={{ fontSize: '0.75rem' }}>
                            +{chambre.equipements.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Statut de réservation en attente */}
                    {statutInfo.statut === 'en_attente' && (
                      <div className="mb-3 p-2 bg-warning bg-opacity-10 border border-warning rounded">
                        <small className="text-warning">
                          <Clock size={12} className="me-1" />
                          Réservation en attente de validation
                        </small>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="d-flex gap-2 mt-auto">
                      <button className="btn btn-primary flex-grow-1">
                        Voir détails
                      </button>
                      {statutInfo.statut === 'disponible' && (
                        <button 
                          className="btn btn-success flex-grow-1"
                          onClick={() => handleReservation(chambre.id)}
                          disabled={reservationLoading === chambre.id}
                        >
                          {reservationLoading === chambre.id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              Réservation...
                            </>
                          ) : (
                            'Réserver'
                          )}
                        </button>
                      )}
                      {statutInfo.statut === 'en_attente' && (
                        <button className="btn btn-warning flex-grow-1" disabled>
                          En attente
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredChambres.length === 0 && (
          <div className="text-center py-5 text-secondary">
            <Search className="mb-3" size={64} />
            <h3 className="h5 mb-2">Aucune chambre trouvée</h3>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RoomsPage;