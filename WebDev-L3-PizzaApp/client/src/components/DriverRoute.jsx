import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export default function DriverRoute({ children }) {
  const { loading } = useAuth();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!token || role !== 'driver') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
