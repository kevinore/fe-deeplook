import { useState } from 'react';
import { useUser } from '@clerk/react';
import { useApiClient } from '../lib/api';
import { DeepLookLogo } from './Icons';

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

const FIELD_STYLE = {
  width: '100%',
  padding: '11px 14px',
  fontSize: 14,
  border: '1.5px solid #e2e2e2',
  borderRadius: 10,
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  color: '#0e0749',
  background: 'white',
  boxSizing: 'border-box',
  transition: 'border-color 150ms',
};

const Field = ({ label, hint, optional, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0e0749', marginBottom: 6 }}>
      {label}
      {optional && <span style={{ fontWeight: 400, color: 'rgba(14,7,73,0.4)', marginLeft: 4 }}>(opcional)</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: 12, color: 'rgba(14,7,73,0.45)', marginTop: 5, lineHeight: 1.55 }}>{hint}</p>}
  </div>
);

const FocusInput = ({ style, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{ ...FIELD_STYLE, ...style, borderColor: focused ? '#4f46e5' : '#e2e2e2' }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};

const FocusSelect = ({ style, children, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{ ...FIELD_STYLE, ...style, borderColor: focused ? '#4f46e5' : '#e2e2e2' }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  );
};

const OnboardingModal = ({ onComplete }) => {
  const { user } = useUser();
  const api = useApiClient();

  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    countryCode: '+57',
    phoneNumber: '',
    identifiers: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.businessName.trim()) return setError('El nombre del negocio es requerido.');
    if (!form.businessType) return setError('Por favor selecciona el tipo de negocio.');
    if (!form.phoneNumber.trim()) return setError('El número de WhatsApp es requerido.');

    const identifiersList = form.identifiers
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      const client = await api.post('/api/v1/clients', {
        body: {
          name: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || '',
          email: user.primaryEmailAddress?.emailAddress || '',
          business_name: form.businessName.trim(),
          business_type: form.businessType,
          phone: `${form.countryCode}${form.phoneNumber.trim()}`,
          business_identifiers: identifiersList,
        },
      });
      onComplete(client);
    } catch (err) {
      // 409 means this email already has a client — fetch it instead of showing an error
      if (err.status === 409) {
        try {
          const clients = await api.get('/api/v1/clients');
          if (clients?.[0]) { onComplete(clients[0]); return; }
        } catch {
          // fall through to generic error
        }
      }
      setError(err.message || 'Error al guardar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(14,7,73,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 20,
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        background: 'white', borderRadius: 20,
        padding: '36px 40px', width: '100%', maxWidth: 460,
        boxShadow: '0 24px 80px rgba(14,7,73,0.22)',
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'pageFade 280ms ease',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', marginBottom: 14 }}>
            <DeepLookLogo size="md" />
          </div>
          <h2 style={{ fontSize: 21, fontWeight: 700, color: '#0e0749', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Cuéntanos sobre tu negocio
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(14,7,73,0.55)', lineHeight: 1.6 }}>
            Solo tomará un momento. Esta información personaliza tu análisis de WhatsApp.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Field label="Nombre de tu negocio *">
            <FocusInput
              value={form.businessName}
              onChange={set('businessName')}
              placeholder="Ej: Clínica Odontológica Sonrisa"
              required
            />
          </Field>

          <Field label="Tipo de negocio *">
            <FocusSelect value={form.businessType} onChange={set('businessType')} required>
              <option value="">Selecciona una categoría…</option>
              {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </FocusSelect>
          </Field>

          <Field label="Número de WhatsApp Business *">
            <div style={{ display: 'flex', gap: 8 }}>
              <FocusSelect
                value={form.countryCode}
                onChange={set('countryCode')}
                style={{ width: 'auto', flexShrink: 0, paddingRight: 8 }}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </FocusSelect>
              <FocusInput
                value={form.phoneNumber}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value.replace(/\D/g, '') }))}
                placeholder="3001234567"
                type="tel"
                style={{ flex: 1 }}
                required
              />
            </div>
          </Field>

          <Field
            label="¿Cómo apareces en los chats?"
            optional
            hint="El nombre o número con que tu negocio aparece en los chats de WhatsApp. Separa varios con coma. Ayuda a la IA a identificar tus mensajes."
          >
            <FocusInput
              value={form.identifiers}
              onChange={set('identifiers')}
              placeholder="Ej: Clínica Sonrisa, +573001234567"
            />
          </Field>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fee2e2',
              color: '#dc2626', fontSize: 13, borderRadius: 10,
              padding: '10px 14px', marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%', padding: '13px 24px',
              fontSize: 15, fontWeight: 700, borderRadius: 10,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Guardando…' : 'Comenzar a usar DeepLook →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
