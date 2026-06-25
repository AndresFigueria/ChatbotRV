import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Marketing() {
  const [audience, setAudience] = useState(() => localStorage.getItem('mkt_audience') || 'Todos');
  const [message, setMessage] = useState(() => localStorage.getItem('mkt_message') || '¡Hola [Nombre]! 🌟 Sabemos que te interesa nuestro servicio de [Item_Favorito], por eso te regalamos un bono especial en tu próxima visita usando el código: REGRESA20.\n\n¿Deseas agendar ahora mismo? Escribe "QUIERO EL BONO" y yo me encargo de todo. ✨');
  const [imgUrl, setImgUrl] = useState(() => localStorage.getItem('mkt_imgUrl') || '');
  const [campaignName, setCampaignName] = useState(() => localStorage.getItem('mkt_campaignName') || 'Recuperación de Clientes Febrero');

  useEffect(() => {
    localStorage.setItem('mkt_audience', audience);
    localStorage.setItem('mkt_message', message);
    localStorage.setItem('mkt_campaignName', campaignName);
    try {
      localStorage.setItem('mkt_imgUrl', imgUrl);
    } catch (e) {
      console.warn('La imagen excede el límite de memoria local del navegador.');
    }
  }, [audience, message, campaignName, imgUrl]);
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  
  // Right side tabs
  const [rightTab, setRightTab] = useState<'audiencia' | 'grupos'>('audiencia');

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
    if (audience === 'Nuevo') return c.status === 'Nuevo' || c.status === 'Contactó';
    if (audience === 'Frecuente') return c.total_orders >= 5 || c.status === 'Cliente Frecuente';
    if (audience === 'Interesado') return c.status === 'Interesado';
    if (audience === 'Inactivo') {
      if (!c.last_order_date) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(c.last_order_date) < thirtyDaysAgo;
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

      // 2. Disparar el Webhook hacia n8n directamente
      const webhookUrl = 'https://n8n-whatsappa-central.robotina-ia.com/webhook/robotina-marketing-ia';
      
      const payload = {
        campaign_id: campaign.id,
        campaign_name: campaignName,
        audience: audience,
        message_template: message,
        image_url: imgUrl,
        customers: targetCustomers.map(c => ({
          phone: c.phone_number,
          name: c.name,
          favorite_item: c.preferences || 'nuestro servicio',
          ltv: c.ltv,
          message_template: message,
          image_url: imgUrl
        }))
      };

      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: JSON.stringify(payload)
        });
        // Al usar no-cors, no podemos leer el response.ok, pero sabemos que se envió
      } catch (err) {
        console.error("Error al enviar al webhook de n8n:", err);
        alert("Atención: La campaña se guardó en la base de datos, pero hubo un error al enviarla a n8n. Revisa que el webhook esté activo.");
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

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800; // Reducimos tamaño máximo para no saturar n8n ni WhatsApp
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Comprimir a JPEG con calidad 70% (reduce el peso dramáticamente)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImgUrl(compressedDataUrl);
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  // === LÓGICA DE DISTRIBUCIÓN DE AUDIENCIAS ===
  const totalOptIn = customers.filter(c => c.whatsapp_opt_in !== false).length;
  
  const getSegmentCount = (seg: string) => {
    return customers.filter(c => {
      if (c.whatsapp_opt_in === false) return false;
      if (seg === 'Todos') return true;
      if (seg === 'VIP') return c.status === 'VIP';
      if (seg === 'Nuevo') return c.status === 'Nuevo' || c.status === 'Contactó';
      if (seg === 'Frecuente') return c.total_orders >= 5 || c.status === 'Cliente Frecuente';
      if (seg === 'Interesado') return c.status === 'Interesado';
      if (seg === 'Inactivo') {
        if (!c.last_order_date) return false;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(c.last_order_date) < thirtyDaysAgo;
      }
      return false;
    }).length;
  };

  const audienceSegments = [
    { id: 'VIP', label: 'Clientes VIP', icon: 'diamond', color: 'var(--tertiary)', count: getSegmentCount('VIP') },
    { id: 'Frecuente', label: 'Frecuentes', icon: 'workspace_premium', color: 'var(--primary)', count: getSegmentCount('Frecuente') },
    { id: 'Interesado', label: 'Interesados', icon: 'local_fire_department', color: '#38bdf8', count: getSegmentCount('Interesado') },
    { id: 'Nuevo', label: 'Nuevos', icon: 'fiber_new', color: 'var(--emerald-400)', count: getSegmentCount('Nuevo') },
    { id: 'Inactivo', label: 'Inactivos', icon: 'snooze', color: 'var(--error)', count: getSegmentCount('Inactivo') },
    { id: 'Todos', label: 'Base Completa', icon: 'public', color: 'var(--on-surface)', count: getSegmentCount('Todos') },
  ];

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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 4fr)', gap: '2rem', alignItems: 'start' }}>
        
        {/* Lado Izquierdo: Formulario de Creación */}
        <div className="card" style={{ padding: '2rem', background: 'linear-gradient(145deg, var(--surface-bright), var(--surface-container-low))' }}>
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
                  <option value="Interesado">Interesados (Prospectos Calientes)</option>
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
                <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Imagen Promocional (Opcional)</label>
                <div style={{ position: 'relative', border: '2px dashed var(--outline-variant)', borderRadius: '12px', padding: imgUrl ? '0' : '1rem', textAlign: 'center', backgroundColor: 'var(--surface-container-low)', cursor: imgUrl ? 'default' : 'pointer', transition: 'all 0.2s ease', overflow: 'hidden' }} 
                     onClick={() => !imgUrl && document.getElementById('promo-image-upload')?.click()}
                     onDragOver={(e) => { e.preventDefault(); if(!imgUrl) e.currentTarget.style.borderColor = 'var(--primary)'; }}
                     onDragLeave={(e) => { e.preventDefault(); if(!imgUrl) e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
                     onDrop={(e) => { 
                       e.preventDefault(); 
                       e.currentTarget.style.borderColor = 'var(--outline-variant)';
                       if (!imgUrl && e.dataTransfer.files && e.dataTransfer.files[0]) handleImageUpload(e.dataTransfer.files[0]); 
                     }}>
                  
                  {imgUrl ? (
                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--surface-container-lowest)' }}>
                       <img src={imgUrl} alt="Preview" style={{ maxHeight: '140px', objectFit: 'contain', width: '100%', display: 'block' }} />
                       <button 
                         type="button"
                         onClick={(e) => { e.stopPropagation(); setImgUrl(''); }}
                         style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                       >
                         <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>close</span>
                       </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--secondary)' }}>cloud_upload</span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--on-surface)', margin: 0, fontWeight: 500 }}>Sube una foto desde tu PC o Teléfono</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', margin: 0 }}>JPG, PNG, GIF</p>
                    </div>
                  )}
                  <input 
                    id="promo-image-upload" 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageUpload(e.target.files[0]);
                        e.target.value = ''; // Reset input to allow uploading the same file again if removed
                      }
                    }} 
                  />
                </div>
              </div>

             <div className="flex justify-end gap-3" style={{ borderTop: 'var(--table-border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
               <button type="submit" disabled={isDeploying} className="btn-primary" style={{ padding: '0.85rem 2rem', boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                 <span className="material-symbols-outlined">{isDeploying ? 'sync' : 'rocket_launch'}</span> 
                 {isDeploying ? 'Disparando Mensajes a la Nube...' : `Desplegar a ${audienceCount} Usuarios`}
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

          {/* Dashboard de Distribución de Audiencias */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(145deg, var(--surface-bright), var(--surface-container-low))' }}>
            <div style={{ borderBottom: '1px solid var(--surface-container-highest)', marginBottom: '1.2rem', display: 'flex', gap: '1.5rem' }}>
              <button 
                onClick={(e) => { e.preventDefault(); setRightTab('audiencia'); }}
                style={{ 
                  padding: '0.5rem 0', 
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: rightTab === 'audiencia' ? '2px solid var(--primary)' : '2px solid transparent',
                  color: rightTab === 'audiencia' ? 'var(--primary)' : 'var(--secondary)',
                  fontWeight: rightTab === 'audiencia' ? 700 : 500,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>pie_chart</span>
                Audiencia
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); setRightTab('grupos'); }}
                style={{ 
                  padding: '0.5rem 0', 
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: rightTab === 'grupos' ? '2px solid var(--primary)' : '2px solid transparent',
                  color: rightTab === 'grupos' ? 'var(--primary)' : 'var(--secondary)',
                  fontWeight: rightTab === 'grupos' ? 700 : 500,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>groups</span>
                Grupos
              </button>
            </div>
            
            {rightTab === 'audiencia' ? (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                  Selecciona un segmento abajo para autocompletar la campaña y apuntar a los clientes correctos.
                </p>
                
                <div className="flex flex-col gap-3">
                  {audienceSegments.map(seg => {
                    const percentage = totalOptIn > 0 ? Math.round((seg.count / totalOptIn) * 100) : 0;
                    const isSelected = audience === seg.id;
                    
                    return (
                      <button 
                        key={seg.id}
                        onClick={(e) => {
                          e.preventDefault();
                          setAudience(seg.id);
                        }}
                        style={{ 
                          padding: '1rem', 
                          backgroundColor: isSelected ? 'var(--surface-container-high)' : 'var(--surface-container-low)', 
                          borderRadius: '0.5rem', 
                          border: isSelected ? `2px solid ${seg.color}` : '2px solid transparent',
                          borderLeft: !isSelected ? `4px solid ${seg.color}` : `2px solid ${seg.color}`,
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? `0 4px 12px ${seg.color}20` : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-container)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-container-low)';
                        }}
                      >
                        <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ color: seg.color, fontSize: '1.2rem' }}>{seg.icon}</span>
                            <p style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: '0.9rem', margin: 0 }}>{seg.label}</p>
                          </div>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--on-surface)' }}>{seg.count}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--surface-container-highest)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: seg.color, borderRadius: '3px' }}></div>
                        </div>
                        <p style={{ fontSize: '0.65rem', color: 'var(--secondary)', marginTop: '0.4rem', textAlign: 'right', margin: 0 }}>
                          {percentage}% del total
                        </p>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--surface-container-low)', borderRadius: '0.5rem', border: '1px dashed var(--surface-container-highest)', marginTop: '1rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--secondary)', marginBottom: '1rem' }}>group_add</span>
                <p style={{ fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Grupos de WhatsApp</p>
                <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>Pronto podrás enviar mensajes masivos directamente a los Grupos de WhatsApp en los que Robotina sea administradora.</p>
              </div>
            )}
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
