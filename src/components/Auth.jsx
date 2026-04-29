import { SignIn, SignUp, useSignUp } from '@clerk/react';
import { useEffect, useRef, useState } from 'react';
import { Icon, DeepLookLogo } from './Icons';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true" style={{ flexShrink: 0 }}>
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);

const SocialAuthButtons = ({ mode }) => {
  const pollRef = useRef(null);

  const handleOAuth = (strategy) => {
    const url = `/oauth-init?strategy=${strategy}&mode=${mode}`;
    const popup = window.open(url, 'clerk_oauth', 'width=520,height=640,scrollbars=yes,resizable=yes');

    if (!popup || popup.closed) {
      // Popup blocked — fall back to same-tab redirect
      window.location.href = url;
      return;
    }

    let msgListener;
    const cleanup = () => {
      clearInterval(pollRef.current);
      window.removeEventListener('message', msgListener);
    };

    msgListener = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'CLERK_AUTH_COMPLETE') {
        cleanup();
        window.location.href = '/app/inicio';
      }
    };
    window.addEventListener('message', msgListener);

    // Safety net — if popup closes without sending message, just clean up
    pollRef.current = setInterval(() => {
      if (popup.closed) cleanup();
    }, 500);
  };

  const btnStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    width: '100%', padding: '9px 16px',
    border: '1.5px solid #8b8ba8', borderRadius: 8,
    background: 'white', color: '#0e0749',
    fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'border-color 150ms, box-shadow 150ms',
  };

  return (
    <div style={{ padding: '20px 22px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          style={btnStyle}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#8b8ba8'; e.currentTarget.style.boxShadow = 'none'; }}
          onClick={() => handleOAuth('oauth_google')}
        >
          <GoogleIcon />
          Continuar con Google
        </button>
        <button
          style={btnStyle}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#8b8ba8'; e.currentTarget.style.boxShadow = 'none'; }}
          onClick={() => handleOAuth('oauth_microsoft')}
        >
          <MicrosoftIcon />
          Continuar con Microsoft
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 0' }}>
        <div style={{ flex: 1, height: 1, background: '#d8d8e4' }} />
        <span style={{ fontSize: 12, color: 'rgba(14,7,73,0.4)', fontWeight: 500, whiteSpace: 'nowrap' }}>o continúa con email</span>
        <div style={{ flex: 1, height: 1, background: '#d8d8e4' }} />
      </div>
    </div>
  );
};

// Wrapper around <SignUp> that catches the missing_requirements/username state
// and silently auto-generates a username so the user never leaves the app.
const SmartSignUp = ({ appearance }) => {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!isLoaded || !signUp || completing) return;
    if (signUp.status !== 'missing_requirements') return;
    if (!signUp.missingFields?.includes('username')) return;

    setCompleting(true);
    const base = (signUp.emailAddress ?? 'user')
      .split('@')[0]
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase()
      .slice(0, 15) || 'user';
    const username = `${base}${Math.random().toString(36).slice(2, 7)}`;

    signUp.update({ username })
      .then((result) => {
        if (result.status === 'complete' && result.createdSessionId) {
          return setActive({ session: result.createdSessionId });
        }
      })
      .catch(() => setCompleting(false));
  }, [isLoaded, signUp?.status]);

  if (completing) {
    return (
      <div style={{ padding: '40px 22px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#0e0749', marginBottom: 6 }}>Completando tu registro…</div>
        <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)' }}>Solo un momento</div>
      </div>
    );
  }

  return <SignUp routing="virtual" appearance={appearance} />;
};

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
    // Hide Clerk's built-in social buttons — we render custom popup buttons above
    socialButtonsRoot: { display: 'none' },
    socialButtonsBlockButton: { display: 'none' },
    socialButtonsBlockButtonText: { display: 'none' },
    socialButtonsBlockButtonArrow: { display: 'none' },
    dividerRow: { display: 'none' },
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
              {/* Custom OAuth buttons open in a popup — main page never redirects */}
              <SocialAuthButtons mode={isSignup ? 'signup' : 'signin'} />
              {isSignup
                ? <SmartSignUp appearance={clerkAppearance} />
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
