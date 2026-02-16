// resources/js/components/sections/HeroSection.jsx
import React from 'react';

export const HeroSection = () => {
  return (
    <section id="accueil" className="relative h-screen bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center text-white">
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Bienvenue à Hotel Paradise
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Découvrez le luxe et le confort dans un cadre paradisiaque
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
            Réserver une chambre
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
            Découvrir nos services
          </button>
        </div>
      </div>
    </section>
  );
};