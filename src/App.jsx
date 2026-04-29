import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import LandingPage from './components/Landing';
import AuthPage from './components/Auth';
import Dashboard from './components/Dashboard';
import LegalPage from './components/LegalPage';
import PaymentResult from './components/PaymentResult';
import SSOCallback from './components/SSOCallback';
import OAuthInit from './components/OAuthInit';

const DASH_PAGES = ['dashboard', 'connect', 'upload', 'reports', 'trends', 'settings', 'help'];
const AUTH_PAGES = ['login', 'signup'];

// URL path ↔ internal page key
const URL_TO_PAGE = {
  '/':               'landing',
  '/landing':        'landing_public',
  '/precios':        'landing_public',
  '/login':          'login',
  '/signup':         'signup',
  '/sso-callback':   'sso_callback',
  '/oauth-init':     'oauth_init',
  '/app/inicio':     'dashboard',
  '/app/conectar':   'connect',
  '/app/upload':     'upload',
  '/app/reports':    'reports',
  '/app/trends':     'trends',
  '/app/settings':   'settings',
  '/app/help':       'help',
  '/privacy':        'privacy',
  '/terms':          'terms',
  '/pago-exitoso':   'payment_result',
};

const PAGE_TO_URL = {
  landing:        '/',
  landing_public: '/landing',
  login:          '/login',
  signup:         '/signup',
  dashboard:      '/app/inicio',
  connect:        '/app/conectar',
  upload:         '/app/upload',
  reports:        '/app/reports',
  trends:         '/app/trends',
  settings:       '/app/settings',
  help:           '/app/help',
  privacy:        '/privacy',
  terms:          '/terms',
};

const App = () => {
  const routerNavigate = useNavigate();
  const { pathname } = useLocation();
  const { isSignedIn, isLoaded } = useAuth();

  const page = URL_TO_PAGE[pathname] ?? 'landing';
  const navigate = (target) => routerNavigate(PAGE_TO_URL[target] ?? '/');

  useEffect(() => {
    if (!isLoaded) return;

    // If we're the OAuth popup and auth just completed, notify parent and close
    if (window.opener && sessionStorage.getItem('is_oauth_popup') && isSignedIn) {
      sessionStorage.removeItem('is_oauth_popup');
      try { window.opener.postMessage({ type: 'CLERK_AUTH_COMPLETE' }, window.location.origin); } catch {}
      window.close();
      return;
    }

    // Never redirect away from OAuth flow pages
    if (page === 'sso_callback' || page === 'oauth_init') return;
    if (isSignedIn && (AUTH_PAGES.includes(page) || page === 'landing'))
      routerNavigate('/app/inicio', { replace: true });
    if (!isSignedIn && DASH_PAGES.includes(page))
      routerNavigate('/login', { replace: true });
  }, [isLoaded, isSignedIn, page]);

  if (!isLoaded) return null;

  // OAuth init/callback — must be accessible without auth (handles OAuth redirect)
  if (page === 'sso_callback') return <SSOCallback onNavigate={navigate} />;
  if (page === 'oauth_init') return <OAuthInit />;

  // landing_public (/landing, /precios) — always visible, no auth redirect
  if (page === 'landing_public') return <LandingPage onNavigate={navigate} />;
  if (page === 'landing') return <LandingPage onNavigate={navigate} />;
  if (AUTH_PAGES.includes(page)) return <AuthPage mode={page} onNavigate={navigate} />;
  if (DASH_PAGES.includes(page)) return <Dashboard page={page} onNavigate={navigate} onLanding={() => routerNavigate('/landing')} />;
  if (page === 'privacy' || page === 'terms') return <LegalPage page={page} onNavigate={navigate} />;
  if (page === 'payment_result') return <PaymentResult onNavigate={navigate} />;
  return <LandingPage onNavigate={navigate} />;
};

export default App;
