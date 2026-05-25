import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'analyst', organisation_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await API.post('/auth/register/', form);
      navigate('/login');
    } catch (err) {
      setError(JSON.stringify(err.response?.data || 'Registration failed'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 48, width: 420, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28, textAlign: 'center' }}>Create Account</h1>
        {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            ['username', 'Username', 'text'],
            ['email', 'Email', 'email'],
            ['password', 'Password', 'password'],
            ['organisation_name', 'Organisation Name', 'text'],
          ].map(([key, label, type]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
              <input type={type} value={form[key]} required
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
            </div>
          ))}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
              <option value="auditor">Auditor</option>
            </select>
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 13, background: '#0ea5e9', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#64748b' }}>
          Have an account? <Link to="/login" style={{ color: '#0ea5e9', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}