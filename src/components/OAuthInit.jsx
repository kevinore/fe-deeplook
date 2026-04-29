import { SignUp, SignIn } from '@clerk/react';
import { useEffect, useRef } from 'react';

// Appearance for the popup — shows only the social buttons, hides the email form.
const POPUP_APPEARANCE = {
  variables: {
    colorPrimary: '#4f46e5',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '14px',
    borderRadius: '8px',
  },
  elements: {
    rootBox: { width: '100%' },
    cardBox: { boxShadow: 'none', width: '100%' },
    card: { boxShadow: 'none', border: 'none', padding: '20px 16px', background: 'transparent', width: '100%' },
    header: { display: 'none' },
    formFieldRow: { display: 'none' },
    formButtonPrimary: { display: 'none' },
    footer: { display: 'none' },
    footerAction: { display: 'none' },
    footerPages: { display: 'none' },
    dividerRow: { display: 'none' },
    socialButtonsBlockButton: {
      border: '1.5px solid #8b8ba8',
      borderRadius: '8px',
      height: '40px',
      background: 'white',
      color: '#0e0749',
      fontSize: '14px',
      fontWeight: '500',
    },
    socialButtonsBlockButtonArrow: { display: 'none' },
  },
};

const OAuthInit = () => {
  const params = new URLSearchParams(window.location.search);
  const strategy = params.get('strategy') ?? 'oauth_google';
  const mode = params.get('mode') ?? 'signup';
  const clicked = useRef(false);

  // Mark this window as an OAuth popup so App.jsx closes it after auth
  useEffect(() => {
    sessionStorage.setItem('is_oauth_popup', '1');
  }, []);

  // Once Clerk renders the social button, click it automatically.
  // Clerk uses its own default OAuth redirect URL (accounts.dev), which is
  // already whitelisted — no Clerk Dashboard changes needed.
  useEffect(() => {
    const provider = strategy.replace('oauth_', '').toLowerCase(); // 'google' | 'microsoft'

    const tryClick = () => {
      if (clicked.current) return true;
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent.toLowerCase().includes(provider) && !b.disabled
      );
      if (btn) {
        clicked.current = true;
        btn.click();
        return true;
      }
      return false;
    };

    const interval = setInterval(() => { if (tryClick()) clearInterval(interval); }, 100);
    const timeout  = setTimeout(() => clearInterval(interval), 10_000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [strategy]);

  return (
    <div style={{
      minHeight: '100vh', background: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 300, padding: '0 20px' }}>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(14,7,73,0.5)', marginBottom: 12 }}>
          Conectando tu cuenta…
        </p>
        {mode === 'signin'
          ? <SignIn routing="virtual" appearance={POPUP_APPEARANCE} />
          : <SignUp routing="virtual" appearance={POPUP_APPEARANCE} />
        }
      </div>
    </div>
  );
};

export default OAuthInit;
