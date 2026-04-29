import { Icon, DeepLookLogo } from './Icons';

const CONTENT = {
  privacy: {
    title: 'Política de Privacidad',
    updated: '29 de abril de 2026',
    sections: [
      {
        heading: 'Nuestra promesa',
        body: `En DeepLook tu información es tuya. No vendemos tus datos a nadie, no los compartimos con anunciantes, ni los usamos para entrenar modelos de inteligencia artificial de terceros.

Construimos DeepLook con la convicción de que las pequeñas y medianas empresas merecen herramientas analíticas serias sin tener que sacrificar la privacidad de su información comercial. Esta política explica exactamente qué datos manejamos, para qué, y qué control tienes sobre ellos.`,
      },
      {
        heading: '1. Identificación del responsable',
        body: `DeepLook S.A.S. es el responsable del tratamiento de tus datos personales en los términos de la Ley 1581 de 2012, su Decreto Reglamentario 1377 de 2013, y demás normas concordantes de la República de Colombia.

Razón social: DeepLook S.A.S.
Domicilio: Bogotá D.C., Colombia
Correo de contacto en privacidad: privacidad@deeplookapp.com
Sitio web: https://deeplookapp.com`,
      },
      {
        heading: '2. Información que recopilamos',
        body: `Recopilamos únicamente la información necesaria para prestar el servicio:

Datos de cuenta: nombre completo, correo electrónico, número de teléfono y nombre de tu negocio.

Datos del negocio: tipo de negocio, identificadores que el usuario asocia a su negocio, valor promedio de transacción (opcional).

Datos de uso: información sobre cómo usas la plataforma (páginas visitadas, fechas de inicio de sesión, reportes generados). Esto se usa solo para mejorar el servicio.

Datos de las conversaciones a analizar: cuando solicitas un análisis, procesamos los metadatos de las conversaciones (fechas, duración, frecuencia, sentimiento) para generar tu reporte.

NO recopilamos: datos de tarjetas de crédito (los procesa Wompi directamente), datos de ubicación en tiempo real, datos biométricos, información sobre tus contactos personales, ni cualquier otra información sensible no relacionada con el servicio.`,
      },
      {
        heading: '3. Finalidades del tratamiento',
        body: `Tus datos personales son tratados exclusivamente para las siguientes finalidades:

• Prestar el servicio de análisis de conversaciones y generación de reportes que solicitas
• Gestionar tu cuenta, suscripción y facturación
• Enviarte notificaciones operacionales (reportes listos, recordatorios de renovación, alertas de seguridad)
• Cumplir con obligaciones legales, contables y tributarias en Colombia
• Mejorar la calidad del servicio basándonos en patrones de uso agregados y anonimizados
• Atender solicitudes, peticiones, reclamos y reportes de seguridad

Cualquier otro uso requeriría tu autorización expresa.`,
      },
      {
        heading: '4. Lo que NO hacemos con tu información',
        body: `Para que no haya dudas, declaramos expresamente que:

• NO vendemos tus datos a terceros bajo ninguna circunstancia
• NO compartimos tus datos con redes de publicidad, analytics de marketing, ni brokers de datos
• NO usamos el contenido de tus reportes para entrenar modelos propios o de terceros
• NO accedemos manualmente a tu información salvo casos estrictamente operativos (soporte solicitado por ti, investigación de incidentes de seguridad, requerimiento legal de autoridad competente)
• NO retenemos tus datos después de que canceles tu cuenta más allá de los plazos legales mínimos requeridos por las normas tributarias y contables colombianas
• NO transferimos tus datos a países sin un nivel adecuado de protección sin tu consentimiento`,
      },
      {
        heading: '5. Almacenamiento y seguridad',
        body: `Aplicamos medidas técnicas y organizativas razonables para proteger tu información:

• Cifrado en tránsito (TLS 1.3) en todas las comunicaciones entre tu dispositivo y nuestros servidores
• Cifrado en reposo (AES-256) en todas las bases de datos y sistemas de almacenamiento
• Autenticación gestionada por un proveedor certificado SOC 2 (no almacenamos contraseñas en texto plano ni con hash reversible)
• Acceso a producción restringido al equipo técnico estrictamente necesario, con autenticación de dos factores obligatoria
• Registro de auditoría de accesos privilegiados
• Respaldos diarios cifrados con retención de 30 días

Aunque ningún sistema es 100% inviolable, trabajamos para mantener nuestras prácticas alineadas con los estándares de la industria. En caso de incidente de seguridad que afecte tus datos, te notificaremos en un plazo máximo de 72 horas y reportaremos a la Superintendencia de Industria y Comercio (SIC) según lo exige la ley.`,
      },
      {
        heading: '6. Tiempo de conservación',
        body: `Conservamos tus datos solo durante el tiempo necesario para las finalidades descritas:

• Datos de cuenta: mientras tu cuenta esté activa
• Reportes generados: mientras tu cuenta esté activa o hasta que solicites su eliminación
• Datos de facturación: 5 años después de la última transacción (obligación tributaria — Estatuto Tributario Art. 632)
• Logs técnicos de seguridad: 6 meses

Cuando eliminas tu cuenta, borramos todos tus datos personales y reportes en un plazo máximo de 30 días, conservando únicamente los datos cuya retención sea obligatoria por ley.`,
      },
      {
        heading: '7. Tus derechos como titular (Habeas Data)',
        body: `Como titular de tus datos personales, en virtud de la Ley 1581 de 2012, tienes los siguientes derechos:

a. Conocer tus datos: solicitar acceso a la información que tenemos sobre ti.

b. Actualizar y rectificar: pedir la corrección de cualquier dato inexacto o incompleto.

c. Solicitar la supresión: pedir la eliminación de tus datos cuando ya no sean necesarios o cuando consideres que el tratamiento no se ajusta a la ley.

d. Revocar la autorización: retirar el consentimiento que diste para el tratamiento de tus datos en cualquier momento.

e. Acceder gratuitamente: a la información que reposa sobre ti, al menos una vez cada mes calendario.

f. Presentar quejas ante la SIC: si consideras que hemos vulnerado tus derechos, puedes acudir a la Superintendencia de Industria y Comercio.

g. Ser informado: sobre el uso que hemos dado a tus datos personales.`,
      },
      {
        heading: '8. Procedimiento para ejercer tus derechos',
        body: `Para ejercer cualquiera de tus derechos:

1. Envía un correo a privacidad@deeplookapp.com con el asunto "Solicitud Habeas Data"

2. Incluye en el cuerpo del mensaje:
   • Tu nombre completo
   • El correo electrónico asociado a tu cuenta
   • El derecho que deseas ejercer
   • Una descripción clara de tu solicitud

3. Te confirmaremos la recepción en máximo 2 días hábiles.

4. Resolveremos tu solicitud en un plazo máximo de 15 días hábiles (consultas) o 15 días hábiles (reclamos), prorrogables por 8 días hábiles adicionales en casos justificados.

Para una mayor agilidad, también puedes ejercer los siguientes derechos directamente desde la plataforma: actualizar datos (Configuración → Perfil), descargar tus datos (Configuración → Exportar mis datos), y eliminar tu cuenta (Configuración → Zona de peligro).`,
      },
      {
        heading: '9. Subprocesadores autorizados',
        body: `Para prestar el servicio, contamos con proveedores especializados que pueden tener acceso técnico (no comercial) a porciones de tu información. Cada uno está sujeto a cláusulas contractuales de confidencialidad y a su propia política de privacidad:

• Supabase Inc. (Estados Unidos) — almacenamiento de base de datos y archivos. Certificado SOC 2 Type II.
• Clerk Inc. (Estados Unidos) — autenticación de usuarios. Certificado SOC 2.
• Resend (Estados Unidos) — envío de correos transaccionales operacionales.
• Wompi (Colombia) — procesamiento de pagos. Certificado PCI-DSS.
• Hetzner Online GmbH (Alemania) — infraestructura de servidores. Certificado ISO 27001.
• Proveedores de inteligencia artificial (OpenAI, Anthropic o Google, según configuración) — generación de reportes. Operan bajo políticas de no-entrenamiento sobre datos de API.

Las transferencias internacionales se realizan al amparo del Art. 26 de la Ley 1581/2012 y bajo cláusulas contractuales tipo aprobadas por autoridades europeas y suramericanas.`,
      },
      {
        heading: '10. Cookies',
        body: `Usamos cookies estrictamente necesarias para el funcionamiento de la plataforma (mantener tu sesión iniciada, recordar preferencias de interfaz). NO usamos cookies de seguimiento publicitario, fingerprinting, ni analítica de terceros.

Puedes desactivar las cookies desde tu navegador, aunque la plataforma no funcionará correctamente sin las cookies de sesión.`,
      },
      {
        heading: '11. Niños y adolescentes',
        body: `DeepLook es un servicio para empresas y no está dirigido a menores de 18 años. No recopilamos a sabiendas información de menores. Si descubres que un menor de edad ha creado una cuenta, contáctanos y eliminaremos sus datos de inmediato.`,
      },
      {
        heading: '12. Cambios a esta política',
        body: `Podemos actualizar esta política para reflejar cambios en el servicio, en la regulación aplicable, o en nuestras prácticas operativas. Cuando hagamos un cambio relevante:

• Te notificaremos por correo electrónico con al menos 15 días de anticipación
• Publicaremos la nueva versión en esta misma página con la fecha de actualización
• Para cambios sustanciales que afecten el alcance del tratamiento, solicitaremos tu autorización expresa nuevamente

El uso continuo del servicio después de la entrada en vigencia constituye aceptación de la versión actualizada.`,
      },
      {
        heading: '13. Contacto y autoridad de control',
        body: `Para cualquier consulta, queja o ejercicio de derechos:

DeepLook S.A.S.
Correo (privacidad): privacidad@deeplookapp.com
Correo (general): contacto@deeplookapp.com
Domicilio: Bogotá D.C., Colombia

Si consideras que tus derechos no han sido respetados, puedes presentar una queja ante la Superintendencia de Industria y Comercio (SIC) — entidad de control en Colombia para temas de protección de datos personales:

Sitio web: https://www.sic.gov.co
Línea gratuita: 01 8000 910 165
Correo: contactenos@sic.gov.co`,
      },
    ],
  },
  terms: {
    title: 'Términos de Servicio',
    updated: '29 de abril de 2026',
    sections: [
      {
        heading: '1. Aceptación de los términos',
        body: `Al crear una cuenta, marcar la casilla de aceptación durante el registro o usar cualquier servicio de DeepLook, aceptas en su totalidad estos Términos de Servicio y nuestra Política de Privacidad. Si no estás de acuerdo con alguna parte, debes abstenerte de usar el servicio.

Estos términos constituyen un contrato vinculante entre tú (en adelante "el Usuario" o "el Cliente") y DeepLook S.A.S. (en adelante "DeepLook", "nosotros" o "la plataforma"), regido por las leyes de la República de Colombia.`,
      },
      {
        heading: '2. Descripción del servicio',
        body: `DeepLook es una plataforma SaaS (software como servicio) que ofrece análisis de conversaciones comerciales y genera reportes con métricas de atención al cliente, sentimiento, calidad de respuesta y oportunidades de mejora.

El servicio se presta en los planes vigentes al momento de la contratación, con los límites y características publicados en la página de planes. DeepLook se reserva el derecho de mejorar, ajustar o ampliar las funcionalidades en el tiempo.`,
      },
      {
        heading: '3. Tu cuenta',
        body: `Para usar el servicio debes crear una cuenta proporcionando información verídica y actualizada. Eres el único responsable de:

• Mantener la confidencialidad de tus credenciales de acceso
• Todas las actividades que ocurran bajo tu cuenta
• Notificarnos inmediatamente cualquier uso no autorizado

Una sola persona o entidad por cuenta. Está prohibido revender el acceso a tu cuenta o compartir tus credenciales con terceros no autorizados.`,
      },
      {
        heading: '4. Uso aceptable',
        body: `Te comprometes a:

• Cargar únicamente información sobre la cual tienes derecho legal para procesarla
• Cumplir con todas las leyes aplicables al usar el servicio, incluyendo normas de protección de datos personales y propiedad intelectual
• No usar el servicio para actividades ilegales, fraudulentas, difamatorias, discriminatorias o que vulneren derechos de terceros
• No intentar acceder a datos de otros usuarios, comprometer la seguridad de la plataforma, ni realizar ingeniería inversa del software
• No sobrecargar intencionalmente nuestra infraestructura mediante automatización excesiva o ataques de denegación de servicio
• No revender, redistribuir ni sublicenciar el servicio sin autorización escrita

Cualquier violación de estas condiciones puede resultar en la suspensión inmediata de la cuenta sin derecho a reembolso.`,
      },
      {
        heading: '5. Planes, pagos y facturación',
        body: `Los precios están expresados en Pesos Colombianos (COP) e incluyen IVA cuando corresponda. Los pagos se procesan a través de Wompi, pasarela certificada PCI-DSS — DeepLook no almacena información de tu tarjeta.

Las suscripciones se cobran de forma anticipada por períodos mensuales. Al pagar, autorizas el cobro recurrente al medio de pago registrado.

Cancelaciones: puedes cancelar tu suscripción en cualquier momento desde Configuración. Conservas acceso al servicio hasta el final del período ya pagado. No realizamos reembolsos por períodos parciales no consumidos, salvo en los casos contemplados por la ley colombiana o en discontinuación del servicio por nuestra parte.

Cambios de precio: cualquier modificación de precios se comunicará con al menos 30 días de anticipación y entrará en vigencia en tu siguiente ciclo de facturación.`,
      },
      {
        heading: '6. Propiedad intelectual',
        body: `DeepLook y todos sus componentes (marca, diseño, código, algoritmos, plantillas, documentación) son propiedad exclusiva de DeepLook S.A.S. y están protegidos por las leyes de propiedad intelectual.

Tus datos: la información que cargas a la plataforma sigue siendo tuya. Nos otorgas únicamente la licencia limitada necesaria para procesar dicha información y prestarte el servicio. Esta licencia termina automáticamente cuando elimines la información o canceles tu cuenta.

Reportes generados: los reportes generados a partir de tus datos son de tu propiedad para uso personal, comercial e interno de tu organización. No puedes redistribuirlos como producto propio.`,
      },
      {
        heading: '7. Limitación de responsabilidad',
        body: `El servicio se presta "tal como está" y "según disponibilidad". Aunque trabajamos para mantener una alta calidad y disponibilidad del servicio, no garantizamos:

• La exactitud absoluta de los análisis e inferencias generados (las recomendaciones son herramientas de apoyo, no sustituyen asesoría profesional)
• La continuidad ininterrumpida del servicio (pueden existir mantenimientos programados o caídas no planificadas)
• La compatibilidad con todos los formatos o casos de uso particulares

Salvo en casos de dolo o culpa grave, la responsabilidad total acumulada de DeepLook frente a cualquier reclamo derivado del servicio se limita al monto efectivamente pagado por el Usuario en los 12 meses anteriores al hecho generador del reclamo.

DeepLook no será responsable por daños indirectos, lucro cesante, pérdida de oportunidades comerciales, ni daños consecuentes de cualquier naturaleza.`,
      },
      {
        heading: '8. Suspensión y terminación',
        body: `DeepLook puede suspender o terminar tu cuenta en los siguientes casos:

• Incumplimiento material de estos Términos
• Falta de pago después del período de gracia
• Uso fraudulento o ilegal del servicio
• Requerimiento de autoridad competente

Tú puedes terminar el contrato en cualquier momento eliminando tu cuenta desde Configuración. La terminación no afecta las obligaciones nacidas durante la vigencia del contrato (pagos pendientes, indemnidades, etc.).`,
      },
      {
        heading: '9. Modificaciones al servicio y a estos términos',
        body: `Nos reservamos el derecho de modificar, suspender o descontinuar funcionalidades del servicio. Para cambios materiales que afecten significativamente la prestación, te avisaremos con al menos 30 días de anticipación.

Estos Términos pueden actualizarse para reflejar cambios legales o de producto. La nueva versión se publicará en esta página con la fecha actualizada y, si los cambios son sustanciales, te lo notificaremos por correo electrónico. El uso continuo del servicio después de la entrada en vigencia constituye aceptación.`,
      },
      {
        heading: '10. Ley aplicable y resolución de disputas',
        body: `Estos Términos se rigen por las leyes de la República de Colombia. Cualquier controversia que surja en relación con estos Términos, su interpretación o ejecución, se intentará resolver primero de buena fe entre las partes.

Si no se logra acuerdo en un plazo de 30 días, la disputa se someterá a la jurisdicción ordinaria de los jueces civiles de Bogotá D.C., Colombia.

Lo anterior sin perjuicio de los derechos del consumidor consagrados en la Ley 1480 de 2011 (Estatuto del Consumidor) cuando el Usuario califique como consumidor, ni de los procedimientos administrativos de la SIC en materia de protección de datos personales.`,
      },
      {
        heading: '11. Disposiciones generales',
        body: `Acuerdo completo: estos Términos junto con la Política de Privacidad constituyen el acuerdo total entre las partes y reemplazan cualquier acuerdo o entendimiento previo sobre la materia.

Cesión: no puedes ceder tus derechos u obligaciones bajo estos Términos sin autorización escrita de DeepLook. DeepLook puede ceder este contrato en caso de fusión, adquisición o reorganización corporativa, garantizando la continuidad del servicio.

Divisibilidad: si alguna cláusula resulta inválida o inaplicable, las demás conservarán plena vigencia.

Renuncia: la falta de exigir el cumplimiento de cualquier disposición no constituye renuncia al derecho de hacerlo en el futuro.

Notificaciones: las notificaciones formales se realizarán por correo electrónico a las direcciones registradas por cada parte.`,
      },
      {
        heading: '12. Contacto',
        body: `Para cualquier consulta sobre estos Términos:

DeepLook S.A.S.
Correo (legal): legal@deeplookapp.com
Correo (privacidad): privacidad@deeplookapp.com
Correo (soporte): contacto@deeplookapp.com
Domicilio: Bogotá D.C., Colombia`,
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
