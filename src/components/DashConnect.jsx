import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from './Icons';
import { useApiClient } from '../lib/api';
import QRCode from 'qrcode';

// ── Utilities ──────────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'justo ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)} días`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtCountdown = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const STATUS_CONFIG = {
  WORKING:                  { label: 'Conectado',       color: '#166534', bg: '#dcfce7', dot: '#22c55e' },
  STOPPED:                  { label: 'En pausa',         color: '#1e40af', bg: '#dbeafe', dot: '#60a5fa' },
  SCAN_QR_CODE:             { label: 'Escanear QR',     color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
  STARTING:                 { label: 'Iniciando…',      color: '#5b21b6', bg: '#ede9fe', dot: '#a78bfa' },
  CHECKING_ACCOUNT:         { label: 'Verificando…',    color: '#5b21b6', bg: '#ede9fe', dot: '#a78bfa' },
  FAILED:                   { label: 'Error',           color: '#991b1b', bg: '#fee2e2', dot: '#f87171' },
  PERSONAL_ACCOUNT_BLOCKED: { label: 'Solo Biz',        color: '#92400e', bg: '#fff7ed', dot: '#f97316' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#374151', bg: '#f3f4f6', dot: '#9ca3af' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: cfg.bg, fontSize: 11, fontWeight: 700, color: cfg.color, letterSpacing: '0.02em' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

const Spinner = ({ size = 24, color = '#4f46e5' }) => (
  <div style={{ width: size, height: size, border: `2.5px solid rgba(79,70,229,0.15)`, borderTopColor: color, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
);

const Avatar = ({ name, size = 44 }) => {
  const initials = (name || 'WA').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: 12, background: 'linear-gradient(135deg,#4f46e5,#7c72f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }}>
      <span style={{ fontSize: size * 0.36, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{initials}</span>
    </div>
  );
};

// ── QR display ─────────────────────────────────────────────────────────────

const QRDisplay = ({ connectionId, api, onConnected }) => {
  const [qr, setQr] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(20);
  const refs = useRef({});

  const fetchQr = useCallback(async () => {
    try {
      const data = await api.get(`/api/v1/whatsapp/connections/${connectionId}/qr`);
      if (data.qr_base64) {
        setQr(data.qr_base64.startsWith('data:') ? data.qr_base64 : `data:image/png;base64,${data.qr_base64}`);
        setSecondsLeft(20);
      }
    } catch (err) {
      // 425 = session still starting (NOWEB Chromium loading) — silently retry in 3s
      if (err.status === 425) {
        setTimeout(fetchQr, 3000);
      }
      // 409 ALREADY_CONNECTED = scanned while we were waiting → status poll will catch it
      // All other errors: just leave the spinner showing, next 20s interval will retry
    }
  }, [connectionId]);

  useEffect(() => {
    fetchQr();
    refs.current.qr = setInterval(fetchQr, 20_000);
    refs.current.cd = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1_000);
    refs.current.st = setInterval(async () => {
      try {
        const s = await api.get(`/api/v1/whatsapp/connections/${connectionId}/status`);
        if (s.status === 'WORKING' || s.status === 'CHECKING_ACCOUNT') {
          Object.values(refs.current).forEach(clearInterval);
          onConnected(s);
        }
      } catch {}
    }, 2_000);
    return () => Object.values(refs.current).forEach(clearInterval);
  }, [connectionId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {qr ? (
        <div style={{ padding: 10, background: '#fff', borderRadius: 14, border: '1.5px solid rgba(79,70,229,0.12)', boxShadow: '0 4px 16px rgba(79,70,229,0.08)' }}>
          <img src={qr} alt="QR" style={{ width: 180, height: 180, display: 'block', borderRadius: 6 }} />
        </div>
      ) : (
        <div style={{ width: 200, height: 200, background: '#f4f3ff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size={32} />
        </div>
      )}
      <span style={{ fontSize: 11, color: 'rgba(14,7,73,0.4)', fontWeight: 500 }}>Se renueva en {secondsLeft}s</span>
    </div>
  );
};

// ── Phone-code authentication ──────────────────────────────────────────────

const PhoneCodeDisplay = ({ connectionId, api, onConnected, onSwitchToQr }) => {
  // step: 'phone'       → user enters their WhatsApp number
  //       'show'        → we display the pairing code for the user to enter in WhatsApp Business
  //       'unavailable' → WAHA engine incompatible with phone-code method
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('57');
  const [pairingCode, setPairingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const refs = useRef({});

  // Poll status exactly like QRDisplay — fires auto-sync on WORKING transition.
  // Starts polling immediately so we catch the WORKING state the moment the
  // user enters the pairing code in their WhatsApp Business app.
  useEffect(() => {
    refs.current.st = setInterval(async () => {
      try {
        const s = await api.get(`/api/v1/whatsapp/connections/${connectionId}/status`);
        if (s.status === 'WORKING' || s.status === 'CHECKING_ACCOUNT') {
          Object.values(refs.current).forEach(clearInterval);
          onConnected(s);
        }
      } catch {}
    }, 2_000);
    return () => Object.values(refs.current).forEach(clearInterval);
  }, [connectionId]);

  const requestCode = async () => {
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length < 7) { setError('Ingresa un número válido con código de país.'); return; }
    setLoading(true); setError('');
    try {
      const data = await api.post(
        `/api/v1/whatsapp/connections/${connectionId}/auth/request-code`,
        { body: { phone_number: digits } },
      );
      setPairingCode(data.pairing_code);
      setStep('show');
    } catch (e) {
      // 503 PHONE_CODE_UNAVAILABLE = WAHA WEBJS engine incompatible with current WhatsApp Web
      if (e.status === 503 || e.data?.code === 'PHONE_CODE_UNAVAILABLE') {
        setStep('unavailable');
      } else {
        setError(e.data?.message || e.message || 'No se pudo obtener el código. Intenta de nuevo.');
      }
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1.5px solid rgba(79,70,229,0.2)',
    borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box',
    fontFamily: '"DM Sans",sans-serif', background: '#fff',
  };

  return (
    <div style={{ width: '100%' }}>

      {step === 'unavailable' && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#0e0749', margin: '0 0 8px' }}>
            Código de teléfono no disponible
          </p>
          <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.5)', margin: '0 0 16px', lineHeight: 1.55 }}>
            Esta función requiere una versión actualizada de WAHA. Usa el código QR para vincular tu cuenta — funciona perfectamente.
          </p>
          <button
            onClick={onSwitchToQr}
            style={{ padding: '9px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            📷 Usar código QR
          </button>
        </div>
      )}

      {step === 'phone' && (
        <>
          <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.55)', margin: '0 0 10px', lineHeight: 1.5 }}>
            Ingresa el número de WhatsApp Business que quieres vincular.
          </p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
            <input
              value="+"
              readOnly
              style={{ ...inputStyle, width: 32, textAlign: 'center', color: 'rgba(14,7,73,0.4)', padding: '10px 6px', flexShrink: 0 }}
            />
            <input
              autoFocus
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ''))}
              onKeyDown={e => e.key === 'Enter' && requestCode()}
              placeholder="573178881502"
              style={{ ...inputStyle, flex: 1 }}
              onFocus={e => { e.target.style.borderColor = '#4f46e5'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(79,70,229,0.2)'; }}
            />
          </div>
          <p style={{ fontSize: 11, color: 'rgba(14,7,73,0.35)', margin: '0 0 8px' }}>
            Código de país + número sin espacios. Ej: 573178881502
          </p>
          {error && (
            <p style={{ fontSize: 12, color: '#dc2626', margin: '0 0 8px', background: '#fee2e2', borderRadius: 8, padding: '6px 10px' }}>{error}</p>
          )}
          <button
            onClick={requestCode}
            disabled={loading || phone.replace(/\D/g, '').length < 7}
            style={{ width: '100%', padding: '10px 0', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading || phone.replace(/\D/g,'').length < 7 ? 0.6 : 1 }}
          >
            {loading ? 'Generando código…' : 'Obtener código de vinculación'}
          </button>
        </>
      )}

      {step === 'show' && (
        <>
          {/* The pairing code — big, easy to read and copy */}
          <div style={{ background: '#fff', border: '2px solid #4f46e5', borderRadius: 14, padding: '18px 14px', marginBottom: 14, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'rgba(14,7,73,0.45)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Tu código de vinculación
            </p>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#4f46e5', letterSpacing: '0.15em', fontFamily: '"JetBrains Mono",monospace', marginBottom: 8 }}>
              {pairingCode}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(pairingCode)}
              style={{ background: 'none', border: 'none', color: 'rgba(14,7,73,0.4)', fontSize: 11, cursor: 'pointer', padding: 0 }}
            >
              📋 Copiar
            </button>
          </div>

          {/* Step-by-step instructions */}
          <div style={{ background: '#f8f7ff', borderRadius: 11, padding: '12px 14px', marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0e0749', margin: '0 0 8px' }}>
              Ingresa el código en WhatsApp Business:
            </p>
            {[
              'Abre WhatsApp Business en tu teléfono',
              'Toca los tres puntos (⋮) → Dispositivos vinculados',
              'Toca "Vincular dispositivo"',
              'Toca "Usar número de teléfono" (debajo del QR)',
              `Ingresa el código: ${pairingCode}`,
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 12, color: '#0e0749', lineHeight: 1.45 }}>{step}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(14,7,73,0.4)' }}>
            <Spinner size={12} color="#4f46e5" />
            <span>Esperando que ingreses el código en WhatsApp…</span>
          </div>

          <button
            onClick={() => { setStep('phone'); setPairingCode(''); setError(''); }}
            style={{ width: '100%', padding: '8px 0', background: 'none', border: 'none', color: 'rgba(14,7,73,0.4)', fontSize: 12, cursor: 'pointer', marginTop: 10 }}
          >
            ← Usar otro número
          </button>
        </>
      )}

    </div>
  );
};

// ── Modals ─────────────────────────────────────────────────────────────────

const Overlay = ({ children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,7,73,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
    {children}
  </div>
);

const ModalCard = ({ children, maxWidth = 460 }) => (
  <div style={{ background: '#fff', borderRadius: 20, padding: '32px', maxWidth, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', position: 'relative' }}>
    {children}
  </div>
);

const ShareModal = ({ connectionId, displayName, api, onClose }) => {
  const [shareUrl, setShareUrl] = useState(null);
  const [metaQr, setMetaQr] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const cdRef = useRef(null);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.post(`/api/v1/whatsapp/connections/${connectionId}/share-token`);
      setShareUrl(data.url);
      const diff = Math.floor((new Date(data.expires_at) - Date.now()) / 1000);
      setSecondsLeft(Math.max(0, diff));
      const qrUrl = await QRCode.toDataURL(data.url, { width: 140, margin: 1, color: { dark: '#0e0749', light: '#ffffff' } });
      setMetaQr(qrUrl);
    } catch {}
    setLoading(false);
  }, [connectionId]);

  useEffect(() => { generate(); }, [generate]);

  useEffect(() => {
    if (secondsLeft === null) return;
    cdRef.current = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1_000);
    return () => clearInterval(cdRef.current);
  }, [secondsLeft !== null]);

  const copy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  return (
    <Overlay>
      <ModalCard maxWidth={500}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: '#f4f4f6', border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={16} color="rgba(14,7,73,0.5)" />
        </button>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0e0749', margin: '0 0 6px' }}>Compartir código QR</h3>
          <p style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)', margin: 0, lineHeight: 1.5 }}>
            Envía este enlace a <strong style={{ color: '#0e0749' }}>{displayName}</strong> — no necesita acceso a DeepLook.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0' }}><Spinner size={36} /></div>
        ) : shareUrl ? (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input readOnly value={shareUrl} style={{ flex: 1, padding: '10px 12px', background: '#f8f7ff', border: '1.5px solid rgba(79,70,229,0.15)', borderRadius: 10, fontSize: 12, color: '#4f46e5', outline: 'none', fontFamily: '"JetBrains Mono",monospace', minWidth: 0 }} />
              <button onClick={copy} style={{ padding: '10px 16px', background: copied ? '#22c55e' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s', flexShrink: 0 }}>
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 16, background: '#f8f7ff', borderRadius: 14, padding: '16px', marginBottom: 14, alignItems: 'center' }}>
              {metaQr && <img src={metaQr} alt="QR del enlace" style={{ width: 70, height: 70, borderRadius: 8, flexShrink: 0 }} />}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0e0749', margin: '0 0 4px' }}>Escanea con la cámara</p>
                <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.5)', margin: 0, lineHeight: 1.55 }}>
                  El QR pequeño abre el portal. Desde ahí el receptor escanea el QR grande con WhatsApp.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(14,7,73,0.4)', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
              <span>⏱ Caduca en <strong style={{ color: '#0e0749' }}>{secondsLeft !== null ? fmtCountdown(secondsLeft) : '—'}</strong></span>
              <button onClick={generate} style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Regenerar</button>
            </div>
          </div>
        ) : (
          <p style={{ color: '#dc2626', fontSize: 13 }}>No se pudo generar el enlace.</p>
        )}
      </ModalCard>
    </Overlay>
  );
};

const RenameModal = ({ connectionId, currentName, api, onRenamed, onClose }) => {
  const [name, setName] = useState(currentName || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try { onRenamed(await api.patch(`/api/v1/whatsapp/connections/${connectionId}`, { body: { display_name: name.trim() } })); }
    catch {}
    setSaving(false);
  };

  return (
    <Overlay>
      <ModalCard maxWidth={400}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0e0749', marginBottom: 14 }}>Renombrar cuenta</h3>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()} maxLength={100}
          placeholder="Ej: Juan — Ventas Norte"
          style={{ width: '100%', padding: '11px 14px', border: '2px solid rgba(79,70,229,0.25)', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: '"DM Sans",sans-serif', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>Cancelar</button>
          <button onClick={save} disabled={!name.trim() || saving} className="btn-primary" style={{ padding: '10px 22px', fontSize: 14 }}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </ModalCard>
    </Overlay>
  );
};

const UnlinkModal = ({ connectionId, displayName, api, onUnlinked, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const unlink = async () => {
    setLoading(true); setError('');
    try { await api.delete(`/api/v1/whatsapp/connections/${connectionId}`); onUnlinked(connectionId); }
    catch (e) { setError(e.message || 'Error al desvincular'); setLoading(false); }
  };

  return (
    <Overlay>
      <ModalCard maxWidth={400}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Icon name="x" size={20} color="#dc2626" />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0e0749', marginBottom: 8 }}>Desvincular cuenta</h3>
        <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.55)', lineHeight: 1.6, marginBottom: 20 }}>
          ¿Seguro que deseas desvincular <strong>{displayName || 'esta cuenta'}</strong>?<br />
          Se cerrará la sesión en WhatsApp y no podrás generar más reportes de esta cuenta.
        </p>
        {error && <p style={{ color: '#dc2626', fontSize: 13, background: '#fee2e2', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={loading} style={{ padding: '10px 20px', background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>Cancelar</button>
          <button onClick={unlink} disabled={loading} style={{ padding: '10px 22px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Desvinculando…' : 'Sí, desvincular'}
          </button>
        </div>
      </ModalCard>
    </Overlay>
  );
};

const NewConnectionModal = ({ api, onCreated, onClose }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const create = async () => {
    if (!name.trim()) return;
    setLoading(true); setError('');
    try { onCreated(await api.post('/api/v1/whatsapp/connections', { body: { display_name: name.trim() } })); }
    catch (e) {
      const code = e.data?.code;
      setError(
        code === 'MULTI_SESSION_REQUIRED' ? 'Tu servidor WAHA no permite múltiples cuentas (activa WAHA_MULTI_SESSION=true).'
        : code === 'PAYMENT_REQUIRED' ? 'Necesitas un plan activo para conectar WhatsApp.'
        : e.message || 'Error al crear la conexión'
      );
      setLoading(false);
    }
  };

  return (
    <Overlay>
      <ModalCard maxWidth={440}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: '#f4f4f6', border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={16} color="rgba(14,7,73,0.5)" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(135deg,#4f46e5,#7c72f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }}>
            <Icon name="whatsapp" size={22} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0e0749', margin: '0 0 3px' }}>Agregar cuenta de WhatsApp</h3>
            <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', margin: 0 }}>Asígnale un nombre para identificarla fácilmente</p>
          </div>
        </div>

        <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(14,7,73,0.6)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Nombre de la cuenta
        </label>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()} maxLength={100}
          placeholder="Ej: Tienda Central, Juan - Ventas Norte…"
          style={{ width: '100%', padding: '12px 14px', border: '2px solid rgba(79,70,229,0.2)', borderRadius: 11, fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: '"DM Sans",sans-serif', transition: 'border-color 0.2s' }}
          onFocus={e => { e.target.style.borderColor = '#4f46e5'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(79,70,229,0.2)'; }}
        />
        <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.4)', margin: '6px 0 20px' }}>Este nombre aparece en los reportes PDF. Puedes cambiarlo después.</p>

        {error && (
          <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={loading} style={{ padding: '11px 20px', background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>Cancelar</button>
          <button onClick={create} disabled={!name.trim() || loading} className="btn-primary" style={{ padding: '11px 26px', fontSize: 14 }}>
            {loading ? 'Creando…' : 'Crear y conectar'}
          </button>
        </div>
      </ModalCard>
    </Overlay>
  );
};

// ── Connection Card ────────────────────────────────────────────────────────

const ConnectionCard = ({ conn, api, onUpdated, onUnlinked, onSync, quota, initialLoad = false }) => {
  const [showQr, setShowQr] = useState(false);
  const [authMethod, setAuthMethod] = useState('qr');  // 'qr' | 'phone'
  const [showShare, setShowShare] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showUnlink, setShowUnlink] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // justConnected: set when QR/code scan completes. Acts as bridge while
  // _auto_sync_on_connect is waiting for WAHA store (up to 5 min). Cleared
  // once backend reports an active job or a sync has completed.
  const [justConnected, setJustConnected] = useState(false);
  const menuRef = useRef(null);

  const isConnected = conn.status === 'WORKING' || conn.status === 'STOPPED';
  const needsQr     = conn.status === 'SCAN_QR_CODE' || conn.status === 'STARTING';
  const isBlocked   = conn.status === 'PERSONAL_ACCOUNT_BLOCKED';
  const isFailed    = conn.status === 'FAILED';
  const displayName = conn.display_name || conn.push_name || `Cuenta ${conn.phone_number || ''}`;

  // Derived sync state — cleared once backend confirms the active job
  const activelySyncing = justConnected || conn.active_job_status === 'pending' || conn.active_job_status === 'processing';

  // Clear justConnected bridge once backend reports the job (or it has already completed)
  useEffect(() => {
    if (conn.active_job_status === 'pending' || conn.active_job_status === 'processing') {
      setJustConnected(false);
    }
  }, [conn.active_job_status]);

  // Per-connection quota — comes from the backend on every connections refresh.
  // Falls back to the parent quota prop if backend hasn't populated it yet.
  const quotaExhausted = conn.reports_remaining != null
    ? conn.reports_remaining === 0
    : (quota != null && quota.reports_remaining === 0);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  const handleSync = async () => {
    setSyncing(true);
    try { await onSync(conn.id); } catch {}
    setSyncing(false);
  };

  const handleConnected = (s) => {
    setShowQr(false);
    setJustConnected(true); // auto-sync fires immediately; bridge until backend reports the job
    onUpdated({ ...conn, status: s.status, phone_number: s.phone_number });
  };

  return (
    <>
      <div style={{
        background: '#fff',
        borderRadius: 18,
        border: `1.5px solid ${needsQr ? 'rgba(245,158,11,0.35)' : isBlocked || isFailed ? 'rgba(220,38,38,0.2)' : 'rgba(79,70,229,0.1)'}`,
        boxShadow: '0 1px 8px rgba(14,7,73,0.05)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(79,70,229,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 8px rgba(14,7,73,0.05)'; e.currentTarget.style.transform = ''; }}
      >
        {/* Card header */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <Avatar name={displayName} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0e0749', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </div>
              {conn.phone_number && (
                <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.4)', marginBottom: 5, fontFamily: '"JetBrains Mono",monospace' }}>
                  +{conn.phone_number}
                </div>
              )}
              <StatusBadge status={conn.status} />
            </div>
            {/* Kebab */}
            <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setMenuOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 7, color: 'rgba(14,7,73,0.3)', display: 'flex' }}>
                <Icon name="more_vertical" size={16} color="rgba(14,7,73,0.35)" />
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)', zIndex: 20, minWidth: 150, overflow: 'hidden' }}>
                  <button onClick={() => { setShowRename(true); setMenuOpen(false); }} style={{ display: 'block', width: '100%', padding: '10px 15px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#0e0749', fontFamily: '"DM Sans",sans-serif' }}>
                    ✏️ &nbsp;Renombrar
                  </button>
                  <button onClick={() => { setShowUnlink(true); setMenuOpen(false); }} style={{ display: 'block', width: '100%', padding: '10px 15px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#dc2626', fontFamily: '"DM Sans",sans-serif' }}>
                    🔗 &nbsp;Desvincular
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sync info */}
          {isConnected && (conn.last_sync_at || conn.next_scheduled_sync_at) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: 12, color: 'rgba(14,7,73,0.4)', marginBottom: 14 }}>
              {conn.last_sync_at && <span>Último sync: <strong style={{ color: 'rgba(14,7,73,0.65)' }}>{timeAgo(conn.last_sync_at)}</strong></span>}
              {conn.next_scheduled_sync_at && <span>Próx.: <strong style={{ color: 'rgba(14,7,73,0.65)' }}>{formatDate(conn.next_scheduled_sync_at)}</strong></span>}
            </div>
          )}

          {/* Personal account warning */}
          {isBlocked && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '10px 13px', marginBottom: 14, fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
              ⚠️ Necesitas una cuenta de <strong>WhatsApp Business</strong> para conectar.
            </div>
          )}

          {/* Auth panel (QR or phone-code) */}
          {showQr && needsQr && (
            <div style={{ background: '#f8f7ff', borderRadius: 12, padding: '16px', marginBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.55)', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                  WhatsApp → Ajustes → Dispositivos vinculados → Vincular dispositivo
                </p>
                <QRDisplay connectionId={conn.id} api={api} onConnected={handleConnected} />
              </div>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div style={{ padding: '12px 20px 20px', display: 'flex', gap: 8 }}>

          {/* QR / pairing buttons */}
          {needsQr && (
            <button onClick={() => setShowQr(s => !s)} className="btn-primary" style={{ flex: 1, padding: '9px 14px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name="qr_code" size={14} color="#fff" />
              {showQr ? 'Ocultar' : 'Vincular cuenta'}
            </button>
          )}
          {needsQr && (
            <button onClick={() => setShowShare(true)} style={{ flex: 1, padding: '9px 14px', fontSize: 13, background: '#f4f3ff', border: '1.5px solid rgba(79,70,229,0.18)', borderRadius: 10, cursor: 'pointer', fontWeight: 600, color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name="share" size={13} color="#4f46e5" />
              Compartir
            </button>
          )}

          {/* Sync / report button — 4 states + loading guard */}
          {isConnected && (() => {
            // While the initial fetch is in flight, show a neutral spinner so
            // the button never flashes "Generar reporte" before accurate state arrives.
            if (initialLoad) {
              return (
                <div style={{ flex: 1, padding: '9px 14px', fontSize: 13, background: '#f4f3ff', border: '1.5px solid rgba(79,70,229,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'default' }}>
                  <Spinner size={13} color="rgba(79,70,229,0.4)" />
                </div>
              );
            }
            // STATE 1 — active sync in progress (auto or manual): spinner, not clickable
            if (activelySyncing || syncing) {
              return (
                <div style={{ flex: 1, padding: '9px 14px', fontSize: 13, background: '#f4f3ff', border: '1.5px solid rgba(79,70,229,0.12)', borderRadius: 10, fontWeight: 600, color: 'rgba(79,70,229,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'default', userSelect: 'none' }}>
                  <Spinner size={13} color="#4f46e5" />
                  {conn.active_job_status === 'processing' ? 'Generando reporte…' : 'Sincronizando…'}
                </div>
              );
            }
            // STATE 2 — quota exhausted: hide button entirely
            if (quotaExhausted) {
              return (
                <div style={{ flex: 1, padding: '9px 14px', fontSize: 12, color: 'rgba(14,7,73,0.38)', textAlign: 'center', fontStyle: 'italic' }}>
                  Sin reportes disponibles este período
                </div>
              );
            }
            // STATE 3 — ready to sync
            return (
              <button onClick={handleSync} style={{ flex: 1, padding: '9px 14px', fontSize: 13, background: '#f4f3ff', border: '1.5px solid rgba(79,70,229,0.18)', borderRadius: 10, cursor: 'pointer', fontWeight: 600, color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name="zap" size={13} color="#4f46e5" />
                Generar reporte
              </button>
            );
          })()}

          {isFailed && (
            <button onClick={() => setShowQr(true)} className="btn-primary" style={{ flex: 1, padding: '9px 14px', fontSize: 13 }}>Reintentar</button>
          )}
        </div>
      </div>

      {showShare  && <ShareModal  connectionId={conn.id} displayName={displayName} api={api} onClose={() => setShowShare(false)} />}
      {showRename && <RenameModal connectionId={conn.id} currentName={conn.display_name || ''} api={api} onRenamed={(u) => { onUpdated(u); setShowRename(false); }} onClose={() => setShowRename(false)} />}
      {showUnlink && <UnlinkModal connectionId={conn.id} displayName={displayName} api={api} onUnlinked={(id) => { onUnlinked(id); setShowUnlink(false); }} onClose={() => setShowUnlink(false)} />}
    </>
  );
};

// ── Add connection payment modal ───────────────────────────────────────

const buildWompiUrl = (session) => {
  const base = 'https://checkout.wompi.co/p/';
  const params = [
    `public-key=${encodeURIComponent(session.public_key)}`,
    `currency=${session.currency}`,
    `amount-in-cents=${session.amount_in_cents}`,
    `reference=${encodeURIComponent(session.reference)}`,
    `signature:integrity=${session.integrity}`,
    `redirect-url=${encodeURIComponent(session.redirect_url)}`,
  ].join('&');
  return `${base}?${params}`;
};

const PLAN_LABELS = { basic: 'Básico', plus: 'Plus', enterprise: 'Enterprise' };
const PLAN_ACCENT = { basic: '#6366f1', plus: '#4f46e5', enterprise: '#7c3aed' };

const AddConnectionPaymentModal = ({ quota, api, onClose }) => {
  const plan = quota?.plan;
  const extraPrice = quota?.extra_connection_price_cop ?? 0;
  const currentLimit = quota?.connections_limit ?? 1;
  const accent = PLAN_ACCENT[plan] || '#4f46e5';

  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = extraPrice * qty;
  const newTotal = currentLimit + qty;

  const handlePay = async () => {
    setLoading(true); setError('');
    try {
      const session = await api.post('/api/v1/billing/payment-session', {
        body: { plan, extra_connections: qty, connections_only: true },
      });
      window.location.href = buildWompiUrl(session);
    } catch (err) {
      setError(err.message || 'Error al iniciar el pago. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <Overlay>
      <ModalCard maxWidth={460}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: '#f4f4f6', border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={16} color="rgba(14,7,73,0.5)" />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0e0749', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            Amplía tus cuentas de WhatsApp
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)', margin: 0, lineHeight: 1.55 }}>
            Se agregarán al mismo plan que ya tienes activo.
          </p>
        </div>

        {/* Tier lock — can't change tier */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: `${accent}0d`, border: `1.5px solid ${accent}22`, borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${accent},#7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="whatsapp" size={18} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0e0749', marginBottom: 1 }}>
              Plan {PLAN_LABELS[plan] || plan}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.5)' }}>
              Tienes {currentLimit} cuenta{currentLimit !== 1 ? 's' : ''} activa{currentLimit !== 1 ? 's' : ''} · Las nuevas quedarán en este mismo plan
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, background: `${accent}18`, padding: '4px 10px', borderRadius: 20, flexShrink: 0 }}>
            Tier actual
          </div>
        </div>

        {/* Qty stepper */}
        <div style={{ background: '#f8f7ff', border: '1px solid rgba(79,70,229,0.1)', borderRadius: 14, padding: '16px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0e0749', marginBottom: 3 }}>¿Cuántas cuentas quieres agregar?</div>
              <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.5)' }}>
                ${extraPrice.toLocaleString('es-CO')} COP/mes por cada una
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${accent}44`, background: 'white', cursor: qty <= 1 ? 'default' : 'pointer', fontSize: 18, fontWeight: 700, color: qty <= 1 ? '#c4c4d4' : accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (qty > 1) e.currentTarget.style.background = '#f4f3ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
              >−</button>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#0e0749', minWidth: 32, textAlign: 'center' }}>{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${accent}44`, background: 'white', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f4f3ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
              >+</button>
            </div>
          </div>

          {/* Before/after */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(14,7,73,0.55)' }}>
            <span style={{ background: '#e8e8f0', borderRadius: 6, padding: '3px 9px', fontWeight: 600 }}>{currentLimit} actuales</span>
            <span>→</span>
            <span style={{ background: `${accent}18`, color: accent, borderRadius: 6, padding: '3px 9px', fontWeight: 700 }}>{newTotal} en total</span>
          </div>
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: `linear-gradient(135deg,${accent}0d,#7c3aed0d)`, border: `1.5px solid ${accent}28`, borderRadius: 12, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.5)', marginBottom: 2 }}>Total a pagar este mes</div>
            <div style={{ fontSize: 11, color: 'rgba(14,7,73,0.4)' }}>{qty} cuenta{qty !== 1 ? 's' : ''} × ${extraPrice.toLocaleString('es-CO')} COP</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: accent, letterSpacing: '-0.03em' }}>
            ${total.toLocaleString('es-CO')}
            <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(14,7,73,0.4)' }}> COP</span>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#dc2626' }}>{error}</div>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          style={{
            width: '100%', padding: '14px 24px', fontSize: 15, fontWeight: 700, borderRadius: 12,
            background: `linear-gradient(135deg, ${accent}, #7c3aed)`, color: '#fff', border: 'none',
            cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
            boxShadow: `0 6px 24px ${accent}44`, transition: 'opacity 0.2s, transform 0.2s, box-shadow 0.2s', marginBottom: 10,
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 10px 32px ${accent}55`; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 24px ${accent}44`; }}
        >
          {loading ? 'Preparando pago…' : `Pagar $${total.toLocaleString('es-CO')} COP con Wompi →`}
        </button>

        <p style={{ fontSize: 11, color: 'rgba(14,7,73,0.38)', textAlign: 'center', margin: 0, lineHeight: 1.55 }}>
          🔒 Pago 100% seguro · Solo se cobra el costo de las cuentas adicionales — tu plan actual no se toca
        </p>
      </ModalCard>
    </Overlay>
  );
};

// ── Main component ─────────────────────────────────────────────────────────

export default function DashConnect({ connections: initialConnections, onConnectionsChange, onNavigate, quota }) {
  const api = useApiClient();
  // Use initialConnections only as the starting point. After mount, DashConnect
  // manages its own state — we never sync from the parent again to avoid the
  // "Generar reporte" flash caused by stale parent data overriding fresh backend data.
  const [connections, setConnections] = useState(initialConnections || []);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [toast, setToast] = useState('');
  // True while the initial fresh fetch is in flight — hides action buttons to
  // prevent flashing the wrong state before accurate data arrives.
  const [initialLoad, setInitialLoad] = useState(true);

  // Single source of truth: always fetch fresh on mount so active_job_status and
  // reports_remaining reflect the real backend state, not the parent's stale cache.
  useEffect(() => {
    api.get('/api/v1/whatsapp/connections').then(fresh => {
      setConnections(fresh);
      onConnectionsChange?.(fresh);
    }).catch(() => {}).finally(() => setInitialLoad(false));
  }, []);

  // Auto-refresh connections while any are transitional OR have an active sync job.
  // This keeps active_job_status current so the button state is always accurate.
  const TRANSITIONAL = ['STARTING', 'SCAN_QR_CODE', 'CHECKING_ACCOUNT'];
  useEffect(() => {
    const needsRefresh = connections.some(
      c => TRANSITIONAL.includes(c.status) || c.active_job_status === 'pending' || c.active_job_status === 'processing'
    );
    if (!needsRefresh) return;

    const timer = setInterval(async () => {
      try {
        const fresh = await api.get('/api/v1/whatsapp/connections');
        setConnections(fresh);
        onConnectionsChange?.(fresh);
      } catch {}
    }, 3000);

    return () => clearInterval(timer);
  }, [connections]);

  const updateConn = (u) => {
    const next = connections.map(c => c.id === u.id ? { ...c, ...u } : c);
    setConnections(next); onConnectionsChange?.(next);
  };
  const removeConn = (id) => {
    const next = connections.filter(c => c.id !== id);
    setConnections(next); onConnectionsChange?.(next);
  };
  const addConn = (conn) => {
    const next = [...connections, conn];
    setConnections(next); onConnectionsChange?.(next); setShowNewModal(false);
  };
  const handleSync = async (connectionId) => {
    const data = await api.post(`/api/v1/whatsapp/connections/${connectionId}/sync`);
    setToast(`Reporte en proceso — ID: ${data.job_id.slice(0, 8)}…`);
    setTimeout(() => { setToast(''); onNavigate?.('reports'); }, 2500);
  };

  const isPaid = quota?.plan && quota.plan !== 'free';
  const connCount = connections.length;
  // Derive limit and remaining from live connection count — quota.connections_remaining
  // can be stale (fetched once on Dashboard mount before connections were added).
  const connLimit = quota?.connections_limit ?? connCount;
  const connRemaining = Math.max(0, connLimit - connCount);
  const hasSlot = connRemaining > 0;
  const openAdd = () => hasSlot ? setShowNewModal(true) : setShowAddPayment(true);
  const extraPrice = quota?.extra_connection_price_cop ?? 0;
  const usedPct = connLimit > 0 ? Math.min(100, (connCount / connLimit) * 100) : 100;

  return (
    <div className="page-fade" style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0e0749', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Cuentas de WhatsApp
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.55)', margin: 0, lineHeight: 1.6 }}>
          Conecta y gestiona las cuentas de WhatsApp de tu negocio.
          Cada cuenta genera sus propios reportes de análisis.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, padding: '11px 16px', marginBottom: 20, fontSize: 13, color: '#166534', fontWeight: 600 }}>
          ✓ {toast}
        </div>
      )}

      {/* Quota & plan info bar */}
      {isPaid && (
        <div style={{
          background: '#fff', border: '1px solid rgba(79,70,229,0.12)',
          borderRadius: 16, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          boxShadow: '0 2px 12px rgba(14,7,73,0.04)',
        }}>
          {/* Plan badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5' }}>
              Plan {PLAN_LABELS[quota?.plan] || quota?.plan}
            </span>
          </div>

          <div style={{ width: 1, height: 28, background: '#e8e8f0', flexShrink: 0 }} />

          {/* Progress */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'rgba(14,7,73,0.55)', fontWeight: 500 }}>Cuentas de WhatsApp</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0e0749' }}>
                {connCount}
                <span style={{ fontWeight: 400, color: 'rgba(14,7,73,0.35)' }}> / {connLimit}</span>
              </span>
            </div>
            <div style={{ height: 7, background: '#f0eff8', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${usedPct}%`,
                background: connRemaining === 0 ? 'linear-gradient(90deg,#ef4444,#f87171)' : 'linear-gradient(90deg,#4f46e5,#7c72f5)',
                borderRadius: 99, transition: 'width 600ms ease',
              }} />
            </div>
          </div>

          {/* Slots pill */}
          {connRemaining > 0 ? (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#166534', background: '#dcfce7', border: '1px solid #86efac', padding: '4px 12px', borderRadius: 20, flexShrink: 0 }}>
              {connRemaining} cupo{connRemaining !== 1 ? 's' : ''} libre{connRemaining !== 1 ? 's' : ''}
            </span>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', background: '#fee2e2', border: '1px solid #fca5a5', padding: '4px 12px', borderRadius: 20, flexShrink: 0 }}>
              Sin cupos disponibles
            </span>
          )}

          {/* Monthly total */}
          {quota?.monthly_total_cop > 0 && (
            <>
              <div style={{ width: 1, height: 28, background: '#e8e8f0', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', flexShrink: 0 }}>
                Total mensual: <strong style={{ color: '#0e0749' }}>${quota.monthly_total_cop.toLocaleString('es-CO')} COP</strong>
              </span>
            </>
          )}
        </div>
      )}

      {/* Free plan gate */}
      {!isPaid && connCount === 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '16px 20px', marginBottom: 24, fontSize: 14, color: '#92400e', lineHeight: 1.6 }}>
          <strong>Plan gratuito.</strong> Necesitas un plan activo para conectar WhatsApp.{' '}
          <button onClick={() => onNavigate?.('settings')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 14, textDecoration: 'underline' }}>
            Ver planes →
          </button>
        </div>
      )}

      {/* Connection grid */}
      {connCount > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
            {connections.map(conn => (
              <ConnectionCard key={conn.id} conn={conn} api={api} onUpdated={updateConn} onUnlinked={removeConn} onSync={handleSync} quota={quota} initialLoad={initialLoad} />
            ))}
          </div>

          {isPaid && (
            hasSlot ? (
              /* Free slot — dashed ghost button */
              <button onClick={openAdd}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 20px', background: '#fff', border: '1.5px dashed rgba(79,70,229,0.25)', borderRadius: 14, cursor: 'pointer', color: '#4f46e5', fontWeight: 600, fontSize: 13, transition: 'border-color 0.2s, background 0.2s', width: '100%', justifyContent: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#f8f7ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(79,70,229,0.25)'; e.currentTarget.style.background = '#fff'; }}
              >
                <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="plus" size={14} color="#4f46e5" />
                </div>
                Agregar otra cuenta
                <span style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', background: '#dcfce7', padding: '2px 8px', borderRadius: 20 }}>
                  {connRemaining} cupo{connRemaining !== 1 ? 's' : ''} libre{connRemaining !== 1 ? 's' : ''}
                </span>
              </button>
            ) : (
              /* Limit reached — payment CTA button */
              <button onClick={openAdd}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', borderRadius: 14, cursor: 'pointer', width: '100%', color: '#fff', boxShadow: '0 4px 20px rgba(79,70,229,0.25)', transition: 'transform 0.2s, box-shadow 0.2s', flexWrap: 'wrap', gap: 12 }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(79,70,229,0.38)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.25)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="plus" size={18} color="#fff" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Agregar más cuentas de WhatsApp</div>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>Tu plan está al máximo · Amplía tu capacidad aquí</div>
                  </div>
                </div>
                {extraPrice > 0 && (
                  <div style={{ fontSize: 13, fontWeight: 700, background: 'rgba(255,255,255,0.18)', padding: '7px 14px', borderRadius: 9, flexShrink: 0 }}>
                    +${extraPrice.toLocaleString('es-CO')} COP/mes c/u →
                  </div>
                )}
              </button>
            )
          )}
        </>
      ) : isPaid && (
        /* Empty state — centered */
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, border: '1.5px dashed rgba(79,70,229,0.18)', padding: '48px 40px', textAlign: 'center', maxWidth: 480, width: '100%' }}>
            <div style={{ width: 68, height: 68, background: 'linear-gradient(135deg,#4f46e5,#7c72f5)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}>
              <Icon name="whatsapp" size={34} color="#fff" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', marginBottom: 10, letterSpacing: '-0.01em' }}>
              Conecta tu primera cuenta
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.5)', marginBottom: 28, lineHeight: 1.7, maxWidth: 340, margin: '0 auto 28px' }}>
              Vincula tu WhatsApp Business y recibe reportes automáticos de respuesta, sentimiento, conversiones y más.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, textAlign: 'left', background: '#f8f7ff', borderRadius: 12, padding: '16px 18px', marginBottom: 28 }}>
              {[
                { icon: 'zap',    t: 'Sync automático según tu plan' },
                { icon: 'shield', t: 'Solo lectura — nunca enviamos mensajes' },
                { icon: 'file',   t: 'Reportes PDF con IA y métricas' },
                { icon: 'user',   t: 'Puedes agregar múltiples cuentas' },
              ].map(({ icon, t }) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 26, height: 26, background: 'rgba(79,70,229,0.1)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={icon} size={13} color="#4f46e5" />
                  </div>
                  <span style={{ fontSize: 13, color: '#0e0749' }}>{t}</span>
                </div>
              ))}
            </div>
            <button onClick={openAdd} className="btn-primary" style={{ padding: '13px 40px', fontSize: 15, fontWeight: 600 }}>
              Conectar ahora
            </button>
          </div>
        </div>
      )}

      {/* Security note */}
      {connCount > 0 && (
        <div style={{ background: '#f8f7ff', border: '1px solid rgba(79,70,229,0.1)', borderRadius: 12, padding: '12px 16px', marginTop: 20 }}>
          <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.5)', margin: 0, lineHeight: 1.65 }}>
            🔒 <strong>Seguridad</strong> — DeepLook se conecta como un dispositivo vinculado (como WhatsApp Web). Solo leemos conversaciones para generar reportes; nunca enviamos mensajes y la sesión se apaga entre sincronizaciones.
          </p>
        </div>
      )}

      {showNewModal && <NewConnectionModal api={api} onCreated={addConn} onClose={() => setShowNewModal(false)} />}
      {showAddPayment && <AddConnectionPaymentModal quota={quota} api={api} onClose={() => setShowAddPayment(false)} />}
    </div>
  );
}
