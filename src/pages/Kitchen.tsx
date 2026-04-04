import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Kitchen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKitchenOrders() {
      // Solo cargamos pedidos que la cocina necesita ver: Pendientes y Preparando
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['Pendiente', 'Preparando'])
        .order('created_at', { ascending: true }); // Los mas viejos primero (FIFO)

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    }

    fetchKitchenOrders();

    // Actualización en tiempo real
    const channel = supabase
      .channel('kitchen-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchKitchenOrders)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePrint = (orderId: string) => {
    // Simulación de envío a impresora térmica
    alert(`ENVIANDO A IMPRESORA TÉRMICA DE COCINA\n--------------------------\nTicket: #${orderId}\n\n[x] Imprimiendo...`);
  };

  const handleDone = async (orderId: string, currentStatus: string) => {
    // Si está pendiente, pasa a preparando. Si está preparando, pasa a listo.
    const newStatus = currentStatus === 'Pendiente' ? 'Preparando' : 'Listo';
    await supabase.from('orders').update({ status: newStatus }).eq('order_code', orderId);
  };

  if (loading) {
    return <div className="p-8"><h2 style={{ color: 'var(--on-surface)' }}>Cargando Terminal...</h2></div>;
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#1E1E1E', minHeight: 'calc(100vh - 60px)', color: '#fff' }}>
      
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem', borderBottom: '2px solid #333', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-1px' }}>KDS - TERMINAL DE COCINA</h1>
          <p style={{ fontSize: '1.2rem', color: '#888', margin: 0 }}>Pedidos en cola (FIFO)</p>
        </div>
        <div className="flex gap-4">
          <div style={{ backgroundColor: '#FF5A1F', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontWeight: 800, fontSize: '1.5rem', color: '#fff' }}>
            {orders.length} PENDIENTES
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {orders.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '5rem', textAlign: 'center', backgroundColor: '#252525', borderRadius: '1rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '5rem', color: '#444' }}>outdoor_grill</span>
            <h2 style={{ color: '#666', marginTop: '1rem', fontSize: '2rem' }}>Cocina Limpia. No hay tickets.</h2>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.order_code} style={{ backgroundColor: order.status === 'Pendiente' ? '#2A2A2A' : '#1A2E1A', border: order.status === 'Pendiente' ? '2px solid #555' : '2px solid #4ade80', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              
              <div className="flex justify-between items-start" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: 0 }}>#{order.order_code}</h2>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: order.status === 'Pendiente' ? '#FFB800' : '#4ade80', textTransform: 'uppercase', padding: '4px 8px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '4px', display: 'inline-block', marginTop: '0.5rem' }}>
                    {order.status === 'Pendiente' ? 'POR PREPARAR' : 'PREPARANDO'}
                  </span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#aaa' }}>
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Simulación del Ticket. Como no tenemos tabla de ítems, simularemos algo genérico basado en items_count */}
              <div style={{ backgroundColor: '#fff', color: '#000', padding: '1.5rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '1.2rem', marginBottom: '2rem', flex: 1, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', fontWeight: 700, borderBottom: '2px dashed #ccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  ORDEN MESA / LLEVAR
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>{order.items_count}x Artículos del Bot</span>
                  </li>
                  {/* Mock logic para dar la sensación física de ticket */}
                  <li style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>- Preparar según indicaciones extra</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handlePrint(order.order_code)}
                  style={{ flex: 1, padding: '1rem', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '0.5rem', fontSize: '1.2rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>print</span> IMPRIMIR
                </button>
                <button 
                  onClick={() => handleDone(order.order_code, order.status)}
                  style={{ flex: 1, padding: '1rem', backgroundColor: order.status === 'Pendiente' ? 'var(--primary)' : '#4ade80', color: order.status === 'Pendiente' ? '#fff' : '#000', border: 'none', borderRadius: '0.5rem', fontSize: '1.2rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>{order.status === 'Pendiente' ? 'skillet' : 'check_circle'}</span> 
                  {order.status === 'Pendiente' ? 'EMPEZAR' : 'LISTO'}
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
