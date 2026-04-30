import { useState, useEffect } from 'react';
import { useUser } from '@clerk/react';
import { Icon } from './Icons';
import { useApiClient } from '../lib/api';

// ── helpers ──────────────────────────────────────────────────────────────────

const useCounter = (target, duration = 1200) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let cur = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
};

const formatJobName = (job) => {
  const d = new Date(job.created_at);
  return `Reporte del ${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatRelative = (dateStr) => {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diffMs / 3600000);
  const d = Math.floor(diffMs / 86400000);
  if (h < 1)  return 'hace menos de 1h';
  if (h < 24) return `hace ${h}h`;
  if (d === 1) return 'ayer';
  if (d < 7)  return `hace ${d} días`;
  return formatDate(dateStr);
};

const scoreLabel = (s) => {
  if (s == null) return null;
  if (s >= 80) return { text: 'Excelente', color: '#22c55e' };
  if (s >= 65) return { text: 'Muy buena', color: '#4ade80' };
  if (s >= 50) return { text: 'Regular',   color: '#f59e0b' };
  if (s >= 35) return { text: 'Baja',       color: '#fb923c' };
  return           { text: 'Crítica',      color: '#f87171' };
};

const scoreColor = (s) => {
  if (s == null) return 'rgba(255,255,255,0.2)';
  if (s >= 65) return '#22c55e';
  if (s >= 40) return '#f59e0b';
  return '#f87171';
};

// ── Shared card shell ─────────────────────────────────────────────────────────
// All 4 cards use this wrapper so padding, border and hover are identical.

const CardShell = ({ accent, children }) => (
  <div
    style={{ background: 'white', border: '1px solid #ededed', borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', transition: 'box-shadow 200ms, transform 200ms' }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(79,70,229,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '16px 16px 0 0' }} />
    {children}
  </div>
);

// Fixed-height top row so numbers always land at the same Y across all cards.
const CardHeader = ({ label, iconSlot }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 36, marginBottom: 14 }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(14,7,73,0.45)', letterSpacing: '0.02em' }}>{label}</div>
    {iconSlot}
  </div>
);

const CardIcon = ({ icon, bg, color }) => (
  <div style={{ width: 34, height: 34, background: bg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <Icon name={icon} size={16} color={color} />
  </div>
);

const BigNumber = ({ children }) => (
  <div style={{ fontSize: 34, fontWeight: 700, color: '#0e0749', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
    {children}
  </div>
);

const SubText = ({ children }) => (
  <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.4)', marginTop: 7 }}>{children}</div>
);

const SkeletonLine = ({ w = 80 }) => (
  <div style={{ height: 36, width: w, background: '#ededed', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }} />
);

// ── Mini ring gauge (34×34, matches icon slot height) ────────────────────────

const MiniRing = ({ score, animated }) => {
  const size = 34;
  const R = size * 0.38;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * R;
  const arc = C * 0.75;
  const filled = arc * ((animated ?? 0) / 100);
  const color = scoreColor(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(14,7,73,0.07)"
        strokeWidth={4} strokeDasharray={`${arc} ${C}`} strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`} />
      {(animated ?? 0) > 0 && (
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={color}
          strokeWidth={4} strokeDasharray={`${filled} ${C}`} strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
      )}
    </svg>
  );
};

// ── 4 stat cards ──────────────────────────────────────────────────────────────

const HealthStatCard = ({ score, latestJob, loading }) => {
  const animated = useCounter(score ?? 0, 1400);
  const label = scoreLabel(score);
  const color = scoreColor(score);
  return (
    <CardShell accent={color}>
      <CardHeader label="Puntaje de salud" iconSlot={<MiniRing score={score} animated={animated} />} />
      {loading
        ? <SkeletonLine w={80} />
        : <BigNumber>
            {score != null ? animated : '—'}
            {score != null && <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(14,7,73,0.3)', marginLeft: 4 }}>/100</span>}
          </BigNumber>
      }
      {!loading && (
        <SubText>
          {label && <><span style={{ color, fontWeight: 600 }}>● {label.text}</span> · </>}
          {latestJob ? formatJobName(latestJob) : 'Sin reportes'}
        </SubText>
      )}
    </CardShell>
  );
};

const EqualStatCard = ({ icon, iconBg, iconColor, label, value, sub, loading, accent }) => (
  <CardShell accent={accent}>
    <CardHeader label={label} iconSlot={<CardIcon icon={icon} bg={iconBg} color={iconColor} />} />
    {loading ? <SkeletonLine /> : <BigNumber>{value}</BigNumber>}
    {!loading && sub && <SubText>{sub}</SubText>}
  </CardShell>
);

const SyncCard = ({ connection }) => {
  const loading = connection === undefined;
  const noConn  = connection === null;
  const synced  = !noConn && connection?.last_sync_at;

  let ageH = null, statusColor = '#c4c4c8', statusText = 'Sin conexión';
  if (synced) {
    ageH = (Date.now() - new Date(connection.last_sync_at).getTime()) / 3600000;
    statusColor = ageH < 2 ? '#22c55e' : ageH < 24 ? '#f59e0b' : '#f87171';
    statusText  = ageH < 2 ? 'Al día' : ageH < 24 ? 'Hoy' : 'Desactualizado';
  } else if (!noConn) {
    statusText = 'Pendiente';
  }

  // Progress in current sync cycle (0–100%) — we don't have next_scheduled_sync_at yet so estimate
  const cycleProgress = synced && ageH != null ? Math.min(100, Math.round((ageH / (30 * 24)) * 100)) : 0;

  return (
    <CardShell accent={`linear-gradient(90deg,${statusColor},${statusColor}88)`}>
      <CardHeader
        label="Conexión WhatsApp"
        iconSlot={<CardIcon icon="whatsapp" bg={`${statusColor}18`} color={statusColor} />}
      />

      {loading
        ? <SkeletonLine w={100} />
        : <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: statusColor, boxShadow: `0 0 6px ${statusColor}`, flexShrink: 0 }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', fontFamily: 'DM Sans, sans-serif', lineHeight: 1 }}>
              {statusText}
            </span>
          </div>
      }

      {!loading && (
        <>
          <SubText>
            {synced ? `Último sync ${formatRelative(connection.last_sync_at)}` : noConn ? 'Conecta tu WhatsApp' : 'Esperando primer sync'}
          </SubText>
          {synced && (
            <div style={{ marginTop: 10 }}>
              <div style={{ height: 4, background: '#ededed', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${cycleProgress}%`, background: statusColor, borderRadius: 2, transition: 'width 800ms ease' }} />
              </div>
              <div style={{ fontSize: 11, color: 'rgba(14,7,73,0.35)', marginTop: 4 }}>
                Ciclo mensual · {cycleProgress}% transcurrido
              </div>
            </div>
          )}
        </>
      )}
    </CardShell>
  );
};

// ── InfoCarousel ──────────────────────────────────────────────────────────────

const CAROUSEL_SLIDES = [
  {
    icon: 'lock',
    gradient: 'linear-gradient(135deg,#0e0749 0%,#2d2a7a 100%)',
    accent: '#a78bfa',
    tag: 'Privacidad',
    title: 'Tus datos nunca se almacenan',
    body: 'Procesamos tus conversaciones en tiempo real para generar el análisis y las descartamos de inmediato. DeepLook no guarda ni un solo mensaje.',
    cta: null,
  },
  {
    icon: 'zap',
    gradient: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)',
    accent: '#fbbf24',
    tag: 'Tip de rendimiento',
    title: 'Responde en menos de 2 minutos',
    body: 'Los clientes que reciben atención rápida tienen 3× más probabilidad de cerrar. Tu puntaje de velocidad lo refleja directamente en el score.',
    cta: null,
  },
  {
    icon: 'chart',
    gradient: 'linear-gradient(135deg,#0e4f47 0%,#065f46 100%)',
    accent: '#34d399',
    tag: '¿Cómo se calcula tu score?',
    title: '6 factores, una sola cifra',
    body: 'Velocidad de respuesta · Cobertura · Sentimiento · Calidad de atención · Tasa de conversión · Operación. Cada uno ponderado para darte un número accionable.',
    cta: null,
  },
  {
    icon: 'whatsapp',
    gradient: 'linear-gradient(135deg,#064e3b 0%,#14532d 100%)',
    accent: '#4ade80',
    tag: 'Sincronización automática',
    title: 'Los reportes llegan solos',
    body: 'Tu WhatsApp se sincroniza automáticamente según tu plan. No tienes que subir ni exportar nada — cuando hay datos nuevos, el análisis se genera solo.',
    cta: null,
  },
];

const InfoCarousel = ({ onNavigate }) => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animDir, setAnimDir] = useState(null); // 'left' | 'right' | null
  const [visible, setVisible] = useState(true);

  const go = (next, dir) => {
    if (!visible) return;
    setAnimDir(dir);
    setVisible(false);
    setTimeout(() => {
      setIdx((next + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
      setAnimDir(dir === 'left' ? 'right' : 'left');
      setVisible(true);
    }, 220);
  };

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(idx + 1, 'left'), 5000);
    return () => clearInterval(t);
  }, [idx, paused]);

  const slide = CAROUSEL_SLIDES[idx];

  const slideStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : `translateX(${animDir === 'left' ? '-18px' : '18px'})`,
    transition: 'opacity 220ms ease, transform 220ms ease',
    display: 'flex', flex: 1, alignItems: 'center', gap: 20, minWidth: 0,
  };

  return (
    <div
      style={{ background: slide.gradient, borderRadius: 16, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, boxShadow: '0 8px 32px rgba(14,7,73,0.22)', overflow: 'hidden', position: 'relative', minHeight: 96 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Decorative blurred circle */}
      <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, background: `${slide.accent}18`, borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Prev arrow */}
      <button
        onClick={() => go(idx - 1, 'right')}
        style={{ flexShrink: 0, width: 30, height: 30, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, transition: 'background 150ms' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
      >‹</button>

      {/* Slide content */}
      <div style={slideStyle}>
        {/* Icon bubble */}
        <div style={{ width: 48, height: 48, background: `${slide.accent}25`, border: `1.5px solid ${slide.accent}50`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={slide.icon} size={22} color={slide.accent} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: slide.accent, marginBottom: 4 }}>{slide.tag}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 4, lineHeight: 1.3 }}>{slide.title}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', lineHeight: 1.55 }}>{slide.body}</div>
        </div>
      </div>

      {/* Right side: dots + next arrow */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => go(idx + 1, 'left')}
          style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, transition: 'background 150ms' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >›</button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {CAROUSEL_SLIDES.map((_, i) => (
            <div key={i} onClick={() => go(i, i > idx ? 'left' : 'right')}
              style={{ width: 6, height: i === idx ? 18 : 6, background: i === idx ? slide.accent : 'rgba(255,255,255,0.25)', borderRadius: 3, cursor: 'pointer', transition: 'height 300ms ease, background 300ms ease' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── QuotaPanel ────────────────────────────────────────────────────────────────

const PLAN_LABELS_HOME = { free: 'Plan Gratis', basic: 'Plan Básico', plus: 'Plan Plus', enterprise: 'Plan Enterprise' };

const QuotaChip = ({ icon, label, active }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: active ? 'rgba(79,70,229,0.08)' : '#f4f4f6', border: `1px solid ${active ? 'rgba(79,70,229,0.2)' : '#e4e4e8'}` }}>
    <Icon name={icon} size={12} color={active ? '#4f46e5' : '#c4c4c8'} />
    <span style={{ fontSize: 12, fontWeight: 500, color: active ? '#4f46e5' : 'rgba(14,7,73,0.35)', textDecoration: active ? 'none' : 'line-through' }}>{label}</span>
  </div>
);

const QuotaPanel = ({ quota, onNavigate }) => {
  if (!quota?.reports) return null;

  const { plan, reports, conversations_per_report, lookback_days, features, billing_period_end } = quota;
  const usedPct = reports.limit > 0 ? Math.min(100, (reports.used / reports.limit) * 100) : 0;
  const exhausted = reports.remaining === 0;
  const periodEnd = new Date(billing_period_end).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
  const barColor = exhausted ? '#f87171' : usedPct >= 80 ? '#f59e0b' : '#4f46e5';

  return (
    <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 14, padding: '20px 24px', marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'rgba(79,70,229,0.08)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="zap" size={16} color="#4f46e5" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749' }}>
              {PLAN_LABELS_HOME[plan] ?? plan}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)' }}>Período actual · renueva {periodEnd}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {exhausted ? (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: 999 }}>
              Cuota agotada
            </span>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 600, color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: 999 }}>
              {reports.remaining} reporte{reports.remaining !== 1 ? 's' : ''} disponible{reports.remaining !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Reports usage bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: 'rgba(14,7,73,0.55)' }}>Reportes este mes</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0e0749', fontFamily: 'JetBrains Mono, monospace' }}>
            {reports.used} / {reports.limit}
          </span>
        </div>
        <div style={{ height: 6, background: '#ededed', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${usedPct}%`, background: barColor, borderRadius: 3, transition: 'width 600ms ease' }} />
        </div>
      </div>

      {/* Feature chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <QuotaChip icon="chat" label={`Hasta ${conversations_per_report} convs/reporte`} active={conversations_per_report > 0} />
        <QuotaChip icon="clock" label={`${lookback_days} días de historial`} active={lookback_days > 0} />
        <QuotaChip icon="upload" label="Subida manual .txt" active={features.manual_upload} />
        <QuotaChip icon="chart" label="Tendencias" active={features.trends_dashboard} />
      </div>

      {exhausted && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="alert" size={15} color="#ef4444" />
          <span>Has usado todos los reportes de este período. Tu cuota se renueva el {periodEnd}.</span>
        </div>
      )}
    </div>
  );
};

// ── InsightPanel ──────────────────────────────────────────────────────────────

const SentimentBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
      <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.6)', width: 68, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 6, background: '#ededed', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 700ms ease' }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(14,7,73,0.5)', width: 30, textAlign: 'right', flexShrink: 0 }}>{pct}%</div>
    </div>
  );
};

const InsightPanel = ({ latestResults }) => {
  const convs = latestResults?.conversations ?? [];

  if (convs.length === 0) {
    return (
      <div style={{ background: '#f4f3ff', border: '1px solid rgba(79,70,229,0.12)', borderRadius: 14, padding: 24, display: 'flex', gap: 16 }}>
        <div style={{ width: 44, height: 44, background: 'rgba(79,70,229,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="lightbulb" size={22} color="#4f46e5" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749', marginBottom: 6 }}>Tip de la semana</div>
          <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.7)', lineHeight: 1.65, marginBottom: 0 }}>
            Responde en menos de 2 minutos para mejorar tu puntaje. Los clientes que reciben atención rápida tienen 3× más probabilidad de cerrar.
          </p>
        </div>
      </div>
    );
  }

  const sentCount = { positive: 0, neutral: 0, negative: 0 };
  convs.forEach(c => { if (c.sentiment in sentCount) sentCount[c.sentiment]++; });
  const total = convs.length;
  const converted = convs.filter(c => c.conversion_status === 'converted').length;
  const lost      = convs.filter(c => c.conversion_status === 'lost').length;
  const convRate  = Math.round((converted / total) * 100);

  return (
    <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 14, padding: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749', marginBottom: 16 }}>Último reporte · resumen</div>

      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(14,7,73,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Sentimiento</div>
      <SentimentBar label="Positivo" count={sentCount.positive} total={total} color="#22c55e" />
      <SentimentBar label="Neutral"  count={sentCount.neutral}  total={total} color="#a78bfa" />
      <SentimentBar label="Negativo" count={sentCount.negative} total={total} color="#f87171" />

      <div style={{ borderTop: '1px solid #ededed', marginTop: 16, paddingTop: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(14,7,73,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Conversiones</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: '#f0fdf4', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a', fontFamily: 'JetBrains Mono,monospace' }}>{converted}</div>
            <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>Cerradas</div>
          </div>
          <div style={{ flex: 1, background: '#fef2f2', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', fontFamily: 'JetBrains Mono,monospace' }}>{lost}</div>
            <div style={{ fontSize: 12, color: '#991b1b', marginTop: 2 }}>Perdidas</div>
          </div>
          <div style={{ flex: 1, background: '#f4f3ff', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#4f46e5', fontFamily: 'JetBrains Mono,monospace' }}>{convRate}%</div>
            <div style={{ fontSize: 12, color: '#3730a3', marginTop: 2 }}>Tasa</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── ReportRow ─────────────────────────────────────────────────────────────────

const ReportRow = ({ job, onDownload, downloading, isLast }) => (
  <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: isLast ? 0 : 10, transition: 'border-color 200ms, box-shadow 200ms' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = '#ededed'; e.currentTarget.style.boxShadow = ''; }}>
    <div style={{ width: 40, height: 40, background: 'rgba(79,70,229,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name="file" size={18} color="#4f46e5" />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#0e0749', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatJobName(job)}</div>
      <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)' }}>
        {formatDate(job.created_at)} · {job.total_conversations} conversaciones
      </div>
    </div>
    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
      <button className="btn-ghost" onClick={() => onDownload(job.job_id)} disabled={downloading} style={{ padding: '7px 14px', fontSize: 13 }}>
        {downloading ? '…' : 'Ver PDF'}
      </button>
      <button onClick={() => onDownload(job.job_id)} disabled={downloading}
        style={{ width: 34, height: 34, background: 'rgba(79,70,229,0.06)', border: '1px solid #ededed', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="download" size={15} color="#4f46e5" />
      </button>
    </div>
  </div>
);

// ── main component ────────────────────────────────────────────────────────────

// jobs: null = loading | [] = empty | [...] = list
// latestResults: undefined = still loading | null = no results | object = results
const FreePlanBanner = ({ onShowPlanModal }) => (
  <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', borderRadius: 16, padding: '22px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', boxShadow: '0 8px 32px rgba(79,70,229,0.28)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
        🔒
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 3 }}>Activa tu plan para empezar a ver reportes</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
          Estás en modo exploración gratuita. Elige un plan y obtén tu primer análisis de WhatsApp en minutos.
        </div>
      </div>
    </div>
    <button
      onClick={onShowPlanModal}
      style={{ background: 'white', color: '#4f46e5', border: 'none', borderRadius: 10, padding: '12px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', transition: 'transform 150ms, box-shadow 150ms', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'; }}>
      Ver planes →
    </button>
  </div>
);

const DashHome = ({ onNavigate, connection, jobs, latestResults, quota, onShowPlanModal }) => {
  const { user } = useUser();
  const api = useApiClient();
  const [downloadingId, setDownloadingId] = useState(null);

  const completedJobs = (jobs ?? [])
    .filter(j => j.status === 'completed')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalConversations = completedJobs.reduce((s, j) => s + (j.total_conversations || 0), 0);
  const recentJobs = completedJobs.slice(0, 3);

  // Use overall_health_score from the backend — no more averaging quality_score
  const healthScore = latestResults?.overall_health_score != null
    ? Math.round(latestResults.overall_health_score)
    : null;

  const convsAnim   = useCounter(totalConversations);
  const reportsAnim = useCounter(completedJobs.length);

  // Show skeleton until both jobs list and latest results have arrived
  const loading = jobs === null || latestResults === undefined;

  const toTitleCase = s => s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const rawName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || '';
  const displayName = rawName ? toTitleCase(rawName) : '';

  const handleDownload = async (jobId) => {
    if (!jobId || downloadingId === jobId) return;
    setDownloadingId(jobId);
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
    } catch {}
    finally { setDownloadingId(null); }
  };

  return (
    <div className="dash-page page-fade">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0e0749', marginBottom: 4, letterSpacing: '-0.02em' }}>
          Hola{displayName ? `, ${displayName}` : ''} 👋
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.55)' }}>
          {loading ? 'Cargando tus datos…' : completedJobs.length === 0
            ? 'Aún no tienes reportes generados.'
            : 'Resumen de tu actividad en WhatsApp'}
        </p>
      </div>

      {/* 4-card equal stats grid */}
      <div style={{ display: 'grid', gap: 14, marginBottom: 24 }} className="dash-home-stats">
        <style>{`
          .dash-home-stats { grid-template-columns: repeat(4, 1fr); }
          @media(max-width:900px){ .dash-home-stats{ grid-template-columns:repeat(2,1fr)!important; } }
          @media(max-width:480px){ .dash-home-stats{ grid-template-columns:1fr!important; } }
        `}</style>

        <HealthStatCard
          score={healthScore}
          latestJob={completedJobs[0] ?? null}
          loading={loading}
        />

        <EqualStatCard
          icon="chat" iconBg="rgba(79,70,229,0.08)" iconColor="#4f46e5"
          accent="linear-gradient(90deg,#4f46e5,#a78bfa)"
          label="Conversaciones analizadas"
          value={convsAnim.toLocaleString('es-CO')}
          sub={`En ${completedJobs.length} reporte${completedJobs.length !== 1 ? 's' : ''}`}
          loading={loading}
        />

        <EqualStatCard
          icon="file" iconBg="rgba(167,139,250,0.1)" iconColor="#a78bfa"
          accent="linear-gradient(90deg,#a78bfa,#c4b5fd)"
          label="Reportes completados"
          value={reportsAnim.toLocaleString('es-CO')}
          sub={completedJobs.length === 0 ? 'Sin reportes aún' : `${completedJobs.length} generado${completedJobs.length !== 1 ? 's' : ''}`}
          loading={loading}
        />

        <SyncCard connection={connection} />
      </div>

      {/* Free-plan upgrade banner */}
      {quota?.plan === 'free' && <FreePlanBanner onShowPlanModal={onShowPlanModal} />}

      {/* Quota panel */}
      {quota && quota.plan !== 'free' && <QuotaPanel quota={quota} onNavigate={onNavigate} />}

      {/* CTA banners */}
      {connection === null && (
        <div style={{ background: 'linear-gradient(135deg,#0e0749,#4f46e5)', borderRadius: 16, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginBottom: 32, boxShadow: '0 8px 32px rgba(14,7,73,0.25)' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 4 }}>Conecta tu WhatsApp para empezar</div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>Vincula tu número y recibe análisis automáticos de tus conversaciones.</div>
          </div>
          <button onClick={() => onNavigate('connect')} style={{ background: 'white', color: '#4f46e5', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'transform 200ms' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}>
            Conectar ahora
          </button>
        </div>
      )}
      {connection && !connection.last_sync_at && (
        <div style={{ background: 'linear-gradient(135deg,#4f46e5,#6c63ff)', borderRadius: 16, padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, boxShadow: '0 8px 32px rgba(79,70,229,0.2)' }}>
          <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="zap" size={24} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 4 }}>Tu primer reporte estará listo pronto</div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)' }}>WhatsApp conectado · La sincronización inicial puede tardar unos minutos.</div>
          </div>
        </div>
      )}
      {(connection === undefined || (connection && connection.last_sync_at)) && (
        <InfoCarousel onNavigate={onNavigate} />
      )}

      {/* Lower section */}
      <div style={{ display: 'grid', gap: 24, alignItems: 'start' }} className="dash-home-lower">
        <style>{`.dash-home-lower { grid-template-columns: minmax(0,1.6fr) minmax(0,1fr); } @media(max-width:960px){.dash-home-lower{grid-template-columns:1fr!important}}`}</style>

        {/* Recent reports */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0e0749' }}>Reportes recientes</h2>
            <button onClick={() => onNavigate('reports')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Ver todos →</button>
          </div>

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 74, borderRadius: 10 }} />)}
            </div>
          )}

          {!loading && recentJobs.length === 0 && (
            <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 10, padding: '32px 20px', textAlign: 'center' }}>
              <Icon name="file" size={28} color="#c4c4c8" />
              <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.45)', marginTop: 10, marginBottom: 16 }}>Aún no tienes reportes generados.</p>
              <button onClick={() => onNavigate('connect')} className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
                Conectar WhatsApp
              </button>
            </div>
          )}

          {!loading && recentJobs.map((job, i) => (
            <ReportRow key={job.job_id} job={job} onDownload={handleDownload} downloading={downloadingId === job.job_id} isLast={i === recentJobs.length - 1} />
          ))}
        </div>

        {/* Insight panel */}
        <InsightPanel latestResults={latestResults} />
      </div>
    </div>
  );
};

export default DashHome;
