import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Users, Bed, Utensils, Check, ArrowLeft, ArrowRight, Mail, Phone, User, CreditCard, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import TypeSelection from '../components/TypeSelection';
import ItemSelection from '../components/ItemSelection';
import ReservationDetails from '../components/ReservationDetails';
import CustomerInfo from '../components/CustomerInfo';
import Confirmation from '../components/Confirmation';
import { useAuth } from '../context/AuthContext';

const MyReservationPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [reservationType, setReservationType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [chambres, setChambres] = useState([]);
  const [error, setError] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    code_postal: '',
    commentaires: '',
  });
  const [reservationDetails, setReservationDetails] = useState({
    date_debut: '',
    date_fin: '',
    heure_debut: '',
    heure_fin: '',
    nombre_personnes: 1,
  });
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const loadChambres = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get('http://localhost:8000/api/public/chambres', { headers });
      if (Array.isArray(response.data)) {
        setChambres(response.data);
      } else if (Array.isArray(response.data.data)) {
        setChambres(response.data.data);
      } else {
        setError("Format de données invalide.");
        setChambres([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des chambres:", error);
      setChambres([]);
      if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
        setError("Impossible de se connecter au serveur.");
      } else if (error.response) {
        setError(`Erreur API: ${error.response.status} - ${error.response.statusText}`);
      } else {
        setError("Erreur inconnue.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reservationType === 'chambre') {
      loadChambres();
    }
  }, [reservationType]);

  const tables = [
    { 
      id: 1, 
      numero: '1', 
      type: 'Standard', 
      nombre_places: 4, 
      disponible: true,
      description: 'Table standard avec vue sur jardin'
    },
    { 
      id: 2, 
      numero: '2', 
      type: 'VIP', 
      nombre_places: 6, 
      disponible: true,
      description: 'Table VIP avec service premium'
    },
    { 
      id: 3, 
      numero: '3', 
      type: 'Standard', 
      nombre_places: 2, 
      disponible: false,
      description: 'Table intime pour deux personnes'
    },
    { 
      id: 4, 
      numero: '4', 
      type: 'Terrasse', 
      nombre_places: 8, 
      disponible: true,
      description: 'Grande table sur la terrasse'
    },
  ];

  const calculateNights = () => {
    if (!reservationDetails.date_debut || !reservationDetails.date_fin) return 0;
    const debut = new Date(reservationDetails.date_debut);
    const fin = new Date(reservationDetails.date_fin);
    if (fin <= debut) return 0;
    return Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
  };

  const verifyToken = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      const response = await axios.get('http://localhost:8000/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.status === 200;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
      }
      return false;
    }
  };
  
  const checkAvailability = async () => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const { date_debut, date_fin } = reservationDetails;
      if (reservationType === 'chambre') {
        const startDate = new Date(date_debut);
        const endDate = new Date(date_fin);
        if (!date_debut || !date_fin || endDate <= startDate) {
          setAvailability({
            disponible: true,
            message: 'La date de fin doit être après la date de début.',
          });
          return;
        }
        const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        setAvailability({
          disponible: true,
          prix_total: selectedItem.prix * nights,
        });
      } else {
        setAvailability({
          disponible: selectedItem.disponible,
          prix_total: 0,
        });
      }
    } catch (error) {
      setAvailability({
        disponible: false,
        message: 'Erreur lors de la vérification.',
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReservation = async () => {
    setLoading(true);
    try {
      // Vérifier d'abord si l'utilisateur est connecté
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Vous devez être connecté pour effectuer une réservation');
        window.location.href = '/login';
        return;
      }
  
      const reservationData = {
        type: reservationType,
        ...(reservationType === 'chambre' 
          ? { chambre_id: selectedItem.id } 
          : { table_id: selectedItem.id }
        ),
        ...reservationDetails,
        montant_total: availability?.prix_total || 0,
        ...customerInfo,
      };
  
      const response = await axios.post(
        'http://localhost:8000/api/reservations', 
        reservationData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      setConfirmation(response.data);
      setCurrentStep(5);
    } catch (error) {
      console.error("Erreur de réservation:", error);
      let errorMessage = "Erreur lors de la réservation";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Session expirée - Veuillez vous reconnecter";
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        } else if (error.response.data?.message || error.response.data?.error) {
          errorMessage = error.response.data.message || error.response.data.error;
        }
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = "Erreur de connexion au serveur";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <h5 className="card-title">Authentification requise</h5>
                <p className="card-text">
                  Vous devez être connecté pour effectuer une réservation.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    window.location.href = '/login';
                  }}
                >
                  Se connecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const resetReservation = () => {
    setCurrentStep(1);
    setReservationType('');
    setSelectedItem(null);
    setAvailability(null);
    setCustomerInfo({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      ville: '',
      code_postal: '',
      commentaires: '', 
    });
    setReservationDetails({
      date_debut: '',
      date_fin: '',
      heure_debut: '',
      heure_fin: '',
      nombre_personnes: 1,
    });
    setConfirmation(null);
    setError(null);
  };
  
  const ItemSelectionComponent = ({
    reservationType,
    chambres,
    tables,
    selectedItem,
    setSelectedItem,
    availability,
    checkAvailability,
    setCurrentStep,
    loading,
    error
  }) => {
    const items = reservationType === 'chambre' ? chambres : tables;
    return (
      <div className="container">
        <h2 className="text-center mb-5">
          Choisissez votre {reservationType === 'chambre' ? 'chambre' : 'table'}
        </h2>
        {error && (
          <div className="alert alert-danger mb-4">
            <AlertCircle className="me-2" size={16} />
            {error}
            {reservationType === 'chambre' && (
              <div className="mt-2">
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={loadChambres}
                  disabled={loading}
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        )}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3 text-muted">
              {reservationType === 'chambre' ? 'Chargement des chambres...' : 'Chargement...'}
            </p>
          </div>
        ) : !items || items.length === 0 ? (
          <div className="alert alert-warning text-center">
            <AlertCircle className="me-2" size={20} />
            {reservationType === 'chambre' 
              ? 'Aucune chambre disponible. Vérifiez que l\'API est en cours d\'exécution.'
              : 'Aucune table disponible pour ce type de réservation.'
            }
            {reservationType === 'chambre' && (
              <div className="mt-3">
                <button 
                  className="btn btn-primary"
                  onClick={loadChambres}
                  disabled={loading}
                >
                  Recharger les chambres
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`row ${reservationType === 'chambre' ? '' : 'justify-content-center'}`}>
            {items.map((item) => (
              <div key={item.id} className="col-lg-4 col-md-6 mb-4">
                <div
                  className={`card h-100 ${selectedItem?.id === item.id ? 'border-primary bg-light' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedItem(item)}
                >
                  {reservationType === 'chambre' ? (
                    <>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={`Chambre ${item.numero}`}
                          className="card-img-top"
                          style={{ height: '200px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title">
                            <Bed className="me-2" size={20} />
                            Chambre {item.numero}
                          </h5>
                          {item.prix && (
                            <span className="badge bg-primary fs-6">{item.prix}€/nuit</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="card-text text-muted small">{item.description}</p>
                        )}
                        {item.type && (
                          <p className="card-text">
                            <strong>Type:</strong> {item.type}
                          </p>
                        )}
                        {item.equipements && item.equipements.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mt-2">
                            {item.equipements.slice(0, 3).map((eq, idx) => (
                              <span key={idx} className="badge bg-secondary small">
                                {eq}
                              </span>
                            ))}
                            {item.equipements.length > 3 && (
                              <span className="badge bg-info small">
                                +{item.equipements.length - 3} autres
                              </span>
                            )}
                          </div>
                        )}
                        <div className={`mt-2 small ${item.disponible !== false ? 'text-success' : 'text-danger'}`}>
                          {item.disponible !== false ? '✓ Disponible' : '✗ Non disponible'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title">
                          <Utensils className="me-2" size={20} />
                          Table {item.numero}
                        </h5>
                        <span className="badge bg-primary">{item.type}</span>
                      </div>
                      <div className="d-flex align-items-center text-muted mb-2">
                        <Users className="me-2" size={16} />
                        <span>{item.nombre_places} places</span>
                      </div>
                      {item.description && (
                        <p className="card-text text-muted small mb-2">{item.description}</p>
                      )}
                      <div className={`small ${item.disponible ? 'text-success' : 'text-danger'}`}>
                        {item.disponible ? '✓ Disponible' : '✗ Occupée'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedItem && (
          <div className="text-center mt-4">
            <div className="card bg-light mb-3">
              <div className="card-body">
                <h6 className="card-title">
                  {reservationType === 'chambre' ? 'Chambre' : 'Table'} sélectionnée : {selectedItem.numero}
                </h6>
                {reservationType === 'chambre' && selectedItem.prix && (
                  <p className="card-text">Prix : {selectedItem.prix}€/nuit</p>
                )}
              </div>
            </div>
            <button
              onClick={checkAvailability}
              disabled={loading}
              className="btn btn-primary btn-lg"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Vérification...
                </>
              ) : (
                <>
                  Vérifier disponibilité <ArrowRight className="ms-2" size={16} />
                </>
              )}
            </button>
          </div>
        )}
        {availability && (
          <div className={`mt-3 text-center fw-bold ${availability.disponible ? 'text-success' : 'text-danger'}`}>
            {availability.message ?? (
              availability.disponible ? (
                <>
                  <CheckCircle className="me-2" size={20} />
                  Disponible
                  {availability.prix_total > 0 && ` — Prix total : ${availability.prix_total} €`}
                </>
              ) : (
                <>
                  <AlertCircle className="me-2" size={20} />
                  Non disponible
                </>
              )
            )}
            {availability.disponible && (
              <div className="mt-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn btn-success btn-lg"
                >
                  Continuer la réservation <ArrowRight className="ms-2" size={16} />
                </button>
              </div>
            )}
          </div>
        )}
        <div className="text-center mt-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="btn btn-outline-secondary"
          >
            <ArrowLeft className="me-2" size={16} />
            Retour
          </button>
        </div>
      </div>
    );
  };

  const steps = [
    {
      number: 1,
      title: 'Type',
      component: () => <TypeSelection setReservationType={setReservationType} setCurrentStep={setCurrentStep} />,
    },
    { 
      number: 2, 
      title: 'Sélection', 
      component: () => (
        <ItemSelectionComponent
          reservationType={reservationType}
          chambres={chambres}
          tables={tables}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          availability={availability}
          checkAvailability={checkAvailability}
          setCurrentStep={setCurrentStep}
          loading={loading}
          error={error}
        />
      )
    },
    { 
      number: 3, 
      title: 'Détails', 
      component: () => (
        <ReservationDetails
          reservationType={reservationType}
          selectedItem={selectedItem}
          reservationDetails={reservationDetails}
          setReservationDetails={setReservationDetails}
          setCurrentStep={setCurrentStep}
          checkAvailability={checkAvailability}
        />
      )
    },
    { 
      number: 4, 
      title: 'Informations', 
      component: () => (
        <CustomerInfo
          availability={availability}
          loading={loading}
          customerInfo={customerInfo}
          setCustomerInfo={setCustomerInfo}
          submitReservation={submitReservation}
          setCurrentStep={setCurrentStep}
          reservationType={reservationType}
          calculateNights={calculateNights}
        />
      )
    },
    { 
      number: 5, 
      title: 'Confirmation', 
      component: () => (
        <Confirmation
          confirmation={confirmation}
          selectedItem={selectedItem}
          reservationType={reservationType}
          resetReservation={resetReservation}
        />
      )
    },
  ];

  const CurrentComponent = steps[currentStep - 1]?.component || (() => <div>Erreur : Étape non trouvée</div>);

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM"
        crossOrigin="anonymous"
      />
      <div className="min-vh-100 bg-light py-4">
        <div className="container">
          <div className="mb-5">
            <div className="d-flex justify-content-center">
              <nav aria-label="Progress">
                <ol className="list-unstyled d-flex align-items-center">
                  {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                      <li className="d-flex align-items-center">
                        <div
                          className={`d-flex align-items-center justify-content-center rounded-circle fw-bold ${
                            currentStep >= step.number ? 'bg-primary text-white' : 'bg-secondary text-white'
                          }`}
                          style={{ width: '40px', height: '40px' }}
                        >
                          {currentStep > step.number ? <Check size={20} /> : step.number}
                        </div>
                        <span
                          className={`ms-2 small ${currentStep >= step.number ? 'text-primary fw-bold' : 'text-muted'}`}
                        >
                          {step.title}
                        </span>
                      </li>
                      {index < steps.length - 1 && (
                        <li className="mx-3">
                          <div
                            className={`${currentStep > step.number ? 'bg-primary' : 'bg-secondary'}`}
                            style={{ width: '40px', height: '2px' }}
                          />
                        </li>
                      )}
                    </React.Fragment>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <CurrentComponent />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyReservationPage;