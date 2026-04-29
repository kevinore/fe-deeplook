import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useApiClient } from '../lib/api';

export const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

const POLL_INTERVAL_MS = 30_000;
const TOAST_DURATION = 5500;

const TYPE_CFG = {
  report_ready: { color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', icon: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )},
  report_failed: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )},
  sync_failed: { color: '#f97316', bg: '#fff7ed', border: '#fed7aa', icon: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  )},
  payment_declined: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
      <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  )},
};

const ToastItem = ({ toast, onDismiss, onMarkRead, onNavigate }) => {
  const [visible, setVisible] = useState(false);
  const cfg = TYPE_CFG[toast.type] || TYPE_CFG.report_ready;

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.toastId), 320);
  }, [toast.toastId, onDismiss]);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 30);
    const hide = setTimeout(dismiss, TOAST_DURATION);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [dismiss]);

  const handleClick = () => {
    onMarkRead(toast.id);
    if (toast.type === 'report_ready') onNavigate?.('reports');
    if (toast.type === 'payment_declined') onNavigate?.('settings');
    dismiss();
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `4px solid ${cfg.color}`,
        borderRadius: 12,
        padding: '13px 14px',
        display: 'flex', gap: 11, alignItems: 'flex-start',
        cursor: 'pointer',
        boxShadow: '0 4px 24px rgba(14,7,73,0.13)',
        width: 340,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(48px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: '50%', background: cfg.color, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
      }}>
        {cfg.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0e0749', marginBottom: 2, lineHeight: 1.3 }}>
          {toast.title}
        </div>
        <div style={{
          fontSize: 12, color: 'rgba(14,7,73,0.6)', lineHeight: 1.45,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {toast.body}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
          color: 'rgba(14,7,73,0.35)', flexShrink: 0, lineHeight: 1,
          fontSize: 16, fontFamily: 'sans-serif',
        }}
      >
        ×
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, onDismiss, onMarkRead, onNavigate }) => {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', top: 80, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.slice(0, 4).map(t => (
        <div key={t.toastId} style={{ pointerEvents: 'auto' }}>
          <ToastItem
            toast={t}
            onDismiss={onDismiss}
            onMarkRead={onMarkRead}
            onNavigate={onNavigate}
          />
        </div>
      ))}
    </div>
  );
};

export const NotificationProvider = ({ children, onNavigate }) => {
  const api = useApiClient();
  const apiRef = useRef(api);
  useEffect(() => { apiRef.current = api; }, [api]);

  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const initialLoadDone = useRef(false);
  const seenIds = useRef(new Set());

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiRef.current.get('/api/v1/notifications?limit=20');

      if (initialLoadDone.current) {
        const fresh = data.filter(n => !n.is_read && !seenIds.current.has(n.id));
        if (fresh.length > 0) {
          setToasts(prev => [
            ...fresh.map(n => ({ ...n, toastId: n.id })),
            ...prev,
          ]);
        }
      }

      data.forEach(n => seenIds.current.add(n.id));
      setNotifications(data);
      initialLoadDone.current = true;
    } catch {}
  }, []); // stable — reads api via ref

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = useCallback(async (id) => {
    try {
      await apiRef.current.patch(`/api/v1/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setToasts(prev => prev.filter(t => t.toastId !== id));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiRef.current.post('/api/v1/notifications/read-all', { body: {} });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, markRead, markAllRead, refresh: fetchNotifications,
    }}>
      {children}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        onMarkRead={markRead}
        onNavigate={onNavigate}
      />
    </NotificationContext.Provider>
  );
};
