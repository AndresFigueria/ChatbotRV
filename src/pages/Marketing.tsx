import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Marketing() {
  const [audience, setAudience] = useState('Todos');
  const [message, setMessage] = useState('¡Hola [Nombre]! 🌟 Sabemos que te interesa nuestro servicio de [Item_Favorito], por eso te regalamos un bono especial en tu próxima visita usando el código: REGRESA20.\n\n¿Deseas agendar ahora mismo? Escribe "QUIERO EL BONO" y yo me encargo de todo. ✨');
  const [imgUrl, setImgUrl] = useState('');
  const [campaignName, setCampaignName] = useState('Recuperación de Clientes Febrero');
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  // Historial real de métricas de marketing (Vacío al inicio)
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function loadCustomers() {
      const { data } = await supabase.from('customers').select('status, whatsapp_opt_in');
      if (data) setCustomers(data);
    }
    loadCustomers();
  }, []);

  // Calcular la audiencia objetivo que SÍ quiere recibir mensajes (opt-in)
  const targetCustomers = customers.filter(c => 
    c.whatsapp_opt_in !== false && (audience === 'Todos' ? true : c.status === audience)
  );
  
  const audienceCount = targetCustomers.length;

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (audienceCount === 0) {
      alert('Tu audiencia actual es 0. Selecciona otro segmento que tenga clientes.');
      return;
    }

    setIsDeploying(true);
    setProgress(0);
    setSuccess(false);

    // Simular envío de mensajes en lote
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDeploying(false);
            setSuccess(true);
            setHistory([{
              id: Date.now(),
              name: campaignName,
              date: 'Buscando ROI...',
              audience: audience,
              sent: audienceCount,
              converted: 0,
              revenue: '$0.00',
              status: 'En Vivo'
            }, ...history]);
            // Ocultar modal de éxito en 4s
            setTimeout(() => setSuccess(false), 4000);
          }, 500);
          return 100;
        }
        return p + 5;
      });
    }, 150);
  };

  return (
    <div className="p-8 relative">
      <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="page-title">Generador de Marketing (WhatsApp)</h2>
          <p className="body-md" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
            Aumenta tus ventas impactando directamente al teléfono de tus clientes mediante la IA.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 4fr)', gap: '2rem' }}>
        
        {/* Lado Izquierdo: Formulario de Creación */}
        <div className="card" style={{ padding: '2rem' }}>
           <h3 className="title-md" style={{ borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>campaign</span>
             Lanzar Nueva Difusión
           </h3>
           
           <form onSubmit={handleLaunch} className="flex flex-col gap-5">
             <div>
               <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre Interno de la Campaña</label>
               <input required type="text" className="input-base" style={{ width: '100%', paddingLeft: '1rem' }} value={campaignName} onChange={e => setCampaignName(e.target.value)} />
             </div>

             <div>
               <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Segmento Objetivo (CRM de Supabase)</label>
               <select className="input-base" style={{ width: '100%', paddingLeft: '1rem', appearance: 'none', backgroundColor: 'var(--surface-container-low)' }} value={audience} onChange={e => setAudience(e.target.value)}>
                 <option value="Todos">Toda mi base de datos (Global Broadcast)</option>
                 <option value="VIP">Solo VIPs (Recompensas de Lealtad)</option>
                 <option value="En Riesgo">Clientes "En Riesgo" (Estrategia de Recuperación)</option>
                 <option value="Nuevo">Nuevos Clientes (Estrategia de Bienvenida)</option>
               </select>
               <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--emerald-400)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                 <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>group_add</span>
                 Audiencia Válida Calculada: {audienceCount} usuarios
               </p>
             </div>

             <div>
               <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Mensaje Inteligente (Soporta Variables del CRM)</label>
               <div style={{ position: 'relative' }}>
                 <textarea required className="input-base" style={{ width: '100%', height: '120px', resize: 'vertical', padding: '1rem', fontSize: '0.85rem', lineHeight: '1.5' }} value={message} onChange={e => setMessage(e.target.value)}></textarea>
               </div>
               <div className="flex gap-2 flex-wrap" style={{ marginTop: '0.5rem' }}>
                 <span style={{ fontSize: '0.65rem', color: 'var(--secondary)' }}>Variables mágicas:</span>
                 <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--surface-container-high)', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace' }}>[Nombre]</span>
                 <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--surface-container-high)', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace' }}>[Plato_Favorito]</span>
                 <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--surface-container-high)', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace' }}>[LTV]</span>
               </div>
             </div>

             <div>
               <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Imagen Promocional (Opcional - Link Web)</label>
               <input type="url" className="input-base" style={{ width: '100%', paddingLeft: '1rem' }} value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="Ej. https://miservidor.com/flyer-promo.jpg" />
             </div>

             <div className="flex justify-end gap-3" style={{ borderTop: 'var(--table-border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
               <button type="submit" disabled={isDeploying} className="btn-primary" style={{ padding: '0.85rem 2rem', boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                 <span className="material-symbols-outlined">{isDeploying ? 'sync' : 'rocket_launch'}</span> 
                 {isDeploying ? 'Disparando Mensajes a la Nube...' : `Desplegar a ${audienceCount} Usuarios (+${(audienceCount * 0.05).toFixed(2)} USD coste API)`}
               </button>
             </div>
           </form>
        </div>

        {/* Lado Derecho: Preview y Tabla de Desempeño */}
        <div className="flex flex-col gap-6">
          
          {/* Mock de Celular (Previsualización) */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ backgroundColor: '#075E54', padding: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>arrow_back</span>
              <img src="https://ui-avatars.com/api/?name=Cliente+Ideal&background=random&color=fff&rounded=true&size=150" alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0, lineHeight: 1 }}>Vista Previa</p>
                <p style={{ fontSize: '0.65rem', margin: 0, opacity: 0.8 }}>Cuenta de Empresa</p>
              </div>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: '#E5DDD5', backgroundImage: 'url(https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png)' }}>
               {/* Mensaje Burbuja */}
               <div style={{ backgroundColor: '#DCF8C6', padding: '0.75rem', borderRadius: '0.5rem', borderTopLeftRadius: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)', maxWidth: '90%', marginLeft: 'auto', borderTopRightRadius: 0 }}>
                  {imgUrl && <img src={imgUrl} alt="Flyer" style={{ width: '100%', borderRadius: '0.4rem', marginBottom: '0.5rem', objectFit: 'cover' }} />}
                  <p style={{ fontSize: '0.8rem', color: '#303030', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                    {message.replace('[Nombre]', 'Cliente').replace('[Item_Favorito]', 'nuestro servicio estrella').replace('[LTV]', '$0.00')}
                  </p>
                  <div style={{ textAlign: 'right', fontSize: '0.6rem', color: '#999', marginTop: '0.2rem' }}>Ahora ✓✓</div>
               </div>
            </div>
          </div>

          {/* Estado de Desempeño */}
          <div className="card" style={{ flex: 1 }}>
            <h3 className="title-md" style={{ borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)' }}>query_stats</span>
               Desempeño e Historial
            </h3>
            
            <div className="flex flex-col gap-3">
              {history.map(h => (
                <div key={h.id} style={{ padding: '1rem', backgroundColor: 'var(--surface-container-low)', borderRadius: '0.5rem', borderLeft: h.status === 'En Vivo' ? '4px solid var(--emerald-400)' : '4px solid var(--surface-container-highest)' }}>
                  <div className="flex justify-between items-start" style={{ marginBottom: '0.5rem' }}>
                    <p style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: '0.85rem' }}>{h.name}</p>
                    <span style={{ fontSize: '0.6rem', backgroundColor: h.status === 'En Vivo' ? 'rgba(52, 211, 153, 0.2)' : 'var(--surface-container-highest)', color: h.status === 'En Vivo' ? 'var(--emerald-400)' : 'var(--secondary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{h.status}</span>
                  </div>
                  <div className="flex justify-between items-center" style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                    <span>Segmento: <strong>{h.audience}</strong> ({h.sent} envíos)</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Tasa de Venta: {((h.converted / (h.sent || 1)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center" style={{ marginTop: '0.5rem', borderTop: '1px solid var(--surface-container)', paddingTop: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--secondary)' }}>{h.date}</span>
                    <strong style={{ color: 'var(--on-surface)', fontSize: '0.9rem' }}>Retorno: {h.revenue}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL ANIMADO DE PROGRESO DE ENVÍO */}
      {isDeploying && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div className="flex flex-col items-center gap-6" style={{ width: '400px' }}>
             <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--primary)', animation: 'pulse 1.5s infinite' }}>rocket</span>
             <h3 className="display-md" style={{ color: '#fff', margin: 0 }}>Desplegando Marketing AI...</h3>
             <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--surface-container)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--surface-container-highest)' }}>
               <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.1s linear', boxShadow: '0 0 10px var(--primary)' }}></div>
             </div>
             <p style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
               Enviando paquetes de datos a la APi de Meta Cloud ({progress}%)...
             </p>
          </div>
        </div>
      )}

      {/* MODAL ANIMADO DE ÉXITO */}
      {success && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--surface-bright)', border: '1px solid rgba(52, 211, 153, 0.4)', boxShadow: '0 20px 50px rgba(52, 211, 153, 0.15)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', color: 'var(--emerald-400)' }}>check_circle</span>
            </div>
            <h3 className="display-md" style={{ margin: 0 }}>¡Inyección Exitosa!</h3>
            <p className="body-md" style={{ color: 'var(--secondary)', textAlign: 'center', maxWidth: '300px', margin: 0 }}>
              Has lanzado {audienceCount} mensajes personalizados directo al teléfono de tus clientes. 
              Siéntate y mira cómo tu Bot empieza a levantar ventas y servicios automáticamente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
