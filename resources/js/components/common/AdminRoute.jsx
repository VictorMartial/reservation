import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const isAdmin = true; // remplace par ta logique admin

  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
