import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const ReservationDetails = ({
  reservationType,
  selectedItem,
  reservationDetails,
  setReservationDetails,
  setCurrentStep,
  checkAvailability
}) => {
  // Vérifier si selectedItem est défini avant de l'utiliser
  // Vérifier si selectedItem est valide
if (!selectedItem || Object.keys(selectedItem).length === 0 || !selectedItem.numero) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger">
          <h3>Erreur de sélection</h3>
          <p>Aucun élément sélectionné. Veuillez revenir à l'étape précédente.</p>
          <button 
            onClick={() => setCurrentStep(2)}
            className="btn btn-primary mt-3"
          >
            <ArrowLeft className="me-2" size={16} /> Retour à la sélection
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h2 className="text-center mb-5">Détails de la réservation</h2>

          <div className="alert alert-info mb-4">
            <h5 className="alert-heading">
                {reservationType === 'chambre'
                 ? `Chambre ${selectedItem?.numero ?? 'inconnue'}`
                 : `Table ${selectedItem?.numero ?? 'inconnue'}`}
            </h5>

            {reservationType === 'chambre' && (
              <p className="mb-0 text-muted">{selectedItem.prix}€ par nuit</p>
            )}
          </div>

          <div>
            {reservationType === 'chambre' ? (
              <>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Date d'arrivée</label>
                    <input
                      type="date"
                      className="form-control"
                      value={reservationDetails.date_debut}
                      onChange={(e) =>
                        setReservationDetails((prev) => ({
                          ...prev,
                          date_debut: e.target.value
                        }))
                      }
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date de départ</label>
                    <input
                      type="date"
                      className="form-control"
                      value={reservationDetails.date_fin}
                      onChange={(e) =>
                        setReservationDetails((prev) => ({
                          ...prev,
                          date_fin: e.target.value
                        }))
                      }
                      min={
                        reservationDetails.date_debut ||
                        new Date().toISOString().split('T')[0]
                      }
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre de personnes</label>
                  <select
                    className="form-select"
                    value={reservationDetails.nombre_personnes}
                    onChange={(e) =>
                      setReservationDetails((prev) => ({
                        ...prev,
                        nombre_personnes: parseInt(e.target.value)
                      }))
                    }
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} personne{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <label className="form-label">Date de réservation</label>
                  <input
                    type="date"
                    className="form-control"
                    value={reservationDetails.date_debut}
                    onChange={(e) =>
                      setReservationDetails((prev) => ({
                        ...prev,
                        date_debut: e.target.value
                      }))
                    }
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Heure d'arrivée</label>
                    <input
                      type="time"
                      className="form-control"
                      value={reservationDetails.heure_debut}
                      onChange={(e) =>
                        setReservationDetails((prev) => ({
                          ...prev,
                          heure_debut: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Heure de départ (optionnel)</label>
                    <input
                      type="time"
                      className="form-control"
                      value={reservationDetails.heure_fin}
                      onChange={(e) =>
                        setReservationDetails((prev) => ({
                          ...prev,
                          heure_fin: e.target.value
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre de personnes</label>
                  <select
                    className="form-select"
                    value={reservationDetails.nombre_personnes}
                    onChange={(e) =>
                      setReservationDetails((prev) => ({
                        ...prev,
                        nombre_personnes: parseInt(e.target.value)
                      }))
                    }
                  >
                    {Array.from(
                      { length: selectedItem?.nombre_places ?? 1 },
                        (_, i) => i + 1
                         ).map((n) => (
                       <option key={n} value={n}>
                       {n} personne{n > 1 ? 's' : ''}
                    </option>
                    ))}

                  </select>
                </div>
              </>
            )}
          </div>

          <div className="d-flex gap-3 mt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="btn btn-outline-secondary"
            >
              <ArrowLeft className="me-2" size={16} /> Retour
            </button>
            <button
  onClick={() => {
    if (typeof checkAvailability === "function") {
      checkAvailability();
      setCurrentStep(4);
    } else {
      console.error("checkAvailability n'est pas défini !");
    }
  }}
  className="btn btn-primary"
>
  Continuer
</button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetails;
