// components/TypeSelection.jsx
import React from 'react';
import { Bed, Utensils } from 'lucide-react';

const TypeSelection = ({ setReservationType, setCurrentStep }) => {
  const handleTypeSelection = (type) => {
    setReservationType(type);
    setCurrentStep(2); // Move to the selection step
  };

  return (
    <div className="container text-center">
      <h2 className="mb-5">Choisissez le type de réservation</h2>
      <div className="row justify-content-center">
        <div className="col-md-4 mb-4">
          <button
            className="btn btn-outline-primary w-100 p-4"
            onClick={() => handleTypeSelection('chambre')}
          >
            <Bed className="me-2" size={24} />
            Chambre
          </button>
        </div>
        <div className="col-md-4 mb-4">
          <button
            className="btn btn-outline-primary w-100 p-4"
            onClick={() => handleTypeSelection('table')}
          >
            <Utensils className="me-2" size={24} />
            Table
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypeSelection;