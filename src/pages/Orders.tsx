import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('Todos');

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers (name, phone_number)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else if (data) {
      const mapped = data.map((o: any) => ({
        id: o.order_code,
        customer: o.customer?.name || 'Cliente WhatsApp',
        phone: o.customer?.phone_number || '+0 000 0000',
        items: o.items_count,
        itemsDetails: o.items_json || [],
        totalNum: Number(o.total_amount),
        total: `$${Number(o.total_amount).toFixed(2)}`,
        time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: o.status,
        statusClass: o.status === 'Pendiente' ? 'status-pending' : (o.status === 'Preparando' ? 'status-preparing' : (o.status === 'Listo' ? 'status-ready' : 'status-delivered'))
      }));
      setOrders(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, _payload => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSimulateOrder = async () => {
    try {
      const { data: custData } = await supabase.from('customers').select('id').limit(1);
      const customerId = custData?.[0]?.id;
      if (!customerId) return alert("Necesitas un cliente en Supabase.");

      const randomCode = '#' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      // Simulación de detalle real de productos
      const mockMenu = ['Hamburguesa Robotina', 'Pizza Cyber-Pepperoni', 'Papas Megabyte', 'Limonada Galáctica'];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const fakeItems = [];
      for(let i=0; i<numItems; i++) {
         fakeItems.push({ 
            name: mockMenu[Math.floor(Math.random() * mockMenu.length)], 
            qty: Math.floor(Math.random() * 2) + 1 
         });
      }

      await supabase.from('orders').insert({
        order_code: randomCode,
        customer_id: customerId,
        items_count: fakeItems.reduce((acc, curr) => acc + curr.qty, 0),
        items_json: fakeItems,
        total_amount: (Math.random() * 40 + 10).toFixed(2),
        status: 'Pendiente'
      });
    } catch (err: any) {
      alert("Error crítico: " + err.message);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    await supabase.from('orders').delete().eq('order_code', orderToDelete);
    setOrderToDelete(null);
  };

  const handleStatusChange = async (orderCode: string, currentStatus: string) => {
    let newStatus = '';
    if (currentStatus === 'Pendiente') newStatus = 'Preparando';
    else if (currentStatus === 'Preparando') newStatus = 'Listo';
    else if (currentStatus === 'Listo') newStatus = 'Despachado';
    else return;

    await supabase.from('orders').update({ status: newStatus }).eq('order_code', orderCode);
  };

  if (loading) return <div className="p-8"><p className="body-md">Sincronizando operaciones...</p></div>;

  const activosCount = orders.filter(o => o.status === 'Pendiente' || o.status === 'Preparando').length;
  const listosCount = orders.filter(o => o.status === 'Listo').length;
  const totalIngresos = orders.reduce((sum, o) => sum + (o.totalNum || 0), 0);

  const filteredOrders = orders.filter(o => activeFilter === 'Todos' || o.status === activeFilter);

  return (
    <div className="p-8">
      <div className="page-header">
        <div>
          <h2 className="display-sm" style={{ fontWeight: 800 }}>Monitor de Operaciones</h2>
          <p className="body-md" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
            Control de flujo logístico y despachos.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSimulateOrder} className="btn-primary" style={{ boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined">smart_toy</span> Pedido de Prueba IA
          </button>
        </div>
      </div>

      <div className="metrics-grid mb-8">
        <div className="card" style={{ borderLeft: '2px solid var(--primary)' }}>
          <p className="label-sm">Tareas Activas</p>
          <h3 className="display-md" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{activosCount.toString().padStart(2, '0')}</h3>
          <p className="body-md" style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>En cocina</p>
        </div>
        <div className="card">
          <p className="label-sm">Finalizadas</p>
          <h3 className="display-md" style={{ color: 'var(--tertiary)', fontSize: '1.5rem', marginTop: '0.5rem' }}>{listosCount.toString().padStart(2, '0')}</h3>
          <p className="body-md" style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>Pendientes de entrega</p>
        </div>
        <div className="card">
          <p className="label-sm">Volumen Transaccional</p>
          <h3 className="display-md" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>${totalIngresos.toFixed(2)}</h3>
          <p className="body-md" style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>Facturación del día</p>
        </div>
      </div>

      <div className="orders-table-wrapper">
        {/* Pestañas de Filtro Rápido */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-container-highest)', backgroundColor: 'var(--surface-container-low)', display: 'flex', gap: '0.5rem' }}>
           {['Todos', 'Pendiente', 'Preparando', 'Listo', 'Despachado'].map(f => (
              <button 
                 key={f} 
                 onClick={() => setActiveFilter(f)}
                 style={{ 
                    padding: '0.4rem 1rem', borderRadius: '2rem', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: activeFilter === f ? 'var(--primary)' : 'transparent',
                    color: activeFilter === f ? '#fff' : 'var(--secondary)'
                 }}
              >
                 {f}
              </button>
           ))}
        </div>

        <table className="orders-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Detalle (Artículos)</th>
              <th>Monto</th>
              <th>Hora Asignada</th>
              <th>Estado Logístico</th>
              <th style={{ textAlign: 'right' }}>Flujo de Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--secondary)' }}>
                  No hay pedidos en esta categoría.
                </td>
              </tr>
            )}
            {filteredOrders.map((order, i) => (
              <tr key={order.id} style={order.status === 'Pendiente' ? { backgroundColor: 'var(--surface-container-high)' } : {}}>
                <td>
                  <div className="flex flex-col items-start gap-2">
                     <span style={{ fontWeight: 800 }}>{order.id}</span>
                     <button onClick={() => setOrderToDelete(order.id)} style={{ color: 'var(--error-dim)', backgroundColor: 'transparent', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', padding: '2px 4px', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer' }}>Anular</button>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span style={{ fontWeight: 600 }}>{order.customer}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--secondary)' }}>{order.phone}</span>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                     {order.itemsDetails && order.itemsDetails.length > 0 ? (
                        order.itemsDetails.map((item: any, idx: number) => (
                           <span key={idx} style={{ fontSize: '0.75rem', fontWeight: 500 }}>• {item.qty}x {item.name}</span>
                        ))
                     ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{order.items} uni. (Sin detalle)</span>
                     )}
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{order.total}</td>
                <td style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>{order.time}</td>
                <td><span className={`status-badge ${order.statusClass}`}>{order.status}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex gap-2 justify-end items-center">
                    {order.status !== 'Despachado' ? (
                      <button onClick={() => handleStatusChange(order.id, order.status)} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, backgroundColor: order.status === 'Pendiente' ? 'var(--primary-container)' : 'var(--surface-container-highest)', color: order.status === 'Pendiente' ? 'var(--on-primary-container)' : 'var(--on-surface)' }}>
                        {order.status === 'Pendiente' ? 'Validar Op.' : (order.status === 'Preparando' ? 'Marcar Listo' : 'Archivar')}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-400)' }}>Completado</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
