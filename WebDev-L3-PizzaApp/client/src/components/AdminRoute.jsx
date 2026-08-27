import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export default function AdminRoute({ children }) {
  const { loading } = useAuth();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!token || role !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
