import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  
  // Data for charts
  const [salesByDay, setSalesByDay] = useState<any[]>([]);
  const [customerStatus, setCustomerStatus] = useState<any[]>([]);
  const [ordersPerHour, setOrdersPerHour] = useState<any[]>([]);
  const [kpis, setKpis] = useState({ 
    totalRevenue: 0, 
    ltvAvg: 0, 
    peakHour: 'N/A', 
    vipCount: 0 
  });

  const COLORS = ['#FF5A1F', '#EEAC6C', '#10B981', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    async function fetchAnalytics() {
      const { data: orders } = await supabase.from('orders').select('*');
      const { data: customers } = await supabase.from('customers').select('*');

      if (orders && customers) {
        // --- KPIs ---
        const revenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        const ltv = customers.reduce((sum, c) => sum + Number(c.ltv || 0), 0) / (customers.length || 1);
        const vips = customers.filter(c => c.status === 'VIP').length;

        // --- Sales By Day (BarChart) ---
        const daysMap: Record<string, number> = { 'Dom': 0, 'Lun': 0, 'Mar': 0, 'Mié': 0, 'Jue': 0, 'Vie': 0, 'Sáb': 0 };
        const daysOrder = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        // --- Orders Per Hour (LineCurve) ---
        // Let's do 24 hours
        const hoursMap: Record<string, number> = {};
        for(let i=0; i<24; i++) hoursMap[`${i.toString().padStart(2, '0')}:00`] = 0;

        orders.forEach(o => {
          const d = new Date(o.created_at);
          // Day
          daysMap[daysOrder[d.getDay()]] += Number(o.total_amount || 0);
          // Hour
          hoursMap[`${d.getHours().toString().padStart(2, '0')}:00`] += 1;
        });

        setSalesByDay(daysOrder.map(d => ({ name: d, Ingresos: daysMap[d] })));

        const mappedHours = Object.keys(hoursMap).map(h => ({ hour: h, Pedidos: hoursMap[h] }));
        setOrdersPerHour(mappedHours);

        // Find peak hour
        let peak = 'N/A';
        let peakVal = -1;
        mappedHours.forEach(h => {
          if (h.Pedidos > peakVal) {
            peakVal = h.Pedidos;
            peak = h.hour;
          }
        });
        if (peakVal === 0) peak = 'Sin datos';

        setKpis({ totalRevenue: revenue, ltvAvg: ltv, peakHour: peak, vipCount: vips });

        // --- Customer Status Distribution (PieChart) ---
        const crMap: Record<string, number> = {};
        customers.forEach(c => {
          crMap[c.status] = (crMap[c.status] || 0) + 1;
        });
        const mappedStatuses = Object.keys(crMap).map(status => ({ name: status, value: crMap[status] }));
        setCustomerStatus(mappedStatuses);
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8 flex justify-center items-center" style={{ minHeight: '50vh' }}><p className="body-md" style={{ color: 'var(--secondary)' }}>Calculando proyecciones con IA y leyendo Supabase...</p></div>;

  return (
    <div className="p-8">
      <div className="page-header">
        <div>
          <h2 className="display-sm" style={{ fontWeight: 800 }}>Business Intelligence</h2>
          <p className="body-md" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
            Análisis de datos cruzados entre pedidos, clientes y automatizaciones.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>download</span>
            Generar Reporte PDF
          </button>
        </div>
      </div>

      <div className="metrics-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <p className="label-sm">Facturación Histórica</p>
          <h3 className="display-md" style={{ color: 'var(--on-surface)', marginTop: '0.5rem', fontSize: '1.5rem' }}>${kpis.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          <p className="body-md" style={{ color: 'var(--emerald-400)', fontSize: '0.75rem', fontWeight: 600 }}>Crecimiento orgánico</p>
        </div>
        <div className="card">
          <p className="label-sm">LTV Promedio (Lifetime Value)</p>
          <h3 className="display-md" style={{ color: 'var(--on-surface)', marginTop: '0.5rem', fontSize: '1.5rem' }}>${kpis.ltvAvg.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="body-md" style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>Dinero dejado por cliente</p>
        </div>
        <div className="card">
          <p className="label-sm">Hora Pico Global</p>
          <h3 className="display-md" style={{ color: 'var(--on-surface)', marginTop: '0.5rem', fontSize: '1.5rem' }}>{kpis.peakHour}</h3>
          <p className="body-md" style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>Máximo flujo de comandas</p>
        </div>
        <div className="card" style={{ background: 'linear-gradient(145deg, var(--surface-container), rgba(255, 90, 31, 0.05))', border: '1px solid rgba(255, 90, 31, 0.2)' }}>
          <p className="label-sm">Comunidad VIP (Fidelización)</p>
          <h3 className="display-md" style={{ color: 'var(--primary)', marginTop: '0.5rem', fontSize: '1.5rem' }}>{kpis.vipCount} <span className="material-symbols-outlined" style={{ fontSize: '1.3rem', verticalAlign: 'middle' }}>workspace_premium</span></h3>
          <p className="body-md" style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>Usuarios activos fidelizados</p>
        </div>
      </div>

      <div className="grid-auto-responsive">
        
        {/* Gráfico 1: Barras Verticales */}
        <div className="card">
          <h3 className="title-md" style={{ marginBottom: '1.5rem' }}>Top Ingresos Diarios</h3>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 12 }} />
                <RechartsTooltip cursor={{ fill: 'var(--surface-container-high)' }} contentStyle={{ backgroundColor: 'var(--surface-bright)', border: '1px solid var(--card-border)', borderRadius: '8px', color: 'var(--on-surface)' }} itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }} />
                <Bar dataKey="Ingresos" fill="var(--primary)" radius={[4, 4, 0, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Pastel (Doughnut) */}
        <div className="card flex flex-col justify-center items-center">
          <h3 className="title-md" style={{ marginBottom: '0.5rem', alignSelf: 'flex-start', width: '100%' }}>Distribución del CRM</h3>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={customerStatus} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none" animationDuration={1200}>
                  {customerStatus.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-bright)', border: '1px solid var(--card-border)', borderRadius: '8px', color: 'var(--on-surface)' }} itemStyle={{ fontWeight: 'bold' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '0.8rem', color: 'var(--secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Línea de tráfico */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="title-md" style={{ marginBottom: '1.5rem' }}>Mapa de Tráfico: Pedidos por Hora</h3>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersPerHour} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" strokeOpacity={0.2} />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 12 }} allowDecimals={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-bright)', border: '1px solid var(--card-border)', borderRadius: '8px', color: 'var(--on-surface)' }} itemStyle={{ color: 'var(--tertiary)', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="Pedidos" stroke="var(--tertiary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--tertiary)', strokeWidth: 0 }} activeDot={{ r: 6, stroke: 'var(--tertiary)', strokeWidth: 2, fill: '#fff' }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
