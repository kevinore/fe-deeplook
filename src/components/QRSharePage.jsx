import { useState, useEffect, useRef, useCallback } from 'react';
import { DeepLookLogo } from './Icons';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Spinner = () => (
  <div style={{
    width: 40, height: 40,
    border: '3px solid rgba(79,70,229,0.15)',
    borderTopColor: '#4f46e5',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  }} />
);

const Step = ({ n, text }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: '#4f46e5', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 13, flexShrink: 0,
    }}>{n}</div>
    <span style={{ fontSize: 14, color: '#0e0749', lineHeight: 1.5, paddingTop: 4 }}>{text}</span>
  </div>
);

export default function QRSharePage({ token }) {
  const [context, setContext] = useState(null);   // { display_name, business_name, status, expires_at }
  const [qr, setQr] = useState(null);             // base64 data URI
  const [status, setStatus] = useState('loading'); // loading | waiting | connected | expired | error
  const [secondsLeft, setSecondsLeft] = useState(null);
  const qrTimerRef = useRef(null);
  const statusTimerRef = useRef(null);
  const countdownRef = useRef(null);

  // ── load context once ──────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/whatsapp/share/${token}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        if (data.status === 'WORKING') { setStatus('connected'); return; }
        setContext(data);
        setStatus('waiting');
        if (data.expires_at) {
          const diff = Math.floor((new Date(data.expires_at) - Date.now()) / 1000);
          setSecondsLeft(Math.max(0, diff));
        }
      })
      .catch(code => setStatus(code === 404 ? 'expired' : 'error'));
  }, [token]);

  // ── fetch QR ──────────────────────────────────────────────────
  const fetchQr = useCallback(() => {
    fetch(`${BASE_URL}/api/v1/whatsapp/share/${token}/qr`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        if (data.qr_base64) setQr(data.qr_base64.startsWith('data:') ? data.qr_base64 : `data:image/png;base64,${data.qr_base64}`);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (status !== 'waiting') return;
    fetchQr();
    qrTimerRef.current = setInterval(fetchQr, 20_000);
    return () => clearInterval(qrTimerRef.current);
  }, [status, fetchQr]);

  // ── poll connection status ────────────────────────────────────
  useEffect(() => {
    if (status !== 'waiting') return;
    statusTimerRef.current = setInterval(() => {
      fetch(`${BASE_URL}/api/v1/whatsapp/share/${token}/status`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => {
          if (data.status === 'WORKING' || data.status === 'CHECKING_ACCOUNT') {
            setStatus('connected');
            clearInterval(statusTimerRef.current);
            clearInterval(qrTimerRef.current);
          }
        })
        .catch(code => { if (code === 404) setStatus('expired'); });
    }, 3_000);
    return () => clearInterval(statusTimerRef.current);
  }, [status, token]);

  // ── expiry countdown ─────────────────────────────────────────
  useEffect(() => {
    if (secondsLeft === null) return;
    countdownRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(countdownRef.current); setStatus('expired'); return 0; }
        return s - 1;
      });
    }, 1_000);
    return () => clearInterval(countdownRef.current);
  }, [secondsLeft !== null]);

  const fmtCountdown = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0e0749 0%, #1a0f5c 50%, #2d1b8a 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: '"DM Sans", sans-serif',
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: 24,
    padding: '36px 40px',
    maxWidth: 480,
    width: '100%',
    boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
    textAlign: 'center',
  };

  // ── Expired ───────────────────────────────────────────────────
  if (status === 'expired') return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <DeepLookLogo dark size="md" style={{ marginBottom: 28 }} />
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏱</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0e0749', marginBottom: 10 }}>
          Enlace vencido
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.6)', lineHeight: 1.6 }}>
          Este enlace de conexión ha expirado.<br />
          Pídele al administrador que genere un nuevo enlace.
        </p>
      </div>
    </div>
  );

  // ── Connected ─────────────────────────────────────────────────
  if (status === 'connected') return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <DeepLookLogo dark size="md" style={{ marginBottom: 28 }} />
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0e0749', marginBottom: 10 }}>
          ¡WhatsApp conectado!
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.6)', lineHeight: 1.6 }}>
          La cuenta ha sido vinculada exitosamente.<br />
          Puedes cerrar esta pestaña.
        </p>
      </div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────
  if (status === 'error') return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <DeepLookLogo dark size="md" style={{ marginBottom: 28 }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0e0749', marginBottom: 10 }}>
          Enlace no encontrado
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.6)', lineHeight: 1.6 }}>
          Este enlace no existe o ha expirado.<br />
          Pídele al administrador un nuevo enlace.
        </p>
      </div>
    </div>
  );

  // ── Loading / Waiting ─────────────────────────────────────────
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <DeepLookLogo dark size="md" style={{ marginBottom: 24 }} />

        {context && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.5)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {context.business_name}
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', margin: 0 }}>
              {context.display_name}
            </h2>
          </div>
        )}

        {/* QR or spinner */}
        <div style={{ background: '#f4f3ff', borderRadius: 16, padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 240, justifyContent: 'center' }}>
          {qr ? (
            <img
              src={qr}
              alt="WhatsApp QR"
              style={{ width: 200, height: 200, borderRadius: 8 }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Spinner />
              <span style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)' }}>Preparando código QR…</span>
            </div>
          )}
          {qr && (
            <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', marginTop: 10, marginBottom: 0 }}>
              Se actualiza automáticamente
            </p>
          )}
        </div>

        {/* Instructions */}
        <div style={{ textAlign: 'left', marginBottom: 16 }}>
          <Step n="1" text="Abre WhatsApp en tu teléfono" />
          <Step n="2" text="Ve a Ajustes → Dispositivos vinculados → Vincular dispositivo" />
          <Step n="3" text="Escanea este código QR con la cámara de WhatsApp" />
        </div>

        {/* Expiry countdown */}
        {secondsLeft !== null && secondsLeft > 0 && (
          <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', borderTop: '1px solid #ededed', paddingTop: 14, marginTop: 4 }}>
            Este enlace caduca en: <strong>{fmtCountdown(secondsLeft)}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
