// src/components/reservation/RoomList.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import RoomCard from './RoomCard';

const RoomList = ({ checkInDate, checkOutDate }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/rooms/available', {
          params: { check_in: checkInDate, check_out: checkOutDate }
        });
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [checkInDate, checkOutDate]);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="room-list">
      {rooms.length > 0 ? (
        rooms.map(room => (
          <RoomCard key={room.id} room={room} />
        ))
      ) : (
        <div>Aucune chambre disponible pour ces dates</div>
      )}
    </div>
  );
};

export default RoomList;