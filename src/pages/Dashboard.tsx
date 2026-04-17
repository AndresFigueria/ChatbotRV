import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D'>('7D');
  
  // Estados para datos reales
  const [metrics, setMetrics] = useState({ revenue: 0, orders: 0, aov: 0, customers: 0 });
  const [chartData7D, setChartData7D] = useState<any[]>([]);
  const [chartData30D, setChartData30D] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      // 1. Obtener todas las órdenes para cálculos
      const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      // 2. Obtener clientes
      const { data: customers } = await supabase.from('customers').select('*');

      if (orders) {
        let totalRev = 0;
        orders.forEach(o => {
          totalRev += Number(o.total_amount || 0);
        });
        
        const aov = orders.length > 0 ? (totalRev / orders.length) : 0;
        
        setMetrics({
          revenue: totalRev,
          orders: orders.length,
          aov: aov,
          customers: customers ? customers.length : 0
        });

        // 3. Crear datos reales para el gráfico de 7 días (agrupando por día de la semana)
        const daysMap: Record<string, number> = { 'Lun': 0, 'Mar': 0, 'Mié': 0, 'Jue': 0, 'Vie': 0, 'Sáb': 0, 'Dom': 0 };
        const daysOrder = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        // Si hay cero ingresos en algunos días, se mostrará como 0. 
        // Agrupamos usando la fecha de creación de la base de datos
        orders.forEach(o => {
          const d = new Date(o.created_at);
          const dayName = daysOrder[d.getDay()];
          daysMap[dayName] += Number(o.total_amount || 0);
        });

        const constructed7D = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => ({
          name: d, ingresos: daysMap[d]
        }));
        setChartData7D(constructed7D);

        // 4. Datos proporcionales para 30D (simplificado para demostración usando proporciones del total)
        setChartData30D([
          { name: 'Semana 1', ingresos: totalRev * 0.15 },
          { name: 'Semana 2', ingresos: totalRev * 0.25 },
          { name: 'Semana 3', ingresos: totalRev * 0.20 },
          { name: 'Semana 4', ingresos: totalRev * 0.40 },
        ]);

        // 5. Historial de Actividad (Últimas 4 órdenes)
        const mappedActs = orders.slice(0, 4).map((o) => ({
          id: o.order_code || Math.random().toString(),
          title: `Pedido ${o.status}`,
          desc: `Facturación: $${Number(o.total_amount).toFixed(2)} con ${o.items_count} ítems`,
          time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(o.created_at).toLocaleDateString(),
          icon: o.status === 'Pendiente' ? 'notifications_active' : (o.status === 'Completado' || o.status === 'Despachado' ? 'check_circle' : 'restaurant_menu'),
          cl: o.status === 'Pendiente' ? 'bg-error' : (o.status === 'Despachado' ? 'bg-emerald-400' : 'bg-primary')
        }));
        setRecentActivities(mappedActs);
      }

      setLoading(false);
    }
    
    fetchDashboardData();

    // Mantener la pantalla principal sincronizada en vivo con Supabase
    const channel = supabase.channel('dashboard-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, _payload => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const chartData = timeRange === '7D' ? chartData7D : chartData30D;

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <p className="body-md" style={{ color: 'var(--secondary)' }}>Sincronizando reportes con Supabase...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <section className="page-header">
        <div>
          <h2 className="display-md">Resumen Comercial en Vivo</h2>
          <p className="body-md" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
            Tus métricas financieras y logísticas operando en tiempo real con la base de datos central.
          </p>
        </div>
      </section>

      {/* Metrics Grid */}
      <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Ingresos Totales', value: `$${metrics.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: 'payments', change: 'En tiempo real', pos: true },
          { label: 'Pedidos Totales', value: metrics.orders.toLocaleString(), icon: 'receipt_long', change: 'Registrados', pos: true },
          { label: 'Ticket Promedio', value: `$${metrics.aov.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: 'avg_time', change: 'Por factura', pos: true },
          { label: 'Nuevos Clientes', value: metrics.customers.toLocaleString(), icon: 'person_add', change: 'En Base de Datos', pos: true }
        ].map(m => (
          <div key={m.label} className="card group">
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <span className="label-sm">{m.label}</span>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>{m.icon}</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{m.value}</span>
              <span style={{ fontSize: '0.70rem', fontWeight: 500, color: m.pos ? 'var(--emerald-400)' : 'var(--error-dim)' }}>
                {m.change}
              </span>
            </div>
            {/* Progress bar visual - Llenado proporcional dinámico para dar estética */}
            <div style={{ marginTop: '1rem', height: '4px', width: '100%', backgroundColor: 'var(--surface-container-low)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: m.label === 'Pedidos Totales' ? '85%' : (m.label === 'Ingresos Totales' ? '100%' : '60%'), backgroundColor: 'var(--primary)', transition: 'width 1s ease' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid-main">
        {/* Revenue Growth Chart */}
        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
            <div>
              <h3 className="title-md">Curva de Facturación</h3>
              <p className="body-md" style={{ color: 'var(--secondary)' }}>Montos liquidados en caja y bot</p>
            </div>
            <div className="flex gap-2">
              <button 
                className={timeRange === '7D' ? 'btn-primary' : 'btn-secondary'} 
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                onClick={() => setTimeRange('7D')}
              >
                7D
              </button>
              <button 
                className={timeRange === '30D' ? 'btn-primary' : 'btn-secondary'} 
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                onClick={() => setTimeRange('30D')}
              >
                30D
              </button>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-bright)', border: '1px solid var(--card-border)', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: 'var(--on-surface)' }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="ingresos" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.5rem' }}>
            <h3 className="title-md">Feed Logístico Automático</h3>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--primary)' }}>history</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {recentActivities.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--secondary)', padding: '2rem 0', fontSize: '0.875rem' }}>
                Sin actividad reciente para mostrar.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentActivities.map(act => (
                  <div key={act.id} className="activity-feed-item" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <div className={`activity-icon ${act.cl}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>{act.icon}</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--on-surface)' }}>{act.title} - #{act.id}</p>
                      <p style={{ color: 'var(--secondary)', fontSize: '0.70rem', marginTop: '0.2rem' }}>{act.desc}</p>
                      <p style={{ color: 'var(--secondary)', fontSize: '0.6rem', marginTop: '0.4rem', fontWeight: 700 }}>{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
