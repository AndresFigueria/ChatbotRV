import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Settings() {
  const [config, setConfig] = useState({
    businessName: 'Robotina Central',
    businessPhone: '+54 9 11 6599-4057',
    botIdentity: 'Robotina SDR',
    botTone: 'Profesional y Atento',
    botSystemContext: 'Eres Robotina, la asesora de ventas y experta en automatización de "Robotina Central". Tu objetivo principal y único es calificar a los dueños de negocios que nos contactan y lograr que agenden una demostración en vivo (Meet) a través de este enlace: https://calendar.app.google/bMz6yssC1LsmjMQHA\n\nREGLAS ESTRICTAS DE COMPORTAMIENTO:\n1. Sé concisa, humana y persuasiva. Tus mensajes deben ser cortos (máximo 2 a 3 oraciones cortas). Evita enviar bloques de texto largos.\n2. NUNCA des asesoría técnica gratuita y extensa. Tú eres ventas, no soporte.\n3. Si el prospecto pregunta precios, dile que tenemos planes desde $49 USD/mes, pero que la mejor forma de cotizar es viendo cómo funciona en vivo, y mándalo al enlace.\n4. Usa un tono amigable, empático, seguro y con autoridad tecnológica. Usa emojis con moderación.\n5. LIMITA EL CHATEO: Después de 2 intercambios de mensajes, DEBES buscar el cierre pidiéndole que elija un horario en el enlace.\n\nEL EMBUDO DE CONVERSACIÓN:\n- Paso 1 (Apertura): Saluda cordialmente, preséntate brevemente y haz la pregunta clave: "¿De qué trata exactamente tu negocio y cuántos mensajes recibes al día aproximadamente?".\n- Paso 2 (Agitación): Basado en su respuesta, empatiza con el tiempo o ventas perdidas por no automatizar.\n- Paso 3 (Solución): Explícale que Robotina automatiza reservas, pedidos y CRM 24/7.\n- Paso 4 (Cierre): Dile: "Lo ideal es que te muestre la plataforma en vivo para tu caso. Elige el horario que mejor te quede aquí: https://calendar.app.google/bMz6yssC1LsmjMQHA".',
    botWelcomeMsg: '¡Hola! 🤖 Soy la asistente virtual de Robotina Central. Estoy aquí para ayudarte a poner las ventas de tu negocio en piloto automático. Para ver cómo podemos ayudarte, cuéntame: ¿Qué producto o servicio vende tu negocio y cómo gestionas tus chats de WhatsApp actualmente?',
    botOffHoursMsg: 'Lo sentimos, en este momento nuestro equipo está fuera de línea. Atendemos de 09h00 a 18h00. 🕒',
    openingTime: '09:00',
    closingTime: '18:00',
    autoClose: true,
    autoConfirmBookings: false,
    autoUpsell: true,
    currency: 'USD'
  });

  const [loading, setLoading] = useState(true);
  const [savedStatus, setSavedStatus] = useState(false);
  const [tenantPlan, setTenantPlan] = useState('starter');
  const [tenantIsActive, setTenantIsActive] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      const { data: userData } = await supabase.auth.getUser();
      let currentTenantId = null;

      if (userData.user) {
        const { data: tenantUser } = await supabase
          .from('tenant_users')
          .select('tenant_id')
          .eq('user_id', userData.user.id)
          .single();
        
        if (tenantUser) {
          currentTenantId = tenantUser.tenant_id;
        }
      }

      const { data, error } = await supabase
        .from('business_config')
        .select('*')
        .maybeSingle();

      let tenantPrompt = '';
      if (currentTenantId) {
        const { data: tenantData } = await supabase.from('tenants').select('system_prompt, plan, is_active').eq('id', currentTenantId).single();
        if (tenantData) {
          tenantPrompt = tenantData.system_prompt;
          if (tenantData.plan) setTenantPlan(tenantData.plan);
          if (tenantData.is_active !== undefined) setTenantIsActive(tenantData.is_active);
        }
      }

      if (!error && data) {
        setConfig({
          businessName: data.business_name || 'Robotina Business',
          businessPhone: data.business_phone || '+54 9 11 6599-4057',
          botIdentity: data.bot_identity || '',
          botTone: data.bot_tone || '',
          botSystemContext: tenantPrompt || data.bot_system_context || '',
          botWelcomeMsg: data.bot_welcome_msg || '¡Hola!',
          botOffHoursMsg: data.bot_off_hours_msg || 'Fuera de horario',
          openingTime: data.opening_time || '09:00',
          closingTime: data.closing_time || '18:00',
          autoClose: data.auto_close_day || true,
          autoConfirmBookings: data.auto_confirm_bookings || false,
          autoUpsell: data.auto_upsell || true,
          currency: data.currency || 'USD'
        });
      } else if (!data && tenantPrompt) {
        // Fallback si no hay business_config
        setConfig(prev => ({ ...prev, botSystemContext: tenantPrompt }));
      }
      setLoading(false);
    }
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedStatus(false);
    
    // Buscar si ya existe una configuración para hacer un upsert seguro
    const { data: existingData } = await supabase.from('business_config').select('id').maybeSingle();
    
    // Buscar el tenant_id del usuario actual para permisos RLS
    const { data: userData } = await supabase.auth.getUser();
    let currentTenantId = null;

    if (userData.user) {
      const { data: tenantUser } = await supabase
        .from('tenant_users')
        .select('tenant_id')
        .eq('user_id', userData.user.id)
        .single();
      
      if (tenantUser) {
        currentTenantId = tenantUser.tenant_id;
      }
    }
    
    const payload: any = {
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
        auto_upsell: config.autoUpsell,
        currency: config.currency
    };

    if (currentTenantId) {
        payload.tenant_id = currentTenantId;
    }
    
    const { error } = await supabase
      .from('business_config')
      .upsert(payload);

    let tenantError = null;
    if (currentTenantId) {
      const { error: err } = await supabase
        .from('tenants')
        .update({ system_prompt: config.botSystemContext })
        .eq('id', currentTenantId);
      tenantError = err;
    }

    if (!error && !tenantError) {
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 3000);
    } else {
      alert('Error al sincronizar con Supabase: ' + (error?.message || tenantError?.message));
    }
  };

  if (loading) return <div className="p-8"><p className="body-md">Cargando cerebro de IA...</p></div>;

    return (
    <div style={{ padding: '0 1.5rem 0' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
        <div>
          <h2 className="page-title">Configuración de Inteligencia</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 340px)', gap: '1.25rem' }}>
        
        {/* Formulario Principal */}
        <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(145deg, var(--surface-bright), var(--surface-container-low))' }}>
           <form onSubmit={handleSave} className="flex flex-col gap-4">
             
             {/* Sección: Perfil del Negocio */}
             <div>
                <h3 className="title-md" style={{ borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.35rem', marginBottom: '0.5rem', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                  <span className="material-symbols-outlined">business</span> Perfil Corporativo
                </h3>
                 <div className="flex gap-3 mb-2">
                   <div style={{ flex: 1.5 }}>
                     <label className="label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>Nombre del Negocio</label>
                     <input required type="text" className="input-base" style={{ width: '100%' }} value={config.businessName} onChange={e => setConfig({...config, businessName: e.target.value})} />
                   </div>
                   <div style={{ flex: 0.8 }}>
                     <label className="label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>Moneda Base</label>
                     <select className="input-base" style={{ width: '100%' }} value={config.currency} onChange={e => setConfig({...config, currency: e.target.value})}>
                       <option value="USD">Dólares (USD)</option>
                       <option value="PEN">Soles (PEN)</option>
                       <option value="ARS">Pesos Argentinos (ARS)</option>
                     </select>
                   </div>
                  <div style={{ flex: 1 }}>
                    <label className="label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>WhatsApp Business</label>
                    <input 
                      readOnly 
                      type="text" 
                      className="input-base" 
                      style={{ 
                        width: '100%', 
                        opacity: 0.6, 
                        cursor: 'not-allowed', 
                        backgroundColor: 'var(--surface-container-high)',
                        border: '1px solid var(--outline-variant)'
                      }} 
                      value={config.businessPhone} 
                      title="Número oficial vinculado a la API de Meta. Para cambiarlo contacta a soporte."
                    />
                  </div>
                </div>

                {/* NUEVO: Horarios de Operación */}
                <div className="flex gap-3 mt-3 p-2.5 rounded-xl" style={{ backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--surface-container-highest)' }}>
                   <div style={{ flex: 1 }}>
                     <label className="label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>Apertura</label>
                     <input type="time" className="input-base" style={{ width: '100%' }} value={config.openingTime} onChange={e => setConfig({...config, openingTime: e.target.value})} />
                   </div>
                   <div style={{ flex: 1 }}>
                     <label className="label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>Cierre</label>
                     <input type="time" className="input-base" style={{ width: '100%' }} value={config.closingTime} onChange={e => setConfig({...config, closingTime: e.target.value})} />
                   </div>
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                     <label className="label-sm" style={{ marginBottom: '0.25rem' }}>Auto-Cierre</label>
                     <div style={{ width: '36px', height: '20px', borderRadius: '10px', backgroundColor: config.autoClose ? 'var(--emerald-400)' : 'var(--surface-container-highest)', display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer', justifyContent: config.autoClose ? 'flex-end' : 'flex-start' }} onClick={() => setConfig({...config, autoClose: !config.autoClose})}>
                        <div style={{ width: '16px', height: '16px', backgroundColor: 'var(--surface-bright)', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                     </div>
                   </div>
                </div>
              </div>

              {/* Sección: Cerebro IA (Fase 3 Core) */}
              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)' }}>
                <h3 className="title-md" style={{ marginBottom: '0.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                  <span className="material-symbols-outlined">psychology</span> Configuración de la IA (Cerebro)
                </h3>
                
                <div className="flex gap-3 mb-2">
                   <div style={{ flex: 1 }}>
                     <label className="label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>Identidad del Bot</label>
                     <input className="input-base" style={{ width: '100%' }} placeholder="Ej: Recepcionista Dental" value={config.botIdentity} onChange={e => setConfig({...config, botIdentity: e.target.value})} />
                   </div>
                   <div style={{ flex: 1 }}>
                     <label className="label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>Tono de Voz</label>
                     <select className="input-base" style={{ width: '100%' }} value={config.botTone} onChange={e => setConfig({...config, botTone: e.target.value})}>
                       <option>Profesional y Atento</option>
                       <option>Casual y Amigable</option>
                       <option>Urgente y Directo</option>
                       <option>Elegante y Sofisticado</option>
                     </select>
                   </div>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <label className="label-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>Contexto y Reglas de Oro (System Prompt)</label>
                  <textarea className="input-base" style={{ width: '100%', height: '125px', resize: 'vertical', fontSize: '0.85rem' }} placeholder="Escribe aquí las reglas que el bot NUNCA debe romper..." value={config.botSystemContext} onChange={e => setConfig({...config, botSystemContext: e.target.value})}></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3" style={{ borderTop: 'var(--table-border)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                <button type="submit" className="btn-primary" style={{ padding: '0.625rem 2rem', boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)' }}>
                  {savedStatus ? '¡Sincronizado con Supabase!' : 'Actualizar Cerebro IA'}
                </button>
              </div>
            </form>
         </div>

         {/* Status y Licencia */}
         <div className="flex flex-col gap-4">
           <div className="card" style={{ border: tenantIsActive ? '1px solid rgba(52, 211, 153, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)', padding: '0.875rem 1rem' }}>
             <h4 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
               <span className="material-symbols-outlined" style={{ color: tenantIsActive ? 'var(--emerald-400)' : '#ef4444' }}>bolt</span> ESTADO DEL BOT
             </h4>
             <div className="flex flex-col gap-2.5">
               <div className="flex justify-between items-center">
                 <span className="label-sm">Estado General</span>
                 <span style={{ fontSize: '0.7rem', fontWeight: 800, color: tenantIsActive ? 'var(--emerald-400)' : '#ef4444' }}>
                   {tenantIsActive ? 'EN LÍNEA' : 'INACTIVO'}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="label-sm">Motor de IA</span>
                 <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--emerald-400)' }}>GPT-4O READY</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="label-sm">Memoria Contextual</span>
                 <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--emerald-400)' }}>ACTIVADA</span>
               </div>
             </div>
           </div>

           <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface-container-low), var(--surface-container-high))', padding: '0.875rem 1rem' }}>
              <h4 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)' }}>verified</span> SUSCRIPCIÓN
              </h4>
              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--surface-container-highest)', borderRadius: '12px', marginBottom: '0.5rem', border: '1px solid var(--outline-variant)' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.6, marginBottom: '0.5rem', color: 'var(--on-surface)' }}>
                  PLAN {tenantPlan.toUpperCase()}
                </p>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>
                  {tenantPlan === 'advanced' ? 'Robotina Advanced' : tenantPlan === 'starter' ? 'Robotina Starter' : 'Robotina Infinite'}
                </h3>
                <p style={{ fontSize: '0.7rem', marginTop: '0.35rem' }}>
                  {tenantPlan === 'advanced' ? 'Acceso avanzado a Booking IA y CRM.' : tenantPlan === 'starter' ? 'Funciones básicas de automatización.' : 'Acceso ilimitado a Booking IA y CRM.'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  window.open('/home#contacto', '_blank');
                }}
                className="btn-secondary" 
                style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem' }}
              >
                Gestionar Facturación
              </button>
           </div>

           <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.875rem 1rem' }}>
             <h4 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#ef4444' }}>
               <span className="material-symbols-outlined">logout</span> SESIÓN ACTIVA
             </h4>
             <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
               Cierra tu sesión en este navegador para evitar accesos no autorizados.
             </p>
             <button 
               type="button"
               onClick={() => {
                 localStorage.removeItem('isAuthenticated');
                 window.location.href = '/';
               }} 
               className="btn-secondary" 
               style={{ 
                 width: '100%', 
                 fontSize: '0.7rem', 
                 padding: '0.5rem 0.75rem', 
                 borderColor: '#ef4444', 
                 color: '#ef4444',
                 transition: 'all 0.2s ease'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.backgroundColor = '#ef4444';
                 e.currentTarget.style.color = '#ffffff';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.backgroundColor = 'transparent';
                 e.currentTarget.style.color = '#ef4444';
               }}
             >
               Cerrar Sesión
             </button>
           </div>
         </div>
       </div>

      {/* Success Toast */}
      <div style={{
        position: 'fixed',
        bottom: savedStatus ? '2rem' : '-5rem',
        right: '2rem',
        backgroundColor: 'var(--emerald-400)',
        color: '#042f2e',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(52, 211, 153, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontWeight: 800,
        zIndex: 9999,
        opacity: savedStatus ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'none'
      }}>
        <span className="material-symbols-outlined">cloud_done</span>
        Sincronización con DB Exitosa
      </div>
    </div>
  );
}
