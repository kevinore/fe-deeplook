import { SignIn, SignUp } from '@clerk/react';
import { Icon, DeepLookLogo } from './Icons';

const clerkAppearance = {
  variables: {
    colorPrimary: '#4f46e5',
    colorBackground: '#ffffff',
    colorInputBackground: '#f4f4f6',
    colorInputText: '#0e0749',
    colorText: '#0e0749',
    colorTextSecondary: 'rgba(14,7,73,0.5)',
    colorNeutral: '#0e0749',
    colorDanger: '#dc2626',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '13.5px',
    borderRadius: '8px',
    spacingUnit: '0.65rem',
  },
  elements: {
    rootBox: { width: '100%' },
    cardBox: { boxShadow: 'none', width: '100%' },
    /* Inner padding so labels/inputs never touch the card edge */
    card: {
      boxShadow: 'none',
      border: 'none',
      padding: '22px 22px 18px',
      background: 'transparent',
      width: '100%',
    },
    header: { display: 'none' },
    /* Stronger border so the button outline is clearly visible */
    socialButtonsBlockButton: {
      border: '1.5px solid #8b8ba8',
      borderRadius: '8px',
      height: '36px',
      background: 'white',
      color: '#0e0749',
      fontSize: '13.5px',
      fontWeight: '500',
      boxShadow: 'none',
      transition: 'border-color 150ms, box-shadow 150ms',
    },
    socialButtonsBlockButtonText: { fontSize: '13.5px', fontWeight: '500' },
    socialButtonsBlockButtonArrow: { display: 'none' },
    dividerLine: { background: '#d8d8e4' },
    dividerText: { color: 'rgba(14,7,73,0.4)', fontSize: '12px', fontWeight: '500' },
    formFieldLabel: { fontSize: '13px', fontWeight: '500', color: '#0e0749' },
    formFieldInput: {
      background: '#f4f4f6',
      border: '1.5px solid #bdbdce',
      borderRadius: '8px',
      height: '38px',
      fontSize: '13.5px',
      color: '#0e0749',
      boxShadow: 'none',
      padding: '0 12px',
    },
    formFieldInputShowPasswordButton: { color: 'rgba(14,7,73,0.4)' },
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
      borderRadius: '8px',
      height: '38px',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 3px 12px rgba(79,70,229,0.28)',
      border: 'none',
    },
    footerActionLink: { color: '#4f46e5', fontWeight: '600', fontSize: '13px' },
    footerActionText: { color: 'rgba(14,7,73,0.55)', fontSize: '13px' },
    identityPreviewText: { color: '#0e0749', fontSize: '13px' },
    identityPreviewEditButton: { color: '#4f46e5' },
    formResendCodeLink: { color: '#4f46e5', fontSize: '13px' },
    otpCodeFieldInput: {
      border: '1.5px solid #bdbdce',
      borderRadius: '8px',
      background: '#f4f4f6',
      color: '#0e0749',
      fontSize: '17px',
    },
    alertText: { fontSize: '12px' },
    footer: { display: 'none' },
    footerAction: { display: 'none' },
    footerPages: { display: 'none' },
  },
};

const MiniDashVisual = () => {
  const bars = [42, 68, 55, 80, 61, 72, 88];
  return (
    <div style={{ position: 'relative', width: '100%', height: 320 }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#a78bfa" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      <div className="float-anim" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 220, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 16, padding: '20px 22px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.08em' }}>PUNTAJE DE SALUD</div>
          <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 6px #22c55e' }} />
        </div>
        <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 52, fontWeight: 700, color: 'white', lineHeight: 1, marginBottom: 4 }}>72</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>/100 · Bueno</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, background: i === bars.length - 1 ? '#a78bfa' : 'rgba(167,139,250,0.3)', borderRadius: '3px 3px 0 0', height: `${h}%` }} />
          ))}
        </div>
        <div style={{ height: 1, background: 'rgba(167,139,250,0.2)', margin: '10px 0 8px' }} />
        <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>↑ +6 pts este mes</div>
      </div>
      <div style={{ position: 'absolute', top: 10, left: -10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(8px)', animation: 'float 4s ease-in-out infinite 0.5s' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>TIEMPO RESPUESTA</div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 700, color: 'white' }}>2.3h</div>
        <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 600, marginTop: 2 }}>↓ -63%</div>
      </div>
      <div style={{ position: 'absolute', top: 12, right: -14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(8px)', animation: 'float 4s ease-in-out infinite 1.2s' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>CONVERSIÓN</div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 700, color: 'white' }}>42%</div>
        <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 600, marginTop: 2 }}>↑ +6%</div>
      </div>
      <div style={{ position: 'absolute', bottom: 20, right: -8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(8px)', animation: 'float 5s ease-in-out infinite 0.8s' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>SENTIMIENTO</div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 700, color: 'white' }}>79%</div>
        <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
          {[1,2,3,4,5].map(s => <div key={s} style={{ width: 10, height: 10, borderRadius: '50%', background: s <= 4 ? '#a78bfa' : 'rgba(167,139,250,0.25)' }} />)}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 14, left: -4, background: 'rgba(79,70,229,0.5)', border: '1px solid rgba(167,139,250,0.4)', borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(8px)', animation: 'float 4.5s ease-in-out infinite 1.5s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: 'rgba(255,255,255,0.15)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={12} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'white', fontWeight: 600 }}>Reporte listo</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Abril 2026</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthLeft = ({ mode }) => {
  const bullets = ['Planes desde $160.000 COP', 'Sin instalaciones complicadas', 'Soporte en español'];
  return (
    <div style={{ background: '#0e0749', padding: '44px 44px', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'rgba(79,70,229,0.3)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -80, width: 300, height: 300, background: 'rgba(167,139,250,0.18)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: -40, width: 200, height: 200, background: 'rgba(79,70,229,0.15)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
        <DeepLookLogo dark={false} size="sm" style={{ height: 48, maxWidth: 170 }} />
        <div style={{ marginTop: 40, marginBottom: 32 }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, color: 'white', lineHeight: 1.25, marginBottom: 12, letterSpacing: '-0.02em' }}>
            {mode === 'signup' ? 'Entiende tu WhatsApp en minutos' : 'Bienvenido de nuevo'}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>Tus Chats Bajo La Lupa — con total privacidad y seguridad.</p>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
          <MiniDashVisual />
        </div>
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bullets.map(b => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="check" size={10} color="#a78bfa" />
              </div>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{b}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(167,139,250,0.15)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['Ley de Habeas Data · Ley 1581 de 2012', 'Tus datos nunca se venden', 'Encriptación AES-256'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="shield" size={12} color="rgba(167,139,250,0.6)" />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AuthRight = ({ mode, onNavigate }) => {
  const isSignup = mode === 'signup' || mode === 'forgot';

  const switchPerks = isSignup
    ? [{ icon: 'zap', text: 'Accede a todos tus reportes' }, { icon: 'chart', text: 'Visualiza tus tendencias' }, { icon: 'star', text: 'Retoma donde lo dejaste' }]
    : [{ icon: 'star', text: 'Puntaje de salud de tu WhatsApp' }, { icon: 'chart', text: 'Tendencias mes a mes con tu dashboard' }, { icon: 'zap', text: 'Planes desde $160.000 COP' }];

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 36px 32px' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Label badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.18)', borderRadius: 999, padding: '4px 12px', marginBottom: 14 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f46e5' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', letterSpacing: '0.07em' }}>
              {isSignup ? 'CREA TU CUENTA GRATIS' : 'BIENVENIDO DE NUEVO'}
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0e0749', marginBottom: 4, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {isSignup ? <>Entiende Tu WhatsApp<br /><span style={{ background: 'linear-gradient(90deg,#4f46e5,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>En Minutos</span></> : <>Tus Chats<br /><span style={{ background: 'linear-gradient(90deg,#4f46e5,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bajo La Lupa</span></>}
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)', lineHeight: 1.6 }}>
              {isSignup ? 'Análisis profesional de tus conversaciones de WhatsApp Business.' : 'Inicia sesión para ver tus reportes y tendencias.'}
            </p>
          </div>

          {/* Hover styles injected globally for Clerk elements */}
          <style>{`
            .cl-socialButtonsBlockButton:hover {
              border-color: #4f46e5 !important;
              box-shadow: 0 0 0 3px rgba(79,70,229,0.1) !important;
            }
            .cl-formFieldInput:focus {
              border-color: #4f46e5 !important;
              box-shadow: 0 0 0 3px rgba(79,70,229,0.1) !important;
            }
            .cl-formButtonPrimary:hover {
              opacity: 0.92;
              box-shadow: 0 6px 20px rgba(79,70,229,0.38) !important;
            }
          `}</style>

          {/* Form card with accent top bar */}
          <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 32px rgba(14,7,73,0.09)', border: '1.5px solid #dcdce8' }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg, #4f46e5, #a78bfa)' }} />
            <div style={{ background: 'white' }}>
              {isSignup
                ? <SignUp routing="virtual" appearance={clerkAppearance} />
                : <SignIn routing="virtual" appearance={clerkAppearance} />
              }
            </div>
          </div>

          {/* Switch mode card */}
          <div style={{ marginTop: 16, borderRadius: 14, border: '1.5px solid #e4e2f8', background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0e0749', marginBottom: 2 }}>
                  {isSignup ? '¿Ya tienes cuenta?' : '¿Eres nuevo en DeepLook?'}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.5)' }}>
                  {isSignup ? 'Accede a tus reportes ahora' : 'Empieza gratis hoy'}
                </div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'white', border: '1.5px solid #dcdce8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(79,70,229,0.08)' }}>
                <Icon name={isSignup ? 'user' : 'zap'} size={16} color="#4f46e5" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {switchPerks.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={p.icon} size={10} color="#4f46e5" />
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(14,7,73,0.65)', fontWeight: 500 }}>{p.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate(isSignup ? 'login' : 'signup')}
              style={{ width: '100%', padding: '10px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #4f46e5, #6d28d9)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 14px rgba(79,70,229,0.3)', transition: 'opacity 200ms, transform 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}>
              {isSignup ? 'Iniciar sesión' : 'Crear cuenta'}
              <span style={{ fontSize: 15 }}>→</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

const AuthPage = ({ mode, onNavigate }) => (
  <div className="page-fade auth-grid">
    <div className="auth-left"><AuthLeft mode={mode} /></div>
    <AuthRight mode={mode} onNavigate={onNavigate} />
  </div>
);

export default AuthPage;
