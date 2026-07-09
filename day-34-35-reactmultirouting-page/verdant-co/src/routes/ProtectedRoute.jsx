import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Not logged in, redirect to login
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Logged in but wrong role, redirect to appropriate default
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/shop'} replace />;
  }

  // If role matches, or no role required, render child routes
  return <Outlet />;
};

export default ProtectedRoute;
