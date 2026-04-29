import { useState, useEffect } from 'react';
import { Icon } from './Icons';

const PlanGateUpload = ({ title, body, icon, onShowPlanModal, ctaLabel = 'Ver planes y activar' }) => (
  <div style={{ maxWidth: 560, margin: '60px auto 0', textAlign: 'center', padding: '0 20px' }}>
    <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#f4f3ff,#ede9fe)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(79,70,229,0.15)' }}>
      <Icon name={icon} size={34} color="#4f46e5" />
    </div>
    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0e0749', marginBottom: 10, letterSpacing: '-0.01em' }}>{title}</h2>
    <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.6)', lineHeight: 1.7, marginBottom: 28 }}>{body}</p>
    <button
      onClick={onShowPlanModal}
      style={{ display: 'inline-block', background: '#4f46e5', color: 'white', fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 15, padding: '13px 32px', borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'transform 200ms, box-shadow 200ms', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.3)'; }}>
      {ctaLabel}
    </button>
  </div>
);

const DashUpload = ({ quota, onShowPlanModal }) => {
  const [step, setStep] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const checks = ['Parseando mensajes','Identificando conversaciones','Analizando sentimiento y calidad','Generando reporte PDF'];

  useEffect(() => {
    if (step === 3) {
      let p = 0;
      const t = setInterval(() => {
        p += Math.random() * 8 + 2;
        if (p >= 100) { p = 100; clearInterval(t); setTimeout(() => setDone(true), 400); }
        setProgress(Math.min(p, 100));
      }, 200);
      return () => clearInterval(t);
    }
  }, [step]);

  const checkIdx = Math.floor(progress / 25);

  // Plan feature gate: only Plus and Enterprise can upload manually
  if (quota && !quota.features?.manual_upload) {
    return (
      <div className="dash-page page-fade">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0e0749', marginBottom: 4, letterSpacing: '-0.02em' }}>Subida manual de archivos</h1>
          <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.55)' }}>Sube archivos .txt de WhatsApp para análisis sin conexión directa.</p>
        </div>
        <PlanGateUpload
          icon="upload"
          title="Función exclusiva de Plan Plus y Enterprise"
          body="La subida manual de archivos .txt de WhatsApp está disponible desde el Plan Plus ($250.000/mes). Con él también obtienes 2 reportes al mes, 300 conversaciones por reporte, y acceso al dashboard de tendencias."
          onShowPlanModal={onShowPlanModal}
        />
      </div>
    );
  }

  // Quota exhausted gate
  if (quota && quota.reports?.remaining === 0) {
    const periodEnd = new Date(quota.billing_period_end).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
    return (
      <div className="dash-page page-fade">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0e0749', marginBottom: 4, letterSpacing: '-0.02em' }}>Nuevo análisis de WhatsApp</h1>
          <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.55)' }}>Sube tu archivo de chat y genera un reporte profesional en minutos.</p>
        </div>
        <PlanGateUpload
          icon="alert"
          title="Cuota del mes agotada"
          body={`Has usado los ${quota.reports.limit} reporte(s) incluidos en tu plan este período. Tu cuota se renueva el ${periodEnd}. Actualiza a un plan superior para obtener más reportes por mes.`}
          onShowPlanModal={onShowPlanModal}
          ctaLabel="Cambiar de plan"
        />
      </div>
    );
  }

  return (
    <div className="dash-page page-fade">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0e0749', marginBottom: 4, letterSpacing: '-0.02em' }}>Nuevo análisis de WhatsApp</h1>
        <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.55)' }}>Sube tu archivo de chat y genera un reporte profesional en minutos.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36, gap: 0 }}>
        {['Subir archivo','Configurar análisis','Procesar'].map((s, i) => {
          const active = step === i + 1;
          const done2 = step > i + 1;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: done2 ? '#4f46e5' : active ? '#4f46e5' : '#ededed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: (active || done2) ? 'white' : 'rgba(14,7,73,0.4)', fontWeight: 700, fontSize: 13, transition: 'all 300ms', flexShrink: 0 }}>
                  {done2 ? <Icon name="check" size={14} color="white" /> : i + 1}
                </div>
                <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#0e0749' : 'rgba(14,7,73,0.45)', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? '#4f46e5' : '#ededed', margin: '0 12px', transition: 'background 300ms' }} />}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }} className="upload-layout">
          <style>{`@media(max-width:900px){.upload-layout{grid-template-columns:1fr!important}}`}</style>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) { setFileName(f.name); setTimeout(() => setStep(2), 500); } }}
            style={{ border: `2px dashed ${dragging ? '#4f46e5' : '#a78bfa'}`, background: dragging ? '#f0effe' : 'white', borderRadius: 16, padding: '60px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, transition: 'all 200ms', cursor: 'pointer', textAlign: 'center' }}
            onClick={() => { setFileName('chats_ejemplo.txt'); setTimeout(() => setStep(2), 300); }}>
            <div style={{ width: 80, height: 80, background: 'rgba(79,70,229,0.08)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="upload" size={40} color="#4f46e5" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0e0749' }}>Arrastra tu archivo aquí</div>
            <div style={{ fontSize: 15, color: 'rgba(14,7,73,0.5)' }}>o haz clic para seleccionar</div>
            <div style={{ fontSize: 13, color: 'rgba(14,7,73,0.4)' }}>Archivos .txt de WhatsApp Business · Máx. 10 MB</div>
            <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 15, marginTop: 8 }} onClick={e => { e.stopPropagation(); setFileName('chats_ejemplo.txt'); setTimeout(() => setStep(2), 300); }}>Seleccionar archivo</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#f4f3ff', border: '1px solid rgba(79,70,229,0.12)', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, background: 'rgba(79,70,229,0.1)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="help" size={18} color="#4f46e5" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0749' }}>¿Cómo exporto mi chat?</div>
              </div>
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                {['Abre WhatsApp Business','Toca el nombre del contacto','Selecciona "Exportar chat"','Elige "Sin archivos multimedia"','Sube el archivo .txt aquí'].map((s,i) => (
                  <li key={i} style={{ fontSize: 13, color: 'rgba(14,7,73,0.7)', marginBottom: 6, lineHeight: 1.5 }}>{s}</li>
                ))}
              </ol>
            </div>
            <div style={{ background: 'white', border: '1px solid #ededed', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0e0749', marginBottom: 10 }}>Privacidad y seguridad</div>
              {['Tus chats se procesan de forma encriptada','Nunca compartimos tu información','Puedes eliminar tus datos en cualquier momento'].map((t,i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, fontSize: 13, color: 'rgba(14,7,73,0.65)' }}>
                  <Icon name="shield" size={14} color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ background: '#f0fff4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <Icon name="check" size={16} color="#22c55e" />
            <span style={{ fontSize: 14, color: '#166534', fontWeight: 500 }}>Archivo cargado: <strong>{fileName}</strong></span>
          </div>
          <div className="dash-g2" style={{ marginBottom: 28 }}>
            {[
              { label:'Nombre del análisis', def:'Análisis del 19 de abril, 2026', ph:'' },
              { label:'Valor promedio de tu venta/servicio (COP)', def:'', ph:'Ej. 150000 — Opcional' },
            ].map(({ label, def, ph }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0e0749', marginBottom: 6 }}>{label}</label>
                <input defaultValue={def} placeholder={ph} style={{ width: '100%', background: '#f4f4f6', border: '1.5px solid #e4e4e8', borderRadius: 8, height: 48, padding: '0 16px', fontSize: 15, color: '#0e0749', outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }} onFocus={e=>e.target.style.borderColor='#4f46e5'} onBlur={e=>e.target.style.borderColor='#e4e4e8'} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0e0749', marginBottom: 6 }}>Tipo de negocio</label>
              <select defaultValue="Belleza/Estética" style={{ width: '100%', background: '#f4f4f6', border: '1.5px solid #e4e4e8', borderRadius: 8, height: 48, padding: '0 16px', fontSize: 15, color: '#0e0749', outline: 'none', fontFamily: 'DM Sans,sans-serif' }}>
                {['Clínica/Salud','Belleza/Estética','Restaurante','Tienda/Retail','Servicios','Otro'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => setStep(3)} className="btn-primary" style={{ width: '100%', height: 52, fontSize: 16 }}>Iniciar análisis</button>
        </div>
      )}

      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          {!done ? (
            <>
              <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid #ededed', borderTop: '4px solid #4f46e5', margin: '0 auto 28px', animation: 'spin 0.8s linear infinite' }} />
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0e0749', marginBottom: 8 }}>Analizando tus conversaciones...</h2>
              <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.55)', marginBottom: 32 }}>Esto puede tomar 2-3 minutos. Te notificaremos cuando esté listo.</p>
              <div style={{ background: '#ededed', borderRadius: 8, height: 6, maxWidth: 480, margin: '0 auto 32px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg,#4f46e5,#a78bfa)', borderRadius: 8, width: `${progress}%`, transition: 'width 200ms' }} />
              </div>
              <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {checks.map((c, i) => (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: i <= checkIdx ? '#0e0749' : 'rgba(14,7,73,0.35)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: i < checkIdx ? '#4f46e5' : i === checkIdx ? 'rgba(79,70,229,0.1)' : '#ededed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 300ms' }}>
                      {i < checkIdx ? <Icon name="check" size={12} color="white" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === checkIdx ? '#4f46e5' : 'transparent' }} />}
                    </div>
                    {c}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="page-fade">
              <div style={{ width: 72, height: 72, background: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Icon name="check" size={36} color="white" />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0e0749', marginBottom: 8 }}>¡Reporte listo!</h2>
              <p style={{ fontSize: 15, color: 'rgba(14,7,73,0.55)', marginBottom: 28 }}>Tu análisis ha sido generado con éxito.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>Ver reporte PDF</button>
                <button onClick={() => { setStep(1); setDone(false); setProgress(0); }} className="btn-ghost" style={{ padding: '12px 24px', fontSize: 15 }}>Nuevo análisis</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashUpload;
