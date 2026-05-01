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

/* ── Pre-QR — simple spinner while WAHA starts up ──────────── */
const PreparingQRCard = () => (
  <div style={{ maxWidth: 400, margin: '60px auto', textAlign: 'center' }}>
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        border: '3px solid rgba(37,211,102,0.2)',
        borderTopColor: '#25d366',
        animation: 'spin 0.9s linear infinite',
      }} />
    </div>
    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0e0749', marginBottom: 8 }}>
      Preparando código QR
    </h3>
    <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.45)', lineHeight: 1.6 }}>
      Esto solo tarda unos segundos…
    </p>
  </div>
);

/* ── Post-scan — animated flow shown after QR is scanned ───── */
const WA_STEPS = [
  { label: 'QR verificado',        sublabel: 'Código escaneado correctamente…',  delay: 0 },
  { label: 'Autenticando cuenta',  sublabel: 'Confirmando con los servidores…',  delay: 1 },
  { label: 'Sincronizando datos',  sublabel: 'Preparando tus conversaciones…',   delay: 3 },
  { label: 'Conexión establecida', sublabel: '¡Tu WhatsApp ya está vinculado!',  delay: 5 },
];

const StartingCard = () => {
  const [elapsed, setElapsed] = useState(0);
  const [doneSteps, setDoneSteps] = useState([]);

  useEffect(() => {
    const tick = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const done = WA_STEPS
      .filter(s => elapsed >= s.delay + 1)
      .map(s => s.label);
    setDoneSteps(done);
  }, [elapsed]);

  const activeIdx = WA_STEPS.reduce((acc, s, i) => elapsed >= s.delay ? i : acc, 0);
  const progress = Math.min(100, (elapsed / 7) * 100);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes waRing  { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.2);opacity:0} }
        @keyframes stepIn  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes barFill { from{width:0%} to{width:var(--bar-w)} }
        @keyframes waDot   { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
      `}</style>

      {/* Pulsing WhatsApp icon */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ position: 'relative', width: 96, height: 96 }}>
          {[1, 1.6, 2.2].map((scale, i) => (
            <div key={i} style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '2px solid #25d366',
              animation: `waRing 2.4s ease-out ${i * 0.8}s infinite`,
            }} />
          ))}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #25d366, #128c7e)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(37,211,102,0.4)',
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Title + animated dots */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', marginBottom: 6, letterSpacing: '-0.01em' }}>
          Conectando WhatsApp
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <span style={{ fontSize: 14, color: 'rgba(14,7,73,0.5)' }}>
            {WA_STEPS[activeIdx]?.sublabel}
          </span>
          <span style={{ display: 'inline-flex', gap: 3, marginLeft: 2 }}>
            {[0, 0.2, 0.4].map((delay, i) => (
              <span key={i} style={{
                width: 5, height: 5, borderRadius: '50%', background: '#25d366',
                display: 'inline-block',
                animation: `waDot 1.4s ease-in-out ${delay}s infinite`,
              }} />
            ))}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: '#f0f0f8', borderRadius: 99, marginBottom: 28, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #25d366, #4f46e5)',
          borderRadius: 99,
          transition: 'width 1s linear',
        }} />
      </div>

      {/* Step list */}
      <div style={{
        background: '#f8f7fc', border: '1px solid rgba(79,70,229,0.08)',
        borderRadius: 16, padding: '20px 22px',
      }}>
        {WA_STEPS.map((step, i) => {
          const isDone = doneSteps.includes(step.label);
          const isActive = activeIdx === i && !isDone;
          return (
            <div
              key={step.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                marginBottom: i < WA_STEPS.length - 1 ? 16 : 0,
                opacity: elapsed >= step.delay ? 1 : 0.28,
                transition: 'opacity 0.5s ease',
              }}
            >
              {/* Step indicator */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDone ? '#22c55e' : isActive ? '#4f46e5' : '#e5e7eb',
                transition: 'background 0.4s ease',
                boxShadow: isActive ? '0 0 0 4px rgba(79,70,229,0.15)' : 'none',
              }}>
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isActive ? (
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                ) : (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db', display: 'block' }} />
                )}
              </div>

              {/* Step text */}
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 700,
                  color: isDone ? '#16a34a' : isActive ? '#0e0749' : 'rgba(14,7,73,0.35)',
                  transition: 'color 0.3s ease',
                }}>
                  {step.label}
                </div>
                {isActive && (
                  <div style={{
                    fontSize: 11, color: 'rgba(14,7,73,0.45)', marginTop: 1,
                    animation: 'stepIn 0.3s ease',
                  }}>
                    {step.sublabel}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom tip */}
      <p style={{
        fontSize: 12, color: 'rgba(14,7,73,0.35)',
        textAlign: 'center', marginTop: 20, lineHeight: 1.6,
      }}>
        Verificando tu conexión con WhatsApp…<br />No cierres esta página.
      </p>
    </div>
  );
};

/* ── SCAN_QR_CODE ───────────────────────────────────────────── */
// Total session lifetime before WAHA gives up and marks it FAILED.
// This must stay ≤ WAHA's internal "QR refs" budget (~90-100s) so the timer
// expires before the user sees an actual failure.
const QR_SESSION_SECONDS = 90;

const QRCard = ({ qr }) => {
  const [secondsLeft, setSecondsLeft] = useState(QR_SESSION_SECONDS);
  // Track which QR session this countdown belongs to. We only reset when the
  // QR image actually changes (new session/restart) — not on every re-render.
  const lastQrRef = useRef(null);

  useEffect(() => {
    if (!qr?.qr_base64) return;
    if (lastQrRef.current === qr.qr_base64) return;
    // Reset countdown only on first QR ever, or when a fresh QR arrives after
    // expiration (which must be from a backend auto-restart since WAHA's session
    // would have died by then). Don't reset on the regular 20s WAHA QR refresh —
    // it's the same session and the 90s budget keeps ticking.
    setSecondsLeft(prev => (prev === 0 || lastQrRef.current === null) ? QR_SESSION_SECONDS : prev);
    lastQrRef.current = qr.qr_base64;
  }, [qr?.qr_base64]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const tick = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(tick);
  }, [secondsLeft <= 0]);

  const isExpired = secondsLeft === 0;
  const isUrgent = secondsLeft > 0 && secondsLeft <= 20;
  const timerColor = isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : '#22c55e';
  const progressPct = (secondsLeft / QR_SESSION_SECONDS) * 100;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0e0749', marginBottom: 8, textAlign: 'center' }}>
        Escanea el código QR
      </h2>
      <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.55)', textAlign: 'center', marginBottom: 24 }}>
        Tienes un tiempo limitado para escanear antes de que el código expire.
      </p>

      {/* Visible countdown */}
      <div style={{
        maxWidth: 460, margin: '0 auto 28px',
        background: 'white',
        border: `1px solid ${isExpired ? '#fecaca' : isUrgent ? '#fed7aa' : '#bbf7d0'}`,
        borderRadius: 14,
        padding: '14px 18px',
        boxShadow: '0 2px 10px rgba(14,7,73,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="clock" size={16} color={timerColor} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0e0749' }}>
              {isExpired ? 'Generando nuevo código…' : 'Tiempo restante para escanear'}
            </span>
          </div>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 18, fontWeight: 700, color: timerColor,
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 0.3s ease',
          }}>
            {String(Math.floor(secondsLeft / 60)).padStart(1, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
          </span>
        </div>
        <div style={{ height: 5, background: '#f0f0f8', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: timerColor,
            borderRadius: 99,
            transition: 'width 1s linear, background 0.3s ease',
          }} />
        </div>
      </div>

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
          <div style={{
            position: 'relative',
            width: 220, height: 220,
            background: '#f4f4f6', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${isExpired ? '#fecaca' : isUrgent ? '#fed7aa' : '#ededed'}`,
            overflow: 'hidden',
            transition: 'border-color 0.3s ease',
          }}>
            {qr?.qr_base64
              ? <img src={qr.qr_base64} alt="QR Code" style={{
                  width: 200, height: 200, objectFit: 'contain',
                  filter: isExpired ? 'blur(6px) grayscale(0.4)' : 'none',
                  opacity: isExpired ? 0.5 : 1,
                  transition: 'filter 0.4s ease, opacity 0.4s ease',
                }} />
              : <Spinner size={36} />
            }
            {isExpired && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(2px)',
              }}>
                <Spinner size={28} color="#4f46e5" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#0e0749' }}>
                  Renovando código…
                </span>
              </div>
            )}
          </div>
          <p style={{
            fontSize: 12,
            color: isUrgent ? '#b45309' : 'rgba(14,7,73,0.4)',
            textAlign: 'center', maxWidth: 220, margin: 0,
            fontWeight: isUrgent ? 600 : 400,
            transition: 'color 0.3s ease',
          }}>
            {isExpired
              ? 'Generando un código nuevo…'
              : isUrgent
                ? `¡Apresúrate! Quedan ${secondsLeft}s`
                : 'El código se renueva automáticamente'}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background: '#f4f3ff', border: '1px solid rgba(79,70,229,0.1)', borderRadius: 12, padding: '16px 20px', marginTop: 32 }}>
        <p style={{ fontSize: 13, color: 'rgba(14,7,73,0.6)', margin: 0, lineHeight: 1.65 }}>
          <strong>Sobre la seguridad de tu cuenta</strong> — DeepLook se conecta como un dispositivo vinculado, igual que WhatsApp Web en tu computadora. Solo leemos conversaciones pasadas para generar el reporte; nunca enviamos mensajes y la conexión se apaga automáticamente entre reportes.
        </p>
      </div>
    </div>
  );
};

/* ── Post-QR scan — verification in progress ───────────────── */
const ScanVerifyingCard = () => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const progress = Math.min(95, (elapsed / 30) * 100);

  return (
    <div style={{ maxWidth: 440, margin: '48px auto', textAlign: 'center' }}>
      <style>{`
        @keyframes waRingVerify { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.2);opacity:0} }
        @keyframes scanShimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>

      {/* Pulsing WhatsApp icon */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          {[0, 0.9].map((delay, i) => (
            <div key={i} style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '2px solid #25d366',
              animation: `waRingVerify 2.4s ease-out ${delay}s infinite`,
            }} />
          ))}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #25d366, #128c7e)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 24px rgba(37,211,102,0.4)',
          }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', marginBottom: 10, letterSpacing: '-0.01em' }}>
        QR escaneado
      </h3>
      <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.55)', lineHeight: 1.7, marginBottom: 28 }}>
        Verificando tu cuenta de WhatsApp Business…<br />
        <span style={{ fontSize: 13, color: 'rgba(14,7,73,0.4)' }}>Esto puede tardar hasta 30 segundos.</span>
      </p>

      {/* Animated shimmer progress bar */}
      <div style={{ height: 5, background: '#f0f0f8', borderRadius: 99, maxWidth: 300, margin: '0 auto 24px', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, #25d366, #4f46e5)',
          borderRadius: 99, transition: 'width 1s linear',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%', width: '30%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
          animation: 'scanShimmer 1.6s ease-in-out infinite',
        }} />
      </div>

      <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.35)', lineHeight: 1.6 }}>
        No cierres esta página
      </p>
    </div>
  );
};

/* ── Personal account warning banner (shown inside ConnectedCard) ── */
const PersonalAccountWarning = () => (
  <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
    <p style={{ fontSize: 13, color: '#92400e', margin: 0, lineHeight: 1.55 }}>
      Estás usando una cuenta <strong>personal de WhatsApp</strong>. Para acceder a todas las métricas de negocio, te recomendamos cambiar a <strong>WhatsApp Business</strong>.
    </p>
  </div>
);

/* ── PERSONAL_ACCOUNT_BLOCKED ───────────────────────────────── */
const PersonalAccountBlockedCard = ({ onRetry, loading }) => (
  <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '48px 0' }}>
    <div style={{ width: 72, height: 72, background: '#fef3c7', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>
      📱
    </div>
    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', marginBottom: 10 }}>
      Se necesita WhatsApp Business
    </h3>
    <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.6)', lineHeight: 1.7, marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
      La cuenta que escaneaste es una cuenta <strong>personal de WhatsApp</strong>.
      DeepLook solo funciona con cuentas de <strong>WhatsApp Business</strong> para
      garantizar el acceso a las métricas de negocio.
    </p>

    {/* Steps to fix */}
    <div style={{ background: '#f4f3ff', border: '1px solid rgba(79,70,229,0.12)', borderRadius: 14, padding: '20px 24px', marginBottom: 28, textAlign: 'left', maxWidth: 420, margin: '0 auto 28px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#0e0749', marginBottom: 14 }}>
        Cómo solucionarlo:
      </div>
      {[
        { n: 1, text: 'Descarga la app "WhatsApp Business" en tu teléfono (gratis).' },
        { n: 2, text: 'Regístrate con el mismo número de tu negocio.' },
        { n: 3, text: 'Vuelve aquí y presiona "Intentar de nuevo" para conectar.' },
      ].map(s => (
        <div key={s.n} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 24, height: 24, background: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
          <span style={{ fontSize: 13, color: '#0e0749', lineHeight: 1.55, paddingTop: 3 }}>{s.text}</span>
        </div>
      ))}
      <a
        href="https://www.whatsapp.com/business/download"
        target="_blank" rel="noopener noreferrer"
        style={{ display: 'inline-block', marginTop: 4, fontSize: 13, color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
        Descargar WhatsApp Business →
      </a>
    </div>

    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      <button
        onClick={onRetry}
        disabled={loading}
        className="btn-primary"
        style={{ padding: '12px 32px', fontSize: 15, opacity: loading ? 0.7 : 1, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        {loading && <Spinner size={16} color="white" />}
        {loading ? 'Cargando…' : 'Intentar de nuevo'}
      </button>
    </div>

    <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.35)', marginTop: 16, lineHeight: 1.6 }}>
      La cuenta personal que escaneaste ya fue desvinculada automáticamente.
    </p>
  </div>
);

/* ── WORKING / STOPPED ─────────────────────────────────────── */
const ConnectedCard = ({ connection, onSync, onUnlink, syncing, quota }) => {
  const syncFreqLabel = { weekly: 'semanal', biweekly: 'quincenal', monthly: 'mensual' }[connection.sync_frequency] ?? connection.sync_frequency;
  const quotaExhausted = quota?.reports?.remaining === 0;
  // is_business_account: true = WA Business, false = personal, null/undefined = not yet determined
  const isPersonal = connection.is_business_account === false;
  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Personal account warning */}
      {isPersonal && <PersonalAccountWarning />}

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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <div style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 999, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#bbf7d0' }}>Activo</span>
          </div>
          {connection.is_business_account === true && (
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: 'white' }}>
              WA Business ✓
            </div>
          )}
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
          className="btn-ghost-danger"
          style={{ padding: '13px 22px', fontSize: 14, flexShrink: 0 }}>
          Desvincular
        </button>
      </div>

      {quotaExhausted && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="alert" size={14} color="#ef4444" />
          Has usado todos los reportes de este período ({quota?.reports?.used ?? 0}/{quota?.reports?.limit ?? 0}). Tu cuota se renueva a inicios del próximo mes.
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
/**
 * ConfirmSyncModal — shown when the user clicks "Generar reporte ahora".
 * Makes it crystal-clear that a manual sync consumes one of their monthly quota
 * and pushes back the next automatic report. Without this, users could exhaust
 * their plan unintentionally and stop receiving auto-reports.
 */
const ConfirmSyncModal = ({ connection, quota, onConfirm, onCancel, loading }) => {
  const planLabel = { free: 'Free', basic: 'Básico', plus: 'Plus', enterprise: 'Enterprise' }[quota?.plan] || (quota?.plan ?? '—');
  const freqLabel = { weekly: 'cada 7 días', biweekly: 'cada 15 días', monthly: 'cada 30 días' }[connection?.sync_frequency] || 'periódico';
  const limit = quota?.reports?.limit ?? 0;
  const used = quota?.reports?.used ?? 0;
  const remaining = quota?.reports?.remaining ?? 0;

  // After this manual sync the user will have used (used + 1) and have (remaining - 1) left.
  const afterUsed = used + 1;
  const afterRemaining = Math.max(0, remaining - 1);
  const willBeLast = remaining === 1;

  // Days until next AUTO sync (informational — helps user decide)
  let daysUntilNext = null;
  let nextDateStr = null;
  if (connection?.next_scheduled_sync_at) {
    const nextDate = new Date(connection.next_scheduled_sync_at);
    nextDateStr = formatDate(connection.next_scheduled_sync_at);
    const ms = nextDate.getTime() - Date.now();
    daysUntilNext = Math.max(0, Math.ceil(ms / 86400000));
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,7,73,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: 18, padding: '32px 36px', maxWidth: 480, width: '100%', boxShadow: '0 24px 80px rgba(14,7,73,0.22)', maxHeight: '90vh', overflowY: 'auto' }}>
        {loading ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <Spinner size={42} color="#4f46e5" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0e0749', marginBottom: 8, textAlign: 'center' }}>
              Iniciando reporte…
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.55)', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
              Estamos sincronizando tu WhatsApp y procesando el análisis. Te avisaremos por correo cuando esté listo.
            </p>
          </>
        ) : (
          <>
            {/* Header with warning icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="alert" size={22} color="#d97706" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', margin: 0, lineHeight: 1.3 }}>
                ¿Generar un reporte manual ahora?
              </h3>
            </div>

            <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.7)', lineHeight: 1.65, marginBottom: 22 }}>
              Esto consumirá <strong>1 reporte de tu cuota del período actual</strong>. Si decides hacerlo, tendrás un reporte menos disponible para los próximos análisis automáticos del mes.
            </p>

            {/* Plan + quota breakdown */}
            <div style={{ background: '#f9fafb', border: '1px solid #ededed', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', marginBottom: 4, letterSpacing: '0.02em' }}>
                Plan {planLabel} · sincronización {freqLabel}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.5)', marginBottom: 14 }}>
                Tu plan incluye {limit} reporte{limit !== 1 ? 's' : ''} por período de facturación.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: '#0e0749', lineHeight: 1 }}>{limit}</div>
                  <div style={{ fontSize: 11, color: 'rgba(14,7,73,0.55)', marginTop: 4 }}>Total del plan</div>
                </div>
                <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: '#a78bfa', lineHeight: 1 }}>{used}</div>
                  <div style={{ fontSize: 11, color: 'rgba(14,7,73,0.55)', marginTop: 4 }}>Usados</div>
                </div>
                <div style={{ background: 'white', border: '1px solid #c7d2fe', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: '#22c55e', lineHeight: 1 }}>{remaining}</div>
                  <div style={{ fontSize: 11, color: 'rgba(14,7,73,0.55)', marginTop: 4 }}>Disponibles</div>
                </div>
              </div>

              {/* After-sync preview */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed #e5e7eb', fontSize: 12, color: 'rgba(14,7,73,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Después de este reporte:</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: afterRemaining === 0 ? '#ef4444' : '#0e0749' }}>
                  {afterUsed}/{limit} usados · {afterRemaining} disponible{afterRemaining !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Last-one warning */}
            {willBeLast && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Icon name="alert" size={16} color="#dc2626" />
                <div style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.55 }}>
                  Este sería tu <strong>último reporte</strong> de este período. No recibirás más análisis automáticos hasta que se renueve tu cuota.
                </div>
              </div>
            )}

            {/* Next automatic sync */}
            {nextDateStr && remaining > 1 && (
              <div style={{ background: '#f0effe', border: '1px solid #c4b5fd', borderRadius: 10, padding: '12px 14px', marginBottom: 22, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Icon name="clock" size={16} color="#4f46e5" />
                <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.75)', lineHeight: 1.55 }}>
                  Si prefieres no usar tu cuota ahora, tu próximo reporte se generará automáticamente el <strong>{nextDateStr}</strong>
                  {daysUntilNext !== null && daysUntilNext > 0 && <> (en {daysUntilNext} día{daysUntilNext !== 1 ? 's' : ''})</>}.
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={onCancel} className="btn-ghost" style={{ padding: '11px 22px', fontSize: 14 }}>
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="btn-primary"
                style={{ padding: '11px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="refresh" size={16} color="white" />
                Sí, generar ahora
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


const UnlinkModal = ({ onConfirm, onCancel, loading }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,7,73,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div style={{ background: 'white', borderRadius: 16, padding: '32px 36px', maxWidth: 440, width: '100%', boxShadow: '0 24px 80px rgba(14,7,73,0.2)' }}>
      {loading ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '3px solid #fecaca', borderTopColor: '#ef4444',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0e0749', marginBottom: 8, textAlign: 'center' }}>
            Desvinculando…
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.55)', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
            Reconectando con WhatsApp para revocar el dispositivo.<br />Esto puede tardar hasta 15 segundos.
          </p>
        </>
      ) : (
        <>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', marginBottom: 12 }}>¿Desvincular WhatsApp?</h3>
          <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.6)', lineHeight: 1.65, marginBottom: 28 }}>
            Esto eliminará "DeepLook" de tus dispositivos vinculados en WhatsApp. Perderás los reportes automáticos, aunque los reportes ya generados seguirán disponibles. Para reconectar necesitarás escanear un código QR nuevo.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={onCancel} className="btn-ghost" style={{ padding: '10px 22px' }}>Cancelar</button>
            <button
              onClick={onConfirm}
              style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
              Desvincular
            </button>
          </div>
        </>
      )}
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
  const [showConfirmSync, setShowConfirmSync] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [scanDetected, setScanDetected] = useState(false);
  // Guard: auto-sync fires exactly once per QR scan session
  const autoSyncFiredRef = useRef(false);
  // Track whether a QR image was successfully shown at least once in this session
  const qrShownRef = useRef(false);

  // Ref always holds the latest conn so polling callbacks don't go stale
  const connRef = useRef(conn);
  const prevStatusRef = useRef(conn?.status);
  useEffect(() => { connRef.current = conn; }, [conn]);

  // Keep local state in sync when parent updates (e.g. initial load)
  useEffect(() => { setConn(connectionProp); }, [connectionProp]);

  // When verification completes successfully: show the connecting animation for ~7s, then success modal.
  // Triggers on CHECKING_ACCOUNT → WORKING (the new two-phase path) or SCAN_QR_CODE → WORKING (fallback).
  useEffect(() => {
    const prev = prevStatusRef.current;
    const current = conn?.status;
    if ((prev === 'SCAN_QR_CODE' || prev === 'CHECKING_ACCOUNT') && current === 'WORKING' && conn?.id) {
      // Fire the first sync exactly once — guard prevents double-trigger from React re-renders
      if (!autoSyncFiredRef.current) {
        autoSyncFiredRef.current = true;
        api.post(`/api/v1/whatsapp/connections/${conn.id}/sync`, { body: {} }).catch(() => {});
      }
      setIsConnecting(true);
      const t = setTimeout(() => {
        setIsConnecting(false);
        setShowSuccessModal(true);
      }, 7500);
      return () => clearTimeout(t);
    }
    prevStatusRef.current = current;
  }, [conn?.status, conn?.id, api]);

  const updateConn = (newConn) => {
    setConn(newConn);
    onConnectionUpdate?.(newConn);
  };

  // Poll status every 2s while STARTING, SCAN_QR_CODE, or CHECKING_ACCOUNT
  useEffect(() => {
    if (!conn?.id || !['STARTING', 'SCAN_QR_CODE', 'CHECKING_ACCOUNT'].includes(conn.status)) return;
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

  // Fetch QR once when SCAN_QR_CODE, refresh every 20s.
  // If the fetch fails after a QR was already shown, the QR was almost certainly scanned —
  // switch to the verification loading card while the status poll catches up.
  useEffect(() => {
    if (conn?.status !== 'SCAN_QR_CODE') {
      setQr(null);
      setScanDetected(false);
      qrShownRef.current = false;
      return;
    }
    let active = true;
    const fetchQr = async () => {
      try {
        const data = await api.get(`/api/v1/whatsapp/connections/${conn.id}/qr`);
        if (active) {
          setQr(data);
          qrShownRef.current = true;
        }
      } catch {
        if (active && qrShownRef.current) setScanDetected(true);
      }
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
      setShowConfirmSync(false);
      onNavigate('reports');
    } catch (e) {
      setError(e.message || 'No se pudo iniciar la sincronización.');
      setSyncing(false);
      setShowConfirmSync(false);
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
  // STOPPED + no phone means brand-new session (no credentials saved yet) → needs QR flow
  // STOPPED + phone means session was paused after a sync → credentials saved, show ConnectedCard
  const isConnected = status === 'WORKING' || (status === 'STOPPED' && !!conn?.phone_number);
  const needsQRStart = status === 'STOPPED' && !conn?.phone_number;
  const isPersonalBlocked = status === 'PERSONAL_ACCOUNT_BLOCKED';

  // When a brand-new STOPPED connection has no saved credentials, auto-start the session
  // The QR endpoint handles STOPPED → starts WAHA → waits → returns QR or 409 if already WORKING
  useEffect(() => {
    if (!needsQRStart || !conn?.id) return;
    let active = true;
    const startSession = async () => {
      try {
        const data = await api.get(`/api/v1/whatsapp/connections/${conn.id}/qr`);
        if (!active) return;
        setConn(prev => ({ ...prev, status: 'SCAN_QR_CODE' }));
        onConnectionUpdate?.({ ...conn, status: 'SCAN_QR_CODE' });
        setQr(data);
      } catch (e) {
        if (!active) return;
        if (e.status === 409) {
          // 409 = session is in a known non-QR state (already connected, blocked, not ready).
          // Refresh live status so the UI renders the correct card.
          try {
            const statusData = await api.get(`/api/v1/whatsapp/connections/${conn.id}/status`);
            const updated = { ...conn, ...statusData };
            setConn(updated);
            onConnectionUpdate?.(updated);
          } catch {}
        } else {
          setError(e.message || 'No se pudo iniciar la sesión de WhatsApp.');
          setConn(prev => ({ ...prev, status: 'FAILED' }));
          onConnectionUpdate?.({ ...conn, status: 'FAILED' });
        }
      }
    };
    startSession();
    return () => { active = false; };
  }, [conn?.id, needsQRStart]);

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
      {showConfirmSync && (
        <ConfirmSyncModal
          connection={conn}
          quota={quota}
          loading={syncing}
          onConfirm={handleSync}
          onCancel={() => setShowConfirmSync(false)}
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

      {(status === 'STARTING' || needsQRStart) && <PreparingQRCard />}

      {status === 'SCAN_QR_CODE' && !isConnecting && !scanDetected && <QRCard qr={qr} />}
      {status === 'SCAN_QR_CODE' && !isConnecting && scanDetected && <ScanVerifyingCard />}
      {status === 'CHECKING_ACCOUNT' && <ScanVerifyingCard />}

      {isConnecting && <StartingCard />}

      {isConnected && !isConnecting && (
        <ConnectedCard
          connection={conn}
          onSync={() => setShowConfirmSync(true)}
          onUnlink={() => setShowUnlinkModal(true)}
          syncing={syncing}
          quota={quota}
        />
      )}

      {status === 'FAILED' && <FailedCard onRetry={handleConnect} loading={loading} />}

      {isPersonalBlocked && (
        <PersonalAccountBlockedCard
          loading={loading}
          onRetry={async () => {
            // Clean up the blocked connection from DB so user can start fresh.
            if (!conn?.id) return;
            setLoading(true);
            try {
              await api.delete(`/api/v1/whatsapp/connections/${conn.id}`);
            } catch {}
            updateConn(null);
            setLoading(false);
          }}
        />
      )}
    </div>
  );
};

export default DashConnect;
