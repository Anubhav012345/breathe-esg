import React, { useState, useEffect } from 'react';
import API from '../api';

const STATUS_STYLE = {
  done: { bg: '#f0fdf4', color: '#15803d' },
  failed: { bg: '#fef2f2', color: '#dc2626' },
  processing: { bg: '#fffbeb', color: '#d97706' },
};

export default function Upload() {
  const [file, setFile] = useState(null);
  const [sourceType, setSourceType] = useState('sap');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [batches, setBatches] = useState([]);

  const loadBatches = () => API.get('/ingestion/batches/').then(r => setBatches(r.data.results || r.data)).catch(() => {});
  useEffect(() => { loadBatches(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    const fd = new FormData();
    fd.append('file', file); fd.append('source_type', sourceType);
    try {
      const res = await API.post('/ingestion/upload/', fd);
      setResult(res.data); loadBatches();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally { setLoading(false); }
  };

  const sources = [
    { value: 'sap', label: '🏭 SAP — Fuel & Procurement', desc: 'CSV/XLSX export from SAP MB51 transaction' },
    { value: 'utility', label: '⚡ Utility — Electricity', desc: 'CSV export from utility portal (kWh/MWh)' },
    { value: 'travel', label: '✈️ Corporate Travel', desc: 'CSV export from Concur/Navan platform' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700 }}>Upload Data</h2>
        <p style={{ color: '#64748b', marginTop: 4 }}>Ingest emissions data from SAP, utility portals, or travel platforms</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>New Upload</h3>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Select Source Type</label>
              {sources.map(s => (
                <label key={s.value} style={{
                  display: 'block', padding: '12px 16px', marginBottom: 8, borderRadius: 8, cursor: 'pointer',
                  border: `2px solid ${sourceType === s.value ? '#0ea5e9' : '#e2e8f0'}`,
                  background: sourceType === s.value ? '#f0f9ff' : '#fafafa',
                }}>
                  <input type="radio" value={s.value} checked={sourceType === s.value}
                    onChange={e => setSourceType(e.target.value)} style={{ marginRight: 10 }} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{s.label}</span>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, marginLeft: 22 }}>{s.desc}</div>
                </label>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>File (CSV or XLSX)</label>
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: 8, padding: 24, textAlign: 'center', background: '#f8fafc' }}>
                <input type="file" accept=".csv,.xlsx,.xls" id="fileInput"
                  onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
                  <div style={{ fontSize: 14, color: '#0ea5e9', fontWeight: 600 }}>Click to select file</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>CSV, XLSX or XLS</div>
                </label>
                {file && <div style={{ marginTop: 12, fontSize: 13, color: '#059669', fontWeight: 600 }}>✓ {file.name}</div>}
              </div>
            </div>

            <button type="submit" disabled={loading || !file} style={{
              width: '100%', padding: 13, background: (!file || loading) ? '#bae6fd' : '#0ea5e9',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
              cursor: (!file || loading) ? 'not-allowed' : 'pointer'
            }}>{loading ? '⏳ Processing...' : '🚀 Upload & Ingest'}</button>

            {result && <div style={{ marginTop: 16, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: 16 }}>
              <div style={{ color: '#15803d', fontWeight: 700, marginBottom: 4 }}>✅ Upload Successful!</div>
              <div style={{ fontSize: 13, color: '#166534' }}>Total: {result.total} | Success: {result.success} | Flagged: {result.flagged}</div>
            </div>}
            {error && <div style={{ marginTop: 16, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: 16 }}>
              <div style={{ color: '#dc2626', fontWeight: 600 }}>❌ {error}</div>
            </div>}
          </form>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Sample Data Format</h3>
          {[
            { type: 'SAP CSV', headers: 'Document Number, Plant, Description, Quantity, Unit, Date' },
            { type: 'Utility CSV', headers: 'Meter_ID, Location, Billing_Period_Start, Billing_Period_End, Consumption, Unit' },
            { type: 'Travel CSV', headers: 'Employee, Trip_Type, Origin, Destination, Travel_Date, Distance_km, Nights' },
          ].map(s => (
            <div key={s.type} style={{ marginBottom: 16, padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{s.type}</div>
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{s.headers}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Upload History</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
              {['File', 'Source', 'Status', 'Total', 'Success', 'Flagged', 'Date'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {batches.map(b => {
              const s = STATUS_STYLE[b.status] || STATUS_STYLE.processing;
              return (
                <tr key={b.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px 14px', fontSize: 13 }}>{b.filename}</td>
                  <td style={{ padding: '12px 14px' }}><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{b.source_type.toUpperCase()}</span></td>
                  <td style={{ padding: '12px 14px' }}><span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{b.status}</span></td>
                  <td style={{ padding: '12px 14px', fontSize: 13 }}>{b.total_rows}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#15803d', fontWeight: 600 }}>{b.success_rows}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#d97706', fontWeight: 600 }}>{b.flagged_rows}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#64748b' }}>{new Date(b.uploaded_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
            {batches.length === 0 && <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No uploads yet. Upload your first file above!</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}