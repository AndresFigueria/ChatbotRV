import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Settings() {
  const [config, setConfig] = useState({
    businessName: 'Robotina Business',
    businessPhone: '',
    botIdentity: 'Asistente Virtual Robotina',
    botTone: 'Profesional y Atento',
    botSystemContext: 'Eres una asistente de inteligencia artificial para un negocio de alta gama. Tu objetivo es ayudar a los clientes a agendar citas, responder dudas sobre servicios y cerrar ventas de manera fluida y elegante.',
    botWelcomeMsg: '¡Hola! 🤖 Soy la asistente virtual de nuestro negocio. ¿En qué puedo ayudarte hoy?',
    botOffHoursMsg: 'Lo sentimos, en este momento nuestro equipo está fuera de línea. Atendemos de 09h00 a 18h00. 🕒',
    openingTime: '09:00',
    closingTime: '18:00',
    autoClose: true,
    autoConfirmBookings: false,
    autoUpsell: true
  });

  const [loading, setLoading] = useState(true);
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      const { data, error } = await supabase
        .from('business_config')
        .select('*')
        .single();

      if (!error && data) {
        setConfig({
          businessName: data.business_name || 'Robotina Business',
          businessPhone: data.business_phone || '',
          botIdentity: data.bot_identity || '',
          botTone: data.bot_tone || '',
          botSystemContext: data.bot_system_context || '',
          botWelcomeMsg: data.bot_welcome_msg || '¡Hola!',
          botOffHoursMsg: data.bot_off_hours_msg || 'Fuera de horario',
          openingTime: data.opening_time || '09:00',
          closingTime: data.closing_time || '18:00',
          autoClose: data.auto_close_day || true,
          autoConfirmBookings: data.auto_confirm_bookings || false,
          autoUpsell: data.auto_upsell || true
        });
      }
      setLoading(false);
    }
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedStatus(false);
    
    // Buscar si ya existe una configuración para hacer un upsert seguro sin violar RLS
    const { data: existingData } = await supabase.from('business_config').select('id').maybeSingle();
    
    const { error } = await supabase
      .from('business_config')
      .upsert({
        id: existingData?.id || undefined,
        business_name: config.businessName,
        business_phone: config.businessPhone,
        bot_identity: config.botIdentity,
        bot_tone: config.botTone,
        bot_system_context: config.botSystemContext,
        bot_welcome_msg: config.botWelcomeMsg,
        bot_off_hours_msg: config.botOffHoursMsg,
        opening_time: config.openingTime,
        closing_time: config.closingTime,
        auto_close_day: config.autoClose,
        auto_confirm_bookings: config.autoConfirmBookings,
        auto_upsell: config.autoUpsell
      });

    if (!error) {
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 3000);
    } else {
      alert('Error al sincronizar con Supabase: ' + error.message);
    }
  };

  if (loading) return <div className="p-8"><p className="body-md">Cargando cerebro de IA...</p></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="display-md">Configuración de Inteligencia</h2>
          <p className="body-md" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
            Define la personalidad, reglas y comportamiento del cerebro de tu bot (Sincronizado con n8n).
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 340px)', gap: '2rem' }}>
        
        {/* Formulario Principal */}
        <div className="card" style={{ padding: '2.5rem', background: 'linear-gradient(145deg, var(--surface-bright), var(--surface-container-low))' }}>
           <form onSubmit={handleSave} className="flex flex-col gap-8">
             
             {/* Sección: Perfil del Negocio */}
             <div>
               <h3 className="title-md" style={{ borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <span className="material-symbols-outlined">business</span> Perfil Corporativo
               </h3>
               <div className="flex gap-4 mb-4">
                 <div style={{ flex: 1 }}>
                   <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre del Negocio</label>
                   <input required type="text" className="input-base" style={{ width: '100%' }} value={config.businessName} onChange={e => setConfig({...config, businessName: e.target.value})} />
                 </div>
                 <div style={{ flex: 1 }}>
                   <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>WhatsApp Business</label>
                   <input required type="text" className="input-base" style={{ width: '100%' }} value={config.businessPhone} onChange={e => setConfig({...config, businessPhone: e.target.value})} />
                 </div>
               </div>

               {/* NUEVO: Horarios de Operación */}
               <div className="flex gap-4 mt-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--surface-container-highest)' }}>
                  <div style={{ flex: 1 }}>
                    <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Apertura</label>
                    <input type="time" className="input-base" style={{ width: '100%' }} value={config.openingTime} onChange={e => setConfig({...config, openingTime: e.target.value})} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Cierre</label>
                    <input type="time" className="input-base" style={{ width: '100%' }} value={config.closingTime} onChange={e => setConfig({...config, closingTime: e.target.value})} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <label className="label-sm" style={{ marginBottom: '0.5rem' }}>Auto-Cierre</label>
                    <div style={{ width: '40px', height: '24px', borderRadius: '12px', backgroundColor: config.autoClose ? 'var(--emerald-400)' : 'var(--surface-container-highest)', display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer', justifyContent: config.autoClose ? 'flex-end' : 'flex-start' }} onClick={() => setConfig({...config, autoClose: !config.autoClose})}>
                       <div style={{ width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%' }}></div>
                    </div>
                  </div>
               </div>
             </div>

             {/* Sección: Cerebro IA (Fase 3 Core) */}
             <div style={{ padding: '2rem', borderRadius: '16px', backgroundColor: 'rgba(255, 90, 31, 0.03)', border: '1px solid rgba(255, 90, 31, 0.1)' }}>
               <h3 className="title-md" style={{ marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <span className="material-symbols-outlined">psychology</span> Configuración de la IA (Cerebro)
               </h3>
               
               <div className="flex gap-4 mb-5">
                  <div style={{ flex: 1 }}>
                    <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Identidad del Bot</label>
                    <input className="input-base" style={{ width: '100%' }} placeholder="Ej: Recepcionista Dental" value={config.botIdentity} onChange={e => setConfig({...config, botIdentity: e.target.value})} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Tono de Voz</label>
                    <select className="input-base" style={{ width: '100%' }} value={config.botTone} onChange={e => setConfig({...config, botTone: e.target.value})}>
                      <option>Profesional y Atento</option>
                      <option>Casual y Amigable</option>
                      <option>Urgente y Directo</option>
                      <option>Elegante y Sofisticado</option>
                    </select>
                  </div>
               </div>

               <div style={{ marginBottom: '1.5rem' }}>
                 <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Contexto y Reglas de Oro (System Prompt)</label>
                 <textarea className="input-base" style={{ width: '100%', height: '120px', resize: 'vertical', fontSize: '0.85rem' }} placeholder="Escribe aquí las reglas que el bot NUNCA debe romper..." value={config.botSystemContext} onChange={e => setConfig({...config, botSystemContext: e.target.value})}></textarea>
               </div>
             </div>

             <div className="flex justify-end gap-3" style={{ borderTop: 'var(--table-border)', paddingTop: '2rem', marginTop: '1rem' }}>
               <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2.5rem', boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)' }}>
                 {savedStatus ? '¡Sincronizado con Supabase!' : 'Actualizar Cerebro IA'}
               </button>
             </div>
           </form>
        </div>


        {/* Status y Licencia */}
        <div className="flex flex-col gap-5">
          <div className="card" style={{ border: '1px solid rgba(52, 211, 153, 0.2)' }}>
            <h4 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)' }}>bolt</span> ESTADO DEL BOT
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="label-sm">Motor de IA</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--emerald-400)' }}>GPT-4O READY</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="label-sm">Memoria Contextual</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--emerald-400)' }}>ACTIVADA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="label-sm">Latencia Media</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>1.2s</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface-container-low), var(--surface-container-high))' }}>
             <h4 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
               <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)' }}>verified</span> SUSCRIPCIÓN PRO
             </h4>
             <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '1rem' }}>
               <p style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.6, marginBottom: '0.5rem' }}>PLAN EMPRESARIAL</p>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>Robotina Infinite</h3>
               <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Acceso ilimitado a Booking IA y CRM.</p>
             </div>
             <button className="btn-secondary" style={{ width: '100%', fontSize: '0.75rem', padding: '0.75rem' }}>Gestionar Facturación</button>
          </div>

          <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h4 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#ef4444' }}>
              <span className="material-symbols-outlined">logout</span> SESIÓN ACTIVA
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
              Cierra tu sesión en este navegador para evitar accesos no autorizados.
            </p>
            <button 
              type="button"
              onClick={() => {
                localStorage.removeItem('isAuthenticated');
                window.location.href = '/';
              }} 
              className="btn-secondary" 
              style={{ width: '100%', fontSize: '0.75rem', padding: '0.75rem', borderColor: '#ef4444', color: '#ef4444' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
