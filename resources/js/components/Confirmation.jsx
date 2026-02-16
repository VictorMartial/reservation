import React, { useState } from 'react';
import { CheckCircle, Mail, ThumbsUp } from 'lucide-react';
import axios from 'axios';

const Confirmation = ({
  confirmation,
  selectedItem,
  reservationType,
  resetReservation,
  isReceptionist = false,
}) => {
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');

  if (!confirmation || !selectedItem) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3">Chargement de la confirmation...</p>
      </div>
    );
  }

  const handleAccept = async () => {
    try {
      setAccepting(true);
      setError('');
      // Appel API pour accepter la réservation
      await axios.post(`/api/reservations/${confirmation.id}/accepter`);
      setAccepted(true);
    } catch (err) {
      setError("Une erreur est survenue lors de la confirmation.");
    } finally {
      setAccepting(false);
    }
  };

  const formatEuro = (value) => {
    return Number(value).toFixed(2) + ' €';
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8 text-center">
          <div className="mb-4">
            <CheckCircle className="text-success mb-3" size={64} />
            <h2 className="text-success mb-2">Réservation en attente !</h2>
            <p className="text-muted">
              Votre réservation a été enregistrée et est en attente de confirmation par le réceptionniste.
            </p>
          </div>

          <div className="card mb-4 text-start">
            <div className="card-header">
              <h5 className="mb-0">Détails de votre réservation</h5>
            </div>
            <div className="card-body">
              <div className="row"><div className="col-sm-4"><strong>Numéro:</strong></div><div className="col-sm-8">{confirmation.numero_reservation}</div></div>
              <hr className="my-2" />
              <div className="row"><div className="col-sm-4"><strong>Type:</strong></div><div className="col-sm-8">{reservationType === 'chambre' ? 'Chambre' : 'Table'} {selectedItem.numero}</div></div>
              <hr className="my-2" />
              <div className="row"><div className="col-sm-4"><strong>Client:</strong></div><div className="col-sm-8">{confirmation.prenom} {confirmation.nom}</div></div>
              <hr className="my-2" />
              <div className="row"><div className="col-sm-4"><strong>Email:</strong></div><div className="col-sm-8">{confirmation.email}</div></div>
              <hr className="my-2" />
              <div className="row"><div className="col-sm-4"><strong>Téléphone:</strong></div><div className="col-sm-8">{confirmation.telephone}</div></div>
              <hr className="my-2" />

              {reservationType === 'chambre' ? (
                <>
                  <div className="row">
                    <div className="col-sm-4"><strong>Dates:</strong></div>
                    <div className="col-sm-8">du {new Date(confirmation.date_debut).toLocaleDateString()} au {new Date(confirmation.date_fin).toLocaleDateString()}</div>
                  </div>
                  <hr className="my-2" />
                  <div className="row">
                    <div className="col-sm-4"><strong>Prix total:</strong></div>
                    <div className="col-sm-8">{formatEuro(confirmation.prix_total)}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="row"><div className="col-sm-4"><strong>Date:</strong></div><div className="col-sm-8">{new Date(confirmation.date_debut).toLocaleDateString()}</div></div>
                  <hr className="my-2" />
                  <div className="row">
                    <div className="col-sm-4"><strong>Heure:</strong></div>
                    <div className="col-sm-8">{confirmation.heure_debut}{confirmation.heure_fin ? ` - ${confirmation.heure_fin}` : ''}</div>
                  </div>
                </>
              )}

              <hr className="my-2" />
              <div className="row"><div className="col-sm-4"><strong>Personnes:</strong></div><div className="col-sm-8">{confirmation.nombre_personnes}</div></div>
            </div>
          </div>

          <div className="alert alert-info d-flex align-items-center mb-4">
            <Mail className="me-2" size={20} />
            <span>Un email de confirmation sera envoyé à <strong>{confirmation.email}</strong></span>
          </div>

          {isReceptionist && !accepted && (
            <div className="mb-4">
              <button
                onClick={handleAccept}
                className="btn btn-success me-2"
                disabled={accepting}
              >
                {accepting ? 'Traitement...' : 'Accepter la réservation'}
              </button>
              {error && <div className="text-danger mt-2">{error}</div>}
            </div>
          )}

          {accepted && (
            <div className="alert alert-success d-flex align-items-center">
              <ThumbsUp className="me-2" />
              <span>La réservation a été acceptée. Un email a été envoyé au client.</span>
            </div>
          )}

          <button onClick={resetReservation} className="btn btn-primary btn-lg mt-3">
            Nouvelle réservation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
