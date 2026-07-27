import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AdminRoute = () => {
  const { user } = useAuth();

  // If not logged in OR not admin → show 404 (hide admin panel existence)
  if (!user || user.role !== 'admin') {
    return <NotFoundPage />;
  }

  return <Outlet />;
};

export default AdminRoute;

