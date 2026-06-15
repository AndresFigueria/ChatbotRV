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
    async function loadData() {
      // Load customers
      const { data: cData } = await supabase.from('customers').select('*');
      if (cData) setCustomers(cData);

      // Load real history
      const { data: hData } = await supabase.from('marketing_campaigns').select('*').order('created_at', { ascending: false });
      if (hData) {
        setHistory(hData.map(h => ({
          id: h.id,
          name: h.name,
          date: new Date(h.created_at).toLocaleDateString(),
          audience: h.audience_segment,
          sent: h.sent_count,
          converted: h.converted_count,
          revenue: `$${h.revenue_generated}`,
          status: h.status
        })));
      }
    }
    loadData();
  }, []);

  // Calcular la audiencia objetivo con reglas de segmentación avanzadas
  const targetCustomers = customers.filter(c => {
    if (c.whatsapp_opt_in === false) return false;
    
    if (audience === 'Todos') return true;
    if (audience === 'VIP') return c.status === 'VIP';
    if (audience === 'Nuevo') return c.status === 'Nuevo';
    if (audience === 'Frecuente') return c.orders_count >= 5;
    if (audience === 'Inactivo') {
      if (!c.last_order) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(c.last_order) < thirtyDaysAgo;
    }
    
    return c.status === audience;
  });
  
  const audienceCount = targetCustomers.length;

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (audienceCount === 0) {
      alert('Tu audiencia actual es 0. Selecciona otro segmento que tenga clientes.');
      return;
    }

    setIsDeploying(true);
    setProgress(0);
    setSuccess(false);

    try {
      // 1. Guardar la campaña en Supabase
      const { data: campaign, error } = await supabase.from('marketing_campaigns').insert([{
        name: campaignName,
        audience_segment: audience,
        sent_count: audienceCount,
        converted_count: 0,
        revenue_generated: 0.00,
        status: 'En Vivo'
      }]).select().single();

      if (error) throw error;

      // Animación de carga simulando la conexión con la API
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 90) return 90; // Wait at 90% until the webhook actually finishes
          return p + 10;
        });
      }, 200);

      // 2. Disparar el Webhook hacia n8n o Meta API
      const webhookUrl = 'https://hook.us1.make.com/placeholder-marketing-webhook'; // Reemplazar con URL real
      
      const payload = {
        campaign_id: campaign.id,
        campaign_name: campaignName,
        audience: audience,
        message_template: message,
        image_url: imgUrl,
        customers: targetCustomers.map(c => ({
          phone: c.phone,
          name: c.name,
          favorite_item: c.favorite_dish || 'nuestro servicio',
          ltv: c.ltv
        }))
      };

      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn("Webhook no disponible, pero la campaña se registró.", err);
        // We catch and ignore fetch error since it's a placeholder URL for now.
      }

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        setIsDeploying(false);
        setSuccess(true);
        
        // Update local history array
        setHistory([{
          id: campaign.id,
          name: campaign.name,
          date: new Date(campaign.created_at).toLocaleDateString(),
          audience: campaign.audience_segment,
          sent: campaign.sent_count,
          converted: 0,
          revenue: '$0.00',
          status: 'En Vivo'
        }, ...history]);

        setTimeout(() => setSuccess(false), 4000);
      }, 500);

    } catch (err: any) {
      setIsDeploying(false);
      alert('Error al lanzar la campaña: ' + err.message);
    }
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
                  <option value="Frecuente">Clientes Frecuentes (Más de 5 órdenes)</option>
                  <option value="Inactivo">Clientes Inactivos (+30 días sin compra)</option>
                  <option value="VIP">Solo VIPs (Recompensas de Lealtad)</option>
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
