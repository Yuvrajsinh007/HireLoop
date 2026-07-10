import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from './Loader';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show the loader while the authentication state is being verified
  if (isLoading) {
    return <Loader />;
  }

  // If the user is not logged in, redirect them to the login page
  // We pass the current location in state so we can redirect them back after they log in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if the user's role is in the allowed list
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized users back to their respective home/dashboard
    return <Navigate to="/" replace />;
  }

  // If authenticated (and authorized), render the child components (the nested routes)
  return <Outlet />;
};

export default ProtectedRoute;