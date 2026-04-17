import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const fetchOrders = async () => {
    // Supabase Join: orders.* y trae el name y phone de la tabla referenciada customers
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers (name, phone)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else if (data) {
      const mapped = data.map((o: any) => ({
        id: o.order_code,
        customer: o.customer?.name || 'Cliente Desconocido',
        phone: o.customer?.phone || '+0 000 0000',
        items: o.items_count,
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

    // Suscripción en tiempo real (Realtime Channel)
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, _payload => {
        fetchOrders();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, _payload => {
        fetchOrders(); // Escuchar si alguien lo actualiza desde otro dispositivo
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSimulateOrder = async () => {
    try {
      const { data: custData, error: custError } = await supabase.from('customers').select('id').limit(1);
      if (custError) {
        alert("Error consultando cliente: " + custError.message);
        return;
      }
      const customerId = custData?.[0]?.id;
      if (!customerId) {
        alert("Necesitas tener al menos un cliente en Supabase para crear un pedido");
        return;
      }

      const randomCode = '#' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const randomItems = Math.floor(Math.random() * 4) + 1;
      const randomTotal = (Math.random() * 40 + 10).toFixed(2);

      const { error: insertError } = await supabase.from('orders').insert({
        order_code: randomCode,
        customer_id: customerId,
        items_count: randomItems,
        total_amount: randomTotal,
        status: 'Pendiente'
      });

      if (insertError) {
        alert("Error insertando pedido: " + insertError.message);
      } else {
        await fetchOrders();
      }
    } catch (err: any) {
      alert("Error crítico: " + err.message);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('order_code', orderToDelete);

    if (error) {
      alert("Error eliminando pedido: " + error.message);
    } else {
      setOrderToDelete(null);
      await fetchOrders();
    }
  };

  const handleStatusChange = async (orderCode: string, currentStatus: string) => {
    let newStatus = '';
    if (currentStatus === 'Pendiente') newStatus = 'Preparando';
    else if (currentStatus === 'Preparando') newStatus = 'Listo';
    else if (currentStatus === 'Listo') newStatus = 'Despachado';
    else return; // "Despachado" is final

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('order_code', orderCode);

    if (error) {
      alert("Error actualizando pedido: " + error.message);
    } else {
      await fetchOrders(); // Reload the UI to reflect new status
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <p className="body-md" style={{ color: 'var(--secondary)' }}>Sincronizando feed de pedidos...</p>
      </div>
    );
  }

  // Cálculos dinámicos de las métricas arriba
  const activosCount = orders.filter(o => o.status === 'Pendiente' || o.status === 'Preparando').length;
  const preparandoCount = orders.filter(o => o.status === 'Preparando').length;
  const listosCount = orders.filter(o => o.status === 'Listo').length;
  const totalIngresos = orders.reduce((sum, o) => sum + (o.totalNum || 0), 0);

  return (
    <div className="p-8">
      <div className="page-header">
        <div>
          <h2 className="display-md">Logística de Pedidos</h2>
          <p className="body-md" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
            Gestión en vivo de ciclos de pedidos automatizados por WhatsApp.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="btn-secondary">Exportar Reporte</button>
          <button onClick={handleSimulateOrder} className="btn-primary" style={{ boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined">smart_toy</span>
            Simular Pedido de Bot
          </button>
        </div>
      </div>

      <div className="metrics-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          { label: 'Activos Ahora', value: activosCount.toString().padStart(2, '0'), desc: 'En curso', special: '', border: true },
          { label: 'Preparando', value: preparandoCount.toString().padStart(2, '0'), desc: 'En cocina' },
          { label: 'Listos para Recoger', value: listosCount.toString().padStart(2, '0'), desc: 'Esperando despacho o retiro', highlight: true },
          { label: "Ingresos (Todo)", value: `$${totalIngresos.toFixed(2)}`, desc: 'Ventas totales registradas' },
        ].map(m => (
          <div key={m.label} className="card" style={m.border ? { borderLeft: '2px solid var(--primary)' } : {}}>
            <p className="label-sm">{m.label}</p>
            <h3 className="display-md" style={{ color: m.highlight ? 'var(--tertiary)' : 'var(--on-surface)', marginTop: '0.5rem', marginBottom: '0.25rem', fontSize: '1.5rem' }}>{m.value}</h3>
            <p className="body-md" style={{ color: m.border ? 'var(--primary)' : 'var(--secondary)', fontSize: '0.75rem' }}>{m.desc}</p>
          </div>
        ))}
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Artículos</th>
              <th>Monto</th>
              <th>Hora Asignada</th>
              <th>Estado Logístico</th>
              <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Flujo de Acción</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--secondary)' }}>
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '3rem', opacity: 0.5 }}>receipt_long</span>
                    <p>Esperando la entrada de nuevos pedidos vía WhatsApp...</p>
                  </div>
                </td>
              </tr>
            )}
            {orders.map((order, i) => (
              <tr key={order.id} style={i === 0 ? { backgroundColor: 'var(--surface-container-high)' } : {}}>
                <td>
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2">
                      {i === 0 && order.status === 'Pendiente' && <div className="pulse-dot"></div>}
                      <span style={{ fontWeight: 700 }}>{order.id}</span>
                    </div>
                    <button 
                      onClick={() => setOrderToDelete(order.id)}
                      className="btn-secondary" 
                      title="Anular / Eliminar Pedido"
                      style={{ 
                        color: 'var(--error-dim)', 
                        padding: '0.2rem 0.4rem', 
                        backgroundColor: 'transparent', 
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '0.8rem' }}>delete</span>
                      Anular
                    </button>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span style={{ fontWeight: 600 }}>{order.customer}</span>
                    <span className="label-sm" style={{ fontSize: '0.625rem', letterSpacing: '0', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>chat</span> {order.phone}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="order-items-stack" style={{ alignItems: 'center' }}>
                    <img src={`https://ui-avatars.com/api/?name=${order.items}&background= random&color=fff&rounded=true&size=50`} alt="item" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, marginLeft: '0.5rem', color: 'var(--secondary)' }}>x{order.items} uni.</span>
                  </div>
                </td>
                <td style={{ fontWeight: 500, color: 'var(--primary)' }}>{order.total}</td>
                <td style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>{order.time}</td>
                <td>
                  <span className={`status-badge ${order.statusClass}`}>{order.status}</span>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div className="flex gap-2 justify-end" style={{ alignItems: 'center' }}>
                    <button 
                      onClick={() => alert(`Enviando ticket de la orden ${order.id} a la impresora térmica...`)}
                      className="icon-btn" 
                      title="Imprimir Ticket"
                      style={{ padding: '0.4rem', backgroundColor: 'var(--surface-container-high)', borderRadius: '8px' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>print</span>
                    </button>
                    {order.status !== 'Despachado' ? (
                      <button 
                        onClick={() => handleStatusChange(order.id, order.status)}
                        className="btn-secondary" 
                        style={{ 
                          padding: '0.4rem 1rem', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700,
                          backgroundColor: order.status === 'Pendiente' ? 'var(--primary-container)' : 'var(--surface-container-highest)',
                          color: order.status === 'Pendiente' ? 'var(--on-primary-container)' : 'var(--on-surface)'
                        }}
                      >
                        {order.status === 'Pendiente' ? 'Aceptar Pedido' : (order.status === 'Preparando' ? 'Marcar Listo' : 'Despachar (Fin)')}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check_circle</span> Completado
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--surface-container-low)', borderTop: '1px solid rgba(64, 73, 82, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="label-sm" style={{ letterSpacing: '0' }}>Mostrando {orders.length} pedidos históricos</span>
          <div className="flex gap-2">
            <button className="icon-btn" disabled style={{ opacity: 0.5 }}><span className="material-symbols-outlined">chevron_left</span></button>
            <button className="icon-btn"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Modal Confirmar Eliminación */}
      {orderToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px', padding: '2rem', textAlign: 'center', border: '1px solid var(--error-dim)', backgroundColor: 'var(--surface-bright)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', color: 'var(--error)', marginBottom: '1rem' }}>warning</span>
            <h3 className="display-md" style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>¿Anular Pedido {orderToDelete}?</h3>
            <p className="body-md" style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>
              Esta acción eliminará el pedido de la base de datos permanentemente. ¿Deseas continuar?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setOrderToDelete(null)} className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>Atrás</button>
              <button onClick={confirmDeleteOrder} className="btn-primary" style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--error)', color: '#fff', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}>Sí, Anular</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
