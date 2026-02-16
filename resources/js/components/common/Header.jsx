// resources/js/components/common/Header.jsx
import React from 'react';
import { Hotel, LogOut, Menu as MenuIcon } from 'lucide-react';
import { useAuth } from '../Auth/AuthContext';

export const Header = ({ onAuthClick, onMenuToggle }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button onClick={onMenuToggle} className="lg:hidden">
            <MenuIcon size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <Hotel className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">Hotel Paradise</h1>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center space-x-6">
          <a href="#accueil" className="text-gray-700 hover:text-blue-600 font-medium">Accueil</a>
          <a href="#chambres" className="text-gray-700 hover:text-blue-600 font-medium">Chambres</a>
          <a href="#restaurant" className="text-gray-700 hover:text-blue-600 font-medium">Restaurant</a>
          <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium">Contact</a>
        </nav>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bonjour, {user?.name}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
};