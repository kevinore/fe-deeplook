import { useState } from 'react';
import { Icon } from './Icons';

const helpCategories = [
  { icon: 'zap',         title: 'Empezar',                  desc: 'Guías básicas para configurar tu cuenta y subir tu primer análisis' },
  { icon: 'download',    title: 'Exportar chats',           desc: 'Tutoriales paso a paso para exportar desde WhatsApp Business' },
  { icon: 'file',        title: 'Entender mi reporte',      desc: 'Qué significa cada métrica y cómo interpretarla para tu negocio' },
  { icon: 'credit_card', title: 'Planes y pagos',           desc: 'Preguntas sobre facturación, cancelaciones y upgrades de plan' },
  { icon: 'user',        title: 'Cuenta y perfil',          desc: 'Gestión de cuenta, contraseña y configuración personal' },
  { icon: 'shield',      title: 'Resolución de problemas',  desc: 'Errores comunes y cómo solucionarlos rápidamente' },
];

const faqs = [
  { q: '¿Cómo exporto un chat desde WhatsApp Business?', a: 'Abre el chat, toca el nombre del contacto, selecciona "Exportar chat" y elige "Sin archivos multimedia". Obtendrás un archivo .txt listo para subir a DeepLook.' },
  { q: '¿Qué significa el puntaje de salud?', a: 'Es un número del 0 al 100 que resume la calidad de tu atención al cliente. Considera tiempo de respuesta, sentimiento, conversión y calidad general.' },
  { q: '¿Con cuántas conversaciones puedo hacer un análisis?', a: 'Mínimo 20 para resultados confiables. El sistema acepta cualquier cantidad sin límite máximo en los planes pagos.' },
  { q: '¿Puedo analizar conversaciones grupales?', a: 'Por ahora solo analizamos chats individuales de WhatsApp Business. Los grupos no están soportados en esta versión.' },
  { q: '¿Mis conversaciones son confidenciales?', a: 'Sí. Todos tus datos se procesan de forma encriptada, nunca se comparten con terceros y puedes eliminarlos en cualquier momento desde Configuración.' },
];

const DashHelp = () => {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="dash-page page-fade">
      <div style={{ background: 'linear-gradient(135deg,#4f46e5,#6c63ff)', borderRadius: 20, padding: '52px 40px', textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 20, letterSpacing: '-0.02em' }}>¿Cómo te podemos ayudar?</h1>
        <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto' }}>
          <Icon name="search" size={18} color="#a78bfa" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Busca una pregunta o tema..."
            style={{ width: '100%', height: 54, paddingLeft: 48, paddingRight: 20, background: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontFamily: 'DM Sans,sans-serif', outline: 'none', color: '#0e0749', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', marginBottom: 18 }}>Categorías</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {helpCategories.map((cat, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid #ededed', borderRadius: 14, padding: 24, cursor: 'pointer', transition: 'border-color 200ms, box-shadow 200ms, transform 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(79,70,229,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#ededed'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
              <div style={{ width: 44, height: 44, background: 'rgba(79,70,229,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon name={cat.icon} size={20} color="#4f46e5" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749', marginBottom: 6 }}>{cat.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.55)', lineHeight: 1.6 }}>{cat.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 24, alignItems: 'start' }} className="help-lower">
        <style>{`@media(max-width:900px){.help-lower{grid-template-columns:1fr!important}}`}</style>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0e0749', marginBottom: 18 }}>Preguntas frecuentes</h2>
          <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 14, overflow: 'hidden' }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid #ededed' : 'none' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', cursor: 'pointer', textAlign: 'left', gap: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#0e0749' }}>{f.q}</span>
                  <div style={{ width: 26, height: 26, background: openFaq === i ? '#4f46e5' : 'rgba(79,70,229,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms', transform: openFaq === i ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>
                    <Icon name="plus" size={13} color={openFaq === i ? 'white' : '#4f46e5'} />
                  </div>
                </button>
                {openFaq === i && <div style={{ padding: '0 24px 18px', fontSize: 14, color: 'rgba(14,7,73,0.7)', lineHeight: 1.7 }}>{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#f4f3ff', border: '1px solid rgba(79,70,229,0.12)', borderRadius: 16, padding: '28px 28px' }}>
            <div style={{ width: 48, height: 48, background: 'rgba(79,70,229,0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Icon name="chat" size={22} color="#4f46e5" />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0e0749', marginBottom: 8 }}>¿No encuentras lo que buscas?</div>
            <div style={{ fontSize: 14, color: 'rgba(14,7,73,0.6)', lineHeight: 1.65, marginBottom: 20 }}>Escríbenos. Respondemos en menos de 24 horas en español.</div>
            <button className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15 }}>Contactar soporte</button>
          </div>
          <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 16, padding: '24px 28px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749', marginBottom: 12 }}>Recursos populares</div>
            {['Guía rápida de inicio','Cómo exportar chats (video)','Glosario de métricas','Mejores prácticas de WhatsApp Business'].map((r, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < 3 ? '1px solid #ededed' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, color: '#0e0749' }}>{r}</span>
                <Icon name="arrow_right" size={14} color="#a78bfa" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashHelp;
