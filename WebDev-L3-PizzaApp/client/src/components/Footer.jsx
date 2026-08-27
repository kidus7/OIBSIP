import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Footer() {

  const navigate = useNavigate();
  const location = useLocation();
  
  const hiddenRoutes = [
    '/',
    '/admin',
    '/driver',
    '/login',
    '/logout',
    '/admin-login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];

  const shouldHideNavbar = hiddenRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  if (shouldHideNavbar) {
    return null;
  }
  
  return (
    <footer style={{ background: '#1f2937', color: '#9ca3af', textAlign: 'center', padding: '1rem', marginTop: 'auto' }}>
      <p style={{ margin: 0 }}>&copy; 2026 OIBSIP WebDev L3 SliceMasters PizzaApp. All rights reserved.</p>
    </footer>
  );
}
