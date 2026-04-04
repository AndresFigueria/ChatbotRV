import { useState, useEffect } from 'react';

export default function Settings() {
  const [config, setConfig] = useState({
    restName: 'Elegancia Operativa Local Centro',
    restPhone: '+593 99 999 9999',
    botApiKey: 'sk-prod-twilio-xxxxxx',
    botWelcomeMsg: '¡Hola! 🤖 Soy el Bot de tu Restaurante. ¿Lista/o para ordenar los mejores platos de la ciudad?',
    botOffHoursMsg: 'Lo sentimos, nuestros fogones están descansando. Atendemos de 12h00 a 22h00. 🕒',
    soundEnabled: true,
    autoAccept: false
  });

  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rest-settings');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('rest-settings', JSON.stringify(config));
    window.dispatchEvent(new Event('settingsUpdated'));
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  const handleReset = () => {
    if(window.confirm('¿Deseas restaurar la configuración base?')) {
      localStorage.removeItem('rest-settings');
      window.location.reload();
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="display-md">Configuración Inteligente</h2>
          <p className="body-md" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
            Ajustes globales de tu negocio y cerebro del Bot de WhatsApp.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 320px)', gap: '2rem' }}>
        
        {/* Formulario Principal */}
        <div className="card" style={{ padding: '2.5rem' }}>
           <form onSubmit={handleSave} className="flex flex-col gap-6">
             
             {/* Sección: Negocio */}
             <div>
               <h3 className="title-md" style={{ borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--on-surface)' }}>⚙️ Perfil del Local</h3>
               <div className="flex gap-4 mb-4">
                 <div style={{ flex: 1 }}>
                   <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre Operativo del Restaurante</label>
                   <input required type="text" className="input-base" style={{ width: '100%', paddingLeft: '1rem' }} value={config.restName} onChange={e => setConfig({...config, restName: e.target.value})} />
                 </div>
                 <div style={{ flex: 1 }}>
                   <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>WhatsApp Business (Línea Cliente)</label>
                   <input required type="text" className="input-base" style={{ width: '100%', paddingLeft: '1rem' }} value={config.restPhone} onChange={e => setConfig({...config, restPhone: e.target.value})} />
                 </div>
               </div>
             </div>

             {/* Sección: Inteligencia Artificial */}
             <div style={{ marginTop: '1rem' }}>
               <h3 className="title-md" style={{ borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--tertiary)' }}>🤖 Personalidad del Bot Analítico</h3>
               
               <div style={{ marginBottom: '1.5rem' }}>
                 <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>API Key o Token de Nube (Twilio / Meta)</label>
                 <div className="relative">
                   <input required type="password" className="input-base" style={{ width: '100%', fontFamily: 'monospace', paddingLeft: '1rem', letterSpacing: '0.1rem' }} value={config.botApiKey} onChange={e => setConfig({...config, botApiKey: e.target.value})} />
                   <span className="material-symbols-outlined absolute" style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }}>key</span>
                 </div>
                 <p style={{ fontSize: '0.65rem', color: 'var(--secondary)', marginTop: '0.4rem' }}>Llave maestra de encriptación que une el modelo de lenguaje de IA con tu número corporativo.</p>
               </div>

               <div style={{ marginBottom: '1.5rem' }}>
                 <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Mensaje Inicial (Prompt al Cliente)</label>
                 <textarea required className="input-base" style={{ width: '100%', height: '80px', resize: 'vertical', padding: '1rem' }} value={config.botWelcomeMsg} onChange={e => setConfig({...config, botWelcomeMsg: e.target.value})}></textarea>
                 <p style={{ fontSize: '0.65rem', color: 'var(--secondary)', marginTop: '0.4rem' }}>El bot romperá el hielo con el cliente copiando exactamente estas palabras.</p>
               </div>

               <div style={{ marginBottom: '1rem' }}>
                 <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Mensaje Fuera del Horario de Atención (Offline)</label>
                 <textarea required className="input-base" style={{ width: '100%', height: '60px', resize: 'vertical', padding: '1rem' }} value={config.botOffHoursMsg} onChange={e => setConfig({...config, botOffHoursMsg: e.target.value})}></textarea>
                 <p style={{ fontSize: '0.65rem', color: 'var(--secondary)', marginTop: '0.4rem' }}>Se dispara automáticamente fuera de los horarios logísticos.</p>
               </div>
             </div>

             {/* Sección: Operativa Dashboard */}
             <div style={{ marginTop: '1rem' }}>
               <h3 className="title-md" style={{ borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--emerald-400)' }}>🎛️ Motor Operativo en Pantallas</h3>
               
               <div className="flex gap-4">
                 
                 {/* Card Toggle 1 */}
                 <div className="card" style={{ flex: 1, padding: '1.5rem', backgroundColor: config.soundEnabled ? 'var(--surface-container-high)' : 'var(--surface-container-low)', cursor: 'pointer', border: config.soundEnabled ? '1px solid var(--primary)' : '1px solid transparent', transition: 'all 0.2s ease' }} onClick={() => setConfig({...config, soundEnabled: !config.soundEnabled})}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: config.soundEnabled ? 'var(--primary)' : 'var(--on-surface)' }}>Timbre Acústico</strong>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: config.soundEnabled ? 'var(--emerald-400)' : 'var(--secondary)' }}>{config.soundEnabled ? 'ON' : 'OFF'}</span>
                        <span className="material-symbols-outlined" style={{ color: config.soundEnabled ? 'var(--primary)' : 'var(--secondary)' }}>{config.soundEnabled ? 'volume_up' : 'volume_off'}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', lineHeight: 1.4 }}>Reproducir una alerta de audio potente y visible cada vez que entre una comandita de WhatsApp.</p>
                 </div>

                 {/* Card Toggle 2 */}
                 <div className="card" style={{ flex: 1, padding: '1.5rem', backgroundColor: config.autoAccept ? 'var(--surface-container-high)' : 'var(--surface-container-low)', cursor: 'pointer', border: config.autoAccept ? '1px solid var(--primary)' : '1px solid transparent', transition: 'all 0.2s ease' }} onClick={() => setConfig({...config, autoAccept: !config.autoAccept})}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: config.autoAccept ? 'var(--primary)' : 'var(--on-surface)' }}>Ruta Automática</strong>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: config.autoAccept ? 'var(--emerald-400)' : 'var(--secondary)' }}>{config.autoAccept ? 'ON' : 'OFF'}</span>
                        <span className="material-symbols-outlined" style={{ color: config.autoAccept ? 'var(--primary)' : 'var(--secondary)' }}>{config.autoAccept ? 'bolt' : 'pan_tool'}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', lineHeight: 1.4 }}>Saltarse el botón "Aceptar Pedido". Ideal para negocios Fast-Food con alto tráfico orgánico.</p>
                 </div>

               </div>
             </div>

             <div className="flex justify-end gap-3" style={{ borderTop: 'var(--table-border)', paddingTop: '2rem', marginTop: '1rem' }}>
               <button type="button" onClick={handleReset} className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>Recuperar de Fábrica</button>
               <button type="submit" className="btn-primary flex items-center gap-2" style={{ padding: '0.75rem 2rem', boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)' }}>
                 {savedStatus ? <><span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>check</span> Cambios en Nube</> : 'Aplicar Sincronía'}
               </button>
             </div>
           </form>
        </div>

        {/* Panel lateral: Status del sistema */}
        <div className="flex flex-col gap-5">
          <div className="card" style={{ backgroundColor: 'var(--surface-container-low)' }}>
            <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem' }}><span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)' }}>dns</span> Servidor Activo</h4>
            
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.5rem' }}>
              <span className="label-sm" style={{ color: 'var(--secondary)' }}>Conexión Supabase</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--emerald-400)', fontWeight: 700, backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>ESTABLE</span>
            </div>
            
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.5rem' }}>
              <span className="label-sm" style={{ color: 'var(--secondary)' }}>Sockets en Vivo</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--emerald-400)', fontWeight: 700, backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>REALTIME ON</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="label-sm" style={{ color: 'var(--secondary)' }}>Bot Respondedor</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, backgroundColor: 'rgba(255, 90, 31, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255, 90, 31, 0.3)' }}>A LA ESCUCHA</span>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--surface-container-low)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
             <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--on-surface)' }}><span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)' }}>verified_user</span> Licencia Operativa</h4>
             
             <div style={{ padding: '1rem', backgroundColor: 'var(--surface-container-high)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
               <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Plan Actual Full-Access</span>
               <div className="flex justify-between items-end" style={{ marginTop: '0.2rem' }}>
                 <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Robotina Operativa Mensual</strong>
                 <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontWeight: 600 }}>Activo ✅</span>
               </div>
               <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--secondary)' }}>
                 Ahorra $200 dólares pagando la cuota <strong style={{ color: 'var(--emerald-400)', cursor: 'pointer', textDecoration: 'underline' }}>Anual ($700 USD)</strong>.
               </div>
             </div>
             
             <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
               <span className="label-sm" style={{ color: 'var(--secondary)' }}>Renovación Periodo</span>
               <span style={{ fontSize: '0.8rem', color: 'var(--on-surface)', fontWeight: 600 }}>15 Nov. 2026</span>
             </div>

             <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
               <span className="label-sm" style={{ color: 'var(--secondary)' }}>Inversión Recurrente</span>
               <span style={{ fontSize: '0.8rem', color: 'var(--on-surface)', fontWeight: 600 }}>$75.00 USD</span>
             </div>

             <button onClick={() => alert('Redirigiendo a tu Portal de Pagos Privado para gestionar la actualización del contrato a plan Anual...')} className="btn-secondary" style={{ width: '100%', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid rgba(255, 90, 31, 0.3)', color: 'var(--primary)', backgroundColor: 'rgba(255, 90, 31, 0.05)', fontWeight: 600 }}>
               <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>credit_card</span> Actualizar a Plan Anual
             </button>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--surface-container-low)' }}>
             <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><span className="material-symbols-outlined" style={{ color: 'var(--tertiary)' }}>support_agent</span> Soporte Corporativo</h4>
             <p className="body-md" style={{ color: 'var(--secondary)', fontSize: '0.8rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
               Si el integrador no está enviando los menús solicitados, puedes reiniciar la terminal regenerando el Token de encriptación arriba.
             </p>
             <button className="btn-secondary" style={{ width: '100%', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem' }}>
               <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>call</span> Hablar con Ingeniero
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
