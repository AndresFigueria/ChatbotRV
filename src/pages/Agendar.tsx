import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import confetti from 'canvas-confetti';

export default function Agendar() {
  const [searchParams] = useSearchParams();

  // Obtener datos del lead del link de WhatsApp
  const name = searchParams.get('name') || '';
  const emailParam = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  const segment = searchParams.get('segment') || '';
  const goal = searchParams.get('goal') || '';

  // Estados
  const [email, setEmail] = useState(emailParam);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [daysList, setDaysList] = useState<{ dayName: string; dayNum: string; fullDate: string }[]>([]);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Configuración del Bot
  const DEMO_WHATSAPP_NUMBER = '5491165994057'; // Número de WhatsApp de RobotinaCentral

  // Horarios de atención: 8:00 AM a 12:00 PM, cada 30 minutos
  const timeSlots = [
    { time: '08:00 AM', label: 'Mañana' },
    { time: '08:30 AM', label: 'Mañana' },
    { time: '09:00 AM', label: 'Mañana' },
    { time: '09:30 AM', label: 'Mañana' },
    { time: '10:00 AM', label: 'Mañana' },
    { time: '10:30 AM', label: 'Mañana' },
    { time: '11:00 AM', label: 'Mañana' },
    { time: '11:30 AM', label: 'Mañana' },
    { time: '12:00 PM', label: 'Mediodía' },
  ];

  // Calcular los próximos 7 días hábiles (excluyendo domingos)
  useEffect(() => {
    const list = [];
    let current = new Date();
    
    // Empezar desde mañana
    current.setDate(current.getDate() + 1);

    const locale = 'es-ES';
    while (list.length < 7) {
      // Excluir domingos (0 = Domingo)
      if (current.getDay() !== 0) {
        const dayName = current.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '');
        const dayNum = current.getDate().toString();
        const fullDate = current.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
        
        list.push({
          dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
          dayNum,
          fullDate
        });
      }
      current.setDate(current.getDate() + 1);
    }
    setDaysList(list);
  }, []);

  // Consultar disponibilidad real del calendario
  useEffect(() => {
    if (daysList.length === 0) return;
    const chosenDay = daysList[selectedDayIndex];

    const checkAvailability = async () => {
      setCheckingAvailability(true);
      try {
        // Hacemos el fetch a la URL del webhook de n8n (puedes cambiarla por tu URL de producción)
        const response = await fetch(`https://andrestate47.hooks.n8n.cloud/webhook/availability?date=${encodeURIComponent(chosenDay.fullDate)}`);
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.busySlots)) {
            setBusySlots(data.busySlots);
          } else {
            setBusySlots([]);
          }
        } else {
          setBusySlots([]);
        }
      } catch (err) {
        // Fallback silencioso si no hay conexión
        setBusySlots([]);
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [selectedDayIndex, daysList]);

  const handleConfirm = async () => {
    if (!email) {
      alert('Por favor, ingresa tu correo electrónico para enviarte la confirmación.');
      return;
    }
    if (!selectedTime) {
      alert('Por favor, selecciona una hora para la reunión.');
      return;
    }

    setLoading(true);

    const chosenDay = daysList[selectedDayIndex];

    try {
      // 1. Buscar si el lead ya existe (creado por el paso previo en Landing.tsx)
      const { data: existingLeads } = await supabase.from('landing_leads').select('id').eq('phone', phone);
      
      if (existingLeads && existingLeads.length > 0) {
        // Actualizar el lead existente
        const { error } = await supabase.from('landing_leads').update({
          email,
          appointment_date: chosenDay.fullDate,
          appointment_time: selectedTime,
          segment,
          goal: goal || 'Automatizar restaurante'
        }).eq('id', existingLeads[0].id);
        
        if (error) console.error('Error al actualizar lead en Supabase:', error);
      } else {
        // Insertar uno nuevo si no existe
        const { error } = await supabase.from('landing_leads').insert([{
          name,
          phone,
          segment,
          volume: 'WhatsApp Direct',
          goal: goal || 'Automatizar restaurante',
          email,
          appointment_date: chosenDay.fullDate,
          appointment_time: selectedTime
        }]);
        
        if (error) console.error('Error al guardar lead en Supabase:', error);
      }

      setLoading(false);
      setSuccess(true);

      // 2. Disparar Confeti de alta intensidad
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#adc6ff', '#00C2FF', '#004395', '#ffffff']
      });

      // Ráfaga secundaria
      setTimeout(() => {
        confetti({
          particleCount: 85,
          spread: 120,
          origin: { y: 0.5 }
        });
      }, 250);

      // 3. Redirección automática a WhatsApp a los 2 segundos
      setTimeout(() => {
        const baseMessage = `¡Listo Robotina! Acabo de agendar mi demo de RobotinaCentral para el *${chosenDay.fullDate}* a las *${selectedTime}*. Mi email es *${email}*. ¿Cuáles son los pasos a seguir?`;
        const encodedText = encodeURIComponent(baseMessage);
        const whatsappUrl = `https://wa.me/${DEMO_WHATSAPP_NUMBER}?text=${encodedText}`;
        window.open(whatsappUrl, '_self');
      }, 2000);

    } catch (err) {
      console.error('Error general al confirmar agendamiento:', err);
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#0b0e11',
      backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(0, 194, 255, 0.08) 0%, transparent 60%)',
      color: '#dde6f2',
      fontFamily: 'Inter, sans-serif',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(20, 26, 32, 0.65)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(173, 198, 255, 0.15)',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        boxSizing: 'border-box',
        textAlign: 'center'
      }}>
        {success ? (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 194, 255, 0.1)',
              border: '2px solid #00C2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#00C2FF' }}>done</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#adc6ff', margin: '0 0 0.5rem 0', letterSpacing: '-0.03em' }}>
              ¡Demo Reservada!
            </h2>
            <p style={{ color: '#9d9da4', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 2rem 0' }}>
              Tu cita para el <strong>{daysList[selectedDayIndex]?.fullDate}</strong> a las <strong>{selectedTime}</strong> ha sido agendada con éxito.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#00C2FF', fontWeight: 600, fontSize: '0.9rem' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(0, 194, 255, 0.2)', borderTopColor: '#00C2FF', animation: 'spin 1s linear infinite' }}></div>
              Abriendo WhatsApp para confirmar...
            </div>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00C2FF', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Agendamiento Demo 1-a-1
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0.25rem 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                Hola, {name || 'Emprendedor'} 👋
              </h1>
              <p style={{ color: '#9d9da4', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                Ya tenemos tu información lista. Selecciona la fecha y hora ideal para vernos por videollamada.
              </p>
            </div>

            {/* Formulario de Email */}
            <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9d9da4', marginBottom: '0.5rem', display: 'block' }}>
                Tu Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@restaurante.com"
                style={{
                  width: '100%',
                  backgroundColor: '#0f1418',
                  border: '1px solid rgba(173, 198, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  color: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#00C2FF'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(173, 198, 255, 0.15)'}
              />
            </div>

            {/* Selector de Días (Horizontal) */}
            <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9d9da4', marginBottom: '0.75rem', display: 'block' }}>
                Selecciona el Día
              </label>
              <div style={{
                display: 'flex',
                gap: '0.6rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                scrollbarWidth: 'none', // Firefox
              }}>
                {daysList.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDayIndex(idx);
                      setSelectedTime('');
                    }}
                    style={{
                      flex: '0 0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '10px',
                      border: idx === selectedDayIndex ? '1px solid #00C2FF' : '1px solid rgba(173, 198, 255, 0.1)',
                      backgroundColor: idx === selectedDayIndex ? 'rgba(0, 194, 255, 0.08)' : '#0f1418',
                      color: idx === selectedDayIndex ? '#ffffff' : '#9d9da4',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: '64px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>{day.dayName}</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem', color: idx === selectedDayIndex ? '#00C2FF' : '#ffffff' }}>{day.dayNum}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Horarios */}
            <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9d9da4', display: 'block', flex: 1 }}>
                  Horario Disponible ({daysList[selectedDayIndex]?.fullDate})
                </label>
                {checkingAvailability && (
                  <span style={{ fontSize: '0.75rem', color: '#00C2FF', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid rgba(0, 194, 255, 0.2)', borderTopColor: '#00C2FF', animation: 'spin 1s linear infinite' }}></div>
                    Consultando...
                  </span>
                )}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.6rem'
              }}>
                {timeSlots.map((slot, idx) => {
                  const isBusy = busySlots.includes(slot.time);
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={idx}
                      disabled={isBusy}
                      onClick={() => setSelectedTime(slot.time)}
                      style={{
                        padding: '0.75rem 0',
                        borderRadius: '8px',
                        border: isBusy 
                          ? '1px dashed rgba(220, 38, 38, 0.25)' 
                          : isSelected 
                            ? '1px solid #00C2FF' 
                            : '1px solid rgba(173, 198, 255, 0.1)',
                        backgroundColor: isBusy 
                          ? 'rgba(220, 38, 38, 0.05)' 
                          : isSelected 
                            ? 'rgba(0, 194, 255, 0.08)' 
                            : '#0f1418',
                        color: isBusy 
                          ? '#4a525d' 
                          : isSelected 
                            ? '#ffffff' 
                            : '#9d9da4',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: isBusy ? 'not-allowed' : 'pointer',
                        textDecoration: isBusy ? 'line-through' : 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        opacity: isBusy ? 0.35 : 1
                      }}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botón de Confirmación */}
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #00C2FF 0%, #004395 100%)',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(0, 194, 255, 0.15)',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if(!loading) e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 194, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                if(!loading) e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 194, 255, 0.15)';
              }}
            >
              {loading ? 'Reservando...' : 'Confirmar Cita y Abrir WhatsApp 🚀'}
            </button>
            
            <p style={{ color: '#6d7680', fontSize: '0.75rem', marginTop: '1rem', lineHeight: '1.4' }}>
              * Al confirmar, se guardará tu cita y serás redirigido a WhatsApp para validar tu reserva con Robotina.
            </p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
