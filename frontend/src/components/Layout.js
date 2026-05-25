import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const logout = () => { localStorage.clear(); navigate('/login'); };
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 240, background: '#0f172a', color: '#fff',
        padding: '24px 0', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh'
      }}>
        <div style={{ padding: '0 24px 8px', fontSize: 20, fontWeight: 700, color: '#38bdf8' }}>🌿 Breathe ESG</div>
        <div style={{ padding: '0 24px 24px', fontSize: 12, color: '#475569' }}>{user.organisation?.name || ''}</div>

        {[
          { to: '/', label: '📊 Dashboard' },
          { to: '/upload', label: '📤 Upload Data' },
          { to: '/review', label: '✅ Review Records' },
        ].map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
            display: 'block', padding: '12px 24px', color: isActive ? '#fff' : '#94a3b8',
            textDecoration: 'none', fontSize: 14,
            background: isActive ? '#1e293b' : 'transparent',
            borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
          })}>{label}</NavLink>
        ))}

        <div style={{ marginTop: 'auto', padding: '16px 24px', borderTop: '1px solid #1e293b' }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
            {user.username} · {user.role}
          </div>
          <button onClick={logout} style={{
            background: 'none', border: '1px solid #334155', color: '#94a3b8',
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13, width: '100%'
          }}>Logout</button>
        </div>
      </aside>
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}