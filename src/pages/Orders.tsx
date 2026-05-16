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
        id: o.order_code || o.id.slice(0, 8).toUpperCase(), // Usar parte del UUID si no hay código
        customer: o.customer_name || o.customer?.name || 'Cliente WhatsApp',
        phone: o.phone || o.customer?.phone_number || '+0 000 0000',
        items: o.items_count || (o.items ? o.items.length : 0),
        itemsDetails: o.items || o.items_json || [],
        totalNum: Number(o.total || o.total_amount || 0),
        total: `$${Number(o.total || o.total_amount || 0).toFixed(2)}`,
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

  const [isDarkMode, setIsDarkMode] = useState(!document.documentElement.classList.contains('light-mode'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.classList.contains('light-mode');
      setIsDarkMode(!isLight);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (loading) return (
    <div className="p-8" style={{ backgroundColor: 'var(--surface-container-low)', minHeight: '100vh', color: 'var(--on-surface)' }}>
      <p className="body-md">Sincronizando operaciones...</p>
    </div>
  );

  const activosCount = orders.filter(o => o.status === 'Pendiente' || o.status === 'Preparando').length;
  const listosCount = orders.filter(o => o.status === 'Listo').length;
  const totalIngresos = orders.reduce((sum, o) => sum + (o.totalNum || 0), 0);

  const filteredOrders = orders.filter(o => activeFilter === 'Todos' || o.status === activeFilter);

  return (
    <div className="p-8" style={{ 
      backgroundColor: 'var(--surface-container-low)', 
      minHeight: '100vh', 
      color: 'var(--on-surface)',
      transition: 'all 0.3s ease'
    }}>
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="display-sm" style={{ fontWeight: 900, letterSpacing: '-1px', color: 'var(--primary)' }}>Gestión de Ventas y Servicios</h2>
          <p className="body-md" style={{ opacity: 0.7, marginTop: '0.25rem', color: 'var(--secondary)' }}>
            Control logístico y comercial de alta precisión • <span style={{ color: 'var(--tertiary)', fontWeight: 600 }}>En Vivo</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSimulateOrder} className="btn-primary" style={{ backgroundColor: '#C9A84C', border: 'none', color: '#1A1A2E', fontWeight: 800, padding: '0.75rem 1.5rem', borderRadius: '12px', boxShadow: '0 0 20px rgba(201, 168, 76, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>smart_toy</span> Simular Acción IA
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--surface-container)', border: '1px solid var(--surface-container-highest)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Tareas Activas</p>
          <h3 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: 'var(--on-surface)' }}>{activosCount.toString().padStart(2, '0')}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--tertiary)', fontSize: '0.8rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span> Operación fluida
          </div>
        </div>
        <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--surface-container)', border: '1px solid var(--surface-container-highest)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Volumen Diario</p>
          <h3 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: 'var(--on-surface)' }}>${totalIngresos.toFixed(2)}</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Ingresos proyectados hoy</p>
        </div>
        <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--surface-container)', border: '1px solid var(--surface-container-highest)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Eficiencia Bot</p>
          <h3 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: 'var(--on-surface)' }}>98.4%</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Precisión en toma de pedidos</p>
        </div>
      </div>

      {/* Filtros Estilo Apple */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {['Todos', 'Pendiente', 'Preparando', 'Listo', 'Despachado'].map(f => (
          <button 
            key={f} 
            onClick={() => setActiveFilter(f)}
            style={{ 
              padding: '0.6rem 1.5rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
              backgroundColor: activeFilter === f ? '#C9A84C' : 'rgba(255,255,255,0.05)',
              color: activeFilter === f ? '#1A1A2E' : '#fff',
              boxShadow: activeFilter === f ? '0 10px 20px rgba(201, 168, 76, 0.2)' : 'none'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid de Pedidos Estilo Tarjetas Premium */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filteredOrders.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', opacity: 0.5 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>inventory_2</span>
            <p style={{ marginTop: '1rem' }}>No hay pedidos activos en esta categoría</p>
          </div>
        ) : filteredOrders.map((order) => {
          const isPending = order.status === 'Pendiente';
          const isReady = order.status === 'Listo';
          
          return (
            <div 
              key={order.id} 
              className="chat-bubble-anim"
              style={{ 
                background: 'var(--surface-container-high)', 
                borderRadius: '20px', 
                border: '1px solid var(--surface-container-highest)', 
                overflow: 'hidden',
                boxShadow: isPending ? '0 0 30px rgba(var(--primary-rgb), 0.15)' : 'var(--shadow-md)',
                position: 'relative'
              }}
            >
              {/* Header de la tarjeta */}
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--surface-container-highest)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{order.id}</h4>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--secondary)' }}>{order.time} • WhatsApp</p>
                </div>
                <div style={{ 
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px',
                  backgroundColor: isPending ? 'var(--primary-container)' : (isReady ? 'var(--tertiary-container)' : 'var(--surface-container-highest)'),
                  color: isPending ? 'var(--on-primary-container)' : (isReady ? 'var(--on-tertiary-container)' : 'var(--on-surface)'),
                  border: '1px solid var(--surface-container-highest)',
                  boxShadow: isPending ? '0 0 10px rgba(var(--primary-rgb), 0.3)' : 'none'
                }}>
                  {order.status.toUpperCase()}
                </div>
              </div>

              {/* Contenido: Cliente e Items */}
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>person</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--on-surface)' }}>{order.customer}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--secondary)' }}>+{order.phone}</p>
                  </div>
                </div>

                <div style={{ background: 'var(--surface-container-low)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--surface-container-highest)' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: '0.75rem' }}>Detalle del Servicio / Venta</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.itemsDetails && order.itemsDetails.length > 0 ? (
                      order.itemsDetails.map((item: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--on-surface)' }}>
                          <span style={{ fontWeight: 500 }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 800, marginRight: '8px' }}>{item.qty}x</span> 
                            {item.name}
                          </span>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', opacity: 0.3 }}>task_alt</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.8rem', opacity: 0.3 }}>Sin detalle del pedido</p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--secondary)' }}>TOTAL A COBRAR</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>{order.total}</span>
                  </div>
                  <button onClick={() => setOrderToDelete(order.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', opacity: 0.6, cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                  </button>
                </div>
              </div>

              {/* Botón de acción principal (Full Width) */}
              {order.status !== 'Despachado' && (
                <button 
                  onClick={() => handleStatusChange(order.id, order.status)}
                  style={{ 
                    width: '100%', padding: '1rem', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.3s',
                    backgroundColor: isPending ? 'var(--primary-container)' : 'var(--surface-container-highest)',
                    color: isPending ? 'var(--on-primary-container)' : 'var(--on-surface)',
                    borderTop: '1px solid var(--surface-container-highest)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isPending ? '#C9A84C' : 'rgba(255,255,255,0.1)'}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isPending ? '#C9A84C' : 'rgba(255,255,255,0.1)';
                    if (isPending) e.currentTarget.style.color = '#1A1A2E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isPending ? 'rgba(201, 168, 76, 0.1)' : 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = isPending ? '#C9A84C' : '#fff';
                  }}
                >
                  {isPending ? 'Empezar Proceso' : (order.status === 'Preparando' ? 'Finalizar Tarea' : 'Archivar Registro')}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
