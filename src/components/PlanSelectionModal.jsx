import { useState } from 'react';
import { useApiClient } from '../lib/api';
import { DeepLookLogo } from './Icons';

/* ─── Plan definitions (mirror backend PLAN_DISPLAY) ─────────────────── */
const PLANS = [
  {
    key: 'basic',
    label: 'Básico',
    price: '$160.000',
    period: '/mes',
    description: 'Visibilidad mensual de tu WhatsApp Business.',
    badge: null,
    features: [
      { text: '1 reporte al mes', active: true },
      { text: '100 conversaciones por reporte', active: true },
      { text: '30 días de historial', active: true },
      { text: 'Reporte PDF con gráficas', active: true },
      { text: 'Análisis IA completo', active: true },
      { text: 'Subida manual de archivos', active: false },
      { text: 'Dashboard de tendencias', active: false },
      { text: 'Soporte por email', active: true },
    ],
    accentColor: '#6366f1',
    bgGradient: 'linear-gradient(135deg, #f0f0ff 0%, #fafafe 100%)',
  },
  {
    key: 'plus',
    label: 'Plus',
    price: '$250.000',
    period: '/mes',
    description: 'Detecta cambios a mitad de mes y analiza más volumen.',
    badge: 'Más popular',
    features: [
      { text: '2 reportes al mes', active: true },
      { text: '300 conversaciones por reporte', active: true },
      { text: '90 días de historial', active: true },
      { text: 'Reporte PDF con gráficas', active: true },
      { text: 'Análisis IA completo', active: true },
      { text: 'Subida manual de archivos', active: true },
      { text: 'Dashboard de tendencias', active: true },
      { text: 'Soporte por email', active: true },
    ],
    accentColor: '#4f46e5',
    bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)',
  },
  {
    key: 'enterprise',
    label: 'Enterprise',
    price: '$400.000',
    period: '/mes',
    description: 'Visibilidad semanal para negocios de alto volumen.',
    badge: null,
    features: [
      { text: '4 reportes al mes', active: true },
      { text: '1.000 conversaciones por reporte', active: true },
      { text: '180 días de historial', active: true },
      { text: 'Reporte PDF con gráficas', active: true },
      { text: 'Análisis IA completo', active: true },
      { text: 'Subida manual de archivos', active: true },
      { text: 'Dashboard de tendencias', active: true },
      { text: 'Soporte prioritario — respuesta < 4h', active: true },
    ],
    accentColor: '#7c3aed',
    bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #fdfbff 100%)',
  },
];

/* ─── Small reusable pieces ──────────────────────────────────────────── */

const CheckIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="8" fill={color} fillOpacity="0.12" />
    <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CrossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="8" fill="#e5e7eb" />
    <path d="M5.5 10.5l5-5M10.5 10.5l-5-5" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const WompiLogo = () => (
  <svg width="64" height="20" viewBox="0 0 64 20" fill="none">
    <text x="0" y="15" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="14" fill="#00b5e2">wompi</text>
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

/* ─── Wompi checkout redirect ────────────────────────────────────────── */
// Wompi's widget script uses document.currentScript internally, which is null
// when injected dynamically in a React SPA. The hosted checkout URL is the
// correct approach for SPAs — same UX, same security model.

const buildWompiUrl = (session) => {
  const base = 'https://checkout.wompi.co/p/';
  // signature:integrity has a literal colon — cannot go through URLSearchParams
  const params = [
    `public-key=${encodeURIComponent(session.public_key)}`,
    `currency=${session.currency}`,
    `amount-in-cents=${session.amount_in_cents}`,
    `reference=${encodeURIComponent(session.reference)}`,
    `signature:integrity=${session.integrity}`,
    `redirect-url=${encodeURIComponent(session.redirect_url)}`,
  ].join('&');
  return `${base}?${params}`;
};

const WompiButton = ({ session, plan }) => {
  if (!session) return null;
  const url = buildWompiUrl(session);
  return (
    <a
      href={url}
      style={{
        display: 'block', width: '100%', textAlign: 'center', boxSizing: 'border-box',
        background: `linear-gradient(135deg, ${plan.accentColor}, #7c3aed)`,
        color: 'white', textDecoration: 'none',
        padding: '15px 24px', borderRadius: 12, fontSize: 16, fontWeight: 700,
        boxShadow: `0 8px 24px ${plan.accentColor}55`,
        fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.01em',
        transition: 'opacity 150ms, transform 150ms',
        marginTop: 8,
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
    >
      Pagar {plan.price} con Wompi →
    </a>
  );
};

/* ─── Step 1 — Plan cards ────────────────────────────────────────────── */

const PlanCard = ({ plan, selected, onSelect, loading }) => {
  const isSelected = selected?.key === plan.key;
  return (
    <div
      onClick={() => !loading && onSelect(plan)}
      style={{
        border: isSelected ? `2px solid ${plan.accentColor}` : '2px solid #e5e7eb',
        borderRadius: 16,
        padding: '24px 20px',
        background: isSelected ? plan.bgGradient : 'white',
        cursor: loading ? 'default' : 'pointer',
        transition: 'border-color 200ms, transform 150ms, box-shadow 200ms',
        transform: isSelected ? 'translateY(-3px)' : 'none',
        boxShadow: isSelected ? `0 8px 32px ${plan.accentColor}28` : '0 2px 8px rgba(14,7,73,0.06)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
      onMouseEnter={e => { if (!loading && !isSelected) e.currentTarget.style.borderColor = plan.accentColor + '66'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#e5e7eb'; }}
    >
      {plan.badge && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: plan.accentColor, color: 'white',
          fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999,
          letterSpacing: '0.04em', whiteSpace: 'nowrap',
        }}>
          {plan.badge}
        </div>
      )}

      <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600, color: plan.accentColor, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {plan.label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: '#0e0749', letterSpacing: '-0.03em' }}>{plan.price}</span>
        <span style={{ fontSize: 13, color: 'rgba(14,7,73,0.45)', fontWeight: 400 }}>{plan.period}</span>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.55)', lineHeight: 1.55, marginBottom: 18 }}>
        {plan.description}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {f.active ? <CheckIcon color={plan.accentColor} /> : <CrossIcon />}
            <span style={{ fontSize: 13, color: f.active ? '#0e0749' : '#9ca3af', fontWeight: f.active ? 500 : 400 }}>
              {f.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 20, padding: '10px 0', borderRadius: 10, textAlign: 'center',
        background: isSelected ? plan.accentColor : 'transparent',
        border: isSelected ? 'none' : `1.5px solid ${plan.accentColor}`,
        color: isSelected ? 'white' : plan.accentColor,
        fontSize: 13, fontWeight: 700,
        transition: 'background 200ms, color 200ms',
      }}>
        {isSelected ? '✓ Seleccionado' : 'Seleccionar'}
      </div>
    </div>
  );
};

/* ─── Step 2 — Checkout confirmation ─────────────────────────────────── */

const CheckoutStep = ({ plan, session, onBack, loading, error }) => (
  <div style={{ animation: 'pageFade 250ms ease' }}>
    <button onClick={onBack} style={{
      background: 'none', border: 'none', color: 'rgba(14,7,73,0.5)',
      fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
      fontFamily: 'DM Sans, sans-serif', padding: '0 0 20px',
    }}>
      ← Cambiar plan
    </button>

    {/* Selected plan summary */}
    <div style={{
      background: `linear-gradient(135deg, ${plan.bgGradient})`,
      border: `1.5px solid ${plan.accentColor}33`,
      borderRadius: 14, padding: '20px 24px', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: plan.accentColor, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
            Plan {plan.label}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0e0749' }}>
            {plan.price}<span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(14,7,73,0.45)' }}> COP/mes</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.5)', marginTop: 4 }}>{plan.description}</div>
        </div>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: plan.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: 'white', fontWeight: 800,
        }}>
          {plan.label[0]}
        </div>
      </div>
    </div>

    {/* Key features recap */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
      {plan.features.filter(f => f.active).slice(0, 4).map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0e0749' }}>
          <CheckIcon color={plan.accentColor} />
          {f.text}
        </div>
      ))}
    </div>

    {error && (
      <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', fontSize: 13, borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
        {error}
      </div>
    )}

    {/* Wompi button */}
    {loading && (
      <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(14,7,73,0.45)', fontSize: 14 }}>
        <div style={{ width: 28, height: 28, border: '3px solid #ededed', borderTopColor: plan.accentColor, borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 10px' }} />
        Preparando tu pago…
      </div>
    )}

    {session && !loading && <WompiButton session={session} plan={plan} />}

    {/* Security badge */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, color: 'rgba(14,7,73,0.4)', fontSize: 12 }}>
      <LockIcon />
      <span>Pago 100% seguro con</span>
      <span style={{ fontWeight: 700, color: '#00b5e2', fontSize: 13 }}>Wompi</span>
      <span>· Cancela cuando quieras</span>
    </div>
  </div>
);

/* ─── Trial code redemption ──────────────────────────────────────────── */

const GiftIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

const TrialCodeBox = ({ api, onRedeemed }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/api/v1/billing/redeem-trial', {
        body: { code: trimmed },
      });
      setSuccess(data);
      // Give the user a beat to read the success state, then close the modal.
      setTimeout(() => onRedeemed?.(data), 1600);
    } catch (err) {
      setError(err.message || 'No pudimos canjear ese código.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
        border: '1.5px solid #86efac', borderRadius: 16,
        padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 4px 16px rgba(34,197,94,0.12)',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: '#10b981', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46', marginBottom: 2 }}>
            ¡Código activado!
          </div>
          <div style={{ fontSize: 13, color: '#047857' }}>
            Tu prueba del plan <strong style={{ textTransform: 'capitalize' }}>{success.plan}</strong> está activa por {success.duration_days} días.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trial-code-card">
      <style>{`
        .trial-code-card {
          background: linear-gradient(135deg, #f5f3ff 0%, #faf9ff 50%, #f0f0ff 100%);
          border: 1.5px solid #ddd6fe;
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(99,102,241,0.06);
          transition: border-color 200ms, box-shadow 200ms;
        }
        .trial-code-card::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 140px; height: 140px;
          background: radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%);
          pointer-events: none;
        }
        .trial-code-card:focus-within {
          border-color: #a78bfa;
          box-shadow: 0 8px 28px rgba(99,102,241,0.16);
        }
        .trial-code-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: white;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 6px 18px rgba(99,102,241,0.32);
        }
        .trial-code-text { flex: 1; min-width: 0; }
        .trial-code-title {
          font-size: 14px; font-weight: 700; color: #0e0749;
          letter-spacing: -0.01em; margin-bottom: 2px;
        }
        .trial-code-sub {
          font-size: 12.5px; color: rgba(14,7,73,0.55); line-height: 1.5;
        }
        .trial-code-form {
          display: flex; gap: 8px; align-items: stretch;
          flex-shrink: 0;
        }
        .trial-code-input {
          width: 200px;
          padding: 11px 14px;
          border: 1.5px solid #ddd6fe;
          border-radius: 10px;
          background: white;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #0e0749;
          outline: none;
          transition: border-color 150ms, box-shadow 150ms;
        }
        .trial-code-input::placeholder {
          color: rgba(14,7,73,0.3);
          font-weight: 500;
          letter-spacing: 0.04em;
        }
        .trial-code-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .trial-code-btn {
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 0 22px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: -0.01em;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(99,102,241,0.32);
          transition: transform 150ms, box-shadow 200ms, opacity 150ms;
          white-space: nowrap;
        }
        .trial-code-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(99,102,241,0.42);
        }
        .trial-code-btn:disabled { opacity: 0.45; cursor: default; box-shadow: none; }
        .trial-code-error {
          margin-top: 10px;
          font-size: 12.5px;
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 8px 12px;
          border-radius: 8px;
        }
        @media (max-width: 640px) {
          .trial-code-card {
            flex-direction: column;
            align-items: stretch;
            text-align: left;
            gap: 14px;
            padding: 18px;
          }
          .trial-code-form { flex-direction: column; gap: 8px; }
          .trial-code-input { width: 100%; box-sizing: border-box; }
          .trial-code-btn { padding: 12px; }
        }
      `}</style>

      <div className="trial-code-icon">
        <GiftIcon />
      </div>

      <div className="trial-code-text">
        <div className="trial-code-title">¿Tienes un código de prueba?</div>
        <div className="trial-code-sub">
          Canjéalo y obtén acceso gratis al plan Básico — un reporte completo, sin tarjeta.
        </div>
        {error && <div className="trial-code-error">{error}</div>}
      </div>

      <div className="trial-code-form">
        <input
          type="text"
          className="trial-code-input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="TU-CÓDIGO"
          disabled={loading}
          onKeyDown={(e) => { if (e.key === 'Enter') handleRedeem(); }}
          aria-label="Código de prueba"
        />
        <button
          type="button"
          className="trial-code-btn"
          onClick={handleRedeem}
          disabled={loading || !code.trim()}
        >
          {loading ? 'Canjeando…' : 'Canjear'}
        </button>
      </div>
    </div>
  );
};

/* ─── Main modal ─────────────────────────────────────────────────────── */

const PlanSelectionModal = ({ onClose, onTrialRedeemed }) => {
  const api = useApiClient();
  const [step, setStep] = useState('select'); // 'select' | 'checkout'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setError('');
    setStep('checkout');
    try {
      const data = await api.post('/api/v1/billing/payment-session', {
        body: { plan: selectedPlan.key },
      });
      setSession(data);
    } catch (err) {
      setError(err.message || 'Error al iniciar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('select');
    setSession(null);
    setError('');
  };

  return (
    <>
      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .plan-modal-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 780px) {
          .plan-modal-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={step === 'select' ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(14,7,73,0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
      >
        {/* Card */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'white',
            borderRadius: 24,
            width: '100%',
            maxWidth: step === 'select' ? 900 : 520,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '36px 40px',
            boxShadow: '0 32px 100px rgba(14,7,73,0.25)',
            animation: 'modalSlideIn 300ms cubic-bezier(0.16,1,0.3,1)',
            transition: 'max-width 350ms ease',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: step === 'select' ? 8 : 24 }}>
            <DeepLookLogo size="sm" dark />
            {onClose && (
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'rgba(14,7,73,0.4)', borderRadius: 8 }}
                onMouseEnter={e => e.currentTarget.style.background = '#f4f3ff'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {step === 'select' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0e0749', letterSpacing: '-0.03em', marginBottom: 8 }}>
                  Elige tu plan
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.55)', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
                  Todos los planes incluyen análisis IA completo y reporte PDF descargable.<br />
                  Cancela cuando quieras, sin compromisos.
                </p>
              </div>

              <div className="plan-modal-grid" style={{ marginBottom: 28 }}>
                {PLANS.map(plan => (
                  <PlanCard
                    key={plan.key}
                    plan={plan}
                    selected={selectedPlan}
                    onSelect={handleSelectPlan}
                    loading={loading}
                  />
                ))}
              </div>

              {/* CTA row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <button
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', color: 'rgba(14,7,73,0.45)', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', padding: '8px 0' }}
                >
                  Más tarde — explorar gratis
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!selectedPlan || loading}
                  className="btn-primary"
                  style={{
                    padding: '13px 32px', fontSize: 15, fontWeight: 700, borderRadius: 12,
                    opacity: selectedPlan ? 1 : 0.4,
                    cursor: selectedPlan ? 'pointer' : 'not-allowed',
                    minWidth: 200,
                  }}
                >
                  {selectedPlan ? `Continuar con ${selectedPlan.label} →` : 'Selecciona un plan'}
                </button>
              </div>

              {/* Trial code redemption — sits between the CTA and the trust line,
                  spans the full modal width to feel anchored, not orphaned */}
              <div style={{ marginTop: 24 }}>
                <TrialCodeBox
                  api={api}
                  onRedeemed={() => onTrialRedeemed?.()}
                />
              </div>

              {/* Trust line */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
                {['🔒 Pago seguro', '🇨🇴 Paga en pesos', '↩ Cancela fácil'].map(t => (
                  <span key={t} style={{ fontSize: 12, color: 'rgba(14,7,73,0.4)' }}>{t}</span>
                ))}
              </div>
            </>
          )}

          {step === 'checkout' && selectedPlan && (
            <CheckoutStep
              plan={selectedPlan}
              session={session}
              onBack={handleBack}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default PlanSelectionModal;
