import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function ResetPassword() {
  const { id, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await authService.resetPassword(id, token, password);
      setMessage(data.message || 'Password successfully updated! Redirecting to login...');
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to reset password');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#1f2937', marginBottom: '1.5rem', textAlign: 'center' }}>Reset Password</h2>

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
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>New Password:</label>
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
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Confirm New Password:</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
            placeholder="******" 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', background: loading ? '#93c5fd' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#4b5563' }}>
        Back to <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
      </div>
    </div>
  );
}
