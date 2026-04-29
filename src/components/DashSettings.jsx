import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/react';
import { Icon } from './Icons';
import { useApiClient } from '../lib/api';

const PLAN_LABELS = {
  free: 'Plan Gratis',
  basic: 'Plan Básico',
  plus: 'Plan Plus',
  enterprise: 'Plan Enterprise',
};

const PLAN_PRICES_COP = { basic: 160_000, plus: 250_000, enterprise: 400_000 };

const PAYMENT_STATUS_MAP = {
  approved: { label: 'Aprobado',  color: '#16a34a', bg: '#f0fdf4' },
  declined: { label: 'Rechazado', color: '#dc2626', bg: '#fef2f2' },
  pending:  { label: 'Pendiente', color: '#d97706', bg: '#fffbeb' },
  voided:   { label: 'Anulado',   color: '#6b7280', bg: '#f9fafb' },
};

const formatCOP = (cents) => {
  if (cents == null) return '—';
  return `$${Math.round(cents / 100).toLocaleString('es-CO')} COP`;
};

const formatDateLong = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatRenewal = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
};

const BUSINESS_TYPES = [
  'Restaurante / Alimentación',
  'Salud / Belleza / Spa',
  'Inmobiliaria',
  'Retail / Tienda',
  'Servicios profesionales',
  'Educación / Capacitación',
  'Tecnología',
  'Automotriz',
  'Turismo / Hospitalidad',
  'Otro',
];

const COUNTRY_CODES = [
  { code: '+57',  flag: '🇨🇴', name: 'Colombia' },
  { code: '+52',  flag: '🇲🇽', name: 'México' },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { code: '+56',  flag: '🇨🇱', name: 'Chile' },
  { code: '+51',  flag: '🇵🇪', name: 'Perú' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+58',  flag: '🇻🇪', name: 'Venezuela' },
  { code: '+1',   flag: '🇺🇸', name: 'EE.UU. / Canadá' },
  { code: '+34',  flag: '🇪🇸', name: 'España' },
];

const parsePhone = (phone) => {
  if (!phone) return { countryCode: '+57', number: '' };
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const c of sorted) {
    if (phone.startsWith(c.code)) {
      return { countryCode: c.code, number: phone.slice(c.code.length).trim() };
    }
  }
  return { countryCode: '+57', number: phone };
};

const Toggle = ({ on, onChange, label, disabled }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #ededed' }}>
    <span style={{ fontSize: 15, color: '#0e0749' }}>{label}</span>
    <div onClick={() => !disabled && onChange(!on)}
      style={{ width: 46, height: 26, background: on ? '#4f46e5' : '#ededed', borderRadius: 999, cursor: disabled ? 'default' : 'pointer', position: 'relative', transition: 'background 200ms', flexShrink: 0, opacity: disabled ? 0.6 : 1 }}>
      <div style={{ width: 20, height: 20, background: 'white', borderRadius: '50%', position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left 200ms', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
    </div>
  </div>
);

const SI = ({ label, value, onChange, type = 'text', readOnly = false, hint }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0e0749', marginBottom: 6 }}>
        {label}
        {readOnly && <span style={{ marginLeft: 8, fontSize: 12, color: 'rgba(14,7,73,0.4)', fontWeight: 400 }}>· solo lectura</span>}
      </label>
      <input value={value} onChange={onChange} readOnly={readOnly} type={type}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: '100%', background: readOnly ? '#ededf0' : '#f4f4f6', border: `1.5px solid ${focused && !readOnly ? '#4f46e5' : '#e4e4e8'}`, borderRadius: 8, height: 46, padding: '0 16px', fontSize: 15, color: readOnly ? 'rgba(14,7,73,0.45)' : '#0e0749', outline: 'none', transition: 'border-color 200ms, box-shadow 200ms', boxShadow: focused && !readOnly ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', cursor: readOnly ? 'default' : 'text' }} />
      {hint && <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', marginTop: 4, marginBottom: 0 }}>{hint}</p>}
    </div>
  );
};

const SaveBtn = ({ onClick, saving }) => (
  <button className="btn-primary" onClick={onClick} disabled={saving}
    style={{ padding: '12px 28px', fontSize: 15, opacity: saving ? 0.7 : 1, cursor: saving ? 'default' : 'pointer' }}>
    {saving ? 'Guardando…' : 'Guardar cambios'}
  </button>
);

const FeedbackMsg = ({ msg }) => msg ? (
  <p style={{ fontSize: 13, color: msg.ok ? '#16a34a' : '#dc2626', marginTop: 10, marginBottom: 0 }}>{msg.text}</p>
) : null;

const PhoneInput = ({ countryCode, number, onCountryChange, onNumberChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0e0749', marginBottom: 6 }}>Celular</label>
      <div style={{ display: 'flex', background: '#f4f4f6', border: `1.5px solid ${focused ? '#4f46e5' : '#e4e4e8'}`, borderRadius: 8, height: 46, overflow: 'hidden', boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none', transition: 'border-color 200ms, box-shadow 200ms' }}>
        <select value={countryCode} onChange={e => onCountryChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ background: 'transparent', border: 'none', borderRight: '1.5px solid #e4e4e8', padding: '0 10px', fontSize: 14, color: '#0e0749', outline: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', flexShrink: 0 }}>
          {COUNTRY_CODES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
          ))}
        </select>
        <input type="tel" value={number} onChange={e => onNumberChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder="Número de celular"
          style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 14px', fontSize: 15, color: '#0e0749', outline: 'none', fontFamily: 'DM Sans,sans-serif', minWidth: 0 }} />
      </div>
    </div>
  );
};

const DeleteModal = ({ onConfirm, onCancel, loading, error }) => {
  const [typed, setTyped] = useState('');
  const confirmed = typed === 'ELIMINAR';
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,7,73,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '32px 36px', maxWidth: 460, width: '100%', boxShadow: '0 24px 80px rgba(14,7,73,0.2)' }}>
        <div style={{ width: 52, height: 52, background: '#fee2e2', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon name="alert" size={24} color="#ef4444" />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', marginBottom: 10 }}>¿Eliminar tu cuenta?</h3>
        <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.6)', lineHeight: 1.65, marginBottom: 20 }}>
          Esta acción es <strong>permanente e irreversible</strong>. Se eliminarán tu cuenta, todos tus reportes y tu conexión de WhatsApp.
        </p>
        <p style={{ fontSize: 13, color: '#0e0749', fontWeight: 500, marginBottom: 8 }}>
          Escribe <strong>ELIMINAR</strong> para confirmar:
        </p>
        <input
          value={typed}
          onChange={e => setTyped(e.target.value)}
          placeholder="ELIMINAR"
          style={{ width: '100%', background: '#f4f4f6', border: `1.5px solid ${confirmed ? '#ef4444' : '#e4e4e8'}`, borderRadius: 8, height: 44, padding: '0 14px', fontSize: 15, color: '#0e0749', outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', marginBottom: 20 }}
        />
        {error && <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn-ghost" style={{ padding: '10px 22px' }} disabled={loading}>Cancelar</button>
          <button
            onClick={onConfirm}
            disabled={!confirmed || loading}
            style={{ background: confirmed ? '#ef4444' : '#fca5a5', color: 'white', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: confirmed && !loading ? 'pointer' : 'default', fontFamily: 'DM Sans,sans-serif', transition: 'background 200ms' }}>
            {loading ? 'Eliminando…' : 'Eliminar mi cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DashSettings = ({ client, onClientUpdate, connection, onConnectionUpdate, quota, onShowPlanModal }) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const api = useApiClient();
  const [tab, setTab] = useState('Perfil');

  const [paymentHistory, setPaymentHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (tab !== 'Plan y facturación') return;
    setHistoryLoading(true);
    api.get('/api/v1/billing/payment-history')
      .then(data => setPaymentHistory(data))
      .catch(() => setPaymentHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [tab]);

  const [profileForm, setProfileForm] = useState(() => {
    const { countryCode, number } = parsePhone(client?.phone);
    return {
      name: user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : '',
      countryCode,
      number,
    };
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [bizForm, setBizForm] = useState(() => ({
    business_name: client?.business_name ?? '',
    business_type: client?.business_type ?? '',
    average_transaction_value: client?.average_transaction_value != null ? String(client.average_transaction_value) : '',
  }));
  const [bizSaving, setBizSaving] = useState(false);
  const [bizMsg, setBizMsg] = useState(null);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  const [notifs, setNotifs] = useState({ ready: true, reminder: true, tips: false, news: false });

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const parts = profileForm.name.trim().split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      const phone = profileForm.number.trim()
        ? `${profileForm.countryCode} ${profileForm.number.trim()}`
        : null;
      await Promise.all([
        user.update({ firstName, lastName }),
        client && api.patch(`/api/v1/clients/${client.id}`, {
          body: { name: profileForm.name.trim(), phone },
        }),
      ]);
      onClientUpdate?.(prev => ({ ...prev, name: profileForm.name.trim(), phone }));
      setProfileMsg({ ok: true, text: 'Perfil actualizado correctamente.' });
    } catch (e) {
      setProfileMsg({ ok: false, text: e.message || 'Error al guardar. Intenta de nuevo.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleBizSave = async () => {
    setBizSaving(true);
    setBizMsg(null);
    try {
      const payload = {
        business_name: bizForm.business_name.trim() || undefined,
        business_type: bizForm.business_type || undefined,
        average_transaction_value: bizForm.average_transaction_value !== '' ? Number(bizForm.average_transaction_value) : null,
      };
      const updated = await api.patch(`/api/v1/clients/${client.id}`, { body: payload });
      onClientUpdate?.(prev => ({ ...prev, ...updated }));
      setBizMsg({ ok: true, text: 'Datos del negocio actualizados.' });
    } catch (e) {
      setBizMsg({ ok: false, text: e.message || 'Error al guardar. Intenta de nuevo.' });
    } finally {
      setBizSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ ok: false, text: 'Las contraseñas nuevas no coinciden.' });
      return;
    }
    if (pwForm.next.length < 8) {
      setPwMsg({ ok: false, text: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await user.updatePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwForm({ current: '', next: '', confirm: '' });
      setPwMsg({ ok: true, text: 'Contraseña actualizada correctamente.' });
    } catch (e) {
      setPwMsg({ ok: false, text: e.errors?.[0]?.message || e.message || 'Error al actualizar la contraseña.' });
    } finally {
      setPwSaving(false);
    }
  };

  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const planLabel = PLAN_LABELS[client?.plan] ?? client?.plan ?? 'Plan Gratis';

  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [unlinkMsg, setUnlinkMsg] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleUnlink = async () => {
    if (!connection?.id) return;
    setUnlinkLoading(true);
    setUnlinkMsg(null);
    try {
      await api.delete(`/api/v1/whatsapp/connections/${connection.id}`);
      onConnectionUpdate?.(null);
      setUnlinkMsg({ ok: true, text: 'WhatsApp desvinculado correctamente.' });
    } catch (e) {
      setUnlinkMsg({ ok: false, text: e.message || 'Error al desvincular.' });
    } finally {
      setUnlinkLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      // Unlink WhatsApp first if connected (best-effort — don't block deletion on failure)
      if (connection?.id) {
        await api.delete(`/api/v1/whatsapp/connections/${connection.id}`).catch(() => {});
      }
      // Delete the Clerk user account — this invalidates the session immediately
      await user.delete();
      // App.jsx will detect isSignedIn=false and redirect to /login automatically
    } catch (e) {
      setDeleteError(e.errors?.[0]?.message || e.message || 'Error al eliminar la cuenta. Intenta de nuevo.');
      setDeleteLoading(false);
    }
  };

  const tabs = ['Perfil', 'Negocio', 'WhatsApp', 'Plan y facturación', 'Notificaciones', 'Seguridad'];

  return (
    <div className="dash-page page-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0e0749', letterSpacing: '-0.02em' }}>Configuración</h1>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #ededed', marginBottom: 36, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '12px 22px', background: 'none', border: 'none', fontSize: 14, fontWeight: tab === t ? 600 : 400, color: tab === t ? '#4f46e5' : 'rgba(14,7,73,0.55)', cursor: 'pointer', borderBottom: `2px solid ${tab === t ? '#4f46e5' : 'transparent'}`, marginBottom: -2, transition: 'color 200ms', fontFamily: 'DM Sans,sans-serif', whiteSpace: 'nowrap' }}>{t}</button>
        ))}
      </div>

      {tab === 'Perfil' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 40, alignItems: 'start' }} className="settings-grid">
          <style>{`@media(max-width:800px){.settings-grid{grid-template-columns:1fr!important}}`}</style>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, padding: '20px 24px', background: '#f4f3ff', borderRadius: 14, border: '1px solid rgba(79,70,229,0.08)' }}>
              <div style={{ flexShrink: 0 }}>
                {user?.imageUrl
                  ? <img src={user.imageUrl} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  : <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'white' }}>{profileForm.name.charAt(0).toUpperCase() || '?'}</div>
                }
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#0e0749' }}>
                  {profileForm.name || '…'}
                </div>
                <div style={{ fontSize: 14, color: 'rgba(14,7,73,0.5)' }}>{email}</div>
              </div>
            </div>
            <SI label="Nombre completo" value={profileForm.name}
              onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
            <SI label="Correo electrónico" value={email} onChange={() => {}} type="email" readOnly
              hint="El correo se gestiona desde tu cuenta de autenticación." />
            <PhoneInput
              countryCode={profileForm.countryCode}
              number={profileForm.number}
              onCountryChange={v => setProfileForm(p => ({ ...p, countryCode: v }))}
              onNumberChange={v => setProfileForm(p => ({ ...p, number: v }))}
            />
          </div>
          <div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0e0749', marginBottom: 6 }}>Zona horaria</label>
              <select defaultValue="Bogotá (UTC-5)"
                style={{ width: '100%', background: '#f4f4f6', border: '1.5px solid #e4e4e8', borderRadius: 8, height: 46, padding: '0 16px', fontSize: 15, color: '#0e0749', outline: 'none', fontFamily: 'DM Sans,sans-serif' }}>
                <option>Bogotá (UTC-5)</option>
                <option>Medellín (UTC-5)</option>
                <option>Cali (UTC-5)</option>
              </select>
            </div>
            <SI label="Idioma del reporte" value="Español (Colombia)" onChange={() => {}} readOnly />
            <div style={{ marginTop: 8 }}>
              <SaveBtn onClick={handleProfileSave} saving={profileSaving} />
              <FeedbackMsg msg={profileMsg} />
            </div>
          </div>
        </div>
      )}

      {tab === 'Negocio' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 40 }} className="settings-grid">
          <div>
            <SI label="Nombre del negocio" value={bizForm.business_name}
              onChange={e => setBizForm(p => ({ ...p, business_name: e.target.value }))} />
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0e0749', marginBottom: 6 }}>Tipo de negocio</label>
              <select value={bizForm.business_type} onChange={e => setBizForm(p => ({ ...p, business_type: e.target.value }))}
                style={{ width: '100%', background: '#f4f4f6', border: '1.5px solid #e4e4e8', borderRadius: 8, height: 46, padding: '0 16px', fontSize: 15, color: '#0e0749', outline: 'none', fontFamily: 'DM Sans,sans-serif' }}>
                <option value="">Selecciona un tipo</option>
                {BUSINESS_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <SI label="Valor promedio de venta (COP)" value={bizForm.average_transaction_value} type="number"
              onChange={e => setBizForm(p => ({ ...p, average_transaction_value: e.target.value }))} />
          </div>
          <div>
            <SI label="Sitio web" value="" onChange={() => {}} readOnly hint="Próximamente disponible." />
            <SI label="Número de empleados" value="" onChange={() => {}} readOnly hint="Próximamente disponible." />
            <div style={{ marginTop: 8 }}>
              <SaveBtn onClick={handleBizSave} saving={bizSaving} />
              <FeedbackMsg msg={bizMsg} />
            </div>
          </div>
        </div>
      )}

      {tab === 'WhatsApp' && (
        <div style={{ maxWidth: 560 }}>
          {connection === undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(14,7,73,0.45)', fontSize: 14 }}>
              <div style={{ width: 20, height: 20, border: '2px solid #ededed', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Cargando estado de conexión…
            </div>
          )}
          {connection === null && (
            <div style={{ background: '#f4f3ff', border: '1px solid rgba(79,70,229,0.1)', borderRadius: 14, padding: '28px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#0e0749', marginBottom: 8 }}>Sin conexión de WhatsApp</div>
              <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.55)', marginBottom: 0 }}>Ve a <strong>Conectar WhatsApp</strong> en el menú lateral para vincular tu número.</p>
            </div>
          )}
          {connection && (
            <>
              <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 14, padding: '22px 26px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749' }}>Estado de la conexión</div>
                  <div style={{
                    background: ['WORKING', 'STOPPED'].includes(connection.status) ? '#dcfce7' : '#fee2e2',
                    color: ['WORKING', 'STOPPED'].includes(connection.status) ? '#166534' : '#991b1b',
                    fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999,
                  }}>
                    {['WORKING', 'STOPPED'].includes(connection.status) ? 'Activo' : connection.status}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 4 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Número</div>
                    <div style={{ fontSize: 15, color: '#0e0749', fontWeight: 500 }}>{connection.phone_number || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Nombre</div>
                    <div style={{ fontSize: 15, color: '#0e0749', fontWeight: 500 }}>{connection.push_name || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Último sync</div>
                    <div style={{ fontSize: 14, color: '#0e0749' }}>
                      {connection.last_sync_at ? new Date(connection.last_sync_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Nunca'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Frecuencia</div>
                    <div style={{ fontSize: 14, color: '#0e0749', textTransform: 'capitalize' }}>{connection.sync_frequency || '—'}</div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749', marginBottom: 8 }}>Desvincular WhatsApp</div>
              <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.55)', marginBottom: 16 }}>
                Esto desconectará tu cuenta. Los reportes ya generados seguirán disponibles.
              </p>
              <button
                onClick={handleUnlink}
                disabled={unlinkLoading}
                className="btn-ghost"
                style={{ borderColor: '#ef4444', color: '#ef4444', padding: '10px 20px', fontSize: 14, opacity: unlinkLoading ? 0.7 : 1, cursor: unlinkLoading ? 'default' : 'pointer' }}>
                {unlinkLoading ? 'Desvinculando…' : 'Desvincular WhatsApp'}
              </button>
              <FeedbackMsg msg={unlinkMsg} />
            </>
          )}
        </div>
      )}

      {tab === 'Plan y facturación' && (() => {
        const renewalDate = formatRenewal(quota?.billing_period_end);
        const planPrice = PLAN_PRICES_COP[client?.plan];
        const isActive = quota?.subscription_status === 'active';
        return (
          <div>
            {/* Plan banner */}
            <div style={{ background: 'linear-gradient(135deg,#4f46e5,#6c63ff)', borderRadius: 16, padding: '28px 36px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 600, letterSpacing: '0.08em' }}>PLAN ACTUAL</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, letterSpacing: '0.05em', textTransform: 'uppercase', background: isActive ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.15)', color: isActive ? '#6ee7b7' : 'rgba(255,255,255,0.6)' }}>
                    {isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 4 }}>{planLabel}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                  {renewalDate
                    ? `Renovación el ${renewalDate}${planPrice ? ` · $${planPrice.toLocaleString('es-CO')} COP/mes` : ''}`
                    : 'Sin suscripción activa'}
                </div>
              </div>
              <button
                onClick={onShowPlanModal}
                style={{ background: 'white', color: '#4f46e5', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                Cambiar de plan
              </button>
            </div>

            {/* Method + Usage */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 24, marginBottom: 28 }} className="settings-grid">
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0e0749', marginBottom: 14 }}>Método de pago</div>
                <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Icon name="credit_card" size={22} color="#4f46e5" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#0e0749' }}>Pagos gestionados por Wompi</div>
                    <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.45)' }}>Pasarela de pago segura 🇨🇴</div>
                  </div>
                </div>
              </div>
              <div style={{ background: '#f4f3ff', border: '1px solid rgba(79,70,229,0.1)', borderRadius: 12, padding: '18px 22px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0e0749', marginBottom: 8 }}>Uso del período actual</div>
                {quota ? (
                  <>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 28, fontWeight: 700, color: quota.reports?.remaining === 0 ? '#ef4444' : '#4f46e5', marginBottom: 4 }}>
                      {quota.reports?.used ?? 0} / {quota.reports?.limit ?? 0}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)', marginBottom: 12 }}>reportes generados este período</div>
                    <div style={{ background: '#ededed', borderRadius: 3, height: 5, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{ height: '100%', width: `${quota.reports?.limit > 0 ? Math.min(100, (quota.reports.used / quota.reports.limit) * 100) : 0}%`, background: quota.reports?.remaining === 0 ? '#ef4444' : '#4f46e5', borderRadius: 3, transition: 'width 600ms ease' }} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {[
                        { label: `Hasta ${quota.conversations_per_report} convs/reporte`, active: true },
                        { label: `${quota.lookback_days} días historial`, active: true },
                        { label: 'Subida manual', active: quota.features?.manual_upload },
                        { label: 'Tendencias', active: quota.features?.trends_dashboard },
                      ].map(({ label, active }) => (
                        <span key={label} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: active ? 'rgba(79,70,229,0.12)' : '#ededed', color: active ? '#4f46e5' : 'rgba(14,7,73,0.35)', textDecoration: active ? 'none' : 'line-through' }}>
                          {label}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 28, fontWeight: 700, color: '#4f46e5', marginBottom: 4 }}>—</div>
                    <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)', marginBottom: 12 }}>Cargando uso…</div>
                    <div style={{ background: '#ededed', borderRadius: 3, height: 5 }} />
                  </>
                )}
              </div>
            </div>

            {/* Payment history */}
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0e0749', marginBottom: 14 }}>Historial de pagos</div>
            <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', padding: '12px 20px', background: '#f8f7ff', fontSize: 12, fontWeight: 600, color: 'rgba(14,7,73,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {['Fecha', 'Plan', 'Monto', 'Estado'].map(h => <span key={h}>{h}</span>)}
              </div>
              {historyLoading && (
                <div style={{ padding: '24px 20px', fontSize: 14, color: 'rgba(14,7,73,0.45)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, border: '2px solid #ededed', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                  Cargando historial…
                </div>
              )}
              {!historyLoading && paymentHistory?.length === 0 && (
                <div style={{ padding: '32px 20px', fontSize: 14, color: 'rgba(14,7,73,0.4)', textAlign: 'center' }}>
                  Sin pagos registrados aún.
                </div>
              )}
              {!historyLoading && paymentHistory?.map((p) => {
                const st = PAYMENT_STATUS_MAP[p.status] ?? { label: p.status, color: '#6b7280', bg: '#f9fafb' };
                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', padding: '14px 20px', borderTop: '1px solid #ededed', fontSize: 14, color: '#0e0749', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'rgba(14,7,73,0.65)' }}>{formatDateLong(p.created_at)}</span>
                    <span style={{ fontWeight: 500 }}>{PLAN_LABELS[p.plan] ?? p.plan}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13 }}>{formatCOP(p.amount_in_cents)}</span>
                    <span>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {tab === 'Notificaciones' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 40, alignItems: 'start' }} className="settings-grid">
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749', marginBottom: 4 }}>Alertas de reportes</div>
            <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)', marginBottom: 16 }}>Te notificamos por correo electrónico</div>
            <Toggle on={notifs.ready} onChange={v => setNotifs({ ...notifs, ready: v })} label="Avisarme cuando un reporte esté listo" />
            <Toggle on={notifs.reminder} onChange={v => setNotifs({ ...notifs, reminder: v })} label="Recordatorio mensual antes de mi próximo reporte" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749', marginBottom: 4 }}>Comunicaciones</div>
            <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.5)', marginBottom: 16 }}>Contenido y novedades</div>
            <Toggle on={notifs.tips} onChange={v => setNotifs({ ...notifs, tips: v })} label="Tips semanales para mejorar mi atención" />
            <Toggle on={notifs.news} onChange={v => setNotifs({ ...notifs, news: v })} label="Novedades del producto" />
          </div>
        </div>
      )}

      {tab === 'Seguridad' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 40, alignItems: 'start' }} className="settings-grid">
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749', marginBottom: 16 }}>Cambiar contraseña</div>
            <SI label="Contraseña actual" value={pwForm.current} type="password"
              onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} />
            <SI label="Nueva contraseña" value={pwForm.next} type="password"
              onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} />
            <SI label="Confirmar nueva contraseña" value={pwForm.confirm} type="password"
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
            <SaveBtn onClick={handlePasswordSave} saving={pwSaving} />
            <FeedbackMsg msg={pwMsg} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749', marginBottom: 16 }}>Autenticación de dos factores</div>
            <div style={{ background: '#f4f3ff', border: '1px solid rgba(79,70,229,0.1)', borderRadius: 12, padding: '20px 22px', marginBottom: 28 }}>
              <Toggle on={user?.twoFactorEnabled ?? false} onChange={() => {}} disabled
                label="Autenticación de dos factores" />
              <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', marginTop: 10, marginBottom: 0 }}>
                Gestiona la verificación en dos pasos desde el perfil de tu cuenta.
              </p>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749', marginBottom: 8 }}>Zona de peligro</div>
            <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.55)', marginBottom: 16 }}>Elimina tu cuenta, reportes y conexión de WhatsApp de forma permanente.</p>
            <button
              onClick={() => { setDeleteError(null); setShowDeleteModal(true); }}
              className="btn-ghost"
              style={{ borderColor: '#ef4444', color: '#ef4444', padding: '10px 20px', fontSize: 14 }}>
              Eliminar mi cuenta
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleteLoading}
          error={deleteError}
        />
      )}
    </div>
  );
};

export default DashSettings;
