import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
