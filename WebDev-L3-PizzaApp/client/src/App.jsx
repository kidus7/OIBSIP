import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Components & Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DriverRoute from './components/DriverRoute';
import InstallPWA from './components/InstallPWA';

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

// Admin Protected Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import InventoryManagement from './pages/admin/InventoryManagement';
import IncomingOrders from './pages/admin/IncomingOrders';
import DriversManagement from './pages/admin/DriversManagement';

// Driver Protected Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import { useAuth } from './hooks/useAuth';

function AuthRedirect({ children, redirectWhenAuthenticated = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (redirectWhenAuthenticated && user) {
    return <Navigate replace to="/dashboard" />;
  }

  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return <Navigate replace to={user ? '/dashboard' : '/login'} />;
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading SliceMasters...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Navbar />
        <main style={{ flex: 1, padding: '20px' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<AuthRedirect redirectWhenAuthenticated><Login /></AuthRedirect>} />
            <Route path="/register" element={<AuthRedirect redirectWhenAuthenticated><Register /></AuthRedirect>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-register" element={<AdminRegister />} />

            {/* User Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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

            {/* Driver Protected Routes */}
            <Route path="/driver/dashboard" element={<DriverRoute><DriverDashboard /></DriverRoute>} />

            {/* Default Route */}
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </main>
        <Footer />
        <InstallPWA />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}