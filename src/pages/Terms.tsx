import { Link } from 'react-router-dom';

export default function Terms() {
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
            Términos y Condiciones de Uso
          </h1>
          <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
            Última actualización: 27 de mayo de 2026
          </p>

          <p style={{ marginBottom: '1.5rem' }}>
            Bienvenido a **Robotina Central**. Al contratar y hacer uso de nuestra plataforma, software y servicios de automatización de WhatsApp, usted acepta y se compromete a cumplir de manera irrestricta los siguientes términos y condiciones de uso. Por favor, léalos detenidamente.
          </p>

          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 800 }}>1.</span> Descripción del Servicio
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Robotina Central proporciona una plataforma de software SaaS (Software as a Service) que permite la automatización de conversaciones, integraciones de inteligencia artificial conversacional y gestión de leads y reportes por medio de la API oficial de WhatsApp (Meta).
          </p>

          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 800 }}>2.</span> Planes, Suscripción y Costo de Configuración
          </h2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <strong>Cargos Recurrentes:</strong> Al suscribirse a cualquiera de nuestros planes (Starter, Growth, Advanced), usted autoriza el cobro mensual automático recurrente del precio del plan contratado mediante el procesador de pagos (Rebill u otros autorizados).
            </li>
            <li>
              <strong style={{ color: '#fff' }}>Costo de Configuración (Setup Fee):</strong> Todos nuestros planes incluyen un cargo de configuración inicial y único al momento de la contratación. Este cargo cubre los costos de aprovisionamiento de servidores, asignación de APIs y el tiempo de ingeniería de onboarding personalizado. <strong>Este cargo de configuración es 100% NO REEMBOLSABLE</strong> bajo ninguna circunstancia, incluso si el cliente decide cancelar el servicio antes del primer mes de uso.
            </li>
          </ul>

          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 800 }}>3.</span> Política de WhatsApp y Suspensión de Números
          </h2>
          <p style={{ marginBottom: '1.5rem', color: '#e9edef' }}>
            El uso de la automatización está sujeto estrictamente a las Políticas de Comercio y de Negocios de WhatsApp (Meta). 
          </p>
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            borderLeft: '4px solid #ef4444',
            padding: '1.25rem',
            borderRadius: '0 12px 12px 0',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: '#f87171'
          }}>
            <strong>IMPORTANTE Y SALVAGUARDA DE RESPONSABILIDAD:</strong> Robotina Central no se responsabiliza, bajo ningún concepto, por posibles bloqueos, suspensiones temporales o definitivas de su número de teléfono por parte de Meta/WhatsApp. El envío de spam, la falta de consentimiento de los destinatarios para recibir mensajes o cualquier infracción a las normativas de Meta es de exclusiva responsabilidad del usuario. La suspensión del número no dará derecho a reembolsos por el servicio contratado.
          </div>

          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 800 }}>4.</span> Cancelación del Servicio
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Usted puede dar de baja su suscripción en cualquier momento directamente desde su panel de facturación o enviando un correo a soporte. La cancelación tendrá efecto al finalizar el ciclo de facturación mensual en curso. No se emitirán reembolsos parciales ni proporcionales por días no utilizados en el mes corriente.
          </p>

          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 800 }}>5.</span> Limitación de Responsabilidad
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Robotina Central proporciona la plataforma "tal cual" ("as is"), sin garantías implícitas de ningún tipo sobre la disponibilidad ininterrumpida. La responsabilidad total de Robotina Central ante cualquier reclamación o daño se limitará a la cantidad pagada por el cliente por el servicio durante el último mes de facturación.
          </p>

          <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 800 }}>6.</span> Ley Aplicable y Jurisdicción
          </h2>
          <p style={{ marginBottom: '0' }}>
            Estos términos se rigen e interpretan según las leyes vigentes de la República del Perú. Cualquier controversia derivada de este acuerdo será resuelta ante los tribunales y juzgados de la ciudad de Lima, Perú, renunciando expresamente a cualquier otra jurisdicción aplicable.
          </p>
        </div>

        {/* Footer text */}
        <p style={{ textAlign: 'center', color: 'var(--secondary)', fontSize: '0.8rem', marginTop: '2.5rem' }}>
          Al proceder con el pago, usted confirma que acepta plenamente estos términos y condiciones.
        </p>
      </div>
    </div>
  );
}
