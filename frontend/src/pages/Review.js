import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

const STATUS_STYLE = {
  pending: { bg: '#fffbeb', color: '#92400e', label: '⏳ Pending' },
  flagged: { bg: '#fef2f2', color: '#991b1b', label: '🚩 Flagged' },
  approved: { bg: '#f0fdf4', color: '#14532d', label: '✅ Approved' },
  rejected: { bg: '#f1f5f9', color: '#475569', label: '✗ Rejected' },
};

export default function Review() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', source_type: '', scope: '' });
  const [actionLoading, setActionLoading] = useState({});
  const [locking, setLocking] = useState(false);

  const loadRecords = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    API.get('/emissions/records/', { params })
      .then(r => setRecords(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const doAction = async (id, action) => {
    setActionLoading(a => ({ ...a, [id]: true }));
    try {
      await API.patch(`/audit/review/${id}/`, { action });
      loadRecords();
    } catch (e) {
      alert(e.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(a => ({ ...a, [id]: false }));
    }
  };

  const lockAll = async () => {
    setLocking(true);
    try {
      const r = await API.post('/audit/lock/');
      alert(`🔒 Locked ${r.data.locked} records for audit`);
      loadRecords();
    } finally { setLocking(false); }
  };

  const sel = { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#fff', marginRight: 8 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700 }}>Review Records</h2>
          <p style={{ color: '#64748b', marginTop: 4 }}>Approve, reject or flag emission records before audit</p>
        </div>
        <button onClick={lockAll} disabled={locking} style={{
          padding: '10px 20px', background: '#7c3aed', color: '#fff',
          border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14
        }}>🔒 Lock Approved for Audit</button>
      </div>

      <div style={{ display: 'flex', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        {[
          ['status', [['', 'All Statuses'], ['pending', 'Pending'], ['flagged', 'Flagged'], ['approved', 'Approved'], ['rejected', 'Rejected']]],
          ['source_type', [['', 'All Sources'], ['sap', 'SAP'], ['utility', 'Utility'], ['travel', 'Travel']]],
          ['scope', [['', 'All Scopes'], ['scope1', 'Scope 1'], ['scope2', 'Scope 2'], ['scope3', 'Scope 3']]],
        ].map(([key, opts]) => (
          <select key={key} style={sel} value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}>
            {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading records...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Source', 'Scope', 'Category', 'Period', 'Location', 'Raw Amount', 'CO₂e (kg)', 'Status', 'Flag Reason', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const s = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
                  const busy = actionLoading[r.id];
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '11px 14px' }}><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{r.source_type?.toUpperCase()}</span></td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#374151' }}>{r.scope}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 600 }}>{r.category}</td>
                      <td style={{ padding: '11px 14px', fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>{r.period_start}</td>
                      <td style={{ padding: '11px 14px', fontSize: 11, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.location}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12 }}>{r.raw_quantity?.toFixed(1)} {r.raw_unit}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{r.co2e_kg?.toFixed(1)}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: 11, color: '#ef4444', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.flag_reason}>{r.flag_reason}</td>
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                        {r.locked_for_audit ? (
                          <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>🔒 Locked</span>
                        ) : (
                          <>
                            {r.status !== 'approved' && (
                              <button onClick={() => doAction(r.id, 'approve')} disabled={busy}
                                style={{ padding: '4px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 5, fontSize: 11, cursor: 'pointer', marginRight: 4, fontWeight: 600 }}>✓ Approve</button>
                            )}
                            {r.status !== 'rejected' && (
                              <button onClick={() => doAction(r.id, 'reject')} disabled={busy}
                                style={{ padding: '4px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>✗ Reject</button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {records.length === 0 && (
                  <tr><td colSpan={10} style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
                    No records found. Upload some data first!
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}