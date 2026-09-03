import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

export default function AdminRoute({ children }) {
  const { user, token: storeToken } = useSelector((state) => state.auth);
  const token = storeToken || localStorage.getItem('token');
  const role = user?.role || localStorage.getItem('role');

  if (!token || role !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
