import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function Kitchen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  
  // Referencia para la alerta de sonido
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inicializar el sonido de "Campana de Servicio"
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/dinner_bell_triangle.ogg');
  }, []);

  // Actualizar el reloj interno cada 30 segundos para calcular el SLA
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchKitchenOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['Pendiente', 'Preparando'])
      .order('created_at', { ascending: true }); // FIFO

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKitchenOrders();

    const channel = supabase
      .channel('kitchen-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        // Reproducir sonido cuando entra un NUEVO pedido
        if (audioRef.current) {
           audioRef.current.play().catch(e => console.log('El navegador bloqueó el autoplay del sonido.', e));
        }
        fetchKitchenOrders();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, fetchKitchenOrders)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, fetchKitchenOrders)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handlePrint = (orderId: string) => {
    alert(`ENVIANDO A IMPRESORA TÉRMICA DE COCINA\n--------------------------\nTicket: #${orderId}\n\n[x] Imprimiendo...`);
  };

  const handleDone = async (orderId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pendiente' ? 'Preparando' : 'Listo';
    await supabase.from('orders').update({ status: newStatus }).eq('order_code', orderId);
  };

  if (loading) return <div className="p-8"><h2 style={{ color: 'var(--on-surface)' }}>Cargando Terminal KDS...</h2></div>;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#121212', minHeight: 'calc(100vh - 60px)', color: '#fff' }}>
      
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem', borderBottom: '2px solid #333', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px' }}>TERMINAL DE COCINA</h1>
          <p style={{ fontSize: '1.2rem', color: '#888', margin: 0 }}>Cola de preparación en vivo (FIFO)</p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
             onClick={() => { if(audioRef.current) audioRef.current.play(); }} 
             style={{ backgroundColor: 'transparent', border: '1px solid #444', color: '#888', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
             <span className="material-symbols-outlined">volume_up</span> Probar Sonido
          </button>
          <div style={{ backgroundColor: '#FF5A1F', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', fontWeight: 800, fontSize: '1.5rem', color: '#fff' }}>
            {orders.length} TICKETS
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {orders.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '5rem', textAlign: 'center', backgroundColor: '#1A1A1A', borderRadius: '1rem', border: '1px dashed #333' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '5rem', color: '#444' }}>outdoor_grill</span>
            <h2 style={{ color: '#666', marginTop: '1rem', fontSize: '2rem' }}>Cocina Limpia. No hay pedidos.</h2>
          </div>
        ) : (
          orders.map((order) => {
            // Cálculo de SLA (Tiempo de espera)
            const orderDate = new Date(order.created_at);
            const diffMinutes = Math.floor((now.getTime() - orderDate.getTime()) / 60000);
            const isDelayed = diffMinutes >= 15; // SLA: 15 minutos máximo
            const itemsList = order.items_json || [];

            return (
               <div key={order.order_code} style={{ 
                  backgroundColor: order.status === 'Pendiente' ? '#1E1E1E' : '#1A2E1A', 
                  border: isDelayed ? '2px solid #ef4444' : (order.status === 'Pendiente' ? '2px solid #444' : '2px solid #4ade80'), 
                  borderRadius: '1rem', 
                  padding: '1.5rem', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: isDelayed ? '0 0 20px rgba(239, 68, 68, 0.2)' : 'none'
               }}>
                 
                 {/* Alerta de Retraso SLA */}
                 {isDelayed && (
                    <div style={{ position: 'absolute', top: '-12px', right: '1rem', backgroundColor: '#ef4444', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', animation: 'pulse 2s infinite' }}>
                       RETRASADO ({diffMinutes} min)
                    </div>
                 )}

                 <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
                   <div>
                     <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: 0 }}>{order.order_code}</h2>
                     <span style={{ fontSize: '0.8rem', fontWeight: 800, color: order.status === 'Pendiente' ? '#FFB800' : '#4ade80', textTransform: 'uppercase', padding: '4px 8px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '4px', display: 'inline-block', marginTop: '0.5rem' }}>
                       {order.status === 'Pendiente' ? 'POR PREPARAR' : 'PREPARANDO...'}
                     </span>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ccc' }}>
                       {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </div>
                     <div style={{ fontSize: '0.8rem', color: isDelayed ? '#ef4444' : '#888', fontWeight: 700, marginTop: '4px' }}>
                        Hace {diffMinutes} min
                     </div>
                   </div>
                 </div>

                 {/* TICKET FÍSICO SIMULADO */}
                 <div style={{ backgroundColor: '#fff', color: '#000', padding: '1rem', borderRadius: '0.5rem', fontFamily: '"Courier New", Courier, monospace', fontSize: '1rem', marginBottom: '1.5rem', flex: 1, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' }}>
                   <div style={{ textAlign: 'center', fontWeight: 800, borderBottom: '2px dashed #ccc', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                     ORDEN DE MESA
                   </div>
                   
                   <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                     {itemsList.length > 0 ? (
                        itemsList.map((item: any, idx: number) => (
                           <li key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, borderBottom: '1px solid #f0f0f0', paddingBottom: '0.25rem' }}>
                              <span style={{ width: '25px', fontWeight: 900 }}>{item.qty}x</span>
                              <span style={{ flex: 1 }}>{item.name}</span>
                           </li>
                        ))
                     ) : (
                        <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
                           <span>{order.items_count}x Artículos varios (Sin detalle JSON)</span>
                        </li>
                     )}
                   </ul>
                   <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '1rem', fontWeight: 700 }}>
                      * Preparar ASAP
                   </div>
                 </div>

                 <div className="flex gap-3">
                   <button 
                     onClick={() => handlePrint(order.order_code)}
                     style={{ flex: 1, padding: '0.75rem', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
                   >
                     <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>print</span> IMPRIMIR
                   </button>
                   <button 
                     onClick={() => handleDone(order.order_code, order.status)}
                     style={{ flex: 1, padding: '0.75rem', backgroundColor: order.status === 'Pendiente' ? 'var(--primary)' : '#4ade80', color: order.status === 'Pendiente' ? '#fff' : '#000', border: 'none', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', transition: 'all 0.2s' }}
                   >
                     <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{order.status === 'Pendiente' ? 'skillet' : 'check_circle'}</span> 
                     {order.status === 'Pendiente' ? 'EMPEZAR' : 'LISTO'}
                   </button>
                 </div>
               </div>
            )
          })
        )}
      </div>
    </div>
  );
}
