import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { InteractiveGlobe } from '../components/InteractiveGlobe';

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [chatStep, setChatStep] = useState(0);
  const [globeVisible, setGlobeVisible] = useState(false);
  const globeSectionRef = useRef<HTMLDivElement>(null);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingSegment, setBookingSegment] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'PEN'>('USD');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: string;
    setup: string;
    rebillUrl: string;
  } | null>(null);

  const DEMO_WHATSAPP_NUMBER = '573100000000'; // Reemplazar con tu número de WhatsApp real

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingPhone || !bookingSegment) {
      alert('Por favor completa todos los campos.');
      return;
    }
    const message = `¡Hola! Me llamo ${bookingName}, mi WhatsApp de negocio es ${bookingPhone} y mi giro es ${bookingSegment}. Me gustaría reservar una videollamada demo de Robotina Central.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${DEMO_WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
    setIsBookingOpen(false);
    setBookingName('');
    setBookingPhone('');
    setBookingSegment('');
  };

  // Lazy-mount globe only when its section enters the viewport
  useEffect(() => {
    const el = globeSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setGlobeVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-advance chat demo for a dynamic showcase
  useEffect(() => {
    const timer = setTimeout(() => {
      if (chatStep < 4) {
        setChatStep(prev => prev + 1);
      } else {
        // Reset after reaching the end
        const resetTimer = setTimeout(() => setChatStep(0), 7000);
        return () => clearTimeout(resetTimer);
      }
    }, chatStep === 0 ? 1500 : chatStep === 1 ? 3000 : chatStep === 2 ? 2500 : 3500);

    return () => clearTimeout(timer);
  }, [chatStep]);

  const faqs = [
    {
      q: "¿Para qué tipo de negocios sirve Robotina?",
      a: "Sirve para cualquier negocio que venda o atienda por WhatsApp: tiendas de e-commerce, prestadores de servicios profesionales (médicos, mecánicos, agencias), academias, inmobiliarias y, por supuesto, restaurantes. Si tu negocio recibe mensajes de clientes, Robotina te ayuda a automatizar y centralizar."
    },
    {
      q: "¿Cómo se centralizan los datos en el Dashboard?",
      a: "Cada vez que la IA interactúa con un cliente, registra la información clave (nombre, teléfono, producto de interés, fecha de cita o pedido) y la guarda al instante en tu base de datos. Tendrás un panel unificado para ver estadísticas, gestionar ventas y monitorear el estado de cada chat en tiempo real."
    },
    {
      q: "¿Qué sucede si el bot no entiende a un cliente?",
      a: "El bot reconoce sus límites. Ante preguntas complejas o solicitudes de hablar con un humano, la IA detiene la automatización temporalmente y envía una alerta visual y sonora a tu Dashboard para que un operador de tu equipo tome el control del chat manualmente."
    },
    {
      q: "¿De verdad procesa mensajes de voz (audios)?",
      a: "Sí. Robotina integra la tecnología Whisper de OpenAI. Transcribe notas de voz complejas en segundos, entiende la intención de compra del cliente y le responde de forma natural, reduciendo radicalmente el tiempo que tu equipo pasa escuchando audios."
    },
    {
      q: "¿Cómo es el proceso de configuración inicial?",
      a: "Es muy rápido. Conectas tu número a la API oficial de Meta y cargas tus productos, servicios o agenda de turnos en el Dashboard. Nosotros te guiamos paso a paso con nuestro onboarding asistido o lo configuramos por ti en menos de 24 horas."
    }
  ];

  return (
    <div style={{
      backgroundColor: 'var(--background)',
      color: 'var(--on-surface)',
      fontFamily: 'var(--font-family)',
      minHeight: '100vh',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* --- HEADER WRAPPER --- */}
      <div style={{
        width: '100%',
        backgroundImage: 'url("/Header.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        paddingBottom: '2rem'
      }}>
        {/* Dark overlay so text is readable across the entire header */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(10, 11, 16, 0.85)',
          zIndex: 0
        }} />

        {/* Background Glowing Lights (static, GPU-composited) */}
        <div className="bg-glow-container" style={{ zIndex: 0 }}>
          {/* Glow 1 - Orange Top Left */}
          <div className="bg-glow-blob" style={{
            top: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            backgroundColor: 'rgba(255, 90, 31, 0.13)'
          }}></div>
          {/* Glow 2 - Yellow Bottom Right */}
          <div className="bg-glow-blob" style={{
            bottom: '10%',
            right: '5%',
            width: '480px',
            height: '480px',
            backgroundColor: 'rgba(245, 158, 11, 0.10)'
          }}></div>
        </div>

        {/* 1. FLOATING NAVIGATION BAR */}
        <div style={{
          position: 'sticky',
          top: '1.5rem',
          left: 0,
          right: 0,
          zIndex: 1000,
          maxWidth: '1100px',
          width: 'calc(100% - 2rem)',
          margin: '0 auto',
          padding: '0.25rem'
        }}>
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 2rem',
            backgroundColor: 'rgba(10, 11, 16, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="brand-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#fff' }}>terminal</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>Robotina</span>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Central</span>
              </div>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-only">
              <a href="#how-it-works" style={{ color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Producto <span className="material-symbols-outlined" style={{ fontSize: '14px', opacity: 0.7 }}>keyboard_arrow_down</span>
              </a>
              <a href="#how-it-works" style={{ color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Clientes <span className="material-symbols-outlined" style={{ fontSize: '14px', opacity: 0.7 }}>keyboard_arrow_down</span>
              </a>
              <a href="#pricing" style={{ color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
                Planes
              </a>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <Link to="/login" style={{ color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                Iniciar sesión
              </Link>
              <button onClick={() => setIsBookingOpen(true)} className="btn-primary" style={{
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                borderRadius: '30px',
                padding: '0.6rem 1.4rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: '0 0 15px rgba(255, 85, 0, 0.25)'
              }}>
                Agendar Demo
              </button>
            </div>
          </nav>
        </div>

        {/* 2. HERO SECTION */}
        <section style={{
          width: '100%',
          position: 'relative',
          zIndex: 1,
          paddingTop: '2rem'
        }}>
          
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto 4rem auto',
            padding: '0 2rem',
            display: 'grid',
            gridTemplateColumns: '1.10fr 0.90fr',
            gap: '4rem',
            alignItems: 'center',
            position: 'relative'
          }} className="grid-auto-responsive">
          <div>
          {/* Pill Badge group matching reference image */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0px',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {/* Pill 1 */}
            <div className="floating-pill" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              padding: '6px 16px',
              borderRadius: '30px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#e9edef',
              animationDelay: '0s'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--primary)' }}>bolt</span>
              Automatización
            </div>

            {/* Connecting line 1 */}
            <div style={{
              width: '24px',
              height: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }} className="desktop-only"></div>

            {/* Pill 2 */}
            <div className="floating-pill" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              padding: '6px 16px',
              borderRadius: '30px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#e9edef',
              animationDelay: '1.4s'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--primary)' }}>trending_up</span>
              Escalabilidad
            </div>

            {/* Connecting line 2 */}
            <div style={{
              width: '24px',
              height: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }} className="desktop-only"></div>

            {/* Pill 3 */}
            <div className="floating-pill" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              padding: '6px 16px',
              borderRadius: '30px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#e9edef',
              animationDelay: '0.7s'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--primary)' }}>auto_awesome</span>
              IA
            </div>
          </div>

          <h1 className="display-lg reveal-fade-up" style={{ 
            marginBottom: '1.5rem'
          }}>
            Recupera <span className="text-gradient-primary">40 horas a la semana</span> y <span className="text-gradient">automatiza tus ventas por WhatsApp</span>
          </h1>

          <p className="reveal-fade-up delay-100" style={{
            fontSize: '1.1rem',
            color: 'var(--secondary)',
            lineHeight: '1.6',
            marginBottom: '2.5rem',
            maxWidth: '560px'
          }}>
            Deja de perder clientes por demorar en responder. Robotina centraliza tus chats, atiende prospectos con Inteligencia Artificial, transcribe audios y cierra ventas en piloto automático 24/7.
          </p>

          <div className="reveal-fade-up delay-200" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setIsBookingOpen(true)} className="btn-primary" style={{ 
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none', 
              fontSize: '1rem', 
              padding: '0.8rem 2.2rem', 
              borderRadius: '30px',
              boxShadow: '0 10px 25px rgba(255, 85, 0, 0.4)'
            }}>
              Reservar Demo Gratuita
            </button>
            <a href="#how-it-works" className="btn-secondary" style={{ 
              textDecoration: 'none', 
              fontSize: '0.9rem', 
              padding: '0.8rem 2rem', 
              borderRadius: '30px'
            }}>
              Ver Funciones Clave
            </a>
          </div>
          <p className="reveal-fade-up delay-300" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.75rem', marginLeft: '1rem' }}>
            * Sin tarjeta de crédito requerida. Configuración en 24h.
          </p>

          <div className="reveal-fade-up delay-400" style={{ 
            display: 'flex', 
            gap: '24px', 
            marginTop: '2.5rem', 
            borderTop: '1px solid rgba(255,255,255,0.05)', 
            paddingTop: '2rem' 
          }}>
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>100%</h4>
              <p style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>Datos en tu panel unificado</p>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}></div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>3 seg</h4>
              <p style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>Respuesta de la IA</p>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}></div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>24/7</h4>
              <p style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>Atención ininterrumpida</p>
            </div>
          </div>
        </div>

        {/* MOCKUP INTERACTIVO DE WHATSAPP (MULTIPROPÓSITO: SERVICIO / CITA / PRODUCTO) */}
        <div style={{
          backgroundColor: '#0c0d14',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 100px rgba(255, 90, 31, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '520px',
          width: '100%',
          maxWidth: '380px',
          margin: '0 auto'
        }}>
          {/* Header de WhatsApp Simulado */}
          <div style={{
            backgroundColor: '#121b22',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,90,31,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>smart_toy</span>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--emerald-400)', position: 'absolute', bottom: 0, right: 0, border: '2px solid #121b22' }}></div>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', margin: 0, fontWeight: 700 }}>Robotina Asistente 🤖</h4>
              <p style={{ color: 'var(--emerald-400)', fontSize: '0.7rem', margin: 0 }}>Ventas & Agenda activas</p>
            </div>
          </div>

          {/* Mensajes del Chat */}
          <div style={{
            flex: 1,
            padding: '1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundImage: 'radial-gradient(rgba(255,90,31,0.02) 1px, transparent 0)',
            backgroundSize: '16px 16px',
            backgroundColor: '#0a0b10'
          }}>
            {/* Mensaje 1: Cliente */}
            {chatStep >= 0 && (
              <div className="chat-bubble-anim" style={{
                alignSelf: 'flex-end',
                backgroundColor: '#005c4b',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '12px 12px 0 12px',
                maxWidth: '85%',
                fontSize: '0.825rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}>
                Hola! Quisiera reservar un turno para soporte técnico a domicilio mañana.
              </div>
            )}

            {/* Mensaje 2: Bot */}
            {chatStep >= 1 && (
              <div className="chat-bubble-anim" style={{
                alignSelf: 'flex-start',
                backgroundColor: '#202c33',
                color: '#e9edef',
                padding: '10px 14px',
                borderRadius: '12px 12px 12px 0',
                maxWidth: '85%',
                fontSize: '0.825rem',
                whiteSpace: 'pre-line',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}>
                ¡Hola! Claro que sí, con gusto te ayudo a agendar tu cita técnica.
                {"\n\n"}
                Mañana tenemos estos turnos disponibles para visita presencial:
                {"\n"}
                *1. Turno Mañana* (10:00 AM)
                {"\n"}
                *2. Turno Tarde* (3:30 PM)
                {"\n\n"}
                ¿Cuál de los dos horarios te acomoda mejor?
              </div>
            )}

            {/* Mensaje 3: Cliente (Audio) */}
            {chatStep >= 2 && (
              <div className="chat-bubble-anim" style={{
                alignSelf: 'flex-end',
                backgroundColor: '#005c4b',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '12px 12px 0 12px',
                maxWidth: '85%',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>play_circle</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ width: '80px', height: '3px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px', position: 'relative' }}>
                    <div style={{ width: '60%', height: '100%', backgroundColor: '#fff', borderRadius: '2px' }}></div>
                  </div>
                  <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>Mensaje de voz • 0:06</span>
                </div>
              </div>
            )}

            {/* Mensaje 4: Bot procesa audio */}
            {chatStep === 3 && (
              <div className="typing-bubble">
                <div className="dot-typing"></div>
                <div className="dot-typing"></div>
                <div className="dot-typing"></div>
              </div>
            )}

            {/* Mensaje 5: Bot responde confirmando pedido */}
            {chatStep >= 4 && (
              <div className="chat-bubble-anim" style={{
                alignSelf: 'flex-start',
                backgroundColor: '#202c33',
                color: '#e9edef',
                padding: '10px 14px',
                borderRadius: '12px 12px 12px 0',
                maxWidth: '85%',
                fontSize: '0.825rem',
                whiteSpace: 'pre-line',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}>
                🔊 _Entendido del audio:_ "Prefiero el de la tarde a las tres y media, por favor".
                {"\n\n"}
                ¡Excelente! He agendado provisionalmente tu turno:
                {"\n"}
                📅 *Mañana a las 3:30 PM*.
                {"\n\n"}
                Para finalizar el registro en nuestro sistema, ¿me confirmas tu nombre completo y la dirección del domicilio?
              </div>
            )}
          </div>

          {/* Footer de Entrada */}
          <div style={{
            backgroundColor: '#1f2c34',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '22px' }}>mood</span>
            <div style={{
              flex: 1,
              backgroundColor: '#2a3942',
              borderRadius: '20px',
              padding: '6px 12px',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.8rem'
            }}>
              Escribe un mensaje...
            </div>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '22px' }}>mic</span>
          </div>
        </div>
        </div>
      </section>
      </div>

      {/* 2.1 SOCIAL PROOF / INTEGRATIONS STRIP */}
      <div className="integrations-strip reveal-fade-up delay-500">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <p style={{ textAlign: 'center', color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
            Se integra perfectamente con tus herramientas favoritas
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', flexWrap: 'wrap', opacity: 0.8 }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" alt="WhatsApp" className="integration-logo" style={{ height: '36px' }} />
            <div className="integration-logo" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">smart_toy</span> OpenAI
            </div>
            <div className="integration-logo" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">payments</span> Stripe
            </div>
            <div className="integration-logo" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">calendar_month</span> Calendly
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 STEPS TO BOOK MEETING (Estilo FunnelChat) */}
      <section style={{
        width: '100%',
        padding: '6rem 0',
        position: 'relative',
        zIndex: 1,
        background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, rgba(10, 11, 16, 0) 70%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
        <span style={{ 
          fontSize: '0.85rem', 
          fontWeight: 800, 
          color: 'var(--emerald-400)', 
          letterSpacing: '1.5px', 
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '1rem',
          filter: 'drop-shadow(0 0 10px rgba(0, 255, 102, 0.45))'
        }}>
          Comienza en minutos
        </span>
        <h2 className="display-md" style={{ marginBottom: '1rem', fontWeight: 800, color: '#fff' }}>
          Reserva tu videollamada demo en 3 simples pasos
        </h2>
        <p style={{ color: 'var(--secondary)', fontSize: '1.1rem', marginBottom: '4rem' }}>
          Te mostramos en vivo y 1 a 1 cómo automatizar las ventas de tu negocio.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '2.5rem',
          position: 'relative',
          alignItems: 'start'
        }} className="grid-auto-responsive">
          {/* Connector Line (visible only on desktop) */}
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '15%',
            right: '15%',
            height: '1px',
            backgroundColor: 'rgba(0, 255, 102, 0.15)',
            zIndex: 0
          }} className="desktop-only"></div>

          {/* Step 1 */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              backgroundColor: 'rgba(0, 255, 102, 0.05)',
              border: '1px solid rgba(0, 255, 102, 0.2)',
              boxShadow: '0 0 20px rgba(0, 255, 102, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--emerald-400)' }}>calendar_month</span>
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--emerald-400)',
                color: '#050508',
                fontWeight: 800,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(0, 255, 102, 0.6)'
              }}>1</span>
            </div>
            <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Elige tu horario</h4>
            <p style={{ color: 'var(--secondary)', fontSize: '0.88rem', lineHeight: '1.6', margin: 0, maxWidth: '280px' }}>
              Selecciona el día y la hora que mejor te acomode para nuestra sesión personalizada.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              backgroundColor: 'rgba(0, 255, 102, 0.05)',
              border: '1px solid rgba(0, 255, 102, 0.2)',
              boxShadow: '0 0 20px rgba(0, 255, 102, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--emerald-400)' }}>video_chat</span>
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--emerald-400)',
                color: '#050508',
                fontWeight: 800,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(0, 255, 102, 0.6)'
              }}>2</span>
            </div>
            <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Reunión 1 a 1</h4>
            <p style={{ color: 'var(--secondary)', fontSize: '0.88rem', lineHeight: '1.6', margin: 0, maxWidth: '280px' }}>
              Nos conectamos contigo y tu equipo por Zoom o Meet para analizar y estructurar tus ventas.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              backgroundColor: 'rgba(0, 255, 102, 0.05)',
              border: '1px solid rgba(0, 255, 102, 0.2)',
              boxShadow: '0 0 20px rgba(0, 255, 102, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--emerald-400)' }}>rocket_launch</span>
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--emerald-400)',
                color: '#050508',
                fontWeight: 800,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(0, 255, 102, 0.6)'
              }}>3</span>
            </div>
            <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Flujo operativo listo</h4>
            <p style={{ color: 'var(--secondary)', fontSize: '0.88rem', lineHeight: '1.6', margin: 0, maxWidth: '280px' }}>
              Dejamos configurado tu primer bot para recibir prospectos y agendar citas en automático.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '4rem' }}>
          <button onClick={() => setIsBookingOpen(true)} className="btn-primary" style={{
            border: 'none',
            cursor: 'pointer',
            backgroundColor: 'var(--emerald-400)',
            color: '#050508',
            fontSize: '1rem',
            padding: '1rem 2.5rem',
            borderRadius: '30px',
            fontWeight: 800,
            boxShadow: '0 0 25px rgba(0, 255, 102, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Reservar Demo en Vivo
            <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 800 }}>arrow_forward</span>
          </button>
        </div>
        </div>
      </section>

      {/* 3. PAIN POINTS SECTION */}
      <section style={{
        backgroundColor: 'transparent',
        padding: '6rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="display-md" style={{ marginBottom: '1rem' }}>
              ¿Vendes por WhatsApp pero tu <span className="text-gradient">información está dispersa?</span>
            </h2>
            <p style={{ color: 'var(--secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
              Responder decenas de chats al día sin un panel de control genera cuellos de botella, pérdida de leads y desorganización de tu equipo.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 110, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>chat_bubble_error</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700 }}>Chats de venta olvidados</h3>
              <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Con decenas de conversaciones cayendo a la vez, responder tarde significa perder la venta. La IA atiende de inmediato y califica al cliente en segundos.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tertiary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>database_off</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700 }}>Datos sin registrar</h3>
              <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Los números, pedidos e información clave quedan perdidos en los celulares de tus vendedores. Nuestro Dashboard centraliza y estructura la base de clientes automáticamente.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald-400)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>troubleshoot</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700 }}>Sin métricas ni auditoría</h3>
              <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Es imposible mejorar lo que no se mide. Visualiza estadísticas de conversión, efectividad de la IA e historial de auditoría de todas tus operaciones comerciales en vivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 ECOSYSTEM SECTION (FunnelChat inspired connection nodes) */}
      <section className="bg-grid-pattern" style={{
        width: '100%',
        padding: '6rem 0 2rem 0',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h2 className="display-md" style={{ marginBottom: '1rem' }}>
            Todas tus automatizaciones en un solo <span className="text-gradient" style={{ background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ecosistema</span>
          </h2>
          <p style={{ color: 'var(--secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
            Comunicación 1 a 1, grupos y comunidades, perfectamente coordinados.
          </p>
        </div>

        {/* Central Hub icon with green glow */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4ade80',
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>hub</span>
          </div>
        </div>

        {/* SVG Connecting paths with running particles */}
        <svg className="ecosystem-svg" viewBox="0 0 1000 140">
          <defs>
            <linearGradient id="grad-left" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00d8f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00d8f6" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="grad-center" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#39d353" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="grad-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#a371f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a371f7" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Left connection path */}
          <path
            className="connection-path"
            stroke="url(#grad-left)"
            d="M500 10 L500 50 C500 65 485 70 470 70 L190 70 C175 70 166 75 166 90 L166 140"
          />
          {/* Center connection path */}
          <path
            className="connection-path"
            stroke="url(#grad-center)"
            d="M500 10 L500 140"
          />
          {/* Right connection path */}
          <path
            className="connection-path"
            stroke="url(#grad-right)"
            d="M500 10 L500 50 C500 65 515 70 530 70 L810 70 C825 70 834 75 834 90 L834 140"
          />

          {/* Glowing Animated circles flowing along the paths */}
          <circle r="4" fill="#00d8f6" style={{ filter: 'drop-shadow(0 0 6px #00d8f6)' }}>
            <animateMotion dur="4s" repeatCount="indefinite" path="M500 10 L500 50 C500 65 485 70 470 70 L190 70 C175 70 166 75 166 90 L166 140" />
          </circle>
          <circle r="4" fill="#39d353" style={{ filter: 'drop-shadow(0 0 6px #39d353)' }}>
            <animateMotion dur="3s" repeatCount="indefinite" path="M500 10 L500 140" />
          </circle>
          <circle r="4" fill="#a371f7" style={{ filter: 'drop-shadow(0 0 6px #a371f7)' }}>
            <animateMotion dur="4s" repeatCount="indefinite" path="M500 10 L500 50 C500 65 515 70 530 70 L810 70 C825 70 834 75 834 90 L834 140" />
          </circle>
        </svg>

        {/* Dest Cards corresponding to paths */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginTop: '1rem',
          textAlign: 'left'
        }}>
          {/* Card 1: Grupos y Comunidades */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderColor: 'rgba(0, 216, 246, 0.15)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(0, 216, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d8f6' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>groups</span>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Comunicación Grupal</span>
              <h3 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 800, marginTop: '4px', marginBottom: '8px' }}>Grupos y comunidades</h3>
              <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                Gestiona anuncios, recordatorios y engagement sin escribir manualmente. Organiza tus canales de comunicación de manera 100% coordinada.
              </p>
            </div>
          </div>

          {/* Card 2: Robotina Central */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderColor: 'rgba(74, 222, 128, 0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(74, 222, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chat</span>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Operación Central</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', marginBottom: '8px' }}>
                <h3 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Robotina Central</h3>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: 'rgba(255, 90, 31, 0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '20px' }}>PRO</span>
              </div>
              <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                Tu equipo inicia cada día con leads calificados y seguimientos ejecutados. Centraliza las conversaciones y permite interactuar de forma inmediata.
              </p>
            </div>
          </div>

          {/* Card 3: Automatizaciones */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderColor: 'rgba(163, 113, 247, 0.15)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(163, 113, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a371f7' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bolt</span>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Flujos Automatizados</span>
              <h3 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 800, marginTop: '4px', marginBottom: '8px' }}>Automatizaciones</h3>
              <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                Construye flujos end-to-end, integra pagos y activa secuencias de Inteligencia Artificial para escalar las interacciones con tus clientes.
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION (SUPERPOWERS) */}
      <section className="bg-grid-pattern" style={{ width: '100%', padding: '6rem 0', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 className="display-md" style={{ marginBottom: '1rem' }}>
            La suite definitiva de <span className="text-gradient">automatización para tu negocio</span>
          </h2>
          <p style={{ color: 'var(--secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
            Centralización absoluta, IA conversacional potente y flujos operativos configurables.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
          {/* Feature 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'center' }} className="grid-auto-responsive">
            <div className="glass-card">
              <div style={{ display: 'inline-flex', padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(255,90,31,0.1)', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>dashboard</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.5px' }}>Dashboard Centralizado en Tiempo Real</h3>
              <p style={{ color: 'var(--secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Visualiza y gestiona las ventas, agendas y clientes capturados por tus bots. Un panel premium diseñado para que los operadores sigan el estado de cada pedido o cita y puedan intervenir los chats en cualquier momento de forma instantánea.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'start', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>check_circle</span>
                <div>
                  <h5 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>Embudo de Ventas (Pedidos and Citas)</h5>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>Clasifica las interacciones según su etapa operativa (Pendiente, Preparando, Listo, Finalizado).</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'start', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>check_circle</span>
                <div>
                  <h5 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>Métricas e Informes Detallados</h5>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>Analiza la eficiencia de tu canal, volumen de chats procesados y facturación de la IA.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }} className="grid-auto-responsive">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="desktop-only">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'start', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>check_circle</span>
                <div>
                  <h5 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>Comprensión de Voz (Whisper)</h5>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>La IA escucha los audios de tus clientes y extrae solicitudes de turnos o productos.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'start', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>check_circle</span>
                <div>
                  <h5 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>Modo CRM Auto-Actualizable</h5>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>Crea registros de clientes recurrentes de forma automática con cada número que escribe.</p>
                </div>
              </div>
            </div>
            <div className="glass-card">
              <div style={{ display: 'inline-flex', padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(255,90,31,0.1)', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>psychology</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.5px' }}>Agentes IA Multipropósito</h3>
              <p style={{ color: 'var(--secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Tus agentes conversacionales tienen acceso directo al catálogo de tus productos o la agenda de servicios en la base de datos. Pueden guiar a tus usuarios para concretar ventas, agendar citas médicas o de mantenimiento, y enviar recordatorios automáticamente.
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* 4.5 SUPER AGENT SECTION */}
      <section style={{
        width: '100%',
        padding: '6rem 0',
        position: 'relative',
        zIndex: 1,
        background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, rgba(10, 11, 16, 0) 70%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div className="glass-card grid-auto-responsive" style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '4rem',
          alignItems: 'center',
          padding: '4rem',
          overflow: 'hidden',
          borderColor: 'rgba(255, 255, 255, 0.05)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          textAlign: 'left'
        }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Sparkle icon */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ 
                color: 'var(--emerald-400)', 
                fontSize: '28px',
                filter: 'drop-shadow(0 0 8px rgba(0, 255, 102, 0.5))' 
              }}>auto_awesome</span>
            </div>

            <div>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: '1.15', letterSpacing: '-1px' }}>
                <span style={{
                  background: 'linear-gradient(to right, var(--emerald-400), #00C2FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 10px rgba(0, 255, 102, 0.2))'
                }}>IA que entiende</span>, responde y vende
              </h2>
              <p style={{ color: 'var(--secondary)', fontSize: '1.1rem', marginTop: '1rem', marginBottom: 0 }}>
                Entrena al Agente IA con tus documentos, FAQs y procesos.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Item 1 */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                <div style={{ marginTop: '3px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '22px' }}>description</span>
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Entrena con tus documentos</h4>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                    Carga PDFs, FAQs y SOPs para que responda con tu voz y tono.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                <div style={{ marginTop: '3px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '22px' }}>schedule</span>
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Responde 24/7 en múltiples idiomas</h4>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                    Detecta intención, conversa en tu estilo y deriva al equipo cuando es necesario.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                <div style={{ marginTop: '3px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '22px' }}>database</span>
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Actualiza CRM y tareas</h4>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                    Registra notas, etiquetas y seguimientos en tu pipeline automáticamente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ 
            position: 'relative', 
            borderRadius: '20px', 
            overflow: 'hidden', 
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            width: '100%',
            height: '460px',
            backgroundColor: '#0c0d14'
          }}>
            <img 
              src="/super_agent_avatar.png" 
              alt="Super Agente IA" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

        </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section id="how-it-works" style={{
        backgroundColor: 'transparent',
        padding: '6rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="display-md" style={{ marginBottom: '1rem' }}>
              Pon tu automatización en <span className="text-gradient">marcha en 3 pasos</span>
            </h2>
            <p style={{ color: 'var(--secondary)', maxWidth: '500px', margin: '0 auto', fontSize: '1.1rem' }}>
              Lleva tu negocio a la era de la inteligencia artificial de manera ágil.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem', boxShadow: '0 0 15px rgba(255, 90, 31, 0.4)' }}>
                1
              </div>
              <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>Vincula tu Canal</h4>
              <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', maxWidth: '250px', lineHeight: '1.6' }}>
                Conecta tu número a la API oficial de Meta a través de nuestro onboarding técnico asistido.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem', boxShadow: '0 0 15px rgba(255, 90, 31, 0.4)' }}>
                2
              </div>
              <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>Define tus Parámetros</h4>
              <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', maxWidth: '250px', lineHeight: '1.6' }}>
                Carga tu inventario, servicios o agenda. Establece el prompt de comportamiento del bot desde el panel.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--emerald-400)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>
                3
              </div>
              <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>Controla en tu Panel</h4>
              <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', maxWidth: '250px', lineHeight: '1.6' }}>
                La IA comienza a capturar leads y agendar de inmediato. Visualizas todas las transacciones consolidadas en tu Dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5.3 INTERACTIVE GLOBE SECTION */}
      <section
        ref={globeSectionRef}
        style={{
          width: '100%',
          padding: '6rem 0 2rem 0',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          background: 'radial-gradient(ellipse at right center, rgba(34, 197, 94, 0.15) 0%, transparent 50%), radial-gradient(ellipse at left center, rgba(79, 70, 229, 0.15) 0%, transparent 50%)'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="display-md" style={{ marginBottom: '1rem', fontWeight: 800 }}>
            Nuestra <span className="text-gradient" style={{ background: 'linear-gradient(135deg, var(--emerald-400) 0%, #00C2FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>disponibilidad</span> internacional
          </h2>
          <p style={{ color: 'var(--secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Operamos y habilitamos la IA de Robotina Central en toda América Latina. Actualmente con soporte activo y encendido en Perú y Argentina.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
          {globeVisible && <InteractiveGlobe />}
        </div>
        </div>
      </section>

      {/* 5.5 SUPPORT / PITCH SECTION */}
      <section style={{
        width: '100%',
        padding: '8rem 0',
        position: 'relative',
        zIndex: 1,
        background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, rgba(10, 11, 16, 0) 70%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="display-md" style={{ marginBottom: '1.5rem', lineHeight: '1.2', fontWeight: 800 }}>
            <span style={{ color: '#fff' }}>Soporte real, soluciones reales.</span><br/>
            <span style={{ color: '#4ade80' }}>¿Frustrado con plataformas que no cumplen?</span>
          </h2>
          <p style={{ color: 'var(--secondary)', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto' }}>
            Deja atrás los bots genéricos y las automatizaciones que se rompen. Centraliza tus conversaciones y escala tu atención con IA que realmente funciona.
          </p>
        </div>

        <div className="glass-card grid-auto-responsive" style={{
          padding: '4rem 3rem',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '4rem',
          alignItems: 'center',
          borderColor: 'rgba(34, 197, 94, 0.15)',
        }}>
          
          {/* Left: Chat interface simulation */}
          <div style={{
            backgroundColor: '#0b141a',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 15px 30px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {/* Simulator Header */}
            <div style={{
              backgroundColor: '#1f2c34',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid rgba(255,255,255,0.04)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(74, 222, 128, 0.2)',
                color: '#4ade80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>support_agent</span>
              </div>
              <div>
                <h5 style={{ color: '#fff', margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>Soporte Robotina Central</h5>
                <span style={{ color: '#8696a0', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00e676' }}></span> En línea
                </span>
              </div>
            </div>

            {/* Simulator Chat Body */}
            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#0b141a',
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 0)',
              backgroundSize: '16px 16px',
              minHeight: '280px'
            }}>
              <div style={{
                alignSelf: 'start',
                backgroundColor: '#202c33',
                color: '#e9edef',
                padding: '0.6rem 0.9rem',
                borderRadius: '0 12px 12px 12px',
                maxWidth: '85%',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
              }}>
                ¡Hola! ¿Cómo vas con la configuración del bot de catálogo?
              </div>
              <div style={{
                alignSelf: 'end',
                backgroundColor: '#005c4b',
                color: '#e9edef',
                padding: '0.6rem 0.9rem',
                borderRadius: '12px 12px 0 12px',
                maxWidth: '85%',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
              }}>
                Hola 👋 Me cuesta un poco entender cómo configurar las respuestas de la IA para reservas.
              </div>
              <div style={{
                alignSelf: 'start',
                backgroundColor: '#202c33',
                color: '#e9edef',
                padding: '0.6rem 0.9rem',
                borderRadius: '0 12px 12px 12px',
                maxWidth: '85%',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
              }}>
                ¡No te preocupes! Nos conectamos en 5 mins por Meet y te ayudo a estructurar el flujo.
              </div>
              <div style={{
                alignSelf: 'end',
                backgroundColor: '#005c4b',
                color: '#e9edef',
                padding: '0.6rem 0.9rem',
                borderRadius: '12px 12px 0 12px',
                maxWidth: '85%',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
              }}>
                ¡Wow, qué rapidez! Ya quedó listo y agendando. Muchísimas gracias. 🙌
              </div>
            </div>
          </div>

          {/* Right: Copywriting / Pitch details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
            
            {/* Small support badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(74, 222, 128, 0.1)',
              color: '#4ade80',
              fontSize: '0.75rem',
              fontWeight: 800,
              width: 'fit-content'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>headset_mic</span>
              Soporte 100% en español | Acompañamiento Técnico
            </div>

            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: '1.2' }}>
              ¿Frustrado con plataformas que no cumplen?
            </h3>

            <p style={{ color: 'var(--secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
              Sabemos que dar el salto a la automatización de WhatsApp con Inteligencia Artificial puede parecer desafiante. Por eso, en Robotina Central <strong>no te dejamos solo</strong>.
            </p>

            <p style={{ color: 'var(--secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
              Ofrecemos acompañamiento real y personalizado para integrar y afinar tus flujos operativos. Te ayudamos a estructurar la base de datos de tus catálogos o agendas para asegurar que tus bots funcionen perfectamente desde el primer día.
            </p>

            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={() => setIsBookingOpen(true)} className="btn-primary" style={{
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                borderRadius: '30px',
                padding: '0.75rem 1.6rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                boxShadow: '0 0 15px rgba(255, 85, 0, 0.25)',
                display: 'inline-block'
              }}>
                Reservar Videollamada Demo
              </button>
            </div>

          </div>

        </div>
        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section id="pricing" className="bg-grid-pattern" style={{ width: '100%', padding: '8rem 0', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="reveal-fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 className="display-md" style={{ marginBottom: '1rem', fontWeight: 800 }}>
              Deja de pagar por <span className="text-gradient">herramientas desconectadas</span>
            </h2>
            <p style={{ color: 'var(--secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.15rem' }}>
              Consolida WhatsApp, IA, Calendario y CRM en una única suscripción fija.
            </p>

            {/* Currency Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '2.5rem',
              marginBottom: '1rem'
            }}>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: currency === 'USD' ? '#fff' : 'var(--secondary)',
                transition: 'color 0.3s ease'
              }}>
                Dólares (USD)
              </span>
              <button
                onClick={() => setCurrency(prev => prev === 'USD' ? 'PEN' : 'USD')}
                style={{
                  width: '56px',
                  height: '28px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  position: 'relative',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background-color 0.3s ease'
                }}
                aria-label="Cambiar moneda"
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--emerald-400)',
                  position: 'absolute',
                  left: currency === 'USD' ? '4px' : '30px',
                  transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)'
                }} />
              </button>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: currency === 'PEN' ? '#fff' : 'var(--secondary)',
                transition: 'color 0.3s ease'
              }}>
                Soles (PEN)
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Sin contratos ocultos. Cancela cuando quieras.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
            
            {/* PLAN STARTER */}
            <div className="pricing-card reveal-fade-up delay-200" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'relative' }}>
              <div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Mensual</div>
                <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>Plan Starter</h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '0.25rem' }}>
                  <span className="price-amount" style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>
                    {currency === 'USD' ? '$49' : 'S/. 180'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{currency === 'USD' ? 'USD' : 'PEN'}/mes</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '1.5rem' }}>
                  + {currency === 'USD' ? '$29' : 'S/. 110'} Setup (Único)
                </div>
                
                <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '2rem', minHeight: '60px' }}>
                  Ideal para pequeños negocios que desean comenzar a automatizar su comunicación por WhatsApp.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Grupos y Comunidades con participantes ilimitados</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'rgba(233, 237, 239, 0.4)', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '18px', opacity: 0.5 }}>close</span>
                    <span style={{ textDecoration: 'line-through' }}>Gestión inteligente de grupos y comunidades</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Automatizaciones ilimitadas</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'rgba(233, 237, 239, 0.4)', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '18px', opacity: 0.5 }}>close</span>
                    <span style={{ textDecoration: 'line-through' }}>Flujos Potenciados con IA</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Automatización de Canales</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Agente de Inteligencia Artificial (Básico)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>1 Número Business</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>1 Número Cloud API</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>10.000 contactos para conversaciones 1 a 1</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>1 Agente de atención incluido</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'rgba(233, 237, 239, 0.4)', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '18px', opacity: 0.5 }}>close</span>
                    <span style={{ textDecoration: 'line-through' }}>Sesiones Personalizadas Dedicadas</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'rgba(233, 237, 239, 0.4)', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '18px', opacity: 0.5 }}>close</span>
                    <span style={{ textDecoration: 'line-through' }}>Account Manager</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setSelectedPlan({
                    name: 'Robotina Starter',
                    price: currency === 'USD' ? '$49 / mes' : 'S/. 180 / mes',
                    setup: currency === 'USD' ? '$29' : 'S/. 110',
                    rebillUrl: 'https://pay.rebill.com/robotinacentral-sandbox/test_pl_c3618793fbcb4aaa86deba798e140388'
                  });
                  setIsPaymentOpen(true);
                }}
                className="btn-secondary"
                style={{
                  textAlign: 'center',
                  padding: '0.8rem',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'block',
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                Adquirir Plan Starter
              </button>
            </div>

            {/* PLAN GROWTH */}
            <div className="pricing-card reveal-fade-up delay-250" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'relative' }}>
              <div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Mensual</div>
                <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>Plan Growth</h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '0.25rem' }}>
                  <span className="price-amount" style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>
                    {currency === 'USD' ? '$99' : 'S/. 370'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{currency === 'USD' ? 'USD' : 'PEN'}/mes</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '1.5rem' }}>
                  + {currency === 'USD' ? '$79' : 'S/. 290'} Setup (Único)
                </div>
                
                <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '2rem', minHeight: '60px' }}>
                  Ideal para negocios con equipos de trabajo que priorizan su atención al cliente por WhatsApp.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Grupos y Comunidades con participantes ilimitados</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>stars</span>
                    <span style={{ fontWeight: 600 }}>Gestión inteligente de grupos y comunidades</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Automatizaciones ilimitadas</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>stars</span>
                    <span style={{ fontWeight: 600 }}>Flujos con IA Conversacional Completa</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Automatización de Canales</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Agente de Inteligencia Artificial (Avanzado)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>1 Número Business</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>1 Número Cloud API</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>25.000 contactos para conversaciones 1 a 1</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Hasta 5 Agentes de atención incluidos</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'rgba(233, 237, 239, 0.4)', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '18px', opacity: 0.5 }}>close</span>
                    <span style={{ textDecoration: 'line-through' }}>Sesiones Personalizadas Dedicadas</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'rgba(233, 237, 239, 0.4)', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '18px', opacity: 0.5 }}>close</span>
                    <span style={{ textDecoration: 'line-through' }}>Account Manager</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setSelectedPlan({
                    name: 'Robotina Growth',
                    price: currency === 'USD' ? '$99 / mes' : 'S/. 370 / mes',
                    setup: currency === 'USD' ? '$79' : 'S/. 290',
                    rebillUrl: 'https://pay.rebill.com/robotinacentral-sandbox/test_pl_f58398496d674bd38d37554b8175475c'
                  });
                  setIsPaymentOpen(true);
                }}
                className="btn-secondary"
                style={{
                  textAlign: 'center',
                  padding: '0.8rem',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'block',
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                Adquirir Plan Growth
              </button>
            </div>

            {/* PLAN ADVANCED */}
            <div className="pricing-card popular reveal-fade-up delay-300" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              position: 'relative',
              border: '2px solid #22c55e',
              boxShadow: '0 0 35px rgba(34, 197, 94, 0.15)',
              backgroundColor: 'rgba(10, 10, 10, 0.8)'
            }}>
              <div>
                <div style={{
                  position: 'absolute', top: '15px', right: '15px',
                  backgroundColor: '#22c55e', color: '#000',
                  padding: '4px 12px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase'
                }}>
                  Más Popular
                </div>

                <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Mensual</div>
                <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>Plan Advanced</h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '0.25rem' }}>
                  <span className="price-amount" style={{ fontSize: '3rem', fontWeight: 800, color: '#22c55e' }}>
                    {currency === 'USD' ? '$199' : 'S/. 740'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{currency === 'USD' ? 'USD' : 'PEN'}/mes</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600, marginBottom: '1.5rem' }}>
                  + {currency === 'USD' ? '$199' : 'S/. 740'} Setup (Único)
                </div>
                
                <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '2rem', minHeight: '60px' }}>
                  Ideal para negocios con equipos que requieren integraciones adicionales, funciones avanzadas y soporte premium.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Grupos y Comunidades con participantes ilimitados</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>stars</span>
                    <span style={{ fontWeight: 600 }}>Gestión inteligente de grupos y comunidades</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Automatizaciones ilimitadas</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>stars</span>
                    <span style={{ fontWeight: 600 }}>Flujos Potenciados con IA Conversacional</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Automatización de Canales</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>stars</span>
                    <span style={{ fontWeight: 600 }}>IA Avanzada (Múltiples bases de datos)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>1 Número Business</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>1 Número Cloud API</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>50.000 contactos para conversaciones 1 a 1</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Agentes de atención Ilimitados</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>3 Sesiones de Onboarding y Setup Dedicado</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)', fontSize: '18px' }}>check_circle</span>
                    <span>Account Manager asignado</span>
                  </div>
                </div>
              </div>

              <a 
                href={`https://wa.me/${DEMO_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, quiero iniciar con el Plan Advanced de Robotina-Central en ${currency === 'USD' ? 'dólares (USD)' : 'soles (PEN)'}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  padding: '1rem',
                  borderRadius: '30px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  display: 'block',
                  boxShadow: '0 10px 25px rgba(34, 197, 94, 0.25)',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#22c55e',
                  color: '#000',
                  border: 'none'
                }}
              >
                Adquirir Plan Advanced
              </a>
            </div>

            {/* PLAN PERSONALIZADO */}
            <div className="pricing-card reveal-fade-up delay-400" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'relative' }}>
              <div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>A medida</div>
                <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>Personalizado</h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '0.25rem' }}>
                  <span className="price-amount" style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>
                    A convenir
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '1.5rem' }}>
                  Setup Adaptado al Proyecto
                </div>
                
                <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '2rem', minHeight: '60px' }}>
                  Soluciones personalizadas para negocios con grandes volúmenes y requerimientos específicos de escala.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '18px' }}>workspace_premium</span>
                    <span style={{ fontWeight: 600 }}>Características Advanced incluidas</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '18px' }}>calendar_today</span>
                    <span>Planes Semestrales y Anuales con descuento</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '18px' }}>forum</span>
                    <span>Consultorías estratégicas de negocio 1 a 1</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '18px' }}>flash_on</span>
                    <span>Activación ultrarrápida y Setup dedicado completo</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#e9edef', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '18px' }}>settings_suggest</span>
                    <span>Integración personalizada de APIs, CRM y Webhooks</span>
                  </div>
                </div>
              </div>

              <a 
                href={`https://wa.me/${DEMO_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, me interesa solicitar una cotización personalizada para el Plan Personalizado de Robotina-Central.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  padding: '0.8rem',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'block',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease'
                }}
              >
                Contactar con Ventas
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section style={{
        backgroundColor: 'var(--surface-container-low)',
        padding: '6rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.03)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="display-md" style={{ color: '#fff', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-1px' }}>
              Preguntas Frecuentes
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
              Respuestas rápidas sobre el bot de WhatsApp y nuestro ecosistema.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} style={{
                  backgroundColor: 'var(--surface-container)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}>
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '1rem'
                    }}
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined" style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      color: 'var(--primary)'
                    }}>
                      keyboard_arrow_down
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{
                      padding: '0 1.5rem 1.5rem 1.5rem',
                      color: 'var(--secondary)',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      animation: 'fadeIn 0.2s ease'
                    }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.03)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }} className="justify-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: '#fff' }}>terminal</span>
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Robotina Central</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link 
              to="/terms" 
              style={{ color: 'var(--secondary)', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--emerald-400)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--secondary)'}
            >
              Términos y Condiciones
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>|</span>
            <span 
              style={{ color: 'var(--secondary)', fontSize: '0.8rem', cursor: 'pointer', transition: 'color 0.3s' }}
              onClick={() => alert('Política de Privacidad en proceso de redacción.')}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--emerald-400)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--secondary)'}
            >
              Política de Privacidad
            </span>
          </div>

          <p style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Robotina-Central. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {isBookingOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 5, 8, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="glass-card" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '3rem 2.5rem',
            position: 'relative',
            border: '1px solid rgba(0, 255, 102, 0.25)',
            boxShadow: '0 25px 50px rgba(0, 255, 102, 0.15), 0 0 100px rgba(0, 255, 102, 0.05)',
            transform: 'none', // Override standard translateY hover transform
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            textAlign: 'left'
          }}>
            {/* Close Button */}
            <button onClick={() => setIsBookingOpen(false)} style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>

            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(0, 255, 102, 0.1)',
                color: 'var(--emerald-400)',
                fontSize: '0.75rem',
                fontWeight: 800,
                marginBottom: '1rem',
                filter: 'drop-shadow(0 0 8px rgba(0, 255, 102, 0.3))'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>video_chat</span>
                Videollamada Demo 1 a 1 Gratuita
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, margin: 0, lineHeight: '1.3' }}>
                Agenda tu Demostración
              </h3>
              <p style={{ color: 'var(--secondary)', fontSize: '0.88rem', margin: '0.5rem 0 0 0', lineHeight: '1.5' }}>
                Completa tus datos para coordinar el día y la hora de nuestra videollamada por Meet/Zoom.
              </p>
            </div>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>Nombre Completo</label>
                <input 
                  type="text" 
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  placeholder="Ej. Juan Pérez" 
                  required
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '0.8rem 1rem',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--emerald-400)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>WhatsApp de tu Negocio</label>
                <input 
                  type="tel" 
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  placeholder="Ej. +34 600 000 000" 
                  required
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '0.8rem 1rem',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--emerald-400)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>Giro o Sector del Negocio</label>
                <input 
                  type="text" 
                  value={bookingSegment}
                  onChange={(e) => setBookingSegment(e.target.value)}
                  placeholder="Ej. Restaurante, Clínica, E-commerce, Inmobiliaria" 
                  required
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '0.8rem 1rem',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--emerald-400)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                />
              </div>

              <button type="submit" className="btn-primary" style={{
                border: 'none',
                cursor: 'pointer',
                backgroundColor: 'var(--emerald-400)',
                color: '#050508',
                fontSize: '0.95rem',
                padding: '0.9rem 2rem',
                borderRadius: '30px',
                fontWeight: 800,
                boxShadow: '0 0 20px rgba(0, 255, 102, 0.3)',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                Confirmar y Agendar por WhatsApp
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 800 }}>send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {isPaymentOpen && selectedPlan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 5, 8, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="glass-card" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '3rem 2.5rem',
            position: 'relative',
            border: '1px solid rgba(0, 255, 102, 0.25)',
            boxShadow: '0 25px 50px rgba(0, 255, 102, 0.15), 0 0 100px rgba(0, 255, 102, 0.05)',
            transform: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            textAlign: 'left'
          }}>
            {/* Close Button */}
            <button onClick={() => setIsPaymentOpen(false)} style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>

            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(0, 255, 102, 0.1)',
                color: 'var(--emerald-400)',
                fontSize: '0.75rem',
                fontWeight: 800,
                marginBottom: '1rem',
                filter: 'drop-shadow(0 0 8px rgba(0, 255, 102, 0.3))'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>shopping_cart</span>
                Método de Pago
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, margin: 0, lineHeight: '1.3' }}>
                {selectedPlan.name}
              </h3>
              <p style={{ color: 'var(--secondary)', fontSize: '0.88rem', margin: '0.5rem 0 0 0', lineHeight: '1.5' }}>
                Mensualidad: <strong style={{ color: '#fff' }}>{selectedPlan.price}</strong> + Setup: <strong style={{ color: '#fff' }}>{selectedPlan.setup}</strong> (Pago único inicial)
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Opción 1: Rebill (Tarjeta) */}
              <a
                href={selectedPlan.rebillUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsPaymentOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                className="payment-option-hover"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--emerald-400)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 255, 102, 0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 255, 102, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--emerald-400)',
                  flexShrink: 0
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>credit_card</span>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Pago con Tarjeta de Crédito/Débito</div>
                  <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                    Procesado de forma segura por <strong>Rebill</strong> (Visa, Mastercard, AMEX)
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '20px' }}>arrow_forward</span>
              </a>

              {/* Opción 2: dLocal / Pago Local (Próximamente) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.03)',
                  opacity: 0.6,
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--secondary)',
                  flexShrink: 0
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>account_balance</span>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ color: '#888', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Pago Local / Transferencia
                    <span style={{
                      backgroundColor: 'rgba(255, 165, 0, 0.1)',
                      color: 'orange',
                      fontSize: '0.65rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 800
                    }}>Próximamente</span>
                  </div>
                  <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                    Yape, Plin, PagoEfectivo o Transferencia Directa (vía dLocal Go)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
