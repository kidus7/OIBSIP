import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

export default function DriverRoute({ children }) {
  const { user, token: storeToken } = useSelector((state) => state.auth);
  const token = storeToken || localStorage.getItem('token');
  const role = user?.role || localStorage.getItem('role');

  if (!token || role !== 'driver') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
