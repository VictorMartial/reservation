import React, { useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';

const ItemSelection = ({ reservationType, chambres, tables, selectedItem, setSelectedItem, setCurrentStep }) => {
  // Sécurisation : si chambres ou tables sont undefined, on utilise un tableau vide
  const items = reservationType === 'chambre' ? chambres ?? [] : tables ?? [];

  return (
    <div className="container">
      <h2 className="text-center mb-5">
        Choisissez votre {reservationType}
      </h2>

      <div className={`row ${reservationType === 'chambre' ? '' : 'justify-content-center'}`}>
        {(items ?? []).map((item) => (
          <div key={item.id} className={`${reservationType === 'chambre' ? 'col-lg-4 col-md-6' : 'col-lg-4 col-md-6'} mb-4`}>
            <div 
              className={`card h-100 ${selectedItem?.id === item.id ? 'border-primary bg-light' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedItem(item)}
            >
              {reservationType === 'chambre' ? (
                <>
                  <img 
                    src={item.image} 
                    alt={`Chambre ${item.numero}`}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title">Chambre {item.numero}</h5>
                      <span className="badge bg-primary fs-6">{item.prix}€/nuit</span>
                    </div>
                    <p className="card-text text-muted small">{item.description}</p>
                    <div className="d-flex flex-wrap gap-1">
                      {item.equipements.slice(0, 3).map((eq, idx) => (
                        <span key={idx} className="badge bg-secondary small">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title">Table {item.numero}</h5>
                    <span className="badge bg-primary">
                      {item.type}
                    </span>
                  </div>
                  <div className="d-flex align-items-center text-muted mb-2">
                    <Users className="me-2" size={16} />
                    <span>{item.nombre_places} places</span>
                  </div>
                  <div className={`small ${item.disponible ? 'text-success' : 'text-danger'}`}>
                    {item.disponible ? '✓ Disponible' : '✗ Occupée'}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="text-center mt-4">
          <button 
            onClick={() => setCurrentStep(3)}
            className="btn btn-primary btn-lg"
          >
            Continuer <ArrowRight className="ms-2" size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// Exemple de composant parent qui utilise ItemSelection
const ReservationPage = () => {
  const [reservationType, setReservationType] = useState('chambre'); // ou 'table'
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentStep, setCurrentStep] = useState(2); // Supposons étape 2 pour choix item

  // Exemple de données initiales — à remplacer par un fetch API ou autre source réelle
  const chambres = [
    {
      id: 1,
      numero: '101',
      prix: 70,
      description: 'Chambre confortable avec vue sur jardin',
      equipements: ['WiFi', 'Climatisation', 'Télévision'],
      image: 'https://via.placeholder.com/400x200?text=Chambre+101',
    },
    {
      id: 2,
      numero: '102',
      prix: 85,
      description: 'Suite avec balcon et minibar',
      equipements: ['WiFi', 'Minibar', 'Balcon'],
      image: 'https://via.placeholder.com/400x200?text=Chambre+102',
    },
  ];

  const tables = [
    {
      id: 1,
      numero: 'A1',
      type: 'Intérieure',
      nombre_places: 4,
      disponible: true,
    },
    {
      id: 2,
      numero: 'T2',
      type: 'Terrasse',
      nombre_places: 6,
      disponible: false,
    },
  ];

  return (
    <div>
      {/* Par exemple un select pour changer de type de réservation */}
      <div className="mb-4 text-center">
        <button onClick={() => { setReservationType('chambre'); setSelectedItem(null); }}>Réserver une chambre</button>
        <button onClick={() => { setReservationType('table'); setSelectedItem(null); }} className="ms-2">Réserver une table</button>
      </div>

      {currentStep === 2 && (
        <ItemSelection 
          reservationType={reservationType}
          chambres={chambres}
          tables={tables}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          setCurrentStep={setCurrentStep}
        />
      )}

      {currentStep === 3 && (
        <div className="text-center">
          <h3>Validation de la réservation</h3>
          <p>Vous avez choisi : {reservationType} n°{selectedItem.numero}</p>
          {/* Ici tu peux ajouter un bouton pour confirmer, modifier, revenir, etc. */}
          <button onClick={() => setCurrentStep(2)}>Retour</button>
        </div>
      )}
    </div>
  );
};

export default ReservationPage;
