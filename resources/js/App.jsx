// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import PaiementPage from './pages/PaiementPage';
import RestaurantPage from './pages/RestaurantPage';
import MyReservationsPage from './pages/MyReservationsPage';
import AdminPage from './pages/AdminPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chambres" element={<RoomsPage />} />
            <Route path="/restaurant" element={<RestaurantPage />} />
            <Route path="/paiements" element={<PaiementPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<PrivateRoute />}>
              <Route path="/mes-reservations" element={<MyReservationsPage />} />
            </Route>
            
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;