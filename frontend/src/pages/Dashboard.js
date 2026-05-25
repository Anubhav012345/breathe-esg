import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import API from '../api';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

function StatCard({ label, value, color = '#0f172a', bg = '#f1f5f9', icon }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: '20px 24px', flex: 1, minWidth: 130, border: `1px solid ${bg === '#f1f5f9' ? '#e2e8f0' : 'transparent'}` }}>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{icon} {label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/audit/stats/').then(r => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div style={{ color: '#64748b' }}>Loading dashboard...</div>
    </div>
  );

  const scopeData = [
    { name: 'Scope 1', value: stats.by_scope.scope1, fill: '#0ea5e9' },
    { name: 'Scope 2', value: stats.by_scope.scope2, fill: '#10b981' },
    { name: 'Scope 3', value: stats.by_scope.scope3, fill: '#f59e0b' },
  ];
  const sourceData = [
    { name: 'SAP', value: stats.by_source.sap },
    { name: 'Utility', value: stats.by_source.utility },
    { name: 'Travel', value: stats.by_source.travel },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a' }}>Emissions Dashboard</h2>
        <p style={{ color: '#64748b', marginTop: 4 }}>Overview of all ingested emission records</p>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard icon="📋" label="Total Records" value={stats.total} />
        <StatCard icon="⏳" label="Pending" value={stats.pending} color="#d97706" bg="#fffbeb" />
        <StatCard icon="🚩" label="Flagged" value={stats.flagged} color="#dc2626" bg="#fef2f2" />
        <StatCard icon="✅" label="Approved" value={stats.approved} color="#059669" bg="#f0fdf4" />
        <StatCard icon="🔒" label="Locked" value={stats.locked} color="#7c3aed" bg="#f5f3ff" />
      </div>

      <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', borderRadius: 12, padding: '20px 28px', marginBottom: 24, color: '#fff' }}>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Total Approved CO₂ Emissions</div>
        <div style={{ fontSize: 36, fontWeight: 700 }}>{(stats.total_co2e_kg / 1000).toFixed(2)} tCO₂e</div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>From {stats.approved} approved records</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: '#374151' }}>Records by Scope</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={scopeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${value}`}>
                {scopeData.map((entry, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: '#374151' }}>Records by Source</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sourceData} barSize={40}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}