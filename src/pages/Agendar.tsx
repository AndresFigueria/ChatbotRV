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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Calendario
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Configuración del Bot
  const DEMO_WHATSAPP_NUMBER = '5491165994057'; // Número de WhatsApp de RobotinaCentral

  // Horarios de atención: Mañana y Tarde
  const timeSlots = [
    { time: '08:00 AM', period: 'Mañana' },
    { time: '08:30 AM', period: 'Mañana' },
    { time: '09:00 AM', period: 'Mañana' },
    { time: '09:30 AM', period: 'Mañana' },
    { time: '10:00 AM', period: 'Mañana' },
    { time: '10:30 AM', period: 'Mañana' },
    { time: '11:00 AM', period: 'Mañana' },
    { time: '11:30 AM', period: 'Mañana' },
    { time: '12:00 PM', period: 'Tarde' },
    { time: '01:00 PM', period: 'Tarde' },
    { time: '02:00 PM', period: 'Tarde' },
    { time: '03:00 PM', period: 'Tarde' },
    { time: '04:00 PM', period: 'Tarde' },
    { time: '05:00 PM', period: 'Tarde' },
  ];

  // Helper para formato de fecha
  const getFullDateString = (date: Date) => {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Set selected date initially to tomorrow (or next available business day)
  useEffect(() => {
    let current = new Date();
    current.setDate(current.getDate() + 1);
    while (current.getDay() === 0) { // Skip Sundays
      current.setDate(current.getDate() + 1);
    }
    setSelectedDate(current);
  }, []);

  // Consultar disponibilidad real del calendario
  useEffect(() => {
    if (!selectedDate) return;

    const checkAvailability = async () => {
      setCheckingAvailability(true);
      setSelectedTime(''); // Reset time when date changes
      try {
        const dateStr = getFullDateString(selectedDate);
        const response = await fetch(`https://andrestate47.hooks.n8n.cloud/webhook/availability?date=${encodeURIComponent(dateStr)}`);
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
        setBusySlots([]);
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [selectedDate]);

  const handleConfirm = async () => {
    if (!email) {
      alert('Por favor, ingresa tu correo electrónico para enviarte la confirmación.');
      return;
    }
    if (!selectedTime) {
      alert('Por favor, selecciona una hora para la reunión.');
      return;
    }
    if (!selectedDate) return;

    setLoading(true);
    const chosenDayStr = getFullDateString(selectedDate);

    try {
      const { data: existingLeads } = await supabase.from('landing_leads').select('id').eq('phone', phone);
      
      if (existingLeads && existingLeads.length > 0) {
        const { error } = await supabase.from('landing_leads').update({
          email,
          appointment_date: chosenDayStr,
          appointment_time: selectedTime,
          segment,
          goal: goal || 'Automatizar restaurante'
        }).eq('id', existingLeads[0].id);
        
        if (error) console.error('Error al actualizar lead en Supabase:', error);
      } else {
        const { error } = await supabase.from('landing_leads').insert([{
          name,
          phone,
          segment,
          volume: 'WhatsApp Direct',
          goal: goal || 'Automatizar restaurante',
          email,
          appointment_date: chosenDayStr,
          appointment_time: selectedTime,
          tenant_id: '4c652a69-006f-4194-9436-fd281d55e644'
        }]);
        
        if (error) console.error('Error al guardar lead en Supabase:', error);
      }

      setLoading(false);
      setSuccess(true);

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#adc6ff', '#00C2FF', '#004395', '#ffffff']
      });

      setTimeout(() => {
        confetti({
          particleCount: 85,
          spread: 120,
          origin: { y: 0.5 }
        });
      }, 250);

      setTimeout(() => {
        const baseMessage = `¡Listo Robotina! Acabo de agendar mi demo de RobotinaCentral para el *${chosenDayStr}* a las *${selectedTime}*. Mi email es *${email}*. ¿Cuáles son los pasos a seguir?`;
        const encodedText = encodeURIComponent(baseMessage);
        const whatsappUrl = `https://wa.me/${DEMO_WHATSAPP_NUMBER}?text=${encodedText}`;
        window.open(whatsappUrl, '_self');
      }, 2000);

    } catch (err) {
      console.error('Error general al confirmar agendamiento:', err);
      setLoading(false);
    }
  };

  // Helper for Calendar Days
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday = 0
  };

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const isDayDisabled = (day: number) => {
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Disable past days and Sundays (0)
    return dateToCheck < today || dateToCheck.getDay() === 0;
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
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(20, 26, 32, 0.65)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(173, 198, 255, 0.15)',
        borderRadius: '24px',
        boxShadow: '0 24px 50px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {success ? (
          <div style={{ padding: '4rem', textAlign: 'center', width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 194, 255, 0.1)',
              border: '2px solid #00C2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem auto'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#00C2FF' }}>done</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#adc6ff', margin: '0 0 1rem 0', letterSpacing: '-0.03em' }}>
              ¡Demo Reservada!
            </h2>
            <p style={{ color: '#9d9da4', fontSize: '1.1rem', lineHeight: '1.5', margin: '0 0 2rem 0' }}>
              Tu cita para el <strong>{selectedDate && getFullDateString(selectedDate)}</strong> a las <strong>{selectedTime}</strong> ha sido agendada con éxito.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#00C2FF', fontWeight: 600, fontSize: '1rem', padding: '1rem 2rem', backgroundColor: 'rgba(0, 194, 255, 0.1)', borderRadius: '50px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(0, 194, 255, 0.2)', borderTopColor: '#00C2FF', animation: 'spin 1s linear infinite' }}></div>
              Abriendo WhatsApp para confirmar...
            </div>
          </div>
        ) : (
          <>
            {/* LEFT COLUMN: Info & Calendar */}
            <div style={{ 
              flex: 'none', 
              padding: '2rem 2rem 1.5rem 2rem', 
              borderBottom: '1px solid rgba(173, 198, 255, 0.1)',
              backgroundColor: 'rgba(0,0,0,0.2)'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#00C2FF', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Agendamiento 1-a-1
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0.5rem 0 1rem 0', letterSpacing: '-0.03em' }}>
                Hola, {name || 'Emprendedor'} 👋
              </h1>
              <p style={{ color: '#9d9da4', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 2rem 0' }}>
                Selecciona la fecha y hora ideal para nuestra videollamada. Evaluaremos cómo Robotina puede automatizar tu negocio.
              </p>

              {/* CALENDAR */}
              <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                    {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={prevMonth} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>chevron_left</span>
                    </button>
                    <button onClick={nextMonth} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>chevron_right</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                  {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => (
                    <div key={d} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6d7680' }}>{d}</div>
                  ))}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                  {blanks.map(b => <div key={`blank-${b}`} />)}
                  {days.map(day => {
                    const isDisabled = isDayDisabled(day);
                    const isSelected = selectedDate && 
                      selectedDate.getDate() === day && 
                      selectedDate.getMonth() === currentMonth.getMonth() && 
                      selectedDate.getFullYear() === currentMonth.getFullYear();

                    return (
                      <button
                        key={day}
                        disabled={isDisabled}
                        onClick={() => {
                          const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                          setSelectedDate(newDate);
                        }}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '50%',
                          border: isSelected ? '1px solid #00C2FF' : '1px solid transparent',
                          background: isSelected ? 'rgba(0, 194, 255, 0.15)' : (isDisabled ? 'transparent' : 'rgba(255,255,255,0.03)'),
                          color: isSelected ? '#00C2FF' : (isDisabled ? '#3a4149' : '#fff'),
                          fontWeight: isSelected ? 800 : 500,
                          cursor: isDisabled ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s',
                        }}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Time Slots & Form */}
            <div style={{ flex: 'none', padding: '1.5rem 2rem 2rem 2rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                      {selectedDate ? getFullDateString(selectedDate) : 'Selecciona una fecha'}
                    </h3>
                    {checkingAvailability && (
                      <span style={{ fontSize: '0.8rem', color: '#00C2FF', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid rgba(0, 194, 255, 0.2)', borderTopColor: '#00C2FF', animation: 'spin 1s linear infinite' }}></div>
                        Consultando horarios...
                      </span>
                    )}
                  </div>
                </div>

                {selectedDate ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* MAÑANA */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9d9da4', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Mañana</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                        {timeSlots.filter(t => t.period === 'Mañana').map((slot, idx) => {
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
                                border: isSelected ? '1px solid #00C2FF' : '1px solid rgba(173, 198, 255, 0.1)',
                                backgroundColor: isBusy ? 'rgba(255,255,255,0.02)' : (isSelected ? 'rgba(0, 194, 255, 0.1)' : 'transparent'),
                                color: isBusy ? '#4a525d' : (isSelected ? '#fff' : '#adc6ff'),
                                fontSize: '0.85rem',
                                fontWeight: isSelected ? 700 : 500,
                                cursor: isBusy ? 'not-allowed' : 'pointer',
                                textDecoration: isBusy ? 'line-through' : 'none',
                                transition: 'all 0.2s',
                              }}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* TARDE */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9d9da4', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Tarde</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                        {timeSlots.filter(t => t.period === 'Tarde').map((slot, idx) => {
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
                                border: isSelected ? '1px solid #00C2FF' : '1px solid rgba(173, 198, 255, 0.1)',
                                backgroundColor: isBusy ? 'rgba(255,255,255,0.02)' : (isSelected ? 'rgba(0, 194, 255, 0.1)' : 'transparent'),
                                color: isBusy ? '#4a525d' : (isSelected ? '#fff' : '#adc6ff'),
                                fontSize: '0.85rem',
                                fontWeight: isSelected ? 700 : 500,
                                cursor: isBusy ? 'not-allowed' : 'pointer',
                                textDecoration: isBusy ? 'line-through' : 'none',
                                transition: 'all 0.2s',
                              }}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a525d', fontStyle: 'italic' }}>
                    Selecciona una fecha en el calendario.
                  </div>
                )}
              </div>

              {/* ACTION AREA */}
              <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(173, 198, 255, 0.1)' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9d9da4', marginBottom: '0.5rem', display: 'block' }}>
                  Correo de contacto
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@negocio.com"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(173, 198, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    fontSize: '0.95rem',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    marginBottom: '1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00C2FF'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(173, 198, 255, 0.15)'}
                />
                <button
                  onClick={handleConfirm}
                  disabled={loading || !selectedTime || !selectedDate}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: (loading || !selectedTime || !selectedDate) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00C2FF 0%, #004395 100%)',
                    color: (loading || !selectedTime || !selectedDate) ? '#9d9da4' : '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: (loading || !selectedTime || !selectedDate) ? 'not-allowed' : 'pointer',
                    boxShadow: (loading || !selectedTime || !selectedDate) ? 'none' : '0 8px 16px rgba(0, 194, 255, 0.2)',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? 'Confirmando...' : 'Confirmar Cita 🚀'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        @media (max-width: 768px) {
          .calendar-container {
            flex-direction: column !important;
          }
          .calendar-col, .time-col {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
