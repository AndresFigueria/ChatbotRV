import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    activeChats: 0,
    customers: 0
  });
  const [chartData7D, setChartData7D] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const channel = supabase.channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_messages' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchDashboardData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchDashboardData = async () => {
    const { data: orders } = await supabase.from('orders').select('*');
    const { count: chatCount } = await supabase.from('whatsapp_chats').select('*', { count: 'exact', head: true });
    const { count: custCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    const { data: chats } = await supabase.from('whatsapp_chats').select('*').order('last_message_at', { ascending: false }).limit(6);

    if (orders) {
      const totalRev = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      setStats({ revenue: totalRev, orders: orders.length, activeChats: chatCount || 0, customers: custCount || 0 });
      const daysMap: Record<string, number> = { 'Lun': 0, 'Mar': 0, 'Mié': 0, 'Jue': 0, 'Vie': 0, 'Sáb': 0, 'Dom': 0 };
      const daysOrder = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      orders.forEach(o => {
        const d = new Date(o.created_at);
        const dayName = daysOrder[d.getDay()];
        if (daysMap[dayName] !== undefined) daysMap[dayName] += Number(o.total_amount || 0);
      });
      setChartData7D(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => ({ name: d, ingresos: daysMap[d] })));
    }

    if (chats) {
      setRecentEvents(chats.map(c => ({
        id: c.id,
        time: new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: `Chat: ${c.contact_name || 'Cliente'}`,
        details: c.last_message,
        cl: 'bg-primary',
        icon: 'chat_bubble'
      })));
    }
    setLoading(false);
  };

  if (loading) return <div className="p-8">Sincronizando Dashboard...</div>;

  return (
    <div className="p-8">
      <header className="page-header mb-8">
        <div>
          <h2 className="display-md">Monitor Robotina Central 🤖</h2>
          <p className="body-md" style={{ color: 'var(--secondary)' }}>Panel de control operativo y financiero.</p>
        </div>
      </header>

      <div className="metrics-grid mb-8">
        <div className="card">
          <p className="label-sm">Facturación Total</p>
          <h3 className="display-md" style={{ color: 'var(--primary)', marginTop: '0.5rem' }}>${stats.revenue.toLocaleString()}</h3>
        </div>
        <div className="card">
          <p className="label-sm">Pedidos Cerrados</p>
          <h3 className="display-md" style={{ marginTop: '0.5rem' }}>{stats.orders}</h3>
        </div>
        <div className="card">
          <p className="label-sm">Chats Activos</p>
          <h3 className="display-md" style={{ marginTop: '0.5rem', color: 'var(--emerald-400)' }}>{stats.activeChats}</h3>
        </div>
        <div className="card">
          <p className="label-sm">Clientes CRM</p>
          <h3 className="display-md" style={{ marginTop: '0.5rem' }}>{stats.customers}</h3>
        </div>
      </div>

      <div className="dashboard-grid-main">
        <div className="card">
          <h3 className="title-md mb-6">Ingresos (Últimos 7 Días)</h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData7D} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-bright)', border: '1px solid var(--card-border)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="ingresos" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="title-md mb-6">Bitácora Operativa IA</h3>
          <div className="activity-feed">
            {recentEvents.map(event => (
              <div key={event.id} className="activity-feed-item">
                <div className={`activity-icon ${event.cl}`} style={{ width: '32px', height: '32px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{event.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex justify-between">
                    <p style={{ fontWeight: 700, fontSize: '0.8rem', margin: 0 }}>{event.event}</p>
                    <span style={{ fontSize: '0.6rem', color: 'var(--secondary)' }}>{event.time}</span>
                  </div>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginTop: '0.1rem' }}>{event.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
