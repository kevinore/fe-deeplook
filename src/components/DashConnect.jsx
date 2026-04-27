import { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { useApiClient } from '../lib/api';

const timeAgo = (dateStr) => {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'justo ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)} días`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
};

const Spinner = ({ size = 32, color = '#4f46e5' }) => (
  <div style={{
    width: size, height: size,
    border: `3px solid rgba(79,70,229,0.15)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  }} />
);

/* ── No connection ─────────────────────────────────────────── */
const ConnectCTA = ({ onConnect, loading, plan }) => (
  <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
    <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#4f46e5,#6c63ff)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
      <Icon name="whatsapp" size={40} color="white" />
    </div>
    <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0e0749', marginBottom: 12, letterSpacing: '-0.01em' }}>
      Conecta tu WhatsApp para empezar
    </h2>
    <p style={{ fontSize: 16, color: 'rgba(14,7,73,0.6)', marginBottom: 32, lineHeight: 1.6 }}>
      Una vez vinculado, sincronizaremos tus conversaciones automáticamente y generaremos reportes de análisis periódicos.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36, textAlign: 'left', background: '#f4f3ff', borderRadius: 14, padding: '20px 24px', border: '1px solid rgba(79,70,229,0.1)' }}>
      {[
        { icon: 'zap',    text: 'Sync automático según tu plan (mensual · semanal)' },
        { icon: 'shield', text: 'Solo lectura — nunca enviamos mensajes' },
        { icon: 'file',   text: 'Reportes PDF con métricas e insights de IA' },
      ].map(b => (
        <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: 'rgba(79,70,229,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={b.icon} size={16} color="#4f46e5" />
          </div>
          <span style={{ fontSize: 14, color: '#0e0749' }}>{b.text}</span>
        </div>
      ))}
    </div>
    {plan === 'free' ? (
      <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: '#92400e', margin: 0 }}>
          Necesitas un plan activo para conectar WhatsApp. <strong>Actualiza tu plan</strong> para continuar.
        </p>
      </div>
    ) : (
      <button
        onClick={onConnect}
        disabled={loading}
        className="btn-primary"
        style={{ padding: '14px 40px', fontSize: 16, fontWeight: 600, opacity: loading ? 0.7 : 1, cursor: loading ? 'default' : 'pointer' }}>
        {loading ? 'Iniciando…' : 'Conectar ahora'}
      </button>
    )}
  </div>
);

/* ── STARTING spinner ──────────────────────────────────────── */
const StartingCard = () => (
  <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '60px 0' }}>
    <Spinner size={48} />
    <p style={{ fontSize: 16, color: 'rgba(14,7,73,0.6)', marginTop: 28 }}>
      Iniciando sesión en nuestros servidores…
    </p>
    <p style={{ fontSize: 13, color: 'rgba(14,7,73,0.4)', marginTop: 8 }}>
      Esto suele tardar menos de 30 segundos.
    </p>
  </div>
);

/* ── SCAN_QR_CODE ───────────────────────────────────────────── */
const QRCard = ({ qr }) => (
  <div style={{ maxWidth: 720, margin: '0 auto' }}>
    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0e0749', marginBottom: 8, textAlign: 'center' }}>
      Escanea el código QR
    </h2>
    <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.55)', textAlign: 'center', marginBottom: 32 }}>
      El código se actualiza automáticamente cada 20 segundos.
    </p>
    <div className="qr-layout">
      <style>{`.qr-layout { display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center; } @media(max-width:640px){.qr-layout{grid-template-columns:1fr!important}}`}</style>

      {/* Instructions */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749', marginBottom: 18 }}>Instrucciones</div>
        {[
          'Abre WhatsApp en tu teléfono',
          'Ve a Ajustes → Dispositivos vinculados',
          'Toca "Vincular un dispositivo"',
          'Apunta la cámara al código QR',
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, background: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 13, flexShrink: 0 }}>
              {i + 1}
            </div>
            <span style={{ fontSize: 14, color: '#0e0749', lineHeight: 1.55, paddingTop: 4 }}>{step}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)' }}>Detectando scan automáticamente…</span>
        </div>
      </div>

      {/* QR image */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 220, height: 220, background: '#f4f4f6', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ededed', overflow: 'hidden' }}>
          {qr?.qr_base64
            ? <img src={qr.qr_base64} alt="QR Code" style={{ width: 200, height: 200, objectFit: 'contain' }} />
            : <Spinner size={36} />
          }
        </div>
        <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.4)', textAlign: 'center', maxWidth: 220, margin: 0 }}>
          Se renueva cada 20 seg
        </p>
      </div>
    </div>

    {/* Disclaimer */}
    <div style={{ background: '#f4f3ff', border: '1px solid rgba(79,70,229,0.1)', borderRadius: 12, padding: '16px 20px', marginTop: 32 }}>
      <p style={{ fontSize: 13, color: 'rgba(14,7,73,0.6)', margin: 0, lineHeight: 1.65 }}>
        <strong>Sobre la seguridad de tu cuenta</strong> — DeepLook se conecta como un dispositivo vinculado, igual que WhatsApp Web en tu computadora. Solo leemos conversaciones pasadas para generar el reporte; nunca enviamos mensajes y la conexión se apaga automáticamente entre reportes. Existe un riesgo muy bajo pero no nulo de restricción por parte de WhatsApp.
      </p>
    </div>
  </div>
);

/* ── WORKING / STOPPED ─────────────────────────────────────── */
const ConnectedCard = ({ connection, onSync, onUnlink, syncing, quota }) => {
  const syncFreqLabel = { weekly: 'semanal', biweekly: 'quincenal', monthly: 'mensual' }[connection.sync_frequency] ?? connection.sync_frequency;
  const quotaExhausted = quota?.reports?.remaining === 0;
  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#4f46e5,#6c63ff)', borderRadius: 16, padding: '28px 32px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="whatsapp" size={28} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>
              {connection.push_name || 'WhatsApp conectado'}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
              {connection.phone_number || '—'} · Sync {syncFreqLabel}
            </div>
          </div>
        </div>
        <div style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 999, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#bbf7d0' }}>Activo</span>
        </div>
      </div>

      {/* Sync info */}
      <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 14, padding: '22px 26px', marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Última sincronización</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0e0749' }}>
              {connection.last_sync_at ? timeAgo(connection.last_sync_at) : 'Nunca'}
            </div>
            {connection.last_sync_at && (
              <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', marginTop: 3 }}>
                {formatDate(connection.last_sync_at)}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Próximo reporte</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0e0749' }}>
              {connection.next_scheduled_sync_at ? formatDate(connection.next_scheduled_sync_at) : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={!quotaExhausted ? onSync : undefined}
          disabled={syncing || quotaExhausted}
          className="btn-primary"
          style={{ flex: 1, padding: '13px', fontSize: 15, opacity: (syncing || quotaExhausted) ? 0.5 : 1, cursor: (syncing || quotaExhausted) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {syncing
            ? <><Spinner size={18} color="white" /><span>Iniciando sincronización…</span></>
            : quotaExhausted
              ? <><Icon name="alert" size={18} color="white" /><span>Cuota del mes agotada</span></>
              : <><Icon name="refresh" size={18} color="white" /><span>Generar reporte ahora</span></>
          }
        </button>
        <button
          onClick={onUnlink}
          className="btn-ghost"
          style={{ padding: '13px 22px', fontSize: 14, color: '#ef4444', borderColor: '#ef4444', flexShrink: 0 }}>
          Desvincular
        </button>
      </div>

      {quotaExhausted && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="alert" size={14} color="#ef4444" />
          Has usado todos los reportes de este período ({quota.reports.used}/{quota.reports.limit}). Tu cuota se renueva a inicios del próximo mes.
        </div>
      )}

      {/* Privacy note */}
      <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.4)', marginTop: 16, textAlign: 'center', lineHeight: 1.6 }}>
        Solo lectura · La sesión se pausa automáticamente entre reportes · Aparece como "DeepLook" en tus dispositivos vinculados de WhatsApp
      </p>
    </div>
  );
};

/* ── FAILED ─────────────────────────────────────────────────── */
const FailedCard = ({ onRetry, loading }) => (
  <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '48px 0' }}>
    <div style={{ width: 64, height: 64, background: '#fee2e2', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
      <Icon name="x" size={28} color="#ef4444" />
    </div>
    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', marginBottom: 8 }}>La sesión falló</h3>
    <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.55)', marginBottom: 28 }}>
      Hubo un error al conectar con WhatsApp. Por favor intenta de nuevo.
    </p>
    <button onClick={onRetry} disabled={loading} className="btn-primary" style={{ padding: '12px 36px', fontSize: 15, opacity: loading ? 0.7 : 1 }}>
      {loading ? 'Reintentando…' : 'Reintentar'}
    </button>
  </div>
);

/* ── Connection success modal ──────────────────────────────── */
const ConnectedModal = ({ onGoToReports }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,7,73,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'pageFade 250ms ease' }}>
    <div style={{ background: 'white', borderRadius: 20, padding: '40px 36px', maxWidth: 460, width: '100%', boxShadow: '0 24px 80px rgba(14,7,73,0.22)', textAlign: 'center' }}>
      {/* Animated check */}
      <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(34,197,94,0.35)' }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#0e0749', marginBottom: 10, letterSpacing: '-0.01em' }}>
        ¡WhatsApp conectado!
      </div>
      <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.6)', lineHeight: 1.7, marginBottom: 8 }}>
        Tu cuenta está vinculada. Estamos procesando tus conversaciones recientes para generar el primer reporte.
      </p>
      <p style={{ fontSize: 13, color: 'rgba(14,7,73,0.4)', marginBottom: 32, lineHeight: 1.6 }}>
        Este proceso puede tardar unos minutos dependiendo del volumen de chats.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={onGoToReports}
          style={{ width: '100%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(79,70,229,0.32)', fontFamily: 'DM Sans,sans-serif' }}>
          Ver mis reportes →
        </button>
        <button
          onClick={onGoToReports}
          style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(14,7,73,0.45)', fontSize: 13, cursor: 'pointer', padding: '6px', fontFamily: 'DM Sans,sans-serif' }}>
          Cerrar
        </button>
      </div>
    </div>
  </div>
);

/* ── Unlink confirmation modal ─────────────────────────────── */
const UnlinkModal = ({ onConfirm, onCancel, loading }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,7,73,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div style={{ background: 'white', borderRadius: 16, padding: '32px 36px', maxWidth: 440, width: '100%', boxShadow: '0 24px 80px rgba(14,7,73,0.2)' }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', marginBottom: 12 }}>¿Desvincular WhatsApp?</h3>
      <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.6)', lineHeight: 1.65, marginBottom: 28 }}>
        Esto desconectará tu cuenta de WhatsApp de DeepLook. Perderás los reportes automáticos, aunque tus reportes ya generados seguirán disponibles. Para reconectar necesitarás escanear un código QR nuevo.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} className="btn-ghost" style={{ padding: '10px 22px' }}>Cancelar</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'DM Sans,sans-serif' }}>
          {loading ? 'Desvinculando…' : 'Desvincular'}
        </button>
      </div>
    </div>
  </div>
);

/* ── Main component ─────────────────────────────────────────── */
const DashConnect = ({ client, connection: connectionProp, onConnectionUpdate, onNavigate, quota, onQuotaRefresh }) => {
  const api = useApiClient();
  const [conn, setConn] = useState(connectionProp);
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Ref always holds the latest conn so polling callbacks don't go stale
  const connRef = useRef(conn);
  const prevStatusRef = useRef(conn?.status);
  useEffect(() => { connRef.current = conn; }, [conn]);

  // Keep local state in sync when parent updates (e.g. initial load)
  useEffect(() => { setConn(connectionProp); }, [connectionProp]);

  // Auto-trigger sync and show success modal when QR scan completes
  useEffect(() => {
    const prev = prevStatusRef.current;
    const current = conn?.status;
    if (prev === 'SCAN_QR_CODE' && current === 'WORKING' && conn?.id) {
      // Fire sync immediately — best-effort, don't block the modal on failure
      api.post(`/api/v1/whatsapp/connections/${conn.id}/sync`, { body: {} }).catch(() => {});
      setShowSuccessModal(true);
    }
    prevStatusRef.current = current;
  }, [conn?.status, conn?.id, api]);

  const updateConn = (newConn) => {
    setConn(newConn);
    onConnectionUpdate?.(newConn);
  };

  // Poll status every 2s while STARTING or SCAN_QR_CODE
  useEffect(() => {
    if (!conn?.id || !['STARTING', 'SCAN_QR_CODE'].includes(conn.status)) return;
    const connId = conn.id;
    const poll = setInterval(async () => {
      try {
        const data = await api.get(`/api/v1/whatsapp/connections/${connId}/status`);
        const current = connRef.current;
        if (!current || current.id !== connId) return;
        const updated = { ...current, ...data };
        // Both calls are outside any state updater — no "setState during render" risk
        setConn(updated);
        onConnectionUpdate?.(updated);
      } catch {}
    }, 2000);
    return () => clearInterval(poll);
  }, [conn?.id, conn?.status]);

  // Fetch QR once when SCAN_QR_CODE, refresh every 20s
  useEffect(() => {
    if (conn?.status !== 'SCAN_QR_CODE') { setQr(null); return; }
    let active = true;
    const fetchQr = async () => {
      try {
        const data = await api.get(`/api/v1/whatsapp/connections/${conn.id}/qr`);
        if (active) setQr(data);
      } catch {}
    };
    fetchQr();
    const iv = setInterval(fetchQr, 20000);
    return () => { active = false; clearInterval(iv); };
  }, [conn?.id, conn?.status]);

  const handleConnect = async () => {
    if (!client?.id) return;
    setLoading(true);
    setError(null);
    try {
      const newConn = await api.post('/api/v1/whatsapp/connections', { body: { client_id: client.id } });
      updateConn(newConn);
    } catch (e) {
      setError(e.message || 'No se pudo iniciar la conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!conn?.id) return;
    setSyncing(true);
    setError(null);
    try {
      await api.post(`/api/v1/whatsapp/connections/${conn.id}/sync`, { body: {} });
      onQuotaRefresh?.();
      onNavigate('reports');
    } catch (e) {
      setError(e.message || 'No se pudo iniciar la sincronización.');
      setSyncing(false);
    }
  };

  const handleUnlink = async () => {
    if (!conn?.id) return;
    setLoading(true);
    try {
      await api.delete(`/api/v1/whatsapp/connections/${conn.id}`);
      updateConn(null);
      setShowUnlinkModal(false);
    } catch (e) {
      setError(e.message || 'No se pudo desvincular.');
    } finally {
      setLoading(false);
    }
  };

  const status = conn?.status ?? null;
  const isConnected = ['WORKING', 'STOPPED'].includes(status);

  return (
    <div className="dash-page page-fade">
      {showSuccessModal && (
        <ConnectedModal onGoToReports={() => { setShowSuccessModal(false); onNavigate('reports'); }} />
      )}
      {showUnlinkModal && (
        <UnlinkModal
          onConfirm={handleUnlink}
          onCancel={() => setShowUnlinkModal(false)}
          loading={loading}
        />
      )}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0e0749', marginBottom: 4, letterSpacing: '-0.02em' }}>
          Conectar WhatsApp
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.55)' }}>
          Vincula tu número para análisis automático de conversaciones
        </p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="alert" size={16} color="#ef4444" />
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', padding: 0 }}>
            <Icon name="x" size={14} color="#991b1b" />
          </button>
        </div>
      )}

      {/* Loading initial state from Dashboard */}
      {conn === undefined && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Spinner size={40} />
        </div>
      )}

      {conn === null && (
        <ConnectCTA onConnect={handleConnect} loading={loading} plan={client?.plan} />
      )}

      {status === 'STARTING' && <StartingCard />}

      {status === 'SCAN_QR_CODE' && <QRCard qr={qr} />}

      {isConnected && (
        <ConnectedCard
          connection={conn}
          onSync={handleSync}
          onUnlink={() => setShowUnlinkModal(true)}
          syncing={syncing}
          quota={quota}
        />
      )}

      {status === 'FAILED' && <FailedCard onRetry={handleConnect} loading={loading} />}
    </div>
  );
};

export default DashConnect;
