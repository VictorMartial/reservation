// resources/js/components/sections/RoomSearchSection.jsx
import React, { useState } from 'react';
import { RoomCard } from '../cards/RoomCard';
import apiService from '../../services/apiService';

export const RoomSearchSection = () => {
  const [searchData, setSearchData] = useState({
    date_debut: '',
    date_fin: '',
    nombre_personnes: 2
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const rooms = await apiService.checkAvailableRooms(searchData);
      setAvailableRooms(Array.isArray(rooms) ? rooms : []);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setAvailableRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="chambres" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Nos Chambres</h2>
          <p className="text-gray-600 text-lg">Trouvez la chambre parfaite pour votre séjour</p>
        </div>
        
        {/* Formulaire de recherche */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-12 max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date d'arrivée</label>
              <input
                type="date"
                value={searchData.date_debut}
                onChange={(e) => handleInputChange('date_debut', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date de départ</label>
              <input
                type="date"
                value={searchData.date_fin}
                onChange={(e) => handleInputChange('date_fin', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nombre de personnes</label>
              <select
                value={searchData.nombre_personnes}
                onChange={(e) => handleInputChange('nombre_personnes', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1,2,3,4,5,6].map(num => (
                  <option key={num} value={num}>{num} personne{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Résultats de recherche */}
        {availableRooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};