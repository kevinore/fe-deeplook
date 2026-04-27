import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import LandingPage from './components/Landing';
import AuthPage from './components/Auth';
import Dashboard from './components/Dashboard';
import LegalPage from './components/LegalPage';

const DASH_PAGES = ['dashboard', 'connect', 'upload', 'reports', 'trends', 'settings', 'help'];
const AUTH_PAGES = ['login', 'signup'];

// URL path ↔ internal page key
const URL_TO_PAGE = {
  '/':               'landing',
  '/landing':        'landing_public',
  '/precios':        'landing_public',
  '/login':          'login',
  '/signup':         'signup',
  '/app/inicio':     'dashboard',
  '/app/conectar':   'connect',
  '/app/upload':     'upload',
  '/app/reports':    'reports',
  '/app/trends':     'trends',
  '/app/settings':   'settings',
  '/app/help':       'help',
  '/privacy':        'privacy',
  '/terms':          'terms',
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
    if (isSignedIn && (AUTH_PAGES.includes(page) || page === 'landing'))
      routerNavigate('/app/inicio', { replace: true });
    if (!isSignedIn && DASH_PAGES.includes(page))
      routerNavigate('/login', { replace: true });
  }, [isLoaded, isSignedIn, page]);

  if (!isLoaded) return null;

  // landing_public (/landing, /precios) — always visible, no auth redirect
  if (page === 'landing_public') return <LandingPage onNavigate={navigate} />;
  if (page === 'landing') return <LandingPage onNavigate={navigate} />;
  if (AUTH_PAGES.includes(page)) return <AuthPage mode={page} onNavigate={navigate} />;
  if (DASH_PAGES.includes(page)) return <Dashboard page={page} onNavigate={navigate} onLanding={() => routerNavigate('/landing')} />;
  if (page === 'privacy' || page === 'terms') return <LegalPage page={page} onNavigate={navigate} />;
  return <LandingPage onNavigate={navigate} />;
};

export default App;
