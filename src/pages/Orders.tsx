import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [botEfficiency, setBotEfficiency] = useState<number>(0);
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [skipDeleteConfirm, setSkipDeleteConfirm] = useState(() => {
    return localStorage.getItem('skipDeleteConfirm') === 'true';
  });

  const fetchBotEfficiency = async () => {
    const { data, error } = await supabase
      .from('whatsapp_chats')
      .select('is_bot_active');
    
    if (!error && data) {
      const total = data.length;
      const active = data.filter(c => c.is_bot_active).length;
      const efficiency = total > 0 ? (active / total) * 100 : 0;
      setBotEfficiency(efficiency);
    }
  };

  const fetchOrders = async () => {
    // 1. Fetch Orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers (name, phone_number)
      `);

    if (ordersError) console.error('Error fetching orders:', ordersError);

    // 2. Fetch Leads (Citas Agendadas)
    const { data: leadsData, error: leadsError } = await supabase
      .from('landing_leads')
      .select('*')
      .not('appointment_date', 'is', null);

    if (leadsError) console.error('Error fetching leads:', leadsError);

    // 3. Fetch Reservations (AI Bookings)
    const { data: resData, error: resError } = await supabase
      .from('reservations')
      .select('*, customer:customers(name, phone_number)');

    if (resError) console.error('Error fetching reservations:', resError);

    const getStatusClass = (status: string) => {
      if (status === 'Pendiente') return 'status-pending';
      if (status === 'Confirmado') return 'status-preparing';
      return 'status-delivered';
    };

    let combined: any[] = [];

    if (ordersData) {
      combined = [...combined, ...ordersData.map((o: any) => ({
        id: o.order_code || o.id.slice(0, 8).toUpperCase(),
        type: 'Pedido',
        customer: o.customer_name || o.customer?.name || 'Cliente WhatsApp',
        phone: o.phone || o.customer?.phone_number || '+0 000 0000',
        email: o.email || '',
        itemsDetails: o.items || o.items_json || [],
        totalNum: Number(o.total || o.total_amount || 0),
        total: `$${Number(o.total || o.total_amount || 0).toFixed(2)}`,
        time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateObj: new Date(o.created_at),
        status: o.status || 'Pendiente',
        statusClass: getStatusClass(o.status || 'Pendiente'),
        isLead: false,
        originalId: o.id,
        segment: '',
        volume: ''
      }))];
    }

    if (leadsData) {
      combined = [...combined, ...leadsData.map((l: any) => ({
        id: `DEMO-${(l.id || '').toString().slice(0, 4).toUpperCase()}`,
        type: 'Cita Agendada',
        customer: l.name || 'Lead Demo',
        phone: l.phone || '+0 000 0000',
        email: l.email || '',
        itemsDetails: [{ name: `Demo: ${l.appointment_date} a las ${l.appointment_time}`, qty: 1 }],
        totalNum: 0,
        total: 'Reunión',
        time: new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateObj: new Date(l.created_at),
        status: l.status || 'Pendiente',
        statusClass: getStatusClass(l.status || 'Pendiente'),
        isLead: true,
        originalId: l.id,
        appointmentDateRaw: l.appointment_date,
        appointmentTimeRaw: l.appointment_time,
        segment: l.segment || '',
        volume: l.volume || ''
      }))];
    }

    if (resData) {
      combined = [...combined, ...resData.map((r: any) => ({
        id: `CITA-${(r.id || '').toString().slice(0, 4).toUpperCase()}`,
        type: 'Cita Agendada (IA)',
        customer: r.customer?.name || 'Cliente WhatsApp',
        phone: r.customer?.phone_number || '+0 000 0000',
        email: '',
        itemsDetails: [{ name: `${r.service_name || 'Servicio'}: ${r.reservation_date} a las ${r.reservation_time}`, qty: 1 }],
        totalNum: 0,
        total: 'Reunión',
        time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateObj: new Date(r.created_at),
        status: r.status || 'Pendiente',
        statusClass: getStatusClass(r.status || 'Pendiente'),
        isLead: true,
        originalId: r.id,
        appointmentDateRaw: null, // we can parse it similarly if needed
        appointmentTimeRaw: r.reservation_time,
        segment: 'IA',
        volume: 'Automático'
      }))];
    }

    // Ordenar por fecha de creación (más recientes primero)
    combined.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

    setOrders(combined);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    fetchBotEfficiency();

    const channelOrders = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, _payload => {
        fetchOrders();
      })
      .subscribe();

    const channelLeads = supabase
      .channel('public:landing_leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'landing_leads' }, _payload => {
        fetchOrders();
      })
      .subscribe();

    const channelRes = supabase
      .channel('public:reservations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, _payload => {
        fetchOrders();
      })
      .subscribe();

    const chatsChannel = supabase
      .channel('orders-chats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_chats' }, _payload => {
        fetchBotEfficiency();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelOrders);
      supabase.removeChannel(channelLeads);
      supabase.removeChannel(channelRes);
      supabase.removeChannel(chatsChannel);
    };
  }, []);



  const handleStatusChange = async (orderCode: string, currentStatus: string, isLead: boolean, originalId: string) => {
    let newStatus = '';
    if (currentStatus === 'Pendiente') newStatus = 'Confirmado';
    else if (currentStatus === 'Confirmado') newStatus = 'Completado';
    else return;

    // Optimistic UI update para que cambie de inmediato
    setOrders(prevOrders => prevOrders.map(o => {
      if (o.id === orderCode) {
        return {
          ...o,
          status: newStatus,
          statusClass: newStatus === 'Pendiente' ? 'status-pending' : (newStatus === 'Confirmado' ? 'status-preparing' : 'status-delivered')
        };
      }
      return o;
    }));

    if (isLead) {
      await supabase.from('landing_leads').update({ status: newStatus }).eq('id', originalId);
    } else {
      await supabase.from('orders').update({ status: newStatus }).eq('order_code', orderCode);
    }
    window.dispatchEvent(new Event('ordersUpdated'));
  };

  const handleReturnToPending = async (orderCode: string, isLead: boolean, originalId: string) => {
    const newStatus = 'Pendiente';
    
    // Optimistic UI update
    setOrders(prevOrders => prevOrders.map(o => {
      if (o.id === orderCode) {
        return {
          ...o,
          status: newStatus,
          statusClass: 'status-pending'
        };
      }
      return o;
    }));

    if (isLead) {
      await supabase.from('landing_leads').update({ status: newStatus }).eq('id', originalId);
    } else {
      await supabase.from('orders').update({ status: newStatus }).eq('order_code', orderCode);
    }
    window.dispatchEvent(new Event('ordersUpdated'));
  };


  const executeDelete = async (order: any) => {
    // Actualización Optimista de la Interfaz (borrar al instante visualmente)
    setOrders(prevOrders => prevOrders.filter(o => o.id !== order.id));
    
    console.log("Intentando eliminar:", order);
    if (order.isLead) {
      const { error } = await supabase.from('landing_leads').delete().eq('id', order.originalId);
      if (error) {
        console.error('Error al borrar lead:', error);
        alert('Error al borrar la cita: ' + error.message);
        fetchOrders(); // Revertir visualmente si hay error
      } else {
        window.dispatchEvent(new Event('ordersUpdated'));
      }
    } else {
      const { error } = await supabase.from('orders').delete().eq('id', order.originalId);
      if (error) {
        console.error('Error al borrar order:', error);
        alert('Error al borrar la orden: ' + error.message);
        fetchOrders(); // Revertir visualmente si hay error
      } else {
        window.dispatchEvent(new Event('ordersUpdated'));
      }
    }
  };

  const getCountryCode = (phone: string) => {
    if (!phone) return 'unknown';
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.startsWith('54')) return 'ar';
    if (cleanPhone.startsWith('51')) return 'pe';
    if (cleanPhone.startsWith('52')) return 'mx';
    if (cleanPhone.startsWith('56')) return 'cl';
    if (cleanPhone.startsWith('57')) return 'co';
    if (cleanPhone.startsWith('58')) return 've';
    if (cleanPhone.startsWith('591')) return 'bo';
    if (cleanPhone.startsWith('593')) return 'ec';
    if (cleanPhone.startsWith('595')) return 'py';
    if (cleanPhone.startsWith('598')) return 'uy';
    if (cleanPhone.startsWith('34') && cleanPhone.length >= 11) return 'es';
    if (cleanPhone.startsWith('1') && cleanPhone.length >= 11) return 'us';
    
    // Si el número tiene 10 dígitos y no coincidió con prefijos internacionales, 
    // asumimos que es un número local de Argentina (ej. 351... de Córdoba o 11... de BBAA)
    if (cleanPhone.length === 10) return 'ar';

    return 'unknown';
  };

  const parseSpanishDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.toLowerCase().split(' de ');
    if (parts.length < 3) return null;
    const day = parseInt(parts[0], 10);
    const monthName = parts[1].trim();
    const year = parseInt(parts[2], 10);
    
    const months: { [key: string]: number } = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
    
    const month = months[monthName];
    if (month === undefined) return null;
    
    return new Date(year, month, day);
  };

  const isUpcoming = (order: any) => {
    if (!order) return false;
    if (order.isLead && order.appointmentDateRaw) {
      const appDate = parseSpanishDate(order.appointmentDateRaw);
      if (appDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        appDate.setHours(0, 0, 0, 0);
        return appDate.getTime() >= today.getTime();
      }
    }
    if (!order.isLead) {
      return order.status !== 'Completado';
    }
    return false;
  };

  const handleDeleteOrder = async (order: any) => {
    const upcoming = isUpcoming(order);
    if (skipDeleteConfirm && !upcoming) {
      await executeDelete(order);
    } else {
      setOrderToDelete(order);
    }
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    await executeDelete(orderToDelete);
    setOrderToDelete(null);
  };

  if (loading) return (
    <div className="p-8" style={{ backgroundColor: 'var(--surface-container-low)', minHeight: '100vh', color: 'var(--on-surface)' }}>
      <p className="body-md">Sincronizando operaciones...</p>
    </div>
  );

  const activosCount = orders.filter(o => o.status === 'Pendiente' || o.status === 'Confirmado').length;
  const totalIngresos = orders.reduce((sum, o) => sum + (o.totalNum || 0), 0);

  const filteredOrders = orders.filter(o => activeFilter === 'Todos' || o.status === activeFilter);

  return (
    <div className="p-8" style={{ 
      backgroundColor: 'var(--surface-container-low)', 
      minHeight: '100vh', 
      color: 'var(--on-surface)',
      transition: 'all 0.3s ease',
      paddingBottom: '10rem'
    }}>
      <header className="page-header">
        <div>
          <h2 className="page-title" style={{ color: 'var(--primary)' }}>Gestión de Ventas y Servicios</h2>
          <p className="body-md" style={{ opacity: 0.7, marginTop: '0.25rem', color: 'var(--secondary)' }}>
            Control logístico y comercial
          </p>
        </div>

      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ width: '200px', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--surface-container)', border: 'var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Tareas Activas</p>
          <h3 style={{ fontSize: '1.25rem', margin: '0.15rem 0', color: 'var(--on-surface)', fontWeight: 800 }}>{activosCount.toString().padStart(2, '0')}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--tertiary)', fontSize: '0.65rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>trending_up</span> Operación fluida
          </div>
        </div>
        <div className="card" style={{ width: '200px', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--surface-container)', border: 'var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Volumen Diario</p>
          <h3 style={{ fontSize: '1.25rem', margin: '0.15rem 0', color: 'var(--on-surface)', fontWeight: 800 }}>${totalIngresos.toFixed(2)}</h3>
          <p style={{ fontSize: '0.65rem', opacity: 0.5, margin: 0 }}>Ingresos proyectados hoy</p>
        </div>
        <div className="card" style={{ width: '200px', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--surface-container)', border: 'var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Eficiencia Bot</p>
          <h3 style={{ fontSize: '1.25rem', margin: '0.15rem 0', color: 'var(--on-surface)', fontWeight: 800 }}>{botEfficiency.toFixed(1)}%</h3>
          <p style={{ fontSize: '0.65rem', opacity: 0.5, margin: 0 }}>Precisión en toma de pedidos</p>
        </div>
      </div>

      {/* Filtros Estilo Apple dentro de contenedor con borde negrita */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', backgroundColor: 'var(--surface-container-low)', borderRadius: '12px', border: 'var(--card-border)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          {['Todos', 'Pendiente', 'Confirmado', 'Completado'].map(f => (
            <button 
              key={f} 
              onClick={() => setActiveFilter(f)}
              style={{ 
                padding: '0.6rem 1.5rem', borderRadius: '30px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
                backgroundColor: activeFilter === f ? '#C9A84C' : 'var(--surface-container-high)',
                color: activeFilter === f ? '#1A1A2E' : 'var(--on-surface)',
                boxShadow: activeFilter === f ? '0 10px 20px rgba(201, 168, 76, 0.2)' : 'none'
              }}
            >
              {f}
            </button>
          ))}
        </div>
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
          const isReady = order.status === 'Confirmado';
          
          return (
            <div 
              key={order.id} 
              className="card chat-bubble-anim"
              style={{ 
                background: 'var(--surface-container-high)', 
                borderRadius: '20px', 
                border: 'var(--card-border)', 
                overflow: 'hidden',
                boxShadow: isPending ? '0 0 30px rgba(var(--primary-rgb), 0.15)' : 'var(--shadow-md)',
                position: 'relative',
                padding: 0 // Anular padding por defecto de .card para tarjetas de pedido
              }}
            >
              {/* Header de la tarjeta */}
              <div style={{ padding: '0.75rem 1rem', borderBottom: 'var(--table-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>{order.id}</h4>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--secondary)' }}>{order.time} • WhatsApp</p>
                </div>
                <div style={{ 
                  padding: '3px 10px', borderRadius: '20px', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '1px',
                  backgroundColor: isPending ? 'var(--primary-container)' : (isReady ? 'var(--tertiary-container)' : 'var(--surface-container-highest)'),
                  color: isPending ? 'var(--on-primary-container)' : (isReady ? 'var(--on-tertiary-container)' : 'var(--on-surface)'),
                  border: 'var(--table-border)',
                  boxShadow: isPending ? '0 0 10px rgba(var(--primary-rgb), 0.3)' : 'none'
                }}>
                  {order.status.toUpperCase()}
                </div>
              </div>

              {/* Contenido: Cliente e Items */}
              <div style={{ padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '18px' }}>person</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: 'var(--on-surface)' }}>{order.customer}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {getCountryCode(order.phone) !== 'unknown' ? (
                        <img src={`https://flagcdn.com/w20/${getCountryCode(order.phone)}.png`} alt="flag" style={{ width: '16px', borderRadius: '2px' }} />
                      ) : (
                        <span style={{ fontSize: '12px' }}>🌍</span>
                      )}
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--secondary)' }}>{order.phone}</p>
                      {order.email && (
                        <>
                          <span style={{ fontSize: '0.7rem', color: 'var(--surface-container-highest)' }}>•</span>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>{order.email}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--surface-container-low)', padding: '0.6rem', borderRadius: '10px', marginBottom: '0.75rem', border: 'var(--table-border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '65px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
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
                    {order.segment && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--on-surface)', borderTop: '1px dashed var(--surface-container-highest)', paddingTop: '4px' }}>
                        <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>A QUÉ SE DEDICA:</span> {order.segment}
                      </div>
                    )}
                    {order.volume && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--on-surface)', borderTop: '1px dashed var(--surface-container-highest)', paddingTop: '4px' }}>
                        <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>VOLUMEN MSJ:</span> {order.volume}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--secondary)' }}>TOTAL A COBRAR</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>{order.total}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteOrder(order)}
                    style={{ 
                      background: 'rgba(255, 82, 82, 0)', 
                      border: 'none', 
                      color: 'var(--error)', 
                      opacity: 0.6, 
                      cursor: 'pointer', 
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      transform: 'scale(1)',
                      padding: '6px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1.15)';
                      e.currentTarget.style.background = 'rgba(255, 82, 82, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.6';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.background = 'rgba(255, 82, 82, 0)';
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.85)';
                      e.currentTarget.style.background = 'rgba(255, 82, 82, 0.2)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'scale(1.15)';
                      e.currentTarget.style.background = 'rgba(255, 82, 82, 0.1)';
                    }}
                    title="Eliminar registro"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                  </button>
                </div>
              </div>

              {/* Botones de acción principales */}
              <div style={{ display: 'flex', width: '100%', borderTop: 'var(--table-border)' }}>
                {!isPending && (
                  <button
                    onClick={() => handleReturnToPending(order.id, order.isLead, order.originalId)}
                    style={{
                      flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.3s',
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      color: '#ef4444',
                      borderRight: 'var(--table-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
                    title="Devolver a Pendiente"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>undo</span>
                  </button>
                )}
                {order.status !== 'Completado' && (
                  <button 
                    onClick={() => handleStatusChange(order.id, order.status, order.isLead, order.originalId)}
                    style={{ 
                      flex: 4, padding: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.3s',
                      backgroundColor: isPending ? 'rgba(201, 168, 76, 0.1)' : 'var(--surface-container-high)',
                      color: isPending ? '#C9A84C' : 'var(--on-surface)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isPending ? '#C9A84C' : 'var(--surface-container-highest)';
                      if (isPending) e.currentTarget.style.color = '#1A1A2E';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isPending ? 'rgba(201, 168, 76, 0.1)' : 'var(--surface-container-high)';
                      e.currentTarget.style.color = isPending ? '#C9A84C' : 'var(--on-surface)';
                    }}
                  >
                    {isPending ? 'Confirmar' : 'Marcar Completado'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de confirmación de eliminación */}
      {orderToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface-container-high)', border: '1px solid rgba(255, 82, 82, 0.3)',
            borderRadius: '24px', padding: '2rem', maxWidth: '380px', width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255, 82, 82, 0.1)', 
              color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 1.5rem auto' 
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>delete_forever</span>
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--on-surface)' }}>¿Eliminar Registro?</h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--secondary)', lineHeight: '1.5' }}>
              Estás a punto de borrar de la base de datos el registro <strong style={{ color: 'var(--error)' }}>{orderToDelete?.id}</strong>. Esta acción es irreversible.
            </p>
            {isUpcoming(orderToDelete) && (
              <div style={{
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '12px',
                padding: '0.75rem',
                marginBottom: '1.5rem',
                fontSize: '0.8rem',
                color: '#ff9800',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#ff9800' }}>warning</span>
                <span>
                  <strong>¡Atención!</strong> Este es un servicio o entrega programada para hoy o el futuro.
                </span>
              </div>
            )}
            {!isUpcoming(orderToDelete) ? (
              <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <input 
                  type="checkbox" 
                  id="skipConfirm" 
                  checked={skipDeleteConfirm}
                  onChange={(e) => {
                    setSkipDeleteConfirm(e.target.checked);
                    localStorage.setItem('skipDeleteConfirm', String(e.target.checked));
                  }}
                  style={{ accentColor: 'var(--error)', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="skipConfirm" style={{ fontSize: '0.8rem', color: 'var(--secondary)', cursor: 'pointer' }}>No volver a preguntar</label>
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem', fontSize: '0.75rem', color: 'var(--secondary)' }}>
                * Por seguridad, se requiere confirmación manual para registros activos o futuros.
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setOrderToDelete(null)}
                style={{
                  flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--surface-container-highest)',
                  background: 'var(--surface-container)', color: 'var(--on-surface)', fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container-highest)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container)'}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                style={{
                  flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none',
                  background: 'var(--error)', color: '#fff', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(255, 82, 82, 0.2)', transition: 'transform 0.1s, opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
