import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '@/utils/adminUtils';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        name,
        username,
        email,
        password,
      });

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container" style={{ maxWidth: '480px', marginTop: '60px' }}>
      <div className="admin-card">
        <h1 className="admin-title" style={{ marginBottom: '8px', textAlign: 'center' }}>Admin Registration</h1>
        <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: '24px' }}>
          Create an administrator account.
        </p>

        {error && (
          <div style={{ padding: '12px', background: '#fdf2f2', color: '#b42318', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '12px', background: '#e6f4ea', color: '#137333', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              className="admin-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g. Malay Maity"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="admin-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g. malayadmin"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g. malay.official.cse@gmail.com"
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
          Already have an account? <Link to="/admin/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Login here</Link>
        </div>
      </div>
    </div>
  );
}
