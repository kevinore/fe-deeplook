import { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { useApiClient } from '../lib/api';

const STATUS_LABELS = {
  completed:  { label: 'Completado', color: '#166534', bg: '#dcfce7' },
  processing: { label: 'Procesando', color: '#92400e', bg: '#fef3c7' },
  pending:    { label: 'En cola',    color: '#1e40af', bg: '#dbeafe' },
  failed:     { label: 'Error',      color: '#991b1b', bg: '#fee2e2' },
};

const formatJobName = (job) => {
  const d = new Date(job.created_at);
  return `Reporte del ${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ProgressSection = ({ job }) => {
  if (job.status === 'pending') {
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#93c5fd', animation: 'pulse 1.5s ease-in-out infinite' }} />
          En cola — esperando disponibilidad…
        </div>
        <div style={{ height: 5, background: '#ededed', borderRadius: 3, overflow: 'hidden' }}>
          <div className="skeleton" style={{ height: '100%', width: '100%', borderRadius: 3 }} />
        </div>
      </div>
    );
  }

  if (job.status === 'processing') {
    const total = job.total_conversations || 1;
    const done  = job.processed_conversations ?? 0;
    const pct   = Math.min(Math.round((done / total) * 100), 100);
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#92400e' }}>
            Analizando conversación {done} de {total}…
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: '#ededed', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
            borderRadius: 3,
            transition: 'width 700ms ease',
          }} />
        </div>
        {total > 0 && (
          <div style={{ fontSize: 11, color: 'rgba(14,7,73,0.4)', marginTop: 5, textAlign: 'right' }}>
            {total - done} restante{total - done !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  return null;
};

const ReportCard = ({ job, onDownload, downloading }) => {
  const statusInfo = STATUS_LABELS[job.status] ?? STATUS_LABELS.pending;
  const name = formatJobName(job);
  const date = formatDate(job.completed_at || job.created_at);
  const isCompleted = job.status === 'completed';
  const isActive    = job.status === 'pending' || job.status === 'processing';

  return (
    <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', transition: 'border-color 200ms, box-shadow 200ms, transform 200ms' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(79,70,229,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#ededed'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, background: isActive ? 'rgba(251,191,36,0.12)' : 'rgba(79,70,229,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isActive
            ? <div style={{ width: 20, height: 20, border: '2.5px solid #fde68a', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            : <Icon name="file" size={20} color="#4f46e5" />
          }
        </div>
        <span style={{ background: statusInfo.bg, color: statusInfo.color, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999 }}>
          {statusInfo.label}
        </span>
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749', marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.45)', marginBottom: 10 }}>{date}</div>

      {job.total_conversations > 0 && !isActive && (
        <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.6)', marginBottom: 14 }}>
          {job.total_conversations} conversaciones
        </div>
      )}

      <ProgressSection job={job} />

      <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
        <button
          onClick={() => isCompleted && onDownload(job.job_id)}
          disabled={!isCompleted || downloading}
          className={isCompleted ? 'btn-ghost' : ''}
          style={{
            flex: 1, padding: '9px', fontSize: 13,
            background: isCompleted ? undefined : '#f4f4f6',
            border: isCompleted ? undefined : '1.5px solid #e4e4e8',
            borderRadius: 8, cursor: isCompleted && !downloading ? 'pointer' : 'default',
            color: isCompleted ? undefined : 'rgba(14,7,73,0.35)',
            fontFamily: 'DM Sans,sans-serif', fontWeight: 500,
          }}>
          {downloading ? 'Descargando…' : isActive ? 'Generando reporte…' : 'Ver reporte'}
        </button>
        <button
          onClick={() => isCompleted && onDownload(job.job_id)}
          disabled={!isCompleted || downloading}
          style={{ width: 38, height: 38, background: isCompleted ? 'rgba(79,70,229,0.06)' : '#f4f4f6', border: '1px solid #ededed', borderRadius: 8, cursor: isCompleted && !downloading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="download" size={15} color={isCompleted ? '#4f46e5' : '#c4c4c8'} />
        </button>
      </div>
    </div>
  );
};

const EmptyState = ({ hasSearch, onNavigate }) => (
  <div style={{ textAlign: 'center', padding: '80px 0' }}>
    <div style={{ width: 64, height: 64, background: '#f4f3ff', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
      <Icon name="file" size={28} color="#a78bfa" />
    </div>
    {hasSearch
      ? <p style={{ color: 'rgba(14,7,73,0.4)', fontSize: 15 }}>No se encontraron reportes para tu búsqueda.</p>
      : <>
          <p style={{ color: 'rgba(14,7,73,0.55)', fontSize: 15, marginBottom: 20 }}>Aún no tienes reportes generados.</p>
          <button onClick={() => onNavigate?.('connect')} className="btn-primary" style={{ padding: '11px 24px', fontSize: 14 }}>
            Conectar WhatsApp
          </button>
        </>
    }
  </div>
);

const FILTERS = ['Todos', 'Últimos 30 días', 'Últimos 90 días', 'Solo completados'];

const applyFilter = (jobs, filter) => {
  const now = Date.now();
  if (filter === 'Últimos 30 días') return jobs.filter(j => now - new Date(j.created_at).getTime() <= 30 * 86400000);
  if (filter === 'Últimos 90 días') return jobs.filter(j => now - new Date(j.created_at).getTime() <= 90 * 86400000);
  if (filter === 'Solo completados') return jobs.filter(j => j.status === 'completed');
  return jobs;
};

const POLL_INTERVAL_MS = 3000;

// jobs: null = loading (from Dashboard) | [...] = ready
// onJobsUpdate: Dashboard's setJobs — used to propagate polling updates upward
const DashReports = ({ onNavigate, jobs, onJobsUpdate }) => {
  const api = useApiClient();
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [downloadingIds, setDownloadingIds] = useState(new Set());
  const [error] = useState(null);
  const apiRef = useRef(api);
  useEffect(() => { apiRef.current = api; }, [api]);

  // Full-list refresh on mount — catches jobs created after Dashboard's initial load
  // (e.g. a sync triggered right after QR scan)
  useEffect(() => {
    apiRef.current.get('/api/v1/jobs')
      .then(fresh => onJobsUpdate(fresh))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll the full jobs list every 3s while any job is active.
  // Fetching the full list (not per-job) means newly created jobs are discovered automatically.
  const hasActive = (jobs ?? []).some(j => j.status === 'pending' || j.status === 'processing');
  useEffect(() => {
    if (!hasActive) return;
    const timer = setInterval(async () => {
      try {
        const fresh = await apiRef.current.get('/api/v1/jobs');
        onJobsUpdate(fresh);
      } catch {}
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActive]);

  const handleDownload = async (jobId) => {
    if (!jobId || downloadingIds.has(jobId)) return;
    setDownloadingIds(prev => new Set(prev).add(jobId));
    try {
      const res = await api.get(`/api/v1/reports/${jobId}/download`, { raw: true });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-deeplook-${String(jobId).slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(`No se pudo descargar el reporte: ${e.message || 'intenta de nuevo.'}`);
    } finally {
      setDownloadingIds(prev => { const s = new Set(prev); s.delete(jobId); return s; });
    }
  };

  const filtered = applyFilter(jobs ?? [], filter)
    .filter(j => formatJobName(j).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalCompleted = (jobs ?? []).filter(j => j.status === 'completed').length;
  const totalActive    = (jobs ?? []).filter(j => j.status === 'pending' || j.status === 'processing').length;

  return (
    <div className="dash-page page-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0e0749', letterSpacing: '-0.02em', marginBottom: 4 }}>Mis reportes</h1>
          <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {jobs === null
              ? 'Cargando…'
              : <>
                  {`${totalCompleted} reporte${totalCompleted !== 1 ? 's' : ''} completado${totalCompleted !== 1 ? 's' : ''}`}
                  {totalActive > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fef3c7', color: '#92400e', fontSize: 13, fontWeight: 600, padding: '2px 10px', borderRadius: 999 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1.2s ease-in-out infinite' }} />
                      {totalActive} en proceso
                    </span>
                  )}
                </>
            }
          </p>
        </div>
        <button onClick={() => onNavigate('connect')} className="btn-primary" style={{ padding: '11px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Icon name="refresh" size={16} color="white" /> Nuevo sync
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#991b1b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 700, fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '8px 16px', borderRadius: 999, border: '1.5px solid', borderColor: filter === f ? '#4f46e5' : '#ededed', background: filter === f ? '#4f46e5' : 'white', color: filter === f ? 'white' : 'rgba(14,7,73,0.65)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all 200ms', whiteSpace: 'nowrap' }}>{f}</button>
          ))}
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Icon name="search" size={15} color="#a78bfa" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar reporte…"
            style={{ paddingLeft: 36, paddingRight: 16, height: 40, border: '1.5px solid #ededed', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none', width: 220, color: '#0e0749', background: 'white', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#ededed'} />
        </div>
      </div>

      {jobs === null ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #ededed', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasSearch={!!search || filter !== 'Todos'} onNavigate={onNavigate} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {filtered.map(job => (
            <ReportCard
              key={job.job_id}
              job={job}
              onDownload={handleDownload}
              downloading={downloadingIds.has(job.job_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashReports;
