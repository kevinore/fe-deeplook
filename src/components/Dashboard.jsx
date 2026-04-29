import { useState, useEffect } from 'react';
import { useUser, useClerk, UserButton } from '@clerk/react';
import { Icon, DeepLookLogo } from './Icons';
import { useApiClient } from '../lib/api';
import OnboardingModal from './OnboardingModal';
import PlanSelectionModal from './PlanSelectionModal';
import RenewalBanner from './RenewalBanner';
import { NotificationProvider } from './NotificationContext';
import NotificationBell from './NotificationBell';
import DashHome from './DashHome';
import DashConnect from './DashConnect';
import DashUpload from './DashUpload';
import DashReports from './DashReports';
import DashTrends from './DashTrends';
import DashSettings from './DashSettings';
import DashHelp from './DashHelp';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Inicio',               icon: 'home' },
  { id: 'connect',   label: 'Conectar WhatsApp',    icon: 'link' },
  { id: 'reports',   label: 'Mis reportes',         icon: 'file' },
  { id: 'trends',    label: 'Tendencias',           icon: 'chart' },
  { id: 'settings',  label: 'Configuración',        icon: 'settings' },
];

const PAGE_TITLES = {
  dashboard: 'Inicio', connect: 'Conectar WhatsApp', upload: 'Subir manualmente',
  reports: 'Mis reportes', trends: 'Tendencias', settings: 'Configuración', help: 'Ayuda',
};

const userButtonAppearance = {
  variables: { colorPrimary: '#4f46e5', fontFamily: '"DM Sans", sans-serif', borderRadius: '10px' },
  elements: {
    avatarBox: { width: 36, height: 36, borderRadius: '50%' },
    userButtonPopoverCard: { boxShadow: '0 8px 40px rgba(14,7,73,0.15)', border: '1px solid #ededed', borderRadius: 14, fontFamily: '"DM Sans", sans-serif' },
    userButtonPopoverActionButton: { fontFamily: '"DM Sans", sans-serif', fontSize: 14 },
    userButtonPopoverActionButtonText: { fontFamily: '"DM Sans", sans-serif' },
    userButtonPopoverFooter: { display: 'none' },
    userPreviewMainIdentifier: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600, color: '#0e0749' },
    userPreviewSecondaryIdentifier: { fontFamily: '"DM Sans", sans-serif', color: 'rgba(14,7,73,0.5)' },
  },
};

const toTitleCase = (str) => str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

// ── Floating WhatsApp support button ─────────────────────────────────────────

const DASH_WA_NUMBER  = '573142601563';
const DASH_WA_MESSAGE = encodeURIComponent('Hola, soy usuario de DeepLook y tengo una duda 🙋');

const WA_SVG = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const DashWhatsAppButton = () => (
  <>
    <style>{`
      @keyframes dashWaPulse {
        0%   { transform: scale(1); opacity: 0.5; }
        70%  { transform: scale(1.55); opacity: 0; }
        100% { transform: scale(1.55); opacity: 0; }
      }
      @keyframes dashWaBounce {
        0%, 100% { transform: translateY(0); }
        40%       { transform: translateY(-6px); }
        60%       { transform: translateY(-3px); }
      }
      .dash-wa-widget { position: fixed; bottom: 24px; right: 24px; z-index: 999; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
      .dash-wa-bubble {
        background: white; border-radius: 18px 18px 4px 18px;
        padding: 16px 20px; box-shadow: 0 8px 32px rgba(14,7,73,0.15);
        max-width: 270px; border: 1px solid #ededed;
        animation: pageFade 400ms ease;
      }
      .dash-wa-bubble-name { font-size: 14px; font-weight: 700; color: #0e0749; font-family: 'DM Sans',sans-serif; margin-bottom: 4px; }
      .dash-wa-bubble-text { font-size: 13px; color: rgba(14,7,73,0.65); font-family: 'DM Sans',sans-serif; line-height: 1.6; }
      .dash-wa-bubble-dot  { display: inline-flex; gap: 3px; margin-top: 6px; }
      .dash-wa-bubble-dot span { width: 7px; height: 7px; background: #25d366; border-radius: 50%; animation: dashWaBounce 1.2s ease infinite; }
      .dash-wa-bubble-dot span:nth-child(2) { animation-delay: 0.15s; }
      .dash-wa-bubble-dot span:nth-child(3) { animation-delay: 0.30s; }
      .dash-wa-pill {
        display: flex; align-items: center; gap: 12px;
        background: #25d366; border-radius: 999px;
        padding: 12px 20px 12px 14px; text-decoration: none;
        box-shadow: 0 6px 28px rgba(37,211,102,0.55);
        transition: transform 200ms, box-shadow 200ms;
        cursor: pointer; position: relative;
      }
      .dash-wa-pill:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(37,211,102,0.65); }
      .dash-wa-pill-ring { position: absolute; inset: 0; border-radius: 999px; background: #25d366; animation: dashWaPulse 2.2s ease-out infinite; pointer-events: none; }
      .dash-wa-pill-text strong { font-size: 14px; font-weight: 700; color: white; font-family: 'DM Sans',sans-serif; line-height: 1.2; display: block; }
      .dash-wa-pill-text span   { font-size: 11px; color: rgba(255,255,255,0.8); font-family: 'DM Sans',sans-serif; }
      .dash-wa-status { width: 9px; height: 9px; background: white; border-radius: 50%; position: absolute; top: 10px; right: 10px; box-shadow: 0 0 0 2px #25d366; }
      @media (max-width: 640px) {
        .dash-wa-widget { bottom: 16px; right: 16px; }
        .dash-wa-pill   { padding: 11px 16px 11px 12px; gap: 10px; }
        .dash-wa-bubble { display: none; }
      }
    `}</style>
    <div className="dash-wa-widget">
      <div className="dash-wa-bubble">
        <div className="dash-wa-bubble-name">¿Necesitas ayuda? 💬</div>
        <div className="dash-wa-bubble-text">Escríbenos por WhatsApp y te respondemos en minutos.</div>
        <div className="dash-wa-bubble-dot"><span /><span /><span /></div>
      </div>
      <a href={`https://wa.me/${DASH_WA_NUMBER}?text=${DASH_WA_MESSAGE}`}
        target="_blank" rel="noopener noreferrer"
        className="dash-wa-pill" aria-label="Soporte por WhatsApp">
        <span className="dash-wa-pill-ring" />
        <span className="dash-wa-status" />
        {WA_SVG}
        <span className="dash-wa-pill-text">
          <strong>Soporte</strong>
          <span>Estamos en línea</span>
        </span>
      </a>
    </div>
  </>
);

const getDisplayName = (user) => {
  if (!user) return '…';
  const raw = [user.firstName, user.lastName].filter(Boolean).join(' ')
    || user.username
    || user.emailAddresses?.[0]?.emailAddress
    || '…';
  return toTitleCase(raw);
};

const SidebarUser = ({ onLanding }) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const displayName = getDisplayName(user);
  const businessName = user?.unsafeMetadata?.businessName;
  return (
    <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <UserButton
          userProfileMode="modal"
          afterSignOutUrl="/"
          appearance={userButtonAppearance}
        />
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
          {businessName && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{businessName}</div>}
        </div>
      </div>
      <button onClick={() => signOut({ redirectUrl: '/' }).then(() => onLanding())}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans,sans-serif', padding: 0, transition: 'color 200ms' }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
        <Icon name="logout" size={14} color="currentColor" /> Cerrar sesión
      </button>
    </div>
  );
};

const Sidebar = ({ page, onNavigate, onLanding, open, onClose }) => (
  <aside className={`dash-sidebar${open ? ' open' : ''}`}
    style={{ background: '#0e0749', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 50 }}>
    <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div onClick={onLanding} style={{ cursor: 'pointer' }}><DeepLookLogo dark={false} size="md" /></div>
      <button onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 4, display: 'flex' }}
        className="dash-hamburger"
        onMouseEnter={e => e.currentTarget.style.color = 'white'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
        <Icon name="x" size={18} color="currentColor" />
      </button>
    </div>
    <nav style={{ flex: 1, padding: '16px 12px' }}>
      {NAV_ITEMS.map(item => {
        const active = page === item.id;
        return (
          <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 8, border: 'none', background: active ? '#4f46e5' : 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: active ? 600 : 400, cursor: 'pointer', marginBottom: 4, textAlign: 'left', fontFamily: 'DM Sans,sans-serif', transition: 'background 200ms, color 200ms' }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'white'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}>
            <Icon name={item.icon} size={18} color={active ? 'white' : 'rgba(255,255,255,0.65)'} />
            {item.label}
            {item.id === 'trends' && (
              <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(167,139,250,0.25)', color: '#a78bfa', padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>PRO</span>
            )}
          </button>
        );
      })}
    </nav>
    <SidebarUser onLanding={onLanding} />
  </aside>
);

const TopBar = ({ page, onMenuOpen, client, onNavigate }) => (
  <header className="dash-topbar"
    style={{ position: 'fixed', top: 0, height: 68, background: 'white', borderBottom: '1px solid #ededed', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', zIndex: 40 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <button className="dash-hamburger" onClick={onMenuOpen}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#0e0749', display: 'flex', alignItems: 'center', borderRadius: 8, transition: 'background 200ms' }}
        onMouseEnter={e => e.currentTarget.style.background = '#f4f3ff'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        <Icon name="menu" size={22} color="#0e0749" />
      </button>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', letterSpacing: '-0.01em' }}>{PAGE_TITLES[page] || 'Dashboard'}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <NotificationBell onNavigate={onNavigate} />
      <div style={{ background: '#4f46e5', color: 'white', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999 }}>
        {PLAN_LABELS[client?.plan] ?? 'Plan Gratis'}
      </div>
    </div>
  </header>
);

const LoadingMain = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 320 }}>
    <div style={{ width: 36, height: 36, border: '3px solid #ededed', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  </div>
);

const PLAN_LABELS = { free: 'Plan Gratis', basic: 'Plan Básico', plus: 'Plan Plus', enterprise: 'Plan Enterprise' };

const Dashboard = ({ page, onNavigate, onLanding }) => {
  const api = useApiClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // null = loading, false = no client yet, object = client profile
  const [client, setClient] = useState(null);
  // undefined = loading, null = no connection, object = connection
  const [connection, setConnection] = useState(undefined);
  // null = loading, [] = no jobs, [...] = jobs list
  const [jobs, setJobs] = useState(null);
  // undefined = still fetching (wait for jobs first), null = no results, object = latest results
  const [latestResults, setLatestResults] = useState(undefined);
  // null = not yet loaded, object = quota data
  const [quota, setQuota] = useState(null);
  // true = show plan selection after onboarding
  const [showPlanModal, setShowPlanModal] = useState(false);

  const refreshQuota = () => {
    api.get('/api/v1/billing/quota')
      .then(setQuota)
      .catch(() => {});
  };

  useEffect(() => {
    // All four fire in parallel on mount
    api.get('/api/v1/clients')
      .then((clients) => setClient(clients[0] ?? false))
      .catch(() => setClient(false));

    api.get('/api/v1/whatsapp/connections')
      .then((conns) => setConnection(conns[0] ?? null))
      .catch(() => setConnection(null));

    api.get('/api/v1/jobs')
      .then(data => {
        const all = Array.isArray(data) ? data : [];
        setJobs(all);
        const latest = all
          .filter(j => j.status === 'completed')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        if (latest) {
          api.get(`/api/v1/jobs/${latest.job_id}/results`)
            .then(r => setLatestResults(r))
            .catch(() => setLatestResults(null));
        } else {
          setLatestResults(null);
        }
      })
      .catch(() => { setJobs([]); setLatestResults(null); });

    api.get('/api/v1/billing/quota')
      .then(setQuota)
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderPage = () => {
    if (client === null) return <LoadingMain />;
    switch (page) {
      case 'dashboard': return <DashHome onNavigate={onNavigate} connection={connection} jobs={jobs} latestResults={latestResults} quota={quota} onShowPlanModal={() => setShowPlanModal(true)} />;
      case 'connect':   return <DashConnect client={client || null} connection={connection} onConnectionUpdate={setConnection} onNavigate={onNavigate} quota={quota} onQuotaRefresh={refreshQuota} />;
      case 'upload':    return <DashUpload clientId={client ? client.id : null} quota={quota} onShowPlanModal={() => setShowPlanModal(true)} />;
      case 'reports':   return <DashReports onNavigate={onNavigate} jobs={jobs} onJobsUpdate={setJobs} quota={quota} onShowPlanModal={() => setShowPlanModal(true)} />;
      case 'trends':    return <DashTrends plan={client?.plan} onNavigate={onNavigate} onShowPlanModal={() => setShowPlanModal(true)} />;
      case 'settings':  return <DashSettings client={client || null} onClientUpdate={setClient} connection={connection} onConnectionUpdate={setConnection} quota={quota} onShowPlanModal={() => setShowPlanModal(true)} />;
      case 'help':      return <DashHelp />;
      default:          return <DashHome onNavigate={onNavigate} connection={connection} quota={quota} onShowPlanModal={() => setShowPlanModal(true)} />;
    }
  };

  return (
    <NotificationProvider onNavigate={onNavigate}>
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f7fc' }}>
      {/* Onboarding — blocks dashboard until profile is complete */}
      {client === false && (
        <OnboardingModal onComplete={(newClient) => {
          setClient(newClient);
          // Right after onboarding, invite free users to pick a plan
          if (!newClient?.plan || newClient.plan === 'free') {
            setShowPlanModal(true);
          }
        }} />
      )}

      {/* Plan selection — shown after onboarding for free users, or manually triggered */}
      {showPlanModal && client && (
        <PlanSelectionModal
          onClose={() => setShowPlanModal(false)}
          onPlanActivated={(updatedClient) => {
            setClient(updatedClient);
            setShowPlanModal(false);
          }}
        />
      )}

      <div className={`dash-overlay${sidebarOpen ? ' visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar page={page} onNavigate={onNavigate} onLanding={onLanding} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dash-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
        <TopBar page={page} onMenuOpen={() => setSidebarOpen(true)} client={client || null} onNavigate={onNavigate} />
        <RenewalBanner quota={quota} onRenew={() => setShowPlanModal(true)} />
        <main style={{ marginTop: 68, flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {renderPage()}
        </main>
      </div>
      <DashWhatsAppButton />
    </div>
    </NotificationProvider>
  );
};

export default Dashboard;
