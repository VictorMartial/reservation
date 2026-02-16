import React from 'react';

export const ContactSection = () => {
  return (
    <section className="py-16 bg-white text-center border-t">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Contactez-nous</h2>
        <p className="text-gray-600 mb-8">
          Vous avez une question ? Un besoin de réservation ? Contactez-nous par les moyens ci-dessous.
        </p>
        <div className="space-y-4 text-gray-700">
          <p>
            📍 Adresse : Lot 123, Sakaraha, Madagascar
          </p>
          <p>
            📞 Téléphone : <a href="tel:+261123456789" className="text-blue-600 hover:underline">+261 12 345 6789</a>
          </p>
          <p>
            ✉️ Email : <a href="mailto:contact@hotel.com" className="text-blue-600 hover:underline">contact@hotel.com</a>
          </p>
        </div>
      </div>
    </section>
  );
};
