import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem('token');

  if (!user && !token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;