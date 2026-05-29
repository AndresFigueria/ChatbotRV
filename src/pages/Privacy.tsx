import { Link } from 'react-router-dom';

export default function Privacy() {
  const BUSINESS_EMAIL = 'soporte@robotinacentral.com';
  const LEGAL_RUC = '15607181699';
  const LEGAL_NAME = 'Robotina Central';
  const BUSINESS_PHONE = '+54 9 11 6599-4057';

  return (
    <div style={{
      backgroundColor: '#0a0b10',
      color: '#e9edef',
      fontFamily: 'Inter, system-ui, sans-serif',
      minHeight: '100vh',
      padding: '4rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '25%',
        width: '500px',
        height: '500px',
        backgroundColor: 'rgba(0, 255, 102, 0.03)',
        filter: 'blur(100px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '800px', width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Header / Brand */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '1.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#00ff66',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0, 255, 102, 0.4)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: '#050508', fontWeight: 800 }}>terminal</span>
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Robotina Central</span>
          </Link>
          <Link to="/" style={{
            color: 'var(--emerald-400)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Volver al inicio
          </Link>
        </div>

        {/* Card Container */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          lineHeight: '1.7',
          fontSize: '0.95rem'
        }}>
          <h1 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-1px' }}>
            Política de Privacidad
          </h1>
          <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
            Última actualización: 28 de mayo de 2026
          </p>

          <p style={{ marginBottom: '1.5rem' }}>
            En **{LEGAL_NAME}** (en adelante, "la Empresa"), nos tomamos muy en serio la privacidad y seguridad de los datos personales de nuestros usuarios y de los clientes finales de estos. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos la información personal y los datos procesados en nuestra plataforma SaaS.
          </p>

          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 800 }}>1.</span> Identidad del Responsable
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            El responsable del tratamiento de sus datos personales es **{LEGAL_NAME}**, constituido como persona jurídica con RUC **{LEGAL_RUC}**. Para cualquier consulta o derecho relacionado con sus datos personales, puede comunicarse con nosotros a través del correo electrónico de soporte: **{BUSINESS_EMAIL}** o al teléfono **{BUSINESS_PHONE}**.
          </p>

          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 800 }}>2.</span> Datos que Recopilamos
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Recopilamos información bajo dos modalidades principales:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <strong>Datos de registro y facturación:</strong> Nombre completo, correo electrónico, número de teléfono de contacto, información de facturación (procesada de forma segura por terceros como Rebill/dLocal Go) y sector del negocio del cliente que contrata el servicio.
            </li>
            <li>
              <strong>Datos de conversación y CRM:</strong> Procesamos de manera automatizada las interacciones por WhatsApp que los clientes finales sostienen con el bot configurado en sus cuentas. Esto incluye números de teléfono, nombres declarados, intenciones de compra, fechas y horarios de citas solicitadas e historiales de mensajes asociados.
            </li>
          </ul>

          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 800 }}>3.</span> Uso y Finalidad de los Datos
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Utilizamos los datos exclusivamente para:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Proveer, mantener y optimizar la plataforma SaaS de automatización conversacional.</li>
            <li>Gestionar el Dashboard de CRM para que el usuario pueda visualizar sus leads y clientes.</li>
            <li>Procesar de forma segura los cobros de planes de suscripción y configuraciones iniciales.</li>
            <li>Brindar soporte técnico y resolver incidencias de integración con la API de Meta.</li>
          </ul>

          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 800 }}>4.</span> Seguridad de los Datos
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Implementamos medidas de seguridad técnicas, administrativas y organizativas rigurosas para prevenir accesos no autorizados, pérdidas o alteraciones de los datos personales. La comunicación entre nuestra plataforma, el Dashboard y los servidores externos está cifrada mediante certificados SSL/TLS estándar en la industria.
          </p>

          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 800 }}>5.</span> Compartición de Datos con Terceros
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            No vendemos ni alquilamos datos personales a terceros. Los datos solo se comparten con proveedores de infraestructura tecnológica autorizados estrictamente necesarios para proveer el servicio (como Supabase para almacenamiento y Meta para la API de WhatsApp Business), de conformidad con la normativa legal de protección de datos de carácter personal.
          </p>

          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 800 }}>6.</span> Derechos del Usuario (ARCO)
          </h2>
          <p style={{ marginBottom: '0' }}>
            Los usuarios pueden ejercer en cualquier momento sus derechos de acceso, rectificación, cancelación y oposición (ARCO) sobre sus datos personales enviando una solicitud formal por escrito a nuestro correo de contacto **{BUSINESS_EMAIL}**, especificando el detalle de la solicitud y adjuntando una copia de su identificación oficial para constancia legal.
          </p>
        </div>

        {/* Footer text */}
        <p style={{ textAlign: 'center', color: 'var(--secondary)', fontSize: '0.8rem', marginTop: '2.5rem' }}>
          El uso de la plataforma de {LEGAL_NAME} implica la plena aceptación de esta política de privacidad.
        </p>
      </div>
    </div>
  );
}
