import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '@/utils/adminUtils';

export function LoginPage() {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        identity,
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('admin', JSON.stringify(res.data.admin));
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container" style={{ maxWidth: '480px', marginTop: '80px' }}>
      <div className="admin-card">
        <h1 className="admin-title" style={{ marginBottom: '8px', textAlign: 'center' }}>Admin Login</h1>
        <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: '24px' }}>
          Sign in to manage your portfolio content.
        </p>

        {error && (
          <div style={{ padding: '12px', background: '#fdf2f2', color: '#b42318', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-group">
            <label htmlFor="identity">Username or Email</label>
            <input
              type="text"
              id="identity"
              className="admin-input"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g. admin or admin@example.com"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
          Don't have an account? <Link to="/admin/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register one here</Link>
        </div>
      </div>
    </div>
  );
}
