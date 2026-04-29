import { useState, useEffect } from 'react';
import { Icon, DeepLookLogo } from './Icons';

const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const NAV_LINKS = [
  { label: 'Producto',      target: 'producto' },
  { label: 'Cómo funciona', target: 'como-funciona' },
  { label: 'Precios',       target: 'precios' },
  { label: 'Preguntas',     target: 'preguntas' },
];

const NavHeader = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <nav style={{ background: 'white', boxShadow: scrolled ? '0 1px 20px rgba(14,7,73,0.08)' : 'none', transition: 'box-shadow 300ms', height: 72, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: (scrolled || mobileOpen) ? 'none' : '1px solid #ededed' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <DeepLookLogo dark size="md" />
          <div className="land-nav-links">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={`#${l.target}`} style={{ color: '#0e0749', textDecoration: 'none', fontSize: 15, fontWeight: 500, opacity: 0.75, transition: 'opacity 200ms', whiteSpace: 'nowrap' }} onMouseEnter={e => e.target.style.opacity=1} onMouseLeave={e => e.target.style.opacity=0.75}>{l.label}</a>
            ))}
          </div>
          <div className="land-nav-cta">
            <button onClick={() => onNavigate('login')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontFamily: 'DM Sans,sans-serif', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '8px 16px', whiteSpace: 'nowrap' }}>Iniciar sesión</button>
            <button onClick={() => scrollTo('precios')} className="btn-primary" style={{ padding: '10px 20px', fontSize: 15, whiteSpace: 'nowrap' }}>Ver planes</button>
          </div>
          <button className="land-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menú">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0e0749" strokeWidth="2" strokeLinecap="round">
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </nav>
      <div className={`land-mobile-drawer${mobileOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(l => <a key={l.label} href={`#${l.target}`} onClick={() => setMobileOpen(false)}>{l.label}</a>)}
        <button className="land-md-link" onClick={() => { setMobileOpen(false); onNavigate('login'); }}>Iniciar sesión</button>
        <button className="btn-primary land-md-cta" onClick={() => { setMobileOpen(false); scrollTo('precios'); }}>Ver planes</button>
      </div>
    </div>
  );
};

const SCENARIOS = [
  {
    label: 'Centro estético',
    avatar: 'CE',
    contact: 'Paciente',
    convs: '143 conversaciones',
    score: 68,
    scoreLabel: 'Bueno',
    metrics: [
      { label:'Tiempo resp.', val:'3.1h', icon:'clock',  color:'#f59e0b' },
      { label:'Sentimiento',  val:'76%',  icon:'smile',  color:'#22c55e' },
      { label:'Conversión',   val:'38%',  icon:'zap',    color:'#a78bfa' },
    ],
    action: 'Configura recordatorios automáticos de cita para reducir cancelaciones',
    messages: [
      { from:'client', text:'Buenas tardes! quisiera agendar una limpieza facial para esta semana', time:'2:10 pm' },
      { from:'biz',    text:'Hola! Con gusto 😊 Tenemos disponibilidad el miércoles y viernes. ¿Cuál te queda mejor?', time:'2:34 pm' },
      { from:'client', text:'El viernes perfecto, a qué horas tienen?', time:'2:35 pm' },
      { from:'biz',    text:'Tenemos 10am, 2pm y 4pm. El valor es $95,000 💆‍♀️', time:'3:01 pm' },
      { from:'client', text:'A las 2pm me sirve! Cómo confirmo?', time:'3:03 pm' },
    ],
  },
  {
    label: 'Skincare',
    avatar: 'SK',
    contact: 'Cliente',
    convs: '198 conversaciones',
    score: 74,
    scoreLabel: 'Bueno',
    metrics: [
      { label:'Tiempo resp.', val:'1.8h', icon:'clock',  color:'#f59e0b' },
      { label:'Sentimiento',  val:'84%',  icon:'smile',  color:'#22c55e' },
      { label:'Conversión',   val:'51%',  icon:'zap',    color:'#a78bfa' },
    ],
    action: 'Crea un catálogo de productos con fotos y precios para responder más rápido',
    messages: [
      { from:'client', text:'Hola! vi sus productos en Instagram 😍 tienen crema para piel sensible?', time:'11:05 am' },
      { from:'biz',    text:'Hola! Sí tenemos 🌿 La crema Calma+ es ideal para piel sensible, $68,000. ¿La has usado antes?', time:'11:28 am' },
      { from:'client', text:'No, es la primera vez. Funciona para piel con acné?', time:'11:30 am' },
      { from:'biz',    text:'Sí! está formulada sin parabenos y con centella asiática. Muchos clientes con acné la aman ✨', time:'11:52 am' },
      { from:'client', text:'Me la llevo! cómo hago el pedido?', time:'11:54 am' },
    ],
  },
  {
    label: 'Servicios del hogar',
    avatar: 'SH',
    contact: 'Prospecto',
    convs: '87 conversaciones',
    score: 61,
    scoreLabel: 'Regular',
    metrics: [
      { label:'Tiempo resp.', val:'4.7h', icon:'clock',  color:'#f59e0b' },
      { label:'Sentimiento',  val:'69%',  icon:'smile',  color:'#22c55e' },
      { label:'Conversión',   val:'29%',  icon:'zap',    color:'#a78bfa' },
    ],
    action: 'Tu tiempo de respuesta de 4.7h es crítico — activa respuestas automáticas fuera de horario',
    messages: [
      { from:'client', text:'Buenos días, necesito un plomero urgente, se me rompió una tubería', time:'8:22 am' },
      { from:'biz',    text:'Buenos días! Podemos ir hoy. ¿En qué barrio está ubicado?', time:'1:14 pm' },
      { from:'client', text:'En Chapinero, pero ya lo solucioné con otro 😞', time:'1:16 pm' },
      { from:'biz',    text:'Lamentamos eso! Para la próxima estamos disponibles las 24h', time:'1:45 pm' },
      { from:'client', text:'Ojalá hubieran respondido antes...', time:'1:46 pm' },
    ],
  },
];

const ReportMockup = () => {
  const [phase, setPhase] = useState(0);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const scenario = SCENARIOS[scenarioIdx];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 3000),
      setTimeout(() => setPhase(2), 5000),
      setTimeout(() => {
        setPhase(0);
        setScenarioIdx(p => (p + 1) % SCENARIOS.length);
      }, 11000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase, scenarioIdx]);

  return (
    <div className="land-mockup">
      <style>{`
        @keyframes msgIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes chipIn { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
        @keyframes scanLine { from { top:0; } to { top:100%; } }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,0.4)} 50%{box-shadow:0 0 0 8px rgba(167,139,250,0)} }
      `}</style>
      <div style={{ background: '#0e0749', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(14,7,73,0.35), 0 0 0 1px rgba(167,139,250,0.2)', position: 'relative' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(167,139,250,0.15)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
          </div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans,sans-serif' }}>DeepLook — {scenario.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {SCENARIOS.map((_, i) => (
              <div key={i} style={{ width: i === scenarioIdx ? 16 : 6, height: 6, borderRadius: 3, background: i === scenarioIdx ? '#a78bfa' : 'rgba(167,139,250,0.25)', transition: 'all 400ms ease' }} />
            ))}
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: phase === 2 ? '#22c55e' : '#f59e0b', boxShadow: `0 0 6px ${phase === 2 ? '#22c55e' : '#f59e0b'}`, animation: 'pulse 2s infinite', marginLeft: 4 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 340 }}>
          <div style={{ borderRight: '1px solid rgba(167,139,250,0.12)', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, paddingBottom: 10, borderBottom: '1px solid rgba(167,139,250,0.1)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>{scenario.avatar}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>{scenario.contact}</div>
                <div style={{ fontSize: 9, color: '#22c55e' }}>en línea</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 9, background: 'rgba(167,139,250,0.15)', color: '#a78bfa', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>{scenario.label}</div>
            </div>
            {scenario.messages.map((m, i) => (
              <div key={`${scenarioIdx}-${i}`} style={{ display: 'flex', flexDirection: 'column', alignItems: m.from === 'client' ? 'flex-start' : 'flex-end', animation: `msgIn 400ms ease ${i * 350}ms both` }}>
                <div style={{ background: m.from === 'client' ? 'rgba(255,255,255,0.08)' : 'rgba(79,70,229,0.5)', borderRadius: m.from === 'client' ? '12px 12px 12px 3px' : '12px 12px 3px 12px', padding: '7px 10px', maxWidth: '88%' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, fontFamily: 'DM Sans,sans-serif' }}>{m.text}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 3, textAlign: 'right' }}>{m.time}</div>
                </div>
              </div>
            ))}
            {phase === 1 && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#a78bfa,transparent)', animation: 'scanLine 1.8s ease-in-out infinite', boxShadow: '0 0 14px #a78bfa', top: 0 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(79,70,229,0.07)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                  <div style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.08em', background: 'rgba(14,7,73,0.95)', padding: '7px 16px', borderRadius: 999, border: '1px solid rgba(167,139,250,0.35)', whiteSpace: 'nowrap' }}>⚙ Analizando conversación...</div>
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 9, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 2 }}>ANÁLISIS DEEPLOOK</div>
            <div style={{ background: 'rgba(79,70,229,0.3)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 12, padding: '12px', textAlign: 'center', opacity: phase === 2 ? 1 : 0, transition: 'opacity 500ms ease', animation: phase === 2 ? 'chipIn 500ms ease' : 'none' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', marginBottom: 2 }}>PUNTAJE DE SALUD</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 36, fontWeight: 700, color: 'white', lineHeight: 1 }}>{scenario.score}</div>
              <div style={{ fontSize: 9, color: '#a78bfa' }}>/100 · {scenario.scoreLabel}</div>
              <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: phase === 2 ? `${scenario.score}%` : '0%', background: 'linear-gradient(90deg,#4f46e5,#a78bfa)', borderRadius: 2, transition: 'width 900ms ease 300ms' }} />
              </div>
            </div>
            {scenario.metrics.map((m, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 10, padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: phase === 2 ? 1 : 0, transition: `opacity 400ms ease ${300 + i * 180}ms`, animation: phase === 2 ? `chipIn 400ms ease ${300 + i * 180}ms backwards` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 22, height: 22, background: `${m.color}20`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={m.icon} size={11} color={m.color} />
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontFamily: 'DM Sans,sans-serif' }}>{m.label}</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, color: 'white' }}>{m.val}</span>
              </div>
            ))}
            <div style={{ marginTop: 'auto', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: '9px 12px', opacity: phase === 2 ? 1 : 0, transition: 'opacity 400ms ease 900ms' }}>
              <div style={{ fontSize: 10, color: '#4ade80', fontWeight: 700, marginBottom: 4 }}>ACCIÓN RECOMENDADA</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>{scenario.action}</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(167,139,250,0.12)', padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans,sans-serif' }}>{scenario.convs} · Abril 2026</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: phase === 2 ? '#22c55e' : '#f59e0b' }} />
            <span style={{ fontSize: 10, color: phase === 2 ? '#4ade80' : '#fbbf24', fontWeight: 600 }}>
              {phase === 2 ? 'Análisis completo' : phase === 1 ? 'Analizando...' : 'Cargando conversación'}
            </span>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: -16, right: -16, background: 'linear-gradient(135deg,#4f46e5,#a78bfa)', color: 'white', borderRadius: 12, padding: '10px 16px', fontSize: 12, fontWeight: 600, boxShadow: '0 8px 24px rgba(79,70,229,0.4)', whiteSpace: 'nowrap' }}>
        Listo en 2 min ⚡
      </div>
    </div>
  );
};

const HeroSection = ({ onNavigate }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);
  return (
    <section className="land-sec" style={{ background: '#fafafe', padding: '100px 32px', borderBottom: '1px solid #ededed' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="land-hero-grid">
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 600ms ease' }}>
          <div style={{ display: 'inline-block', background: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', padding: '6px 14px', borderRadius: 999, marginBottom: 20 }}>WHATSAPP BUSINESS ANALYTICS</div>
          <h1 className="land-hero-h1" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1, color: '#0e0749', marginBottom: 24, letterSpacing: '-0.03em' }}>Descubre lo que tus chats de WhatsApp no te están diciendo</h1>
          <p style={{ fontSize: 18, color: 'rgba(14,7,73,0.7)', lineHeight: 1.7, maxWidth: 520, marginBottom: 36 }}>DeepLook analiza tus conversaciones de WhatsApp Business y te entrega reportes claros con las acciones exactas que debes tomar para vender más. Sin instalaciones complicadas.</p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            <button onClick={() => onNavigate('signup')} className="btn-primary" style={{ padding: '14px 28px', fontSize: 16 }}>Analiza tu WhatsApp ahora</button>
            <button onClick={() => scrollTo('reporte')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: 15, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: '14px 0' }}>Ver reporte de ejemplo →</button>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)' }}>Descubre en minutos por qué pierdes clientes — y cómo recuperarlos</p>
        </div>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 800ms ease 200ms', display: 'flex', justifyContent: 'center' }}>
          <ReportMockup />
        </div>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ number, label, source }) => (
  <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 12, padding: 32, flex: 1, textAlign: 'center', transition: 'transform 200ms, box-shadow 200ms' }} onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(79,70,229,0.12)'}} onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 56, fontWeight: 700, color: '#4f46e5', lineHeight: 1, marginBottom: 12 }}>{number}</div>
    <p style={{ fontSize: 15, color: '#0e0749', lineHeight: 1.6, marginBottom: 8 }}>{label}</p>
    <span style={{ fontSize: 12, color: 'rgba(14,7,73,0.4)' }}>{source}</span>
  </div>
);

const ProblemSection = () => (
  <section className="land-sec" style={{ background: 'white', padding: '96px 32px' }}>
    <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', color: '#a78bfa', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 20 }}>EL PROBLEMA</div>
      <h2 className="land-h2" style={{ fontSize: 40, fontWeight: 700, color: '#0e0749', marginBottom: 20, lineHeight: 1.2, letterSpacing: '-0.02em' }}>El 87% de las MiPymes en Colombia venden por WhatsApp. Muy pocas saben qué tan bien lo están haciendo.</h2>
      <p style={{ fontSize: 18, color: 'rgba(14,7,73,0.7)', lineHeight: 1.7, marginBottom: 56 }}>Cada día llegan decenas de clientes a tu WhatsApp. Unos compran, otros no. ¿Sabes por qué? ¿Sabes cuánto tardas en responder? Sin datos, estás operando a ciegas.</p>
      <div className="land-stats">
        <StatCard number="65%" label="de los consumidores colombianos esperan respuesta en menos de 5 minutos" source="Aurora Inbox 2026" />
        <StatCard number="56%" label="abandona una compra cuando el negocio tarda en responder" source="DANE Digital 2025" />
        <StatCard number="78%" label="compra del primer negocio que les responde" source="Estudio MiPymes CO 2026" />
      </div>
    </div>
  </section>
);

const HowItWorksSection = () => {
  const steps = [
    {
      n: '01', icon: 'whatsapp', title: 'Conecta tu WhatsApp',
      desc: 'Vincula tu número de WhatsApp Business escaneando un código QR desde la plataforma. Solo tarda 2 minutos y no requiere instalaciones ni apps adicionales.',
      badge: null,
      badgeColor: null,
      accent: '#25d366',
      accentBg: 'rgba(37,211,102,0.08)',
    },
    {
      n: '02', icon: 'refresh', title: 'Sync automático según tu plan',
      desc: 'DeepLook extrae tus conversaciones recientes de forma automática en los intervalos de tu plan — mensual, quincenal o semanal. Sin que tengas que hacer nada más.',
      badge: '100% automático',
      badgeColor: '#4f46e5',
      accent: '#4f46e5',
      accentBg: 'rgba(79,70,229,0.08)',
    },
    {
      n: '03', icon: 'file', title: 'Reporte listo en minutos',
      desc: 'Recibes un PDF profesional con análisis IA completo: sentimiento, calidad de atención, tiempos de respuesta y recomendaciones de mejoras concretas para tu negocio.',
      badge: null,
      badgeColor: null,
      accent: '#a78bfa',
      accentBg: 'rgba(167,139,250,0.08)',
    },
  ];
  return (
    <section id="como-funciona" className="land-sec" style={{ background: '#ededed', padding: '96px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', color: '#4f46e5', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>CÓMO FUNCIONA</div>
        <h2 className="land-h2" style={{ fontSize: 40, fontWeight: 700, color: '#0e0749', marginBottom: 12, letterSpacing: '-0.02em' }}>
          Sin exportaciones. Sin complicaciones.
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(14,7,73,0.58)', marginBottom: 52, lineHeight: 1.6 }}>
          Conecta tu número una vez y DeepLook analiza tus conversaciones automáticamente.
        </p>

        <div className="land-steps" style={{ alignItems: 'stretch' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'stretch', alignSelf: 'stretch', gap: 0 }}>
              {/* Connector arrow between cards */}
              {i < steps.length - 1 && (
                <div className="land-step-arrow" style={{ position: 'absolute', right: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 3, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, background: 'white', border: '1.5px solid #e0e0ee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(79,70,229,0.1)' }}>
                    <Icon name="arrow_right" size={14} color="#4f46e5" />
                  </div>
                </div>
              )}

              <div
                style={{ background: 'white', borderRadius: 20, padding: '36px 32px', width: '100%', height: '100%', textAlign: 'left', position: 'relative', overflow: 'hidden', transition: 'transform 220ms, box-shadow 220ms', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 52px rgba(79,70,229,0.13)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Step number watermark */}
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 72, fontWeight: 700, color: 'rgba(14,7,73,0.22)', lineHeight: 1, marginBottom: 12, userSelect: 'none' }}>{s.n}</div>

                {/* Icon + badge row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, background: s.accentBg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={s.icon} size={24} color={s.accent} />
                  </div>
                  {s.badge && (
                    <div style={{ background: 'rgba(79,70,229,0.07)', border: '1px solid rgba(79,70,229,0.18)', color: s.badgeColor, fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 999, letterSpacing: '0.04em' }}>
                      {s.badge}
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', marginBottom: 12, lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, color: 'rgba(14,7,73,0.65)', lineHeight: 1.75, margin: 0 }}>{s.desc}</p>

                {/* Bottom accent line */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.accent}, transparent)`, borderRadius: '0 0 20px 20px', opacity: 0.5 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{ marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'white', border: '1px solid #e0e0ee', borderRadius: 999, padding: '10px 24px', fontSize: 14, color: 'rgba(14,7,73,0.6)', fontWeight: 500 }}>
          <Icon name="shield" size={15} color="#4f46e5" />
          La conexión es segura. Tus mensajes nunca se almacenan en texto plano.
        </div>
      </div>
      <style>{`
        @media(max-width:860px){
          .land-step-arrow{ display:none!important; }
        }
      `}</style>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    { icon:'clock', title:'Tiempo de respuesta real', desc:'Sabe exactamente cuánto tardas en responder, hora por hora. Identifica las horas donde pierdes más clientes.' },
    { icon:'smile', title:'Sentimiento del cliente', desc:'Descubre cómo se sienten tus clientes al hablar contigo. ¿Salen satisfechos, indiferentes o frustrados?' },
    { icon:'star', title:'Calidad de atención', desc:'Evaluamos tu utilidad, tono, completitud y velocidad. Sabrás exactamente en qué dimensión fallas y en cuál brillas.' },
    { icon:'funnel', title:'Análisis de conversión', desc:'¿Cuántos clientes interesados terminan comprando? Compara tu tasa contra el benchmark colombiano.' },
    { icon:'list', title:'Preguntas frecuentes', desc:'Identifica las preguntas que más te hacen para crear respuestas rápidas y reducir tu tiempo de respuesta.' },
    { icon:'zap', title:'Plan de acción concreto', desc:'No solo mostramos datos. Te damos 3 acciones específicas para tu negocio con expectativa de impacto en ventas.' },
  ];
  return (
    <section className="land-sec" style={{ background: 'white', padding: '96px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div id="producto" style={{ display: 'inline-block', color: '#4f46e5', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>LO QUE VAS A DESCUBRIR</div>
        <h2 className="land-h2" style={{ fontSize: 40, fontWeight: 700, color: '#0e0749', marginBottom: 56, letterSpacing: '-0.02em' }}>Todo lo que pasa en tu WhatsApp, en un solo reporte</h2>
        <div className="land-feat-grid">
          {features.map((f, i) => (
            <div key={i} style={{ border: '1px solid #ededed', borderRadius: 12, padding: 32, textAlign: 'left', transition: 'border-color 200ms, box-shadow 200ms, transform 200ms' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#4f46e5';e.currentTarget.style.boxShadow='0 8px 32px rgba(79,70,229,0.1)';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#ededed';e.currentTarget.style.boxShadow='';e.currentTarget.style.transform=''}}>
              <div style={{ width: 52, height: 52, background: 'rgba(79,70,229,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Icon name={f.icon} size={24} color="#4f46e5" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0e0749', marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.65)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Gauge = ({ value, max = 100, size = 140, color = '#a78bfa' }) => {
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / max) * circ * 0.75;
  const offset = circ * 0.125;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12"
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeDashoffset={-offset}
        strokeLinecap="round" transform={`rotate(135 ${size/2} ${size/2})`} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={`${filled} ${circ - filled}`} strokeDashoffset={-offset}
        strokeLinecap="round" transform={`rotate(135 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 800ms ease' }} />
      <text x={size/2} y={size/2 + 6} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="28" fontWeight="700" fill="white">{value}</text>
      <text x={size/2} y={size/2 + 22} textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="11" fill="rgba(255,255,255,0.5)">/100</text>
    </svg>
  );
};

const HBar = ({ label, value, color = '#a78bfa', delay = 0 }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
      <span style={{ color: 'white', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{value}%</span>
    </div>
    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3, transition: `width 700ms ease ${delay}ms` }} />
    </div>
  </div>
);

const TabHealth = () => (
  <div style={{ padding: '24px 28px', animation: 'pageFade 300ms ease' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 24 }}>
      <Gauge value={72} />
      <div>
        <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>PUNTAJE DE SALUD</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 4, letterSpacing: '-0.02em' }}>Bueno · 72/100</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Subiste 6 puntos<br/>desde el mes pasado</div>
        <div style={{ marginTop: 10, display: 'inline-block', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999 }}>↑ +6 pts este mes</div>
      </div>
    </div>
    <HBar label="Tiempo de respuesta" value={78} delay={0} />
    <HBar label="Sentimiento del cliente" value={82} color="#c4b5fd" delay={100} />
    <HBar label="Calidad de atención" value={74} delay={200} />
    <HBar label="Tasa de conversión" value={61} color="#c4b5fd" delay={300} />
  </div>
);

const TabTime = () => {
  const hours = [
    { h:'8am', v:95 },{ h:'9am', v:88 },{ h:'10am', v:72 },{ h:'11am', v:60 },
    { h:'12pm', v:30 },{ h:'2pm', v:25 },{ h:'4pm', v:45 },{ h:'6pm', v:78 },
  ];
  const maxV = Math.max(...hours.map(h => h.v));
  return (
    <div style={{ padding: '24px 28px', animation: 'pageFade 300ms ease' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>TIEMPO DE RESPUESTA</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 36, fontWeight: 700, color: 'white' }}>2.3h</span>
          <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>↓ mejoró 63% vs. mes anterior</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90, marginBottom: 8 }}>
        {hours.map((h, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', background: h.v > 60 ? 'rgba(167,139,250,0.5)' : '#a78bfa', borderRadius: '4px 4px 0 0', height: `${(h.v/maxV)*80}px`, transition: `height 600ms ease ${i*60}ms`, position: 'relative' }}>
              {h.v === maxV && <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: '#fbbf24', fontWeight: 700, whiteSpace: 'nowrap' }}>PICO</div>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {hours.map((h, i) => <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{h.h}</div>)}
      </div>
      <div style={{ marginTop: 16, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
        ⚠️ Pico de mensajes entre 8–10am. Considera un agente de respuesta automática en ese horario.
      </div>
    </div>
  );
};

const TabSentiment = () => {
  const items = [
    { label: 'Positivo', pct: 62, color: '#4ade80' },
    { label: 'Neutral',  pct: 23, color: '#a78bfa' },
    { label: 'Negativo', pct: 15, color: '#f87171' },
  ];
  const topWords = ['precio','cita','disponibilidad','horario','urgente'];
  return (
    <div style={{ padding: '24px 28px', animation: 'pageFade 300ms ease' }}>
      <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>SENTIMIENTO DEL CLIENTE</div>
      <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', marginBottom: 16, gap: 2 }}>
        {items.map((it, i) => (
          <div key={i} style={{ width: `${it.pct}%`, background: it.color, transition: `width 700ms ease ${i * 150}ms` }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: it.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{it.label}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, color: 'white' }}>{it.pct}%</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontWeight: 600, letterSpacing: '0.06em' }}>PALABRAS MÁS FRECUENTES</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {topWords.map((w, i) => (
          <span key={i} style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#c4b5fd', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999 }}>#{w}</span>
        ))}
      </div>
      <div style={{ marginTop: 16, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
        ✅ 62% de sentimiento positivo es bueno. El objetivo es superar 70%.
      </div>
    </div>
  );
};

const TabActions = () => {
  const actions = [
    { n:'01', title:'Activa respuestas rápidas', impact:'+18% conversión', desc:'Crea 5 respuestas para "precio", "cita" y "disponibilidad". Reducirás tu tiempo de respuesta en 40%.', color:'#a78bfa' },
    { n:'02', title:'Refuerza el horario 8–10am', impact:'+12% satisfacción', desc:'Asigna un operador dedicado en las mañanas. Es tu hora pico y donde más clientes se pierden.', color:'#c4b5fd' },
    { n:'03', title:'Mejora el cierre de ventas', impact:'+8% conversión', desc:'Detectamos 12 conversaciones donde el cliente mostró interés pero no recibió seguimiento.', color:'#818cf8' },
  ];
  return (
    <div style={{ padding: '24px 28px', animation: 'pageFade 300ms ease' }}>
      <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>PLAN DE ACCIÓN</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {actions.map((a, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 14 }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 700, color: a.color, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{a.n}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{a.title}</div>
                <div style={{ fontSize: 11, background: 'rgba(74,222,128,0.15)', color: '#4ade80', fontWeight: 600, padding: '2px 9px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0 }}>{a.impact}</div>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>{a.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportPreviewSection = ({ onNavigate }) => {
  const [tab, setTab] = useState(0);
  const tabs = [
    { label: 'Puntaje', icon: 'star',       content: <TabHealth /> },
    { label: 'Respuesta', icon: 'clock',     content: <TabTime /> },
    { label: 'Sentimiento', icon: 'smile',   content: <TabSentiment /> },
    { label: 'Acciones', icon: 'zap',        content: <TabActions /> },
  ];

  useEffect(() => {
    const t = setInterval(() => setTab(p => (p + 1) % tabs.length), 9000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="reporte" className="land-sec" style={{ background: '#0e0749', padding: '100px 32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, background: 'rgba(79,70,229,0.2)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, background: 'rgba(167,139,250,0.12)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="land-preview-grid">
          <div>
            <div style={{ display: 'inline-block', color: '#a78bfa', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>ASÍ SE VE UN REPORTE DEEPLOOK</div>
            <h2 className="land-h2-w" style={{ fontSize: 40, fontWeight: 700, color: 'white', marginBottom: 20, lineHeight: 1.15, letterSpacing: '-0.02em' }}>Datos reales. Decisiones claras. En minutos.</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 36 }}>Cada reporte incluye puntaje de salud, análisis de tiempos de respuesta, sentimiento del cliente y un plan de acción con 3 pasos concretos y su impacto esperado en ventas.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {[
                { icon:'file',         text:'PDF profesional descargable para compartir con tu equipo' },
                { icon:'trending_up',  text:'Comparativa mes a mes para ver tu evolución' },
                { icon:'globe',        text:'Benchmarks del sector colombiano para contexto real' },
              ].map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, background: 'rgba(167,139,250,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={it.icon} size={15} color="#a78bfa" />
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>{it.text}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => onNavigate('signup')} style={{ background: 'white', color: '#0e0749', border: 'none', borderRadius: 8, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'transform 200ms, box-shadow 200ms' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.03)';e.currentTarget.style.boxShadow='0 8px 32px rgba(255,255,255,0.15)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                <Icon name="download" size={16} color="#4f46e5" /> Descargar reporte de ejemplo
              </button>
              <button onClick={() => scrollTo('precios')} style={{ background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: '14px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'border-color 200ms, background 200ms' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.6)';e.currentTarget.style.background='rgba(255,255,255,0.06)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.25)';e.currentTarget.style.background='transparent'}}>
                Ver planes →
              </button>
            </div>
          </div>
          <div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 40px 100px rgba(0,0,0,0.4)' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(167,139,250,0.15)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, background: '#4f46e5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="search" size={15} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Reporte DeepLook</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Clínica Wellness · Abril 2026</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                  <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>En vivo</span>
                </div>
              </div>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(167,139,250,0.12)', background: 'rgba(0,0,0,0.15)' }}>
                {tabs.map((t, i) => (
                  <button key={i} onClick={() => setTab(i)} style={{ flex: 1, background: 'none', border: 'none', padding: '12px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, borderBottom: `2px solid ${tab === i ? '#a78bfa' : 'transparent'}`, transition: 'border-color 200ms', marginBottom: -1 }}>
                    <Icon name={t.icon} size={15} color={tab === i ? '#a78bfa' : 'rgba(255,255,255,0.35)'} />
                    <span style={{ fontSize: 11, fontWeight: tab === i ? 600 : 400, color: tab === i ? '#a78bfa' : 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontFamily: 'DM Sans,sans-serif' }}>{t.label}</span>
                  </button>
                ))}
              </div>
              <div style={{ height: 300, overflow: 'hidden', position: 'relative' }}>
                {tabs[tab].content}
              </div>
              <div style={{ height: 2, background: 'rgba(255,255,255,0.06)' }}>
                <div key={tab} style={{ height: '100%', background: '#a78bfa', animation: 'progressBar 9s linear forwards', borderRadius: 1 }} />
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 14 }}>Vista interactiva del reporte · Cicla automáticamente</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const CHECK = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const CROSS = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(14,7,73,0.2)" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const PLANS = [
  {
    id: 'basic', name: 'Basic', tagline: 'Para empezar con datos reales',
    monthly: { cop: 160000 }, annual: { cop: 128000 },
    badge: null, dark: false, reports: '1', convs: '100', history: '30 días',
    cta: 'Empezar ahora',
    features: [
      { text: '1 sync automático al mes',               on: true },
      { text: '100 conversaciones por reporte',          on: true },
      { text: '30 días de historial analizado',          on: true },
      { text: 'Reporte PDF',                             on: true },
      { text: 'Recomendaciones de mejoras',              on: true },
      { text: 'Dashboard de tendencias',                 on: false },
      { text: 'Soporte prioritario',                     on: false },
    ],
  },
  {
    id: 'plus', name: 'Plus', tagline: 'Para negocios que quieren crecer',
    monthly: { cop: 250000 }, annual: { cop: 200000 },
    badge: 'Más popular', dark: true, reports: '2', convs: '300', history: '90 días',
    cta: 'Empezar con Plus',
    features: [
      { text: '2 syncs al mes (cada 15 días)',           on: true },
      { text: '300 conversaciones por reporte',          on: true },
      { text: '90 días de historial analizado',          on: true },
      { text: 'Reporte PDF',                             on: true },
      { text: 'Recomendaciones de mejoras',              on: true },
      { text: 'Dashboard de tendencias',                 on: true },
      { text: 'Soporte prioritario',                     on: false },
    ],
  },
  {
    id: 'enterprise', name: 'Enterprise', tagline: 'Para líderes que no se pierden nada',
    monthly: { cop: 400000 }, annual: { cop: 320000 },
    badge: null, dark: false, reports: '4', convs: '1.000', history: '180 días',
    cta: 'Hablar con ventas',
    features: [
      { text: '4 syncs al mes (semanal)',                on: true },
      { text: '1.000 conversaciones por reporte',        on: true },
      { text: '180 días de historial analizado',         on: true },
      { text: 'Reporte PDF',                             on: true },
      { text: 'Recomendaciones de mejoras',              on: true },
      { text: 'Dashboard de tendencias completo',        on: true },
      { text: 'Soporte dedicado (respuesta < 4 h)',      on: true },
    ],
  },
];

const PricingSection = ({ onNavigate }) => {
  const [billing, setBilling] = useState('monthly');
  const [hovered, setHovered] = useState(null);

  const fmt = (plan) => {
    const d = billing === 'annual' ? plan.annual : plan.monthly;
    return `$${d.cop.toLocaleString('es-CO')}`;
  };

  return (
    <section className="land-sec" style={{ background: '#fafafe', padding: '96px 32px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div id="precios" style={{ display: 'inline-block', color: '#4f46e5', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>PRECIOS</div>
          <h2 className="land-h2" style={{ fontSize: 40, fontWeight: 700, color: '#0e0749', marginBottom: 12, letterSpacing: '-0.02em' }}>
            Planes pensados para MiPymes colombianas
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(14,7,73,0.65)', marginBottom: 36 }}>
            Sin contratos. Sin cobros ocultos. Cancela cuando quieras.
          </p>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', background: 'white', border: '1.5px solid #ededed', borderRadius: 12, padding: 4 }}>
              {[['monthly','Mensual'],['annual','Anual']].map(([id, label]) => (
                <button key={id} onClick={() => setBilling(id)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: billing === id ? '#4f46e5' : 'transparent', color: billing === id ? 'white' : 'rgba(14,7,73,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all 200ms' }}>{label}</button>
              ))}
            </div>

            {billing === 'annual' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 999, animation: 'chipIn 300ms ease' }}>
                ✓ 20% de descuento incluido
              </div>
            )}
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, alignItems: 'center' }} className="land-pricing-grid">
          <style>{`@media(max-width:920px){.land-pricing-grid{grid-template-columns:1fr!important}}`}</style>

          {PLANS.map(plan => {
            const isHov = hovered === plan.id;
            return (
              <div key={plan.id}
                onMouseEnter={() => setHovered(plan.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: plan.dark ? '#0e0749' : 'white',
                  border: plan.dark ? '2px solid rgba(167,139,250,0.4)' : isHov ? '1.5px solid #4f46e5' : '1.5px solid #ededed',
                  borderRadius: 22,
                  padding: plan.dark ? '44px 36px' : '36px 32px',
                  display: 'flex', flexDirection: 'column',
                  position: 'relative',
                  boxShadow: plan.dark
                    ? '0 28px 64px rgba(79,70,229,0.28), 0 0 0 1px rgba(167,139,250,0.15)'
                    : isHov ? '0 12px 40px rgba(79,70,229,0.1)' : 'none',
                  transform: plan.dark ? 'scale(1.04)' : isHov ? 'translateY(-4px)' : 'none',
                  transition: 'all 280ms cubic-bezier(0.4,0,0.2,1)',
                  zIndex: plan.dark ? 2 : 1,
                }}>

                {/* Popular badge */}
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#4f46e5,#a78bfa)', color: 'white', fontSize: 12, fontWeight: 700, padding: '6px 20px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(79,70,229,0.45)' }}>
                    ★ {plan.badge}
                  </div>
                )}

                {/* Plan name */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: plan.dark ? '#a78bfa' : '#4f46e5', marginBottom: 6 }}>{plan.name.toUpperCase()}</div>
                  <div style={{ fontSize: 15, color: plan.dark ? 'rgba(255,255,255,0.6)' : 'rgba(14,7,73,0.55)', marginBottom: 22, lineHeight: 1.5 }}>{plan.tagline}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 40, fontWeight: 700, color: plan.dark ? 'white' : '#0e0749', lineHeight: 1, transition: 'all 280ms ease' }}>{fmt(plan)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: plan.dark ? 'rgba(255,255,255,0.35)' : 'rgba(14,7,73,0.38)' }}>
                    COP · por mes · cancela cuando quieras
                  </div>
                </div>

                {/* Key metrics strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 28 }}>
                  {[
                    { label: 'Reportes', val: plan.reports + '/mes' },
                    { label: 'Convers.', val: plan.convs },
                    { label: 'Historial', val: plan.history },
                  ].map(s => (
                    <div key={s.label} style={{ background: plan.dark ? 'rgba(167,139,250,0.1)' : 'rgba(79,70,229,0.05)', border: `1px solid ${plan.dark ? 'rgba(167,139,250,0.2)' : 'rgba(79,70,229,0.1)'}`, borderRadius: 10, padding: '10px 4px', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 15, fontWeight: 700, color: plan.dark ? '#c4b5fd' : '#4f46e5', marginBottom: 3 }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: plan.dark ? 'rgba(255,255,255,0.38)' : 'rgba(14,7,73,0.42)', fontWeight: 600, letterSpacing: '0.03em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Feature list */}
                <ul style={{ listStyle: 'none', flex: 1, marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: !f.on ? (plan.dark ? 'rgba(255,255,255,0.22)' : 'rgba(14,7,73,0.25)') : (plan.dark ? 'rgba(255,255,255,0.88)' : '#0e0749'), lineHeight: 1.45 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: f.on ? (plan.dark ? 'rgba(167,139,250,0.18)' : 'rgba(79,70,229,0.08)') : 'transparent', border: f.on ? 'none' : `1.5px solid ${plan.dark ? 'rgba(255,255,255,0.12)' : '#e8e8ee'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        {f.on ? <CHECK /> : <CROSS />}
                      </div>
                      {f.text}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => onNavigate('signup')}
                  style={{
                    width: '100%', padding: '15px', fontSize: 15, fontWeight: 700,
                    fontFamily: 'DM Sans,sans-serif', borderRadius: 11, cursor: 'pointer',
                    transition: 'all 200ms ease',
                    background: plan.dark
                      ? 'linear-gradient(135deg,#4f46e5,#7c6ff7)'
                      : isHov ? '#4f46e5' : 'white',
                    color: plan.dark ? 'white' : isHov ? 'white' : '#4f46e5',
                    border: plan.dark ? 'none' : '2px solid #4f46e5',
                    boxShadow: plan.dark ? '0 8px 24px rgba(79,70,229,0.4)' : 'none',
                  }}>
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom trust strip */}
        <div style={{ marginTop: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          {[
            { icon: '🔒', text: 'Pago seguro' },
            { icon: '💳', text: 'Diversos medios de pago' },
            { icon: '↩', text: 'Cancela cuando quieras' },
            { icon: '🇨🇴', text: 'Hecho para Colombia' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(14,7,73,0.55)', fontWeight: 500 }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span> {t.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TrustSection = ({ onNavigate }) => {
  const pillars = [
    { icon: 'lock', title: 'Tus datos no se venden, nunca', desc: 'La información de tus conversaciones es tuya y solo tuya. Jamás la compartimos, cedemos ni vendemos a terceros, anunciantes ni socios comerciales. Tu privacidad no está en negociación.', color: '#4f46e5' },
    { icon: 'shield', title: 'Cumplimos la Ley de Habeas Data', desc: 'Operamos de acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia. Tienes derecho a conocer, actualizar, rectificar y solicitar la eliminación de tus datos en cualquier momento.', color: '#a78bfa' },
    { icon: 'eye_off', title: 'Solo procesamos lo necesario', desc: 'Solo analizamos los datos mínimos para generar tu reporte: tiempos de respuesta, sentimiento y calidad de atención. No leemos el contenido personal de tus mensajes más allá de lo que el análisis requiere.', color: '#4f46e5' },
    { icon: 'globe', title: 'Encriptación de extremo a extremo', desc: 'Tus archivos se transfieren y almacenan con encriptación AES-256. Nadie dentro ni fuera de DeepLook puede acceder a tus conversaciones en texto plano.', color: '#a78bfa' },
    { icon: 'x', title: 'Elimina tus datos cuando quieras', desc: 'Tienes control total. Puedes solicitar la eliminación completa de todos tus archivos y reportes desde Configuración, en cualquier momento y sin costo adicional.', color: '#4f46e5' },
    { icon: 'user', title: 'Transparencia total', desc: 'Nuestra política de privacidad está redactada en español claro, sin lenguaje legal confuso. Sabes exactamente qué hacemos con tu información desde el primer día.', color: '#a78bfa' },
  ];
  return (
    <section className="land-sec" style={{ background: '#ededed', padding: '96px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', color: '#4f46e5', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>PRIVACIDAD Y SEGURIDAD</div>
          <h2 className="land-h2" style={{ fontSize: 40, fontWeight: 700, color: '#0e0749', marginBottom: 16, letterSpacing: '-0.02em' }}>Tu información está protegida. Sin letra pequeña.</h2>
          <p style={{ fontSize: 18, color: 'rgba(14,7,73,0.65)', maxWidth: 640, margin: '0 auto', lineHeight: 1.7 }}>Entendemos que tus conversaciones de negocio son privadas. Por eso construimos DeepLook con privacidad desde el primer día, no como un añadido.</p>
        </div>
        <div className="land-trust-grid">
          {pillars.map((p, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: '32px 28px', transition: 'transform 200ms, box-shadow 200ms' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(79,70,229,0.1)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
              <div style={{ width: 52, height: 52, background: `rgba(${p.color === '#4f46e5' ? '79,70,229' : '167,139,250'},0.1)`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Icon name={p.icon} size={24} color={p.color} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0e0749', marginBottom: 10, lineHeight: 1.35 }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.65)', lineHeight: 1.75 }}>{p.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ background: '#0e0749', borderRadius: 16, padding: '28px 36px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ width: 56, height: 56, background: 'rgba(167,139,250,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="shield" size={28} color="#a78bfa" />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 4 }}>Cumplimos con la Ley Colombiana de Habeas Data</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>Ley 1581 de 2012 · Decreto 1377 de 2013 · Superintendencia de Industria y Comercio</div>
          </div>
          <button onClick={() => onNavigate('privacy')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 200ms', fontFamily: 'DM Sans,sans-serif' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}>
            Leer política de privacidad →
          </button>
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:'¿Necesito conocimientos técnicos para usar DeepLook?', a:'No. Solo necesitas crear tu cuenta, conectar tu número de WhatsApp Business escaneando un QR, y listo. El sistema sincroniza y analiza tus conversaciones automáticamente. El reporte está escrito en español claro, sin jerga técnica.' },
    { q:'¿Mis conversaciones están seguras?', a:'Sí. La conexión a WhatsApp se hace a través de un servidor seguro dedicado a tu cuenta. Tus conversaciones se procesan de forma confidencial, se almacenan encriptadas, y nunca se comparten con terceros. Puedes desconectar y eliminar tus datos en cualquier momento.' },
    { q:'¿Cómo conecto mi WhatsApp?', a:'Desde tu cuenta en DeepLook, ve a "Conectar WhatsApp" y escanea el código QR con tu teléfono — igual que vinculas WhatsApp Web. El proceso tarda menos de 2 minutos y no requiere instalar ninguna app adicional.' },
    { q:'¿Cuántas conversaciones analiza DeepLook?', a:'Depende de tu plan: Basic analiza hasta 100 conversaciones por reporte, Plus hasta 300, y Enterprise hasta 1.000. El sistema toma siempre las más recientes dentro del período de tu plan.' },
    { q:'¿Puedo cancelar mi suscripción?', a:'Sí, en cualquier momento, sin preguntas ni letra chica. Si cancelas, mantienes acceso hasta el final del período pagado.' },
    { q:'¿Funciona para cualquier tipo de negocio?', a:'DeepLook está optimizado para MiPymes colombianas: clínicas, salones, tiendas, restaurantes, distribuidoras, asesorías, inmobiliarias, etc.' },
    { q:'¿En qué idioma está el reporte?', a:'100% en español colombiano. Los benchmarks están basados en estudios del mercado colombiano, no extranjeros.' },
    { q:'¿Cómo pago?', a:'Aceptamos tarjeta de crédito/débito (Visa, Mastercard), transferencia por Nequi o Bancolombia, y PSE. Todos los pagos se procesan de forma segura.' },
  ];
  return (
    <section className="land-sec" style={{ background: 'white', padding: '96px 32px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div id="preguntas" style={{ display: 'inline-block', color: '#4f46e5', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>PREGUNTAS FRECUENTES</div>
          <h2 className="land-h2" style={{ fontSize: 40, fontWeight: 700, color: '#0e0749', letterSpacing: '-0.02em' }}>Todo lo que necesitas saber</h2>
        </div>
        {faqs.map((f, i) => (
          <div key={i} style={{ borderBottom: '1px solid #ededed', overflow: 'hidden' }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: 17, fontWeight: 600, color: '#0e0749', flex: 1, marginRight: 16 }}>{f.q}</span>
              <div style={{ width: 24, height: 24, background: open === i ? '#4f46e5' : 'rgba(79,70,229,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 200ms, transform 200ms', transform: open === i ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>
                <Icon name="plus" size={14} color={open === i ? 'white' : '#4f46e5'} />
              </div>
            </button>
            {open === i && <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.72)', lineHeight: 1.75, paddingBottom: 20 }}>{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

const FinalCTASection = ({ onNavigate }) => (
  <section className="land-sec" style={{ background: '#4f46e5', padding: '96px 32px', textAlign: 'center' }}>
    <h2 className="land-h2-w" style={{ fontSize: 44, fontWeight: 700, color: 'white', marginBottom: 16, letterSpacing: '-0.02em' }}>Deja de perder ventas por falta de datos</h2>
    <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.82)', marginBottom: 40 }}>Descubre en minutos por qué pierdes clientes — y cómo recuperarlos.</p>
    <button onClick={() => onNavigate('signup')} style={{ background: 'white', color: '#4f46e5', border: 'none', borderRadius: 8, padding: '16px 40px', fontSize: 18, fontWeight: 700, cursor: 'pointer', transition: 'transform 200ms, box-shadow 200ms' }} onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.04)';e.currentTarget.style.boxShadow='0 8px 40px rgba(0,0,0,0.2)'}} onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>Ver mi diagnóstico ahora</button>
    <p style={{ marginTop: 16, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Sé de los primeros en descubrir lo que tus chats realmente dicen</p>
  </section>
);

const FooterLink = ({ label, action, href }) => {
  const s = { color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14, transition: 'color 200ms', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', padding: 0 };
  const hover = e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
  const leave = e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
  if (href) return <a href={href} style={s} onMouseEnter={hover} onMouseLeave={leave}>{label}</a>;
  return <button onClick={action || undefined} style={s} onMouseEnter={hover} onMouseLeave={leave}>{label}</button>;
};

const FooterColTitle = ({ children }) => (
  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>{children}</div>
);

const Footer = ({ onNavigate }) => (
  <footer style={{ background: '#0e0749', padding: '64px 32px 40px' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="land-footer-grid">

        {/* Brand + contact card */}
        <div>
          <DeepLookLogo dark={false} size="md" />
          <p style={{ marginTop: 14, fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 240 }}>Inteligencia real sobre tus conversaciones de WhatsApp.</p>
          <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(167,139,250,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>¿Tienes preguntas?</div>
            <a href={`https://wa.me/573142601563?text=${encodeURIComponent('Hola, me interesa conocer más sobre DeepLook 👋')}`} target="_blank" rel="noopener noreferrer"
               style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: '#25d366', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#25d366' }}>Escríbenos por WhatsApp</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Respondemos en menos de 24h</div>
              </div>
            </a>
            <a href="mailto:contacto@deeplookapp.com" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, background: 'rgba(167,139,250,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="mail" size={14} color="#a78bfa" />
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>contacto@deeplookapp.com</div>
            </a>
          </div>
          <p style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© 2026 DeepLook. Todos los derechos reservados.</p>
        </div>

        {/* Producto */}
        <div>
          <FooterColTitle>Producto</FooterColTitle>
          {[
            { label: 'Características',    action: () => scrollTo('producto') },
            { label: 'Cómo funciona',      action: () => scrollTo('como-funciona') },
            { label: 'Precios',            action: () => scrollTo('precios') },
            { label: 'Reporte de ejemplo', action: () => scrollTo('reporte') },
          ].map(l => <div key={l.label} style={{ marginBottom: 10 }}><FooterLink {...l} /></div>)}
        </div>

        {/* Cuenta */}
        <div>
          <FooterColTitle>Cuenta</FooterColTitle>
          {[
            { label: 'Iniciar sesión', action: () => onNavigate('login') },
            { label: 'Crear cuenta',   action: () => onNavigate('signup') },
            { label: 'Ver planes',     action: () => scrollTo('precios') },
            { label: 'Preguntas frecuentes', action: () => scrollTo('preguntas') },
          ].map(l => <div key={l.label} style={{ marginBottom: 10 }}><FooterLink {...l} /></div>)}
        </div>

        {/* Legal + trust */}
        <div>
          <FooterColTitle>Legal</FooterColTitle>
          <div style={{ marginBottom: 10 }}><FooterLink label="Política de privacidad" action={() => onNavigate('privacy')} /></div>
          <div style={{ marginBottom: 10 }}><FooterLink label="Términos de servicio"   action={() => onNavigate('terms')} /></div>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Ley Habeas Data · 1581/2012',
              'Encriptación AES-256',
              'Tus datos nunca se venden',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, background: 'rgba(167,139,250,0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="shield" size={12} color="rgba(167,139,250,0.7)" />
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </footer>
);

const WA_NUMBER = '573142601563';
const WA_MESSAGE = encodeURIComponent('Hola, me interesa conocer más sobre DeepLook 👋');

const WA_SVG = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const WhatsAppButton = () => (
  <>
    <style>{`
      @keyframes waPulse {
        0%   { transform: scale(1); opacity: 0.5; }
        70%  { transform: scale(1.55); opacity: 0; }
        100% { transform: scale(1.55); opacity: 0; }
      }
      @keyframes waBounce {
        0%, 100% { transform: translateY(0); }
        40%       { transform: translateY(-6px); }
        60%       { transform: translateY(-3px); }
      }
      .wa-widget { position: fixed; bottom: 24px; right: 24px; z-index: 999; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
      .wa-bubble {
        background: white;
        border-radius: 18px 18px 4px 18px;
        padding: 18px 22px;
        box-shadow: 0 8px 32px rgba(14,7,73,0.15);
        max-width: 290px;
        animation: pageFade 400ms ease;
        border: 1px solid #ededed;
      }
      .wa-bubble-name  { font-size: 15px; font-weight: 700; color: #0e0749; font-family: 'DM Sans',sans-serif; margin-bottom: 4px; }
      .wa-bubble-text  { font-size: 14px; color: rgba(14,7,73,0.65); font-family: 'DM Sans',sans-serif; line-height: 1.6; }
      .wa-bubble-dot   { display: inline-flex; gap: 3px; margin-top: 6px; }
      .wa-bubble-dot span { width: 7px; height: 7px; background: #25d366; border-radius: 50%; animation: waBounce 1.2s ease infinite; }
      .wa-bubble-dot span:nth-child(2) { animation-delay: 0.15s; }
      .wa-bubble-dot span:nth-child(3) { animation-delay: 0.30s; }
      .wa-pill {
        display: flex; align-items: center; gap: 12px;
        background: #25d366;
        border-radius: 999px;
        padding: 12px 20px 12px 14px;
        text-decoration: none;
        box-shadow: 0 6px 28px rgba(37,211,102,0.55);
        transition: transform 200ms, box-shadow 200ms;
        cursor: pointer;
        position: relative;
      }
      .wa-pill:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(37,211,102,0.65); }
      .wa-pill-ring { position: absolute; inset: 0; border-radius: 999px; background: #25d366; animation: waPulse 2.2s ease-out infinite; pointer-events: none; }
      .wa-pill-text { display: flex; flex-direction: column; }
      .wa-pill-text strong { font-size: 14px; font-weight: 700; color: white; font-family: 'DM Sans',sans-serif; line-height: 1.2; }
      .wa-pill-text span   { font-size: 11px; color: rgba(255,255,255,0.8); font-family: 'DM Sans',sans-serif; }
      .wa-status { width: 9px; height: 9px; background: white; border-radius: 50%; position: absolute; top: 10px; right: 10px; box-shadow: 0 0 0 2px #25d366; }
      /* Mobile: smaller pill, hide bubble */
      @media (max-width: 640px) {
        .wa-widget { bottom: 16px; right: 16px; }
        .wa-pill { padding: 12px 16px 12px 12px; gap: 10px; }
        .wa-pill-text strong { font-size: 13px; }
        .wa-bubble { max-width: 220px; padding: 12px 16px; border-radius: 16px 16px 4px 16px; }
        .wa-bubble-name { font-size: 13px; margin-bottom: 2px; }
        .wa-bubble-text { font-size: 12px; }
      }
    `}</style>
    <div className="wa-widget">
      <div className="wa-bubble">
        <div className="wa-bubble-name">DeepLook 👋</div>
        <div className="wa-bubble-text">¡Hola! ¿Tienes preguntas? Escríbenos, estamos para ayudarte.</div>
        <div className="wa-bubble-dot">
          <span /><span /><span />
        </div>
      </div>
      <a
        href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-pill"
        aria-label="Escríbenos por WhatsApp"
      >
        <span className="wa-pill-ring" />
        <span className="wa-status" />
        {WA_SVG}
        <span className="wa-pill-text">
          <strong>WhatsApp</strong>
          <span>Estamos en línea</span>
        </span>
      </a>
    </div>
  </>
);

const LandingPage = ({ onNavigate }) => (
  <div className="page-fade">
    <NavHeader onNavigate={onNavigate} />
    <HeroSection onNavigate={onNavigate} />
    <ProblemSection />
    <HowItWorksSection />
    <FeaturesSection />
    <ReportPreviewSection onNavigate={onNavigate} />
    <PricingSection onNavigate={onNavigate} />
    <TrustSection onNavigate={onNavigate} />
    <FAQSection />
    <FinalCTASection onNavigate={onNavigate} />
    <Footer onNavigate={onNavigate} />
    <WhatsAppButton />
  </div>
);

export default LandingPage;
