const CONFIGS = {
  expired: {
    bg: 'linear-gradient(135deg, #fef2f2 0%, #fff1f1 100%)',
    border: '#fecaca',
    iconBg: '#ef4444',
    textColor: '#991b1b',
    subColor: '#b91c1c',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    ),
    label: 'Plan expirado',
    getMessage: () => 'Tu plan ha expirado. Renueva ahora para recuperar el acceso completo.',
    cta: 'Renovar ahora',
    urgencyDot: '#ef4444',
  },
  critical: {
    bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
    border: '#fed7aa',
    iconBg: '#f97316',
    textColor: '#9a3412',
    subColor: '#c2410c',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
      </svg>
    ),
    label: 'Expira pronto',
    getMessage: (days) =>
      days === 1
        ? 'Tu plan expira mañana. Renueva para no perder el acceso.'
        : `Tu plan expira en ${days} días. Renueva antes de que pierda acceso.`,
    cta: 'Renovar ahora',
    urgencyDot: '#f97316',
  },
  warning: {
    bg: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
    border: '#fde68a',
    iconBg: '#eab308',
    textColor: '#713f12',
    subColor: '#92400e',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    ),
    label: 'Renovación próxima',
    getMessage: (days, date) =>
      `Tu plan vence el ${date}. Renuévalo para mantener el acceso sin interrupciones.`,
    cta: 'Renovar plan',
    urgencyDot: '#eab308',
  },
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long',
  });
};

const RenewalBanner = ({ quota, onRenew }) => {
  const urgency = quota?.renewal_urgency;
  if (!urgency || urgency === 'ok') return null;

  const cfg = CONFIGS[urgency];
  const days = quota?.days_remaining ?? 0;
  const expiryDate = formatDate(quota?.plan_expires_at);
  const message = cfg.getMessage(days, expiryDate);

  const PLAN_LABELS = { basic: 'Básico', plus: 'Plus', enterprise: 'Enterprise' };
  const planLabel = PLAN_LABELS[quota?.plan] || quota?.plan || '';

  return (
    <>
      <style>{`
        @keyframes renewDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.75)} }
        .renewal-banner-btn {
          background: white; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13px;
          padding: 8px 18px; border-radius: 8px; white-space: nowrap;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .renewal-banner-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
      `}</style>

      <div style={{
        background: cfg.bg,
        borderBottom: `1px solid ${cfg.border}`,
        padding: '10px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 68, zIndex: 90,
        flexWrap: 'wrap',
      }}>
        {/* Icon */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: cfg.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {cfg.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 1 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: cfg.urgencyDot, flexShrink: 0,
              animation: urgency === 'expired' || urgency === 'critical'
                ? 'renewDot 1.4s ease-in-out infinite' : 'none',
            }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: cfg.textColor }}>
              {cfg.label}
              {planLabel ? ` — Plan ${planLabel}` : ''}
            </span>
          </div>
          <p style={{ fontSize: 12, color: cfg.subColor, margin: 0, lineHeight: 1.4 }}>
            {message}
          </p>
        </div>

        {/* CTA */}
        <button
          className="renewal-banner-btn"
          style={{ color: cfg.iconBg }}
          onClick={onRenew}
        >
          {cfg.cta} →
        </button>
      </div>
    </>
  );
};

export default RenewalBanner;
