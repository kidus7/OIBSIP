import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { CartProvider } from './context/CartContext';

// Components & Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DriverRoute from './components/DriverRoute';
import InstallPWA from './components/InstallPWA';
import LoadingSpinner from './components/LoadingSpinner';

// Public Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminLogin from './pages/auth/AdminLogin';
import AdminRegister from './pages/auth/AdminRegister';

// User Protected Pages
import Dashboard from './pages/user/Dashboard';
import PizzaBuilder from './pages/user/PizzaBuilder';
import CartSummary from './pages/user/CartSummary';
import Checkout from './pages/user/Checkout';
import MyOrders from './pages/user/MyOrders';
import OrderTracking from './pages/user/OrderTracking';
import Profile from './pages/Profile';

// Admin Protected Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import InventoryManagement from './pages/admin/InventoryManagement';
import IncomingOrders from './pages/admin/IncomingOrders';
import DriversManagement from './pages/admin/DriversManagement';
import AdminProfile from './pages/admin/AdminProfile';

// Driver Protected Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverProfile from './pages/driver/DriverProfile';

// Helper to resolve landing page based on user role
function getRoleBasedPath(user) {
  if (!user) return '/login';
  if (user.role === 'admin') return '/admin/dashboard';
  if (user.role === 'driver') return '/driver/dashboard';
  return '/dashboard';
}

function AuthRedirect({ children, redirectWhenAuthenticated = false }) {
  const { user } = useSelector((state) => state.auth);

  if (redirectWhenAuthenticated && user) {
    return <Navigate replace to={getRoleBasedPath(user)} />;
  }

  return children;
}

function RootRedirect() {
  const { user } = useSelector((state) => state.auth);

  return <Navigate replace to={getRoleBasedPath(user)} />;
}

function AppLayout() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Determine if current route is an Admin or Driver view
  const isAdminOrDriverRoute = 
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/driver') ||
    user?.role === 'admin' ||
    user?.role === 'driver';

  const isAuthRoute = 
    ['/login', '/register', '/forgot-password', '/admin-login', '/admin-register'].includes(location.pathname) ||
    location.pathname.startsWith('/reset-password');

  const hideHeaderFooter = isAuthRoute || isAdminOrDriverRoute;

  return (
    <div className="app-container overflow-x-hidden" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      
      {!hideHeaderFooter && <Navbar />}

      <main style={{ flex: 1 }} className={!hideHeaderFooter ? "pt-20" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthRedirect redirectWhenAuthenticated><Login /></AuthRedirect>} />
          <Route path="/register" element={<AuthRedirect redirectWhenAuthenticated><Register /></AuthRedirect>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
          <Route path="/admin-login" element={<AuthRedirect redirectWhenAuthenticated><AdminLogin /></AuthRedirect>} />
          <Route path="/admin-register" element={<AuthRedirect redirectWhenAuthenticated><AdminRegister /></AuthRedirect>} />

          {/* User Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/custom-builder" element={<ProtectedRoute><PizzaBuilder /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><CartSummary /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
          <Route path="/order-tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
          <Route path="/order-tracking/:orderId" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/inventory" element={<AdminRoute><InventoryManagement /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><IncomingOrders /></AdminRoute>} />
          <Route path="/admin/drivers" element={<AdminRoute><DriversManagement /></AdminRoute>} />
          <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />

          {/* Driver Protected Routes */}
          <Route path="/driver/dashboard" element={<DriverRoute><DriverDashboard /></DriverRoute>} />
          <Route path="/driver/profile" element={<DriverRoute><DriverProfile /></DriverRoute>} />

          {/* Default Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Catch-all Fallback Route */}
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </main>

      {!hideHeaderFooter && <Footer />}
      <InstallPWA />
    </div>
  );
}

function AppContent() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default function App() {
  React.useEffect(() => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
