import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    const channel = supabase.channel('global-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchNotifications())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_chats' }, () => fetchNotifications())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchNotifications = async () => {
    try {
      // 1. Traer pedidos pendientes
      const { data: orders } = await supabase.from('orders').select('*, customer:customers(name, phone_number)').eq('status', 'Pendiente').limit(10);
      
      // 2. Traer chats activos (últimas conversaciones)
      const { data: chats } = await supabase.from('whatsapp_chats').select('*').order('last_message_at', { ascending: false }).limit(10);
      
      const combined = [
        ...(orders || []).map(o => ({
          id: o.id,
          type: 'order',
          title: `Nuevo Pedido: ${o.order_code}`,
          desc: `Pedido de $${o.total_amount} de ${o.customer?.name || 'Cliente'}.`,
          time: o.created_at,
          icon: 'shopping_cart_checkout',
          color: 'var(--error)',
          link: '/orders'
        })),
        ...(chats || []).map(c => ({
          id: c.id,
          type: 'chat',
          title: `Chat Activo: ${c.contact_name || 'Cliente'}`,
          desc: `Último msj: "${c.last_message}"`,
          time: c.last_message_at,
          icon: 'chat_bubble',
          color: 'var(--primary)',
          link: '/whatsapp'
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setNotifications(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const visibleNotifications = notifications.filter(n => !dismissedIds.includes(n.id));

  return (
    <div className="p-8 h-full flex flex-col">
      <header style={{ marginBottom: '2rem' }}>
        <h2 className="display-md">Centro de Notificaciones 🔔</h2>
        <p className="body-md" style={{ color: 'var(--secondary)' }}>Eventos que requieren tu atención en Robotina Central.</p>
      </header>

      <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-container-highest)', display: 'flex', justifyContent: 'space-between' }}>
          <h3 className="title-md">Alertas Operativas ({visibleNotifications.length})</h3>
          <button onClick={() => setDismissedIds(notifications.map(n => n.id))} className="btn-secondary">Limpiar todas</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
             <div style={{ textAlign: 'center', padding: '2rem' }}>Sincronizando...</div>
          ) : visibleNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>No hay alertas pendientes.</div>
          ) : visibleNotifications.map(n => (
            <div key={n.id} onClick={() => navigate(n.link)} className="activity-feed-item" style={{ border: '1px solid var(--surface-container-highest)', padding: '1.25rem', borderRadius: '0.75rem', display: 'flex', gap: '1rem', cursor: 'pointer', backgroundColor: 'var(--surface-container-low)' }}>
               <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: `${n.color}15`, color: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <span className="material-symbols-outlined">{n.icon}</span>
               </div>
               <div style={{ flex: 1 }}>
                 <p style={{ fontWeight: 700, margin: 0, fontSize: '1rem' }}>{n.title}</p>
                 <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{n.desc}</p>
                 <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.4rem', fontWeight: 600 }}>{new Date(n.time).toLocaleTimeString()}</p>
               </div>
               <button onClick={(e) => { e.stopPropagation(); setDismissedIds([...dismissedIds, n.id]); }} className="icon-btn" style={{ color: 'var(--secondary)' }}>
                 <span className="material-symbols-outlined">close</span>
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
