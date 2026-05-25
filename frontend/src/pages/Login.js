import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/login/', form);
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch {
      setError('Invalid username or password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 48, width: 400, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌿</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Breathe ESG</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Emissions Data Platform</p>
        </div>

        {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14, border: '1px solid #fecaca' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {[['username', 'Username', 'text'], ['password', 'Password', 'password']].map(([key, label, type]) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
              <input type={type} value={form[key]} required
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 13, background: loading ? '#7dd3fc' : '#0ea5e9',
            color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8
          }}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
          No account? <Link to="/register" style={{ color: '#0ea5e9', fontWeight: 600 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}