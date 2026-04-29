import { useSignUp, useSignIn } from '@clerk/react';
import { useEffect, useRef } from 'react';

// Rendered at /sso-callback — handles the OAuth redirect for both sign-up and sign-in.
// When running inside a popup (window.opener exists), sends a postMessage to the
// parent and closes the popup instead of navigating. This keeps the main app page
// visible the whole time.
const SSOCallback = ({ onNavigate }) => {
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const handled = useRef(false);

  useEffect(() => {
    if (!signUpLoaded || !signInLoaded || handled.current) return;
    handled.current = true;

    const finish = (setActive, sessionId) => {
      return setActive({ session: sessionId }).then(() => {
        if (window.opener) {
          try {
            window.opener.postMessage({ type: 'CLERK_AUTH_COMPLETE' }, window.location.origin);
          } catch { /* cross-origin guard */ }
          window.close();
        } else {
          onNavigate('dashboard');
        }
      });
    };

    const handle = async () => {
      try {
        // Sign-in OAuth callback (returning user)
        if (signIn?.firstFactorVerification?.status === 'transferable') {
          const result = await signIn.handleRedirectCallback({});
          if (result.status === 'complete') {
            await finish(setSignInActive, result.createdSessionId);
            return;
          }
        }

        // Sign-up OAuth callback (new user)
        if (signUp) {
          const result = await signUp.handleRedirectCallback({});

          if (result.status === 'missing_requirements' && result.missingFields?.includes('username')) {
            const base = (result.emailAddress ?? 'user')
              .split('@')[0]
              .replace(/[^a-z0-9]/gi, '')
              .toLowerCase()
              .slice(0, 15) || 'user';
            const username = `${base}${Math.random().toString(36).slice(2, 7)}`;
            const updated = await signUp.update({ username });
            if (updated.status === 'complete') {
              await finish(setSignUpActive, updated.createdSessionId);
              return;
            }
          }

          if (result.status === 'complete') {
            await finish(setSignUpActive, result.createdSessionId);
            return;
          }
        }

        // Fallback
        if (window.opener) { window.close(); } else { onNavigate('signup'); }
      } catch (err) {
        console.error('SSO callback error:', err);
        if (window.opener) { window.close(); } else { onNavigate('signup'); }
      }
    };

    handle();
  }, [signUpLoaded, signInLoaded]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: 14,
      background: '#fafafa', fontFamily: 'DM Sans, sans-serif',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 38, height: 38,
        border: '3px solid rgba(79,70,229,0.15)',
        borderTop: '3px solid #4f46e5',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
      }} />
      <p style={{ fontSize: 14, color: '#0e0749', margin: 0 }}>Conectando tu cuenta…</p>
    </div>
  );
};

export default SSOCallback;
