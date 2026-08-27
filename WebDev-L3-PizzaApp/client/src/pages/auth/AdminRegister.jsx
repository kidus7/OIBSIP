import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

export default function AdminRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await authService.adminRegister({ name, email, password, adminSecret });

      if (data.user.role !== 'admin') {
        setError('Access denied. Administrator privileges required.');
        setLoading(false);
        return;
      }

      login(data.user, data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);

      setMessage('Admin registration successful! Redirecting...');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Admin registration failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ef4444', borderRadius: '8px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#dc2626', marginBottom: '1.5rem', textAlign: 'center' }}>Admin Portal Registration</h2>
      
      {error && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#d1fae5', color: '#065f46', borderRadius: '4px', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Name:</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
            placeholder="Admin Name" 
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Admin Email:</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
            placeholder="admin@pizzaapp.com" 
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Password:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
            placeholder="******" 
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Admin Security Key:</label>
          <input 
            type="password" 
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
            placeholder="Enter admin secret passkey" 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', background: loading ? '#fca5a5' : '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}
        >
          {loading ? 'Registering...' : 'Register as Admin'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
        <Link to="/admin-login" style={{ color: '#dc2626', textDecoration: 'none' }}>
          Already have an Admin Account? Login here
        </Link>
      </div>
    </div>
  );
}
