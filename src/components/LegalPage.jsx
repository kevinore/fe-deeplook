import { Icon, DeepLookLogo } from './Icons';

const CONTENT = {
  privacy: {
    title: 'Política de Privacidad',
    updated: '1 de abril de 2026',
    sections: [
      {
        heading: '1. Información que recopilamos',
        body: `Recopilamos la información que nos proporcionas directamente al registrarte o usar nuestros servicios: nombre completo, correo electrónico, nombre de tu negocio y tipo de negocio. También recopilamos los archivos de chat de WhatsApp Business que decides subir voluntariamente para su análisis.

No recopilamos datos de pago directamente — los pagos son procesados por terceros certificados (PSE, Wompi, Nequi) que cuentan con sus propias políticas de seguridad.`,
      },
      {
        heading: '2. Cómo usamos tu información',
        body: `Usamos tu información exclusivamente para:
• Generar los reportes de análisis que solicitas
• Enviarte notificaciones relacionadas con tu cuenta y reportes
• Mejorar la calidad de nuestro servicio
• Cumplir con obligaciones legales en Colombia

Nunca usamos tu información para publicidad de terceros ni la compartimos con otras empresas con fines comerciales.`,
      },
      {
        heading: '3. Almacenamiento y seguridad',
        body: `Tus archivos de chat se almacenan con encriptación AES-256 y solo durante el tiempo necesario para generar tu reporte. Puedes solicitar la eliminación completa de tus datos en cualquier momento desde Configuración > Zona de peligro.

Nuestros servidores están ubicados en centros de datos con certificación SOC 2 y cumplimos con las mejores prácticas de seguridad de la industria.`,
      },
      {
        heading: '4. Tus derechos (Habeas Data)',
        body: `De acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de la República de Colombia, tienes derecho a:
• Conocer, actualizar y rectificar tus datos personales
• Solicitar la eliminación de tus datos
• Revocar la autorización de tratamiento
• Acceder gratuitamente a tus datos

Para ejercer estos derechos escríbenos a privacidad@deeplook.co`,
      },
      {
        heading: '5. Cookies',
        body: `Usamos cookies de sesión estrictamente necesarias para el funcionamiento de la plataforma. No usamos cookies de seguimiento ni publicidad. Puedes desactivar las cookies en tu navegador, aunque esto puede afectar algunas funcionalidades de la plataforma.`,
      },
      {
        heading: '6. Cambios a esta política',
        body: `Podemos actualizar esta política ocasionalmente. Te notificaremos por correo electrónico con al menos 15 días de anticipación ante cualquier cambio relevante. El uso continuo del servicio después de dichos cambios constituye tu aceptación.`,
      },
      {
        heading: '7. Contacto',
        body: `Para cualquier pregunta sobre esta política de privacidad contáctanos:\n\nDeepLook S.A.S.\nCorreo: privacidad@deeplook.co\nDirección: Bogotá, Colombia`,
      },
    ],
  },
  terms: {
    title: 'Términos de Servicio',
    updated: '1 de abril de 2026',
    sections: [
      {
        heading: '1. Aceptación de los términos',
        body: `Al crear una cuenta o usar los servicios de DeepLook, aceptas estos Términos de Servicio en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debes usar el servicio.

Estos términos se rigen por las leyes de la República de Colombia.`,
      },
      {
        heading: '2. Descripción del servicio',
        body: `DeepLook es una plataforma SaaS que analiza conversaciones de WhatsApp Business exportadas por el usuario y genera reportes con métricas de atención al cliente. El servicio se presta "tal como está" en los planes disponibles en el momento de la contratación.`,
      },
      {
        heading: '3. Uso aceptable',
        body: `Te comprometes a:
• Subir únicamente archivos de chat de los que tienes autorización legal
• No usar el servicio para actividades ilegales
• No intentar acceder a datos de otros usuarios
• No sobrecargar intencionalmente nuestra infraestructura

Nos reservamos el derecho de suspender cuentas que violen estas condiciones sin previo aviso.`,
      },
      {
        heading: '4. Planes y pagos',
        body: `Los precios están expresados en COP (Pesos Colombianos) e incluyen IVA cuando aplique. Los planes de suscripción se cobran mensualmente de forma anticipada.

Puedes cancelar tu suscripción en cualquier momento. Al cancelar, conservas acceso hasta el final del período ya pagado. No hay reembolsos por períodos parciales.`,
      },
      {
        heading: '5. Propiedad intelectual',
        body: `DeepLook y todos sus componentes (marca, diseño, algoritmos, reportes generados) son propiedad de DeepLook S.A.S. Los reportes generados a partir de tus datos son de tu propiedad para uso personal y comercial.`,
      },
      {
        heading: '6. Limitación de responsabilidad',
        body: `DeepLook no garantiza la exactitud absoluta de los análisis generados. Los reportes son herramientas de apoyo a la toma de decisiones, no sustitutos de asesoría profesional. En ningún caso DeepLook será responsable por pérdidas indirectas o daños consecuentes derivados del uso del servicio.`,
      },
      {
        heading: '7. Modificaciones al servicio',
        body: `Nos reservamos el derecho de modificar, suspender o descontinuar cualquier aspecto del servicio con 30 días de aviso previo por correo electrónico. En caso de discontinuación total del servicio, reembolsaremos el tiempo proporcional no utilizado.`,
      },
      {
        heading: '8. Contacto',
        body: `Para consultas sobre estos términos:\n\nDeepLook S.A.S.\nCorreo: legal@deeplook.co\nDirección: Bogotá, Colombia`,
      },
    ],
  },
};

const LegalPage = ({ page, onNavigate }) => {
  const content = CONTENT[page] || CONTENT.privacy;
  return (
    <div className="page-fade" style={{ minHeight: '100vh', background: '#f8f7fc' }}>
      {/* Top bar */}
      <nav style={{ background: 'white', borderBottom: '1px solid #ededed', height: 68, display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => onNavigate('landing')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 8, color: '#4f46e5', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', padding: 0 }}>
            <Icon name="arrow_left" size={16} color="#4f46e5" /> Volver al inicio
          </button>
          <DeepLookLogo dark size="sm" />
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#4f46e5,#6c63ff)', padding: '56px 24px 48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 20 }}>
          <Icon name="shield" size={14} color="white" />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: '0.08em' }}>DOCUMENTO LEGAL</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: 'white', marginBottom: 12, letterSpacing: '-0.02em' }}>{content.title}</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>Última actualización: {content.updated}</p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #ededed', overflow: 'hidden' }}>
          {content.sections.map((s, i) => (
            <div key={i} style={{ padding: '32px 36px', borderBottom: i < content.sections.length - 1 ? '1px solid #ededed' : 'none' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0e0749', marginBottom: 14 }}>{s.heading}</h2>
              {s.body.split('\n').map((line, j) => (
                line.trim()
                  ? <p key={j} style={{ fontSize: 14, color: 'rgba(14,7,73,0.72)', lineHeight: 1.75, marginBottom: 10 }}>{line}</p>
                  : <div key={j} style={{ height: 6 }} />
              ))}
            </div>
          ))}
        </div>

        {/* Switch link */}
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'rgba(14,7,73,0.55)' }}>
          {page === 'privacy'
            ? <>¿Buscas los <button onClick={() => onNavigate('terms')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', fontSize: 14, padding: 0, fontFamily: 'DM Sans,sans-serif' }}>Términos de Servicio</button>?</>
            : <>¿Buscas la <button onClick={() => onNavigate('privacy')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', fontSize: 14, padding: 0, fontFamily: 'DM Sans,sans-serif' }}>Política de Privacidad</button>?</>
          }
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button onClick={() => onNavigate('landing')} className="btn-primary" style={{ padding: '12px 32px', fontSize: 15 }}>
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
