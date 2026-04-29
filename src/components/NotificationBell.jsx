import { useState, useEffect, useRef } from 'react';
import { useNotifications } from './NotificationContext';
import { Icon } from './Icons';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'justo ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)} días`;
};

const TYPE_CFG = {
  report_ready: { color: '#22c55e', label: 'Reporte listo' },
  report_failed: { color: '#ef4444', label: 'Error en análisis' },
  sync_failed:   { color: '#f97316', label: 'Error de sincronización' },
};

const NotificationBell = ({ onNavigate }) => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleItemClick = (n) => {
    if (!n.is_read) markRead(n.id);
    if (n.type === 'report_ready') onNavigate?.('reports');
    setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: open ? '#f4f3ff' : 'none',
          border: 'none', cursor: 'pointer',
          padding: 8, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', transition: 'background 150ms',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = '#f4f3ff'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'none'; }}
        aria-label="Notificaciones"
      >
        <Icon name="bell" size={20} color={open ? '#4f46e5' : '#0e0749'} style={{ opacity: open ? 1 : 0.7 }} />

        {unreadCount > 0 ? (
          <div style={{
            position: 'absolute', top: 4, right: 4,
            minWidth: 16, height: 16, background: '#ef4444', borderRadius: 999,
            border: '2px solid white', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white',
            padding: '0 3px',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        ) : (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, background: '#4f46e5', borderRadius: '50%',
            border: '1.5px solid white',
          }} />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: -8,
          width: 360, background: 'white', borderRadius: 16,
          boxShadow: '0 8px 40px rgba(14,7,73,0.16)',
          border: '1px solid #ebebf5', zIndex: 200,
          overflow: 'hidden',
          animation: 'panelFadeIn 0.18s ease',
        }}>
          <style>{`
            @keyframes panelFadeIn {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            padding: '15px 20px 13px', borderBottom: '1px solid #f0f0f8',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0e0749' }}>Notificaciones</span>
              {unreadCount > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: 'white',
                  background: '#ef4444', borderRadius: 999, padding: '2px 7px',
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: '#4f46e5', fontWeight: 600, padding: 0,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Marcar todo leído
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '44px 20px', textAlign: 'center' }}>
                <div style={{
                  width: 48, height: 48, background: '#f4f3ff', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <Icon name="bell" size={22} color="#4f46e5" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0e0749', marginBottom: 4 }}>
                  Sin notificaciones
                </div>
                <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.4)', lineHeight: 1.5 }}>
                  Te avisaremos cuando un reporte esté listo.
                </div>
              </div>
            ) : notifications.map((n, idx) => {
              const cfg = TYPE_CFG[n.type] || { color: '#4f46e5', label: n.type };
              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  style={{
                    padding: '13px 20px',
                    cursor: 'pointer',
                    borderBottom: idx < notifications.length - 1 ? '1px solid #f5f5fa' : 'none',
                    background: n.is_read ? 'white' : '#fafaff',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f4f3ff'}
                  onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'white' : '#fafaff'}
                >
                  {/* Status dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: n.is_read ? '#d1d5db' : cfg.color,
                    marginTop: 5, flexShrink: 0,
                    transition: 'background 200ms',
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: n.is_read ? 500 : 700,
                      color: n.is_read ? 'rgba(14,7,73,0.55)' : '#0e0749',
                      marginBottom: 3, lineHeight: 1.3,
                    }}>
                      {n.title}
                    </div>
                    <div style={{
                      fontSize: 12, color: 'rgba(14,7,73,0.5)', lineHeight: 1.45,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {n.body}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(14,7,73,0.3)', marginTop: 5 }}>
                      {timeAgo(n.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
