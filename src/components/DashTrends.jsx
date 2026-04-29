import { useState, useEffect, useCallback, useRef } from 'react';
import { Icon } from './Icons';
import { useApiClient } from '../lib/api';

// ---------------------------------------------------------------------------
// Chart primitives (preserved exactly)
// ---------------------------------------------------------------------------

const LineChart = ({ series, labels, height = 160, yMax = 100, unit = '' }) => {
  const [hover, setHover] = useState(null);
  const W = 800, H = height, padL = 36, padB = 26, padT = 14, padR = 12;
  const cW = W - padL - padR, cH = H - padB - padT;
  const gridVals = [0, 25, 50, 75, 100].filter(v => v <= yMax + 5);
  const colors = ['#4f46e5','#a78bfa','#22c55e','#f59e0b'];

  const getXY = (val, idx, total) => ({
    x: padL + (idx / (total - 1)) * cW,
    y: padT + (1 - val / yMax) * cH
  });

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <defs>
          {series.map((s, si) => (
            <linearGradient key={si} id={`lg${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[si % colors.length]} stopOpacity="0.15" />
              <stop offset="100%" stopColor={colors[si % colors.length]} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {gridVals.map(v => {
          const y = padT + (1 - v / yMax) * cH;
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#ededed" strokeWidth="1" strokeDasharray={v === 0 ? 'none' : '4 4'} />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="7" fill="rgba(14,7,73,0.35)" fontFamily="JetBrains Mono">{v}{unit}</text>
            </g>
          );
        })}
        {labels.map((l, i) => {
          const x = padL + (i / (labels.length - 1)) * cW;
          return <line key={i} x1={x} y1={padT} x2={x} y2={padT + cH} stroke={hover === i ? '#4f46e5' : 'transparent'} strokeWidth="1" strokeDasharray="4 4" />;
        })}
        {series.map((s, si) => {
          const color = colors[si % colors.length];
          const pts = s.data.map((v, i) => getXY(v, i, labels.length));
          const linePath = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
          const areaPath = linePath + ` L${pts[pts.length-1].x},${padT+cH} L${pts[0].x},${padT+cH} Z`;
          return (
            <g key={si}>
              <path d={areaPath} fill={`url(#lg${si})`} />
              <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 6 : 4} fill={hover === i ? color : 'white'} stroke={color} strokeWidth="2"
                  style={{ transition: 'r 150ms' }} />
              ))}
            </g>
          );
        })}
        {labels.map((l, i) => {
          const x = padL + (i / (labels.length - 1)) * cW;
          return <text key={i} x={x} y={H - 4} textAnchor="middle" fontSize="7" fill="rgba(14,7,73,0.45)" fontFamily="DM Sans">{l}</text>;
        })}
        {labels.map((l, i) => {
          const x = padL + (i / (labels.length - 1)) * cW;
          return <rect key={i} x={x - 20} y={padT} width="40" height={cH} fill="transparent"
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'crosshair' }} />;
        })}
      </svg>
      {hover !== null && (
        <div style={{ position: 'absolute', top: 8, right: 8, background: 'white', border: '1px solid #ededed', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 20px rgba(14,7,73,0.12)', minWidth: 140, zIndex: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0e0749', marginBottom: 6 }}>{labels[hover]}</div>
          {series.map((s, si) => (
            <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: ['#4f46e5','#a78bfa','#22c55e','#f59e0b'][si % 4], flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'rgba(14,7,73,0.65)' }}>{s.label}:</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 700, color: '#0e0749' }}>{s.data[hover]}{unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BarChart = ({ data, labels, color = '#4f46e5', max, unit = '', horizontal = false }) => {
  const m = max || Math.max(...data, 1) * 1.15;
  if (horizontal) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((v, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.55)', minWidth: 80, textAlign: 'right', lineHeight: 1.3 }}>{labels[i]}</div>
            <div style={{ flex: 1, height: 22, background: '#f0effe', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: `${(v/m)*100}%`, background: `linear-gradient(90deg,${color},#a78bfa)`, borderRadius: 4, transition: 'width 800ms ease' }} />
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 700, color: '#0e0749', minWidth: 36 }}>{v}{unit}</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#4f46e5', fontWeight: 700 }}>{v}{unit}</div>
          <div style={{ width: '100%', background: `linear-gradient(180deg,${color},#a78bfa)`, borderRadius: '4px 4px 0 0', height: `${(v/m)*90}px`, transition: 'height 800ms ease', minHeight: 2 }} />
          <div style={{ fontSize: 10, color: 'rgba(14,7,73,0.45)', textAlign: 'center', lineHeight: 1.2 }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
};

const DonutChart = ({ segments, size = 140 }) => {
  const r = 50, cx = 70, cy = 70, strokeW = 18;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const [hov, setHov] = useState(null);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={size} height={size} viewBox="0 0 140 140">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0effe" strokeWidth={strokeW} />
          {segments.map((s, i) => {
            const dash = (s.pct / 100) * circ;
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={hov === i ? strokeW + 4 : strokeW}
                strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset + circ * 0.25}
                strokeLinecap="butt" transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-width 200ms' }} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />
            );
            offset += dash;
            return el;
          })}
          {hov !== null ? (
            <>
              <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill={segments[hov].color} fontFamily="JetBrains Mono">{segments[hov].pct}%</text>
              <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="rgba(14,7,73,0.6)" fontFamily="DM Sans">{segments[hov].label}</text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="700" fill="#0e0749" fontFamily="JetBrains Mono">{segments[0]?.pct ?? 0}%</text>
              <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="rgba(14,7,73,0.5)" fontFamily="DM Sans">positivo</text>
            </>
          )}
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'default' }}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgba(14,7,73,0.7)' }}>{s.label}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, color: '#0e0749', marginLeft: 'auto' }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HealthGauge = ({ score, label }) => {
  const r = 72, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ * 0.75;
  const color = score >= 70 ? '#4f46e5' : score >= 50 ? '#a78bfa' : '#f59e0b';
  return (
    <svg width={180} height={140} viewBox="0 0 180 140">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0effe" strokeWidth="14"
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeDashoffset={-circ * 0.125}
        strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="14"
        strokeDasharray={`${filled} ${circ - filled}`} strokeDashoffset={-circ * 0.125}
        strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 1200ms ease' }} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="32" fontWeight="700" fill="#0e0749">{score}</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontFamily="DM Sans" fontSize="11" fill="rgba(14,7,73,0.5)">{label}</text>
    </svg>
  );
};

const DimBar = ({ label, value, max, color, benchmark }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
      <span style={{ fontSize: 13, color: 'rgba(14,7,73,0.7)', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {benchmark && <span style={{ fontSize: 11, color: 'rgba(14,7,73,0.4)' }}>Meta: {benchmark}</span>}
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, color: '#0e0749' }}>{value}/{max}</span>
      </div>
    </div>
    <div style={{ height: 8, background: '#f0effe', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
      <div style={{ height: '100%', width: `${(value/max)*100}%`, background: `linear-gradient(90deg,${color},#a78bfa)`, borderRadius: 4, transition: 'width 900ms ease' }} />
      {benchmark && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(parseFloat(benchmark)/max)*100}%`, width: 2, background: 'rgba(14,7,73,0.25)', borderRadius: 1 }} />}
    </div>
  </div>
);

const Funnel = ({ steps }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    {steps.map((s, i) => {
      const w = 100 - i * 14;
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: `${w}%`, background: `linear-gradient(90deg,${s.color || '#4f46e5'},#a78bfa)`, borderRadius: 6, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'width 800ms ease' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{s.label}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 700, color: 'white' }}>{s.value}</span>
            </div>
          </div>
        </div>
      );
    })}
    {steps.slice(1).map((s, i) => {
      const drop = steps[i].value > 0
        ? (100 - (steps[i + 1].value / steps[i].value) * 100).toFixed(0)
        : '0';
      return (
        <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>▼ {drop}% abandona aquí</span>
        </div>
      );
    })}
  </div>
);

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

const Skeleton = ({ w = '100%', h = 20, r = 8, style = {} }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f0effe,#e0dcff,#f0effe)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style }} />
);

// ---------------------------------------------------------------------------
// useTrends hook
// ---------------------------------------------------------------------------

const filterByRange = (jobs, range) => {
  if (!jobs || jobs.length === 0) return [];
  if (range === 'all') return jobs;
  const days = range === '3m' ? 90 : range === '6m' ? 180 : 365;
  const cutoff = new Date(Date.now() - days * 86400 * 1000);
  return jobs.filter(j => new Date(j.date) >= cutoff);
};

const DEMO_TRENDS = {
  jobs: [
    { job_id:'d1', date:'2026-01-10', label:'Ene 10', health_score:54, total_conversations:18, avg_response_time_min:48, first_response_time_min:12, positive_pct:38, neutral_pct:35, negative_pct:27, conversion_rate:18, avg_quality_score:6.1, converted_count:3, applicable_count:14, top_topics:['Precios','Disponibilidad','Soporte'] },
    { job_id:'d2', date:'2026-01-24', label:'Ene 24', health_score:61, total_conversations:22, avg_response_time_min:41, first_response_time_min:9,  positive_pct:44, neutral_pct:33, negative_pct:23, conversion_rate:24, avg_quality_score:6.8, converted_count:5, applicable_count:19, top_topics:['Precios','Envíos','Disponibilidad'] },
    { job_id:'d3', date:'2026-02-07', label:'Feb 7',  health_score:58, total_conversations:20, avg_response_time_min:55, first_response_time_min:14, positive_pct:40, neutral_pct:30, negative_pct:30, conversion_rate:21, avg_quality_score:6.4, converted_count:4, applicable_count:17, top_topics:['Soporte','Precios','Garantía'] },
    { job_id:'d4', date:'2026-02-21', label:'Feb 21', health_score:67, total_conversations:25, avg_response_time_min:36, first_response_time_min:8,  positive_pct:51, neutral_pct:29, negative_pct:20, conversion_rate:29, avg_quality_score:7.2, converted_count:7, applicable_count:23, top_topics:['Disponibilidad','Precios','Envíos'] },
    { job_id:'d5', date:'2026-03-06', label:'Mar 6',  health_score:72, total_conversations:28, avg_response_time_min:30, first_response_time_min:7,  positive_pct:57, neutral_pct:27, negative_pct:16, conversion_rate:33, avg_quality_score:7.7, converted_count:9, applicable_count:26, top_topics:['Precios','Disponibilidad','Soporte'] },
    { job_id:'d6', date:'2026-03-20', label:'Mar 20', health_score:69, total_conversations:24, avg_response_time_min:38, first_response_time_min:10, positive_pct:53, neutral_pct:28, negative_pct:19, conversion_rate:30, avg_quality_score:7.4, converted_count:7, applicable_count:22, top_topics:['Envíos','Precios','Garantía'] },
    { job_id:'d7', date:'2026-04-03', label:'Abr 3',  health_score:78, total_conversations:31, avg_response_time_min:25, first_response_time_min:6,  positive_pct:63, neutral_pct:24, negative_pct:13, conversion_rate:38, avg_quality_score:8.1, converted_count:12, applicable_count:29, top_topics:['Precios','Disponibilidad','Soporte','Envíos'] },
  ],
  summary: {
    total_reports: 7,
    total_conversations: 168,
    latest_health_score: 78,
    latest_label: 'Abr 3',
    avg_health_score: 65.6,
    trend_direction: 'up',
    health_breakdown: [
      { name:'Velocidad de respuesta', key:'response_speed', raw_score:82, weight:0.25, max_points:25, obtained_points:20.5, pct_of_max:82, color:'#4f46e5', is_strength:true,  is_critical:false },
      { name:'Cobertura',              key:'coverage',       raw_score:71, weight:0.15, max_points:15, obtained_points:10.7, pct_of_max:71, color:'#22c55e', is_strength:false, is_critical:false },
      { name:'Sentimiento',            key:'sentiment',      raw_score:75, weight:0.20, max_points:20, obtained_points:15.0, pct_of_max:75, color:'#f59e0b', is_strength:false, is_critical:false },
      { name:'Calidad',                key:'quality',        raw_score:68, weight:0.15, max_points:15, obtained_points:10.2, pct_of_max:68, color:'#a78bfa', is_strength:false, is_critical:true  },
      { name:'Conversión',             key:'conversion',     raw_score:60, weight:0.15, max_points:15, obtained_points:9.0,  pct_of_max:60, color:'#ec4899', is_strength:false, is_critical:false },
      { name:'Operacional',            key:'operational',    raw_score:55, weight:0.10, max_points:10, obtained_points:5.5,  pct_of_max:55, color:'#14b8a6', is_strength:false, is_critical:false },
    ],
    top_topics: [
      { label:'Precios',        count:24, pct:28.6 },
      { label:'Disponibilidad', count:18, pct:21.4 },
      { label:'Soporte',        count:15, pct:17.9 },
      { label:'Envíos',         count:13, pct:15.5 },
      { label:'Garantía',       count:8,  pct:9.5  },
    ],
  },
};

// Module-level cache — survives component unmount/remount (navigation away and back)
let _trendsCache = null;
let _trendsCachedAt = 0;
const TRENDS_TTL_MS = 5 * 60 * 1000;

const useTrends = (enabled = true) => {
  const api = useApiClient();
  const isFresh = _trendsCache && Date.now() - _trendsCachedAt < TRENDS_TTL_MS;
  const [trends, setTrends] = useState(() => {
    if (!enabled) return DEMO_TRENDS;
    return _trendsCache ?? null;
  });
  const [loading, setLoading] = useState(enabled && !isFresh);
  const seenJobIds = useRef(new Set());

  const fetchTrends = useCallback(async () => {
    try {
      const data = await api.get('/api/v1/trends');
      _trendsCache = data;
      _trendsCachedAt = Date.now();
      setTrends(data);
    } catch (e) {
      console.error('Failed to fetch trends:', e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Initial fetch — skipped when cache is fresh
  useEffect(() => {
    if (!enabled) return;
    if (_trendsCache && Date.now() - _trendsCachedAt < TRENDS_TTL_MS) return;
    fetchTrends();
  }, [fetchTrends, enabled]);

  // Poll /jobs every 15s; re-fetch trends when a new completed job appears
  useEffect(() => {
    if (!enabled) return;
    const poll = async () => {
      try {
        const jobs = await api.get('/api/v1/jobs');
        const completed = jobs.filter(j => j.status === 'completed');
        let hasNew = false;
        for (const j of completed) {
          const id = String(j.job_id);
          if (!seenJobIds.current.has(id)) {
            seenJobIds.current.add(id);
            hasNew = true;
          }
        }
        if (hasNew && seenJobIds.current.size > 0) {
          _trendsCachedAt = 0; // bust cache so fetchTrends always re-requests
          fetchTrends();
        }
      } catch (_) {}
    };

    const seed = async () => {
      try {
        const jobs = await api.get('/api/v1/jobs');
        jobs.filter(j => j.status === 'completed').forEach(j => seenJobIds.current.add(String(j.job_id)));
      } catch (_) {}
    };

    seed();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [api, fetchTrends, enabled]);

  return { trends, loading, refresh: fetchTrends };
};

// ---------------------------------------------------------------------------
// Plan gate overlay
// ---------------------------------------------------------------------------

const LOCK_SVG = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const STAR_SVG = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const PlanGate = ({ onShowPlanModal }) => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px 24px' }}>
    <div style={{
      background: 'white',
      border: '1px solid #e0e7ff',
      borderRadius: 24,
      padding: '48px 40px',
      maxWidth: 460,
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 24px 64px rgba(79,70,229,0.18)',
    }}>
      <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        {LOCK_SVG}
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 999, padding: '4px 12px', marginBottom: 20 }}>
        {STAR_SVG}
        <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e', letterSpacing: '0.05em' }}>FUNCIÓN PRO</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#0e0749', marginBottom: 12, lineHeight: 1.3 }}>
        Tendencias y evolución histórica
      </div>
      <div style={{ fontSize: 14, color: 'rgba(14,7,73,0.6)', lineHeight: 1.75, marginBottom: 32 }}>
        Descubre cómo evoluciona tu atención al cliente a lo largo del tiempo. Visualiza el puntaje de salud, sentimiento, tiempos de respuesta y tasa de conversión reporte a reporte.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {[
          'Evolución del puntaje de salud',
          'Tendencias de sentimiento y conversión',
          'Desglose de temas frecuentes',
          'Insights automáticos por período',
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
            <div style={{ width: 20, height: 20, background: '#eef2ff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span style={{ fontSize: 13, color: 'rgba(14,7,73,0.75)', fontWeight: 500 }}>{f}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onShowPlanModal}
        style={{ width: '100%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em', boxShadow: '0 8px 24px rgba(79,70,229,0.35)', transition: 'opacity 150ms' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Activar plan Plus o Enterprise →
      </button>
      <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.4)', marginTop: 14 }}>
        Sin contratos. Cancela cuando quieras.
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const DashTrends = ({ plan, onNavigate, onShowPlanModal }) => {
  const [range, setRange] = useState('all');
  const [activeMetric, setActiveMetric] = useState('health');
  const isLocked = plan === 'basic' || plan === 'free' || !plan;
  const { trends, loading } = useTrends(!isLocked);

  const ranges = [
    { id: 'all',  label: 'Todos' },
    { id: '3m',  label: '3m' },
    { id: '6m',  label: '6m' },
    { id: 'year', label: 'Este año' },
  ];

  const filteredJobs = filterByRange(trends?.jobs, range);
  const summary = trends?.summary ?? {};
  const lastJob = filteredJobs.at(-1);
  const prevJob = filteredJobs.at(-2);

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="dash-page page-fade">
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <div style={{ marginBottom: 24 }}>
          <Skeleton h={32} w={220} style={{ marginBottom: 8 }} />
          <Skeleton h={16} w={340} />
        </div>
        <div className="dash-g4" style={{ marginBottom: 20 }}>
          {[0,1,2,3].map(i => <Skeleton key={i} h={110} r={14} />)}
        </div>
        <Skeleton h={280} r={16} style={{ marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 20 }}>
          <Skeleton h={360} r={16} />
          <Skeleton h={360} r={16} />
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------
  const isEmpty = !trends?.jobs?.length || summary.total_reports === 0;
  if (isEmpty) {
    return (
      <div className="dash-page page-fade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ width: 64, height: 64, background: '#f0effe', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Icon name="bar_chart" size={28} color="#a78bfa" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', marginBottom: 10 }}>Aún no tienes reportes completados</div>
          <div style={{ fontSize: 14, color: 'rgba(14,7,73,0.55)', lineHeight: 1.65 }}>Tus tendencias aparecerán aquí una vez que se genere el primer reporte automáticamente.</div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Metric cards
  // ---------------------------------------------------------------------------
  const fmtDelta = (v, decimals = 1) => v === null || v === undefined ? null : +v.toFixed(decimals);

  const healthCurrent = lastJob?.health_score ?? null;
  const healthPrev    = prevJob?.health_score ?? null;
  const healthDelta   = healthCurrent !== null && healthPrev !== null ? fmtDelta(healthCurrent - healthPrev) : null;

  const rtCurrent = lastJob ? (lastJob.first_response_time_min ?? lastJob.avg_response_time_min ?? null) : null;
  const rtPrev    = prevJob ? (prevJob.first_response_time_min ?? prevJob.avg_response_time_min ?? null) : null;
  const rtDelta   = rtCurrent !== null && rtPrev !== null ? fmtDelta(rtCurrent - rtPrev) : null;

  const sentCurrent = lastJob?.positive_pct ?? null;
  const sentPrev    = prevJob?.positive_pct ?? null;
  const sentDelta   = sentCurrent !== null && sentPrev !== null ? fmtDelta(sentCurrent - sentPrev) : null;

  const convCurrent = lastJob?.conversion_rate ?? null;
  const convPrev    = prevJob?.conversion_rate ?? null;
  const convDelta   = convCurrent !== null && convPrev !== null ? fmtDelta(convCurrent - convPrev) : null;

  const metrics = [
    {
      id: 'health',
      label: 'Puntaje de salud',
      color: '#4f46e5',
      currentFmt: healthCurrent !== null ? `${healthCurrent}/100` : '—',
      delta: healthDelta,
      lowerIsBetter: false,
      unit: 'pts',
      chartData: filteredJobs.map(j => j.health_score ?? 0),
      yMax: 100,
      chartUnit: '',
    },
    {
      id: 'response',
      label: 'Tiempo de respuesta',
      color: '#f59e0b',
      currentFmt: rtCurrent !== null ? `${rtCurrent}m` : '—',
      delta: rtDelta,
      lowerIsBetter: true,
      unit: 'm',
      chartData: filteredJobs.map(j => j.first_response_time_min ?? j.avg_response_time_min ?? 0),
      yMax: null,
      chartUnit: 'm',
    },
    {
      id: 'sentiment',
      label: 'Sentimiento positivo',
      color: '#22c55e',
      currentFmt: sentCurrent !== null ? `${sentCurrent}%` : '—',
      delta: sentDelta,
      lowerIsBetter: false,
      unit: '%',
      chartData: filteredJobs.map(j => j.positive_pct ?? 0),
      yMax: 100,
      chartUnit: '%',
    },
    {
      id: 'conversion',
      label: 'Tasa de conversión',
      color: '#a78bfa',
      currentFmt: convCurrent !== null ? `${convCurrent}%` : '—',
      delta: convDelta,
      lowerIsBetter: false,
      unit: '%',
      chartData: filteredJobs.map(j => j.conversion_rate ?? 0),
      yMax: 100,
      chartUnit: '%',
    },
  ];

  const activeMet = metrics.find(m => m.id === activeMetric) ?? metrics[0];
  const chartLabels = filteredJobs.map(j => j.label);

  // ---------------------------------------------------------------------------
  // Health breakdown
  // ---------------------------------------------------------------------------
  const breakdown = summary.health_breakdown ?? [];
  const latestHealth = summary.latest_health_score ?? 0;
  const latestLabel  = summary.latest_label ?? '';

  // ---------------------------------------------------------------------------
  // Conversion funnel
  // ---------------------------------------------------------------------------
  const totalConvs    = filteredJobs.reduce((s, j) => s + (j.total_conversations ?? 0), 0);
  const totalApplicable = filteredJobs.reduce((s, j) => s + (j.applicable_count ?? 0), 0);
  const totalConverted  = filteredJobs.reduce((s, j) => s + (j.converted_count ?? 0), 0);
  const overallConvRate = totalApplicable > 0 ? ((totalConverted / totalApplicable) * 100).toFixed(1) : null;

  const funnelSteps = [
    { label: 'Conversaciones totales',    value: totalConvs,      color: '#4f46e5' },
    { label: 'Con intención de compra',   value: totalApplicable, color: '#6c63ff' },
    { label: 'Convertidas',               value: totalConverted,  color: '#a78bfa' },
  ];

  // ---------------------------------------------------------------------------
  // Sentiment donut
  // ---------------------------------------------------------------------------
  const sentPos  = Math.round(lastJob?.positive_pct ?? 0);
  const sentNeu  = Math.round(lastJob?.neutral_pct  ?? 0);
  const sentNeg  = Math.round(lastJob?.negative_pct ?? 0);
  const donutSegments = [
    { label: 'Positivo', pct: sentPos, color: '#22c55e' },
    { label: 'Neutral',  pct: sentNeu, color: '#a78bfa' },
    { label: 'Negativo', pct: sentNeg, color: '#f87171' },
  ];

  // ---------------------------------------------------------------------------
  // Topics
  // ---------------------------------------------------------------------------
  const topTopics = summary.top_topics ?? [];

  // ---------------------------------------------------------------------------
  // AI Insights (dynamic)
  // ---------------------------------------------------------------------------
  const prevHealth = filteredJobs.at(-2)?.health_score ?? null;
  const healthDeltaNum = latestHealth !== null && prevHealth !== null ? latestHealth - prevHealth : null;

  const trendDir = summary.trend_direction ?? 'stable';
  let trendInsight;
  if (trendDir === 'up' && healthDeltaNum !== null) {
    trendInsight = { icon: 'trending_up', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', title: 'Puntaje en ascenso', text: `Tu puntaje de salud subió ${Math.abs(healthDeltaNum).toFixed(1)} puntos desde el último reporte. Sigue así.` };
  } else if (trendDir === 'down' && healthDeltaNum !== null) {
    trendInsight = { icon: 'trending_down', color: '#f87171', bg: '#fff1f2', border: '#fecdd3', title: 'Atención requerida', text: `Tu puntaje de salud bajó ${Math.abs(healthDeltaNum).toFixed(1)} puntos desde el último reporte. Revisa los tiempos de respuesta y cobertura.` };
  } else {
    trendInsight = { icon: 'minus_circle', color: '#a78bfa', bg: '#f5f3ff', border: '#ddd6fe', title: 'Puntaje estable', text: `Tu puntaje de salud se mantiene estable en ${latestHealth}/100. Identifica la dimensión con menor puntaje para mejorar.` };
  }

  let rtInsight;
  const rtVal = rtCurrent;
  if (rtVal === null) {
    rtInsight = { icon: 'clock', color: '#a78bfa', bg: '#f5f3ff', border: '#ddd6fe', title: 'Sin datos de tiempo', text: 'Genera reportes para ver el análisis de tus tiempos de respuesta.' };
  } else if (rtVal > 60) {
    rtInsight = { icon: 'clock', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', title: 'Tiempo de respuesta crítico', text: `Tu primer tiempo de respuesta promedio es de ${rtVal}m. Procura bajar a menos de 5 minutos para mejorar la conversión.` };
  } else if (rtVal < 5) {
    rtInsight = { icon: 'zap', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', title: 'Respuesta ultra-rápida', text: `Respondes en ${rtVal}m en promedio. Eso te pone en el top de atención al cliente por WhatsApp.` };
  } else {
    rtInsight = { icon: 'clock', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', title: 'Tiempo de respuesta mejorable', text: `Tu primer tiempo de respuesta es ${rtVal}m. El benchmark Colombia es < 5 min. Pequeñas mejoras tienen gran impacto.` };
  }

  const topTopic = topTopics[0]?.label;
  const topicInsight = topTopic
    ? { icon: 'lightbulb', color: '#4f46e5', bg: '#f0effe', border: '#c4b5fd', title: `Oportunidad: ${topTopic}`, text: `"${topTopic}" es el tema que más consultan tus clientes (${topTopics[0]?.pct}% de tus conversaciones). Optimiza tu respuesta para este tema.` }
    : { icon: 'lightbulb', color: '#a78bfa', bg: '#f5f3ff', border: '#ddd6fe', title: 'Sin datos de temas aún', text: 'Los temas más consultados aparecerán aquí cuando tengas reportes completados.' };

  const strengthDim = breakdown.find(d => d.is_strength);
  const strengthInsight = strengthDim
    ? { icon: 'star', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', title: `Tu fortaleza: ${strengthDim.name}`, text: `${strengthDim.name} es tu dimensión más fuerte con ${strengthDim.pct_of_max.toFixed(0)}% de cumplimiento. Aprovecha esto en tu comunicación con clientes.` }
    : { icon: 'star', color: '#a78bfa', bg: '#f5f3ff', border: '#ddd6fe', title: 'Sigue generando reportes', text: 'Con más reportes, DeepLook detectará tus fortalezas y te dará recomendaciones más precisas.' };

  const aiInsights = [trendInsight, rtInsight, topicInsight, strengthInsight];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="dash-page page-fade" style={{ position: 'relative' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @media(max-width:900px){.trends-mid{grid-template-columns:1fr!important}}
        @media(max-width:1100px){.trends-bot{grid-template-columns:1fr 1fr!important}}
        @media(max-width:700px){.trends-bot{grid-template-columns:1fr!important}}
      `}</style>
      {isLocked && <PlanGate onShowPlanModal={onShowPlanModal} />}
      <div style={isLocked ? { filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.6 } : undefined}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0e0749', letterSpacing: '-0.02em', marginBottom: 4 }}>Tus tendencias</h1>
          <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.55)' }}>
            Evolución de tu atención al cliente · {summary.total_reports} reporte{summary.total_reports !== 1 ? 's' : ''} · {summary.total_conversations} conversaciones
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, background: '#f4f3ff', borderRadius: 10, padding: 4 }}>
          {ranges.map(r => (
            <button key={r.id} onClick={() => setRange(r.id)}
              style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: range === r.id ? '#4f46e5' : 'transparent', color: range === r.id ? 'white' : 'rgba(14,7,73,0.55)', fontSize: 13, fontWeight: range === r.id ? 600 : 400, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all 200ms', whiteSpace: 'nowrap' }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="dash-g4" style={{ marginBottom: 20 }}>
        {metrics.map(m => {
          const isGood = m.delta === null ? null : m.lowerIsBetter ? m.delta < 0 : m.delta >= 0;
          const deltaColor = m.delta === null ? 'rgba(14,7,73,0.4)' : isGood ? '#22c55e' : '#f59e0b';
          const deltaArrow = m.delta === null ? '' : m.delta > 0 ? '↑' : m.delta < 0 ? '↓' : '→';
          return (
            <div key={m.id} onClick={() => setActiveMetric(m.id)}
              style={{ background: 'white', border: `2px solid ${activeMetric === m.id ? m.color : '#ededed'}`, borderRadius: 14, padding: '20px 22px', cursor: 'pointer', transition: 'all 200ms', boxShadow: activeMetric === m.id ? `0 4px 20px ${m.color}22` : 'none' }}
              onMouseEnter={e => { if (activeMetric !== m.id) e.currentTarget.style.borderColor = m.color + '66'; }}
              onMouseLeave={e => { if (activeMetric !== m.id) e.currentTarget.style.borderColor = '#ededed'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(14,7,73,0.55)', lineHeight: 1.4 }}>{m.label}</div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: activeMetric === m.id ? m.color : '#ededed', transition: 'background 200ms', flexShrink: 0, marginTop: 3 }} />
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 700, color: '#0e0749', marginBottom: 4 }}>{m.currentFmt}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: deltaColor }}>
                {m.delta !== null ? `${deltaArrow} ${Math.abs(m.delta)}${m.unit} vs. reporte anterior` : 'Sin reporte anterior'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main line chart */}
      {filteredJobs.length < 2 ? (
        <div style={{ background: '#f8f7ff', border: '1px dashed #c4b5fd', borderRadius: 16, padding: '28px 32px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'rgba(14,7,73,0.55)' }}>Genera al menos 2 reportes para ver la evolución de esta métrica.</div>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 16, padding: '24px 28px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0e0749', marginBottom: 2 }}>{activeMet.label} — evolución</div>
              <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)' }}>Haz clic en las tarjetas de arriba para cambiar la métrica</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: activeMet.color }} />
              <span style={{ fontSize: 13, color: 'rgba(14,7,73,0.65)' }}>{activeMet.label}</span>
            </div>
          </div>
          <LineChart
            series={[{ label: activeMet.label, data: activeMet.chartData }]}
            labels={chartLabels}
            unit={activeMet.chartUnit}
            yMax={activeMet.yMax ?? (Math.max(...activeMet.chartData, 1) * 1.3)}
          />
        </div>
      )}

      {/* Health breakdown + Conversion funnel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 20, marginBottom: 20 }} className="trends-mid">
        {/* Health breakdown */}
        <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 16, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0e0749', marginBottom: 2 }}>Desglose del puntaje</div>
              <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)' }}>6 dimensiones · Último reporte: {latestLabel}</div>
            </div>
            <HealthGauge score={latestHealth} label={latestLabel} />
          </div>
          {breakdown.length === 0 ? (
            <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.45)', textAlign: 'center', padding: '24px 0' }}>Sin datos de desglose aún.</div>
          ) : (
            breakdown.map((d, i) => (
              <DimBar key={i} label={d.name} value={parseFloat(d.obtained_points.toFixed(1))} max={d.max_points} color={d.color} />
            ))
          )}
        </div>

        {/* Conversion funnel */}
        <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 16, padding: '24px 28px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0e0749', marginBottom: 4 }}>Embudo de conversión</div>
          <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)', marginBottom: 20 }}>De consulta a venta — período seleccionado</div>
          <Funnel steps={funnelSteps} />
          <div style={{ marginTop: 20, padding: '14px 16px', background: '#f4f3ff', borderRadius: 10, border: '1px solid rgba(79,70,229,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0e0749', marginBottom: 2 }}>Tasa de conversión final</div>
                <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.5)' }}>Benchmark Colombia: 35–42%</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 28, fontWeight: 700, color: '#4f46e5' }}>
                  {overallConvRate !== null ? `${overallConvRate}%` : '—'}
                </div>
                {overallConvRate !== null && (
                  <div style={{ fontSize: 11, color: parseFloat(overallConvRate) >= 35 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                    {parseFloat(overallConvRate) >= 35 ? '✓ Por encima del benchmark' : '↗ Por debajo del benchmark'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversations per report + Sentiment + Topics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr)', gap: 20, marginBottom: 20 }} className="trends-bot">
        {/* Conversations per report bar chart */}
        <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 16, padding: '24px 28px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0e0749', marginBottom: 4 }}>Conversaciones por reporte</div>
          <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)', marginBottom: 18 }}>Volumen analizado en cada reporte</div>
          {filteredJobs.length === 0 ? (
            <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.45)', textAlign: 'center', padding: '24px 0' }}>Sin datos.</div>
          ) : (
            <BarChart
              data={filteredJobs.map(j => j.total_conversations)}
              labels={filteredJobs.map(j => j.label)}
              color="#4f46e5"
            />
          )}
          <div style={{ marginTop: 14, display: 'flex', gap: 16 }}>
            <div style={{ fontSize: 12, background: '#f4f3ff', border: '1px solid #c4b5fd', borderRadius: 8, padding: '8px 12px', flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#4f46e5', marginBottom: 2 }}>Total analizado</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#0e0749' }}>{totalConvs} conversaciones</div>
            </div>
            <div style={{ fontSize: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#166534', marginBottom: 2 }}>Reportes</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#0e0749' }}>{filteredJobs.length} en período</div>
            </div>
          </div>
        </div>

        {/* Sentiment donut */}
        <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 16, padding: '24px 28px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0e0749', marginBottom: 4 }}>Sentimiento</div>
          <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)', marginBottom: 20 }}>Cómo terminan tus conversaciones</div>
          <DonutChart segments={donutSegments} />
          <div style={{ marginTop: 16, height: 1, background: '#ededed' }} />
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.5)', fontWeight: 600, marginBottom: 8 }}>EVOLUCIÓN — % POSITIVO</div>
            {filteredJobs.length >= 2 ? (
              <BarChart
                data={filteredJobs.map(j => Math.round(j.positive_pct ?? 0))}
                labels={filteredJobs.map(j => j.label)}
                unit="%"
                max={100}
                color="#22c55e"
              />
            ) : (
              <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.4)', textAlign: 'center', padding: '12px 0' }}>Necesitas al menos 2 reportes.</div>
            )}
          </div>
        </div>

        {/* Topics */}
        <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 16, padding: '24px 28px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0e0749', marginBottom: 4 }}>Temas frecuentes</div>
          <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)', marginBottom: 20 }}>Lo que más preguntan tus clientes</div>
          {topTopics.length === 0 ? (
            <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.45)', lineHeight: 1.65 }}>Aún no hay datos de temas. Los temas se extraen de los reportes completados.</div>
          ) : (
            <>
              <BarChart
                data={topTopics.map(t => t.pct)}
                labels={topTopics.map(t => t.label)}
                unit="%"
                max={100}
                color="#a78bfa"
                horizontal={true}
              />
              <div style={{ marginTop: 16, background: '#f4f3ff', border: '1px solid rgba(79,70,229,0.1)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', marginBottom: 4 }}>Acción recomendada</div>
                <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.7)', lineHeight: 1.55 }}>
                  El {topTopics[0].pct}% de tus conversaciones son sobre "{topTopics[0].label}". Crea una respuesta rápida para atenderlo en segundos.
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0e0749', marginBottom: 16 }}>Análisis e insights de tu período</div>
        <div className="dash-g4">
          {aiInsights.map((ins, i) => (
            <div key={i}
              style={{ background: ins.bg, border: `1px solid ${ins.border}`, borderRadius: 14, padding: '20px 20px', transition: 'transform 200ms, box-shadow 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${ins.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, background: `${ins.color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={ins.icon} size={17} color={ins.color} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0e0749' }}>{ins.title}</div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(14,7,73,0.7)', lineHeight: 1.65, margin: 0 }}>{ins.text}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default DashTrends;
