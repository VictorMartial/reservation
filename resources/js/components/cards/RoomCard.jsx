// resources/js/components/cards/RoomCard.jsx
import React from 'react';
import { Hotel, Users } from 'lucide-react';
import { useAuth } from '../Auth/AuthContext';

export const RoomCard = ({ room }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
        <Hotel size={64} className="text-white" />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Chambre {room.numero || 'Standard'}
        </h3>
        <p className="text-gray-600 mb-4">
          {room.description || 'Chambre confortable avec toutes les commodités'}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-600">
            <Users size={18} className="mr-2" />
            <span>{room.capacite || 2} personnes</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {room.prix_par_nuit?.toLocaleString() || '50 000'} Ar/nuit
          </div>
        </div>
        
        <button
          disabled={!isAuthenticated}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAuthenticated ? 'Réserver maintenant' : 'Connectez-vous pour réserver'}
        </button>
      </div>
    </div>
  );
};