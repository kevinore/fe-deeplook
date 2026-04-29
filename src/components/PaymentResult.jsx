import { useEffect, useRef, useState } from 'react';
import { DeepLookLogo } from './Icons';
import { useApiClient } from '../lib/api';

const PLAN_LABELS = { basic: 'Básico', plus: 'Plus', enterprise: 'Enterprise' };

const CheckCircle = () => (
  <svg width="64" height="64" viewBox="0 0 72 72" fill="none">
    <circle cx="36" cy="36" r="36" fill="#d1fae5" />
    <circle cx="36" cy="36" r="26" fill="#10b981" />
    <path d="M24 36l8 8 16-16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XCircle = () => (
  <svg width="64" height="64" viewBox="0 0 72 72" fill="none">
    <circle cx="36" cy="36" r="36" fill="#fee2e2" />
    <circle cx="36" cy="36" r="26" fill="#ef4444" />
    <path d="M27 27l18 18M45 27L27 45" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const PendingCircle = () => (
  <svg width="64" height="64" viewBox="0 0 72 72" fill="none">
    <circle cx="36" cy="36" r="36" fill="#fef3c7" />
    <circle cx="36" cy="36" r="26" fill="#f59e0b" />
    <path d="M36 24v12l7 4" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const STEPS = [
  {
    num: 1,
    label: 'Plan activado',
    sublabel: 'Tu suscripción está lista',
    state: 'done',
  },
  {
    num: 2,
    label: 'Conectar WhatsApp',
    sublabel: 'Escanea el código QR con tu teléfono',
    state: 'active',
  },
  {
    num: 3,
    label: 'Primer reporte',
    sublabel: 'Análisis automático de tus conversaciones',
    state: 'upcoming',
  },
];

const StepIcon = ({ state, num }) => {
  const bg = state === 'done' ? '#10b981' : state === 'active' ? '#4f46e5' : '#e5e7eb';
  const color = state === 'upcoming' ? 'rgba(14,7,73,0.3)' : 'white';
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      background: bg, color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 13, fontWeight: 700,
      boxShadow: state === 'active' ? '0 0 0 4px rgba(79,70,229,0.15)' : 'none',
      transition: 'all 0.2s',
    }}>
      {state === 'done' ? '✓' : num}
    </div>
  );
};

const DECLINED_STATUSES = new Set(['declined', 'voided', 'error', 'failure', 'rejected', 'cancelled']);

const PaymentResult = ({ onNavigate }) => {
  const api = useApiClient();
  const params = new URLSearchParams(window.location.search);
  const txId = params.get('id') || '';
  const ref = params.get('ref') || '';

  const [status, setStatus] = useState('pending');
  const [plan, setPlan] = useState('');
  const [countdown, setCountdown] = useState(15);
  const pollRef = useRef(null);
  // Stable ref so the polling interval never restarts due to api identity changes
  const apiRef = useRef(api);
  useEffect(() => { apiRef.current = api; }, [api]);

  useEffect(() => {
    if (ref.includes('-')) {
      const parts = ref.split('-');
      if (parts.length >= 2) setPlan(parts[1] || '');
    }
    // Read the real gateway status from the redirect URL.
    // MercadoPago uses `status` (approved / pending / failure / rejected).
    const gatewayStatus = params.get('status') || params.get('collection_status') || '';
    if (gatewayStatus === 'approved') {
      setStatus('approved');
    } else if (
      gatewayStatus === 'failure' ||
      gatewayStatus === 'rejected' ||
      gatewayStatus === 'declined' ||
      gatewayStatus === 'cancelled'
    ) {
      setStatus('declined');
    } else {
      setStatus('pending');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  // While pending: poll the backend every 3 s until the payment resolves.
  // Uses apiRef so the interval is never restarted due to api identity changes between renders.
  useEffect(() => {
    if (status !== 'pending' || !ref) return;

    const check = async () => {
      try {
        const data = await apiRef.current.get(`/api/v1/billing/payment-status?ref=${encodeURIComponent(ref)}`);
        const s = (data.status || '').toLowerCase();
        if (s === 'approved') {
          setStatus('approved');
        } else if (DECLINED_STATUSES.has(s)) {
          setStatus('declined');
        }
        // still 'pending' → keep polling
      } catch {
        // network / auth error — keep polling silently
      }
    };

    check(); // immediate first check
    pollRef.current = setInterval(check, 3000);
    return () => clearInterval(pollRef.current);
  }, [status, ref]); // api intentionally omitted — accessed via stable apiRef

  useEffect(() => {
    if (status !== 'approved') return;
    if (countdown <= 0) { onNavigate('connect'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, status, onNavigate]);

  const isApproved = status === 'approved';
  const isDeclined = status === 'declined';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8f7fc 0%, #ede9fe 100%)',
      padding: 24, fontFamily: 'DM Sans, sans-serif',
    }}>
      <style>{`
        @keyframes pageFade { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
      `}</style>

      <div style={{
        background: 'white', borderRadius: 24, padding: '48px 44px',
        maxWidth: 520, width: '100%', textAlign: 'center',
        boxShadow: '0 24px 80px rgba(14,7,73,0.13)',
        animation: 'pageFade 450ms cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Logo */}
        <div style={{ marginBottom: 28, display: 'inline-flex' }}>
          <DeepLookLogo size="sm" dark />
        </div>

        {/* Status icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          {isApproved ? <CheckCircle /> : isDeclined ? <XCircle /> : <PendingCircle />}
        </div>

        {/* ── APPROVED state ── */}
        {isApproved && (
          <>
            <h2 style={{
              fontSize: 26, fontWeight: 800, color: '#0e0749',
              marginBottom: 10, letterSpacing: '-0.02em',
            }}>
              ¡Pago exitoso! 🎉
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.55)', lineHeight: 1.65, marginBottom: 32 }}>
              {plan
                ? <>Tu plan <strong style={{ color: '#4f46e5' }}>{PLAN_LABELS[plan] || plan}</strong> ya está activado.</>
                : 'Tu plan ya está activado.'
              }{' '}
              Para generar tu primer reporte, conecta tu cuenta de WhatsApp.
            </p>

            {/* Step tracker */}
            <div style={{
              background: '#f8f7fc', border: '1px solid rgba(79,70,229,0.08)',
              borderRadius: 16, padding: '20px 22px',
              marginBottom: 28, textAlign: 'left',
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700, color: 'rgba(14,7,73,0.38)',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18,
              }}>
                Próximos pasos
              </p>

              {STEPS.map((step, i) => (
                <div key={step.num}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Left: icon + connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <StepIcon state={step.state} num={step.num} />
                      {i < STEPS.length - 1 && (
                        <div style={{
                          width: 2, height: 20, marginTop: 4,
                          background: step.state === 'done'
                            ? 'linear-gradient(to bottom, #10b981, #e5e7eb)'
                            : '#e5e7eb',
                        }} />
                      )}
                    </div>

                    {/* Right: text */}
                    <div style={{ paddingTop: 4, paddingBottom: i < STEPS.length - 1 ? 20 : 0, flex: 1 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap',
                        marginBottom: 3,
                      }}>
                        {step.state === 'active' && (
                          <span style={{ color: '#25d366', display: 'flex', alignItems: 'center' }}>
                            <WhatsAppIcon size={15} />
                          </span>
                        )}
                        <span style={{
                          fontSize: 14, fontWeight: 700,
                          color: step.state === 'done'
                            ? '#10b981'
                            : step.state === 'active'
                            ? '#0e0749'
                            : 'rgba(14,7,73,0.32)',
                        }}>
                          {step.label}
                        </span>
                        {step.state === 'active' && (
                          <span style={{
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            color: 'white', fontSize: 9, fontWeight: 800,
                            padding: '2px 8px', borderRadius: 99, letterSpacing: '0.06em',
                            animation: 'pulse 2s ease-in-out infinite',
                          }}>
                            AHORA
                          </span>
                        )}
                      </div>
                      <p style={{
                        fontSize: 12, lineHeight: 1.5, margin: 0,
                        color: step.state === 'upcoming'
                          ? 'rgba(14,7,73,0.25)'
                          : 'rgba(14,7,73,0.45)',
                      }}>
                        {step.sublabel}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Email confirmation badge */}
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
              padding: '11px 16px', marginBottom: 24, fontSize: 13, color: '#15803d',
              fontWeight: 500,
            }}>
              ✓ Recibirás confirmación por correo electrónico
            </div>

            {/* Primary CTA — WhatsApp */}
            <button
              onClick={() => onNavigate('connect')}
              style={{
                padding: '14px 24px', fontSize: 15, fontWeight: 700, borderRadius: 12,
                width: '100%', marginBottom: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                boxShadow: '0 6px 24px rgba(37,211,102,0.38)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,211,102,0.48)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,211,102,0.38)';
              }}
            >
              <WhatsAppIcon size={19} />
              Conectar WhatsApp ahora
            </button>

            {/* Secondary link */}
            <button
              onClick={() => onNavigate('dashboard')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: 'rgba(14,7,73,0.42)', padding: '8px 16px',
                width: '100%', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
              }}
            >
              Ir al dashboard primero →
            </button>

            {countdown > 0 && (
              <p style={{ fontSize: 11, color: 'rgba(14,7,73,0.28)', marginTop: 12 }}>
                Continuando automáticamente en {countdown}s…
              </p>
            )}
          </>
        )}

        {/* ── DECLINED state ── */}
        {isDeclined && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0e0749', marginBottom: 10, letterSpacing: '-0.02em' }}>
              Pago rechazado
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.6)', lineHeight: 1.65, marginBottom: 24 }}>
              Tu pago no fue procesado. Esto puede pasar por fondos insuficientes, datos incorrectos o restricciones del banco.
            </p>

            {/* Common reasons */}
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14,
              padding: '16px 20px', marginBottom: 28, textAlign: 'left',
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                Razones frecuentes
              </p>
              {[
                'Fondos insuficientes en la cuenta',
                'Datos de tarjeta incorrectos o vencida',
                'Banco bloqueó el pago por seguridad',
                'Límite de transacciones en línea alcanzado',
              ].map(r => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#7f1d1d' }}>{r}</span>
                </div>
              ))}
            </div>

            {/* Primary CTA — retry */}
            <button
              onClick={() => onNavigate('settings')}
              style={{
                padding: '14px 24px', fontSize: 15, fontWeight: 700, borderRadius: 12,
                width: '100%', marginBottom: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white', fontFamily: 'DM Sans, sans-serif',
                boxShadow: '0 6px 24px rgba(79,70,229,0.32)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(79,70,229,0.42)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(79,70,229,0.32)';
              }}
            >
              Intentar con otro método de pago
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: 'rgba(14,7,73,0.42)', padding: '8px 16px',
                width: '100%', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
              }}
            >
              Volver al dashboard
            </button>

            <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.35)', marginTop: 16, lineHeight: 1.6 }}>
              ¿Necesitas ayuda? Escríbenos a{' '}
              <a href="mailto:soporte@deeplook.com" style={{ color: '#4f46e5', textDecoration: 'none' }}>
                soporte@deeplook.com
              </a>
            </p>
          </>
        )}

        {/* ── PENDING state ── */}
        {!isApproved && !isDeclined && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0e0749', marginBottom: 10 }}>
              Procesando pago…
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.6)', lineHeight: 1.7, marginBottom: 20 }}>
              Estamos verificando tu transacción con el banco. Esto solo toma unos segundos.
            </p>

            {/* Animated polling indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: '2.5px solid rgba(79,70,229,0.2)',
                borderTopColor: '#4f46e5',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ fontSize: 13, color: 'rgba(14,7,73,0.45)' }}>Verificando en tiempo real…</span>
            </div>

            <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.35)', marginBottom: 24, lineHeight: 1.6 }}>
              Esta página se actualizará automáticamente. No la cierres.
            </p>
            <button
              onClick={() => onNavigate('dashboard')}
              style={{
                background: 'none', border: '1px solid #e5e7eb', cursor: 'pointer',
                fontSize: 13, color: 'rgba(14,7,73,0.5)', padding: '10px 24px',
                borderRadius: 10, width: '100%', fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Ir al dashboard (te notificaremos el resultado)
            </button>
          </>
        )}

        {/* Transaction ref */}
        {txId && (
          <p style={{
            fontSize: 11, color: 'rgba(14,7,73,0.2)', marginTop: 20,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            Ref. {txId.slice(0, 22)}…
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
