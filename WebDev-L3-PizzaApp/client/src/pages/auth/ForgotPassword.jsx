import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authService.forgotPassword(email);
      setMessage('Password reset link sent to your email. Please check your inbox.');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send password reset email');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#1f2937', marginBottom: '1.5rem', textAlign: 'center' }}>Forgot Password</h2>

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
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Email Address:</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
            placeholder="user@example.com" 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', background: loading ? '#fcd34d' : '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#4b5563' }}>
        Remembered your password? <Link to="/login" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
      </div>
    </div>
  );
}
