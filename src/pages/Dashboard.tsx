import { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    activeChats: 0,
    customers: 0,
    meetings: 0
  });
  const [chartData7D, setChartData7D] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('robotina_sound') !== 'false');
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    localStorage.setItem('robotina_sound', soundEnabled.toString());
  }, [soundEnabled]);

  const playSound = (type: 'chat' | 'meeting', forcePlay: boolean = false) => {
    if (!forcePlay && !soundEnabledRef.current) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      if (type === 'chat') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.15);
      } else {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
      }
    } catch (e) {
      console.error('Audio play failed', e);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const channel = supabase.channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_messages' }, () => {
        fetchDashboardData(selectedDate);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchDashboardData(selectedDate))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        fetchDashboardData(selectedDate);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'landing_leads' }, () => {
        fetchDashboardData(selectedDate);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedDate]);

  const fetchDashboardData = async (targetDate: Date) => {
    // Definimos el inicio y fin del día seleccionado para KPIs diarios
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Para el gráfico de 7 días, necesitamos los 7 días terminando en la fecha seleccionada
    const startOf7Days = new Date(targetDate);
    startOf7Days.setDate(startOf7Days.getDate() - 6);
    startOf7Days.setHours(0, 0, 0, 0);

    // 1. Órdenes Totales (histórico hasta la fecha seleccionada)
    const { data: allOrders } = await supabase
      .from('orders')
      .select('*')
      .lte('created_at', endOfDay.toISOString());

    // 2. Chats Totales (histórico)
    const { count: chatCount } = await supabase.from('whatsapp_chats')
      .select('*', { count: 'exact', head: true })
      .lte('last_message_at', endOfDay.toISOString());

    // 3. Clientes Totales (histórico acumulado - la tabla no tiene created_at)
    const { count: custCount } = await supabase.from('customers')
      .select('*', { count: 'exact', head: true });
    
    // 4. Reuniones Agendadas Totales (histórico)
    const { count: leadsCount } = await supabase.from('landing_leads')
      .select('*', { count: 'exact', head: true })
      .not('appointment_date', 'is', null)
      .lte('created_at', endOfDay.toISOString());

    const { count: resCount } = await supabase.from('reservations')
      .select('*', { count: 'exact', head: true })
      .lte('created_at', endOfDay.toISOString());

    const totalMeetings = (leadsCount || 0) + (resCount || 0);

    // 5. Historial reciente de chats (para la bitácora)
    const { data: chats } = await supabase.from('whatsapp_chats')
      .select('*')
      .lte('last_message_at', endOfDay.toISOString())
      .order('last_message_at', { ascending: false })
      .limit(6);

    if (allOrders) {
      // KPIs totales históricos
      const totalRev = allOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      setStats({ revenue: totalRev, orders: allOrders.length, activeChats: chatCount || 0, customers: custCount || 0, meetings: totalMeetings });
      
      // Para el gráfico de 7 días, extraemos solo los de la última semana terminando en targetDate
      const orders7D = allOrders.filter(o => {
        const d = new Date(o.created_at);
        return d >= startOf7Days && d <= endOfDay;
      });

      // Chart: últimos 7 días terminando en la fecha seleccionada
      const daysMap: Record<string, number> = {};
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      
      // Inicializar los últimos 7 días en orden cronológico
      const chartLabels: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(targetDate);
        d.setDate(d.getDate() - i);
        const name = dayNames[d.getDay()];
        chartLabels.push(name);
        daysMap[name] = 0;
      }

      orders7D.forEach(o => {
        const d = new Date(o.created_at);
        const dayName = dayNames[d.getDay()];
        if (daysMap[dayName] !== undefined) {
          daysMap[dayName] += Number(o.total_amount || 0);
        }
      });
      setChartData7D(chartLabels.map(d => ({ name: d, ingresos: daysMap[d] })));
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

  if (loading) return <div style={{ padding: '2rem' }}>Sincronizando Dashboard...</div>;

  return (
    <div style={{ padding: '0.5rem 1.5rem' }}>
      <header className="page-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">Robotina Business Control 🤖</h2>
          <p className="body-md" style={{ color: 'var(--secondary)' }}>Panel de control operativo.</p>
        </div>
        
        {/* Sound Toggle Pill */}
        <div 
          onClick={() => {
            const nextState = !soundEnabled;
            setSoundEnabled(nextState);
            if (nextState) {
              playSound('chat', true);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            backgroundColor: 'var(--surface-container-high)',
            borderRadius: '9999px',
            padding: '4px',
            cursor: 'pointer',
            border: '1px solid var(--card-border)',
            width: '180px',
            height: '36px',
            justifyContent: 'space-between',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: '4px',
              bottom: '4px',
              left: '4px',
              width: 'calc(50% - 4px)',
              backgroundColor: 'var(--surface-container-highest)',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              transform: soundEnabled ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
          </div>
          <span style={{
            flex: 1,
            textAlign: 'center',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            zIndex: 2,
            color: soundEnabled ? 'var(--primary)' : 'var(--secondary)',
            transition: 'color 0.3s'
          }}>SONIDO</span>
          <span style={{
            flex: 1,
            textAlign: 'center',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            zIndex: 2,
            color: !soundEnabled ? 'var(--on-surface)' : 'var(--secondary)',
            transition: 'color 0.3s'
          }}>SILENCIO</span>
        </div>
      </header>

      <div className="mb-4" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ width: '170px', padding: '0.75rem 0.5rem' }}>
          <p className="label-sm" style={{ color: 'var(--on-surface)', fontWeight: 800 }}>Facturación Total</p>
          <h3 className="display-md" style={{ color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 900 }}>${stats.revenue.toLocaleString()}</h3>
        </div>
        <div className="card" style={{ width: '170px', padding: '0.75rem 0.5rem' }}>
          <p className="label-sm" style={{ color: 'var(--on-surface)', fontWeight: 800 }}>Operaciones Totales</p>
          <h3 className="display-md" style={{ color: 'var(--on-surface)', marginTop: '0.5rem', fontWeight: 900 }}>{stats.orders}</h3>
        </div>
        <div className="card" style={{ width: '170px', padding: '0.75rem 0.5rem' }}>
          <p className="label-sm" style={{ color: 'var(--on-surface)', fontWeight: 800 }}>Reuniones Agendadas</p>
          <h3 className="display-md" style={{ color: '#C9A84C', marginTop: '0.5rem', fontWeight: 900 }}>{stats.meetings}</h3>
        </div>
        <div className="card" style={{ width: '170px', padding: '0.75rem 0.5rem' }}>
          <p className="label-sm" style={{ color: 'var(--on-surface)', fontWeight: 800 }}>Chats Activos</p>
          <h3 className="display-md" style={{ color: 'var(--emerald-400)', marginTop: '0.5rem', fontWeight: 900 }}>{stats.activeChats}</h3>
        </div>
        <div className="card" style={{ width: '170px', padding: '0.75rem 0.5rem' }}>
          <p className="label-sm" style={{ color: 'var(--on-surface)', fontWeight: 800 }}>Clientes CRM</p>
          <h3 className="display-md" style={{ color: 'var(--on-surface)', marginTop: '0.5rem', fontWeight: 900 }}>{stats.customers}</h3>
        </div>
      </div>

      {/* Date Selector */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.5rem', marginTop: '-0.5rem', paddingLeft: '0.25rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: 'var(--surface-container-high)',
          borderRadius: '12px',
          padding: '0.25rem',
          border: '1px solid var(--card-border)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <button 
            className="icon-btn" 
            style={{ color: 'var(--on-surface)', padding: '0.5rem' }}
            onClick={() => {
              const prev = new Date(selectedDate);
              prev.setDate(prev.getDate() - 1);
              setSelectedDate(prev);
            }}
            title="Día Anterior"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>chevron_left</span>
          </button>
          
          <div style={{ position: 'relative', margin: '0 0.5rem' }}>
            <input 
              type="date" 
              value={selectedDate.toLocaleDateString('en-CA')}
              onChange={(e) => {
                if (e.target.value) {
                  // Agregamos tiempo local para evitar desfaces por timezone
                  const [y, m, d] = e.target.value.split('-');
                  setSelectedDate(new Date(Number(y), Number(m)-1, Number(d)));
                }
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--on-surface)',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
                colorScheme: localStorage.getItem('theme-mode') === 'dark' ? 'dark' : 'light'
              }}
            />
          </div>
          
          <button 
            className="icon-btn" 
            style={{ 
              color: 'var(--on-surface)', 
              padding: '0.5rem',
              opacity: selectedDate.toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA') ? 0.3 : 1,
              pointerEvents: selectedDate.toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA') ? 'none' : 'auto'
            }}
            onClick={() => {
              const next = new Date(selectedDate);
              next.setDate(next.getDate() + 1);
              setSelectedDate(next);
            }}
            title="Día Siguiente"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>chevron_right</span>
          </button>
        </div>
      </div>

      <div className="dashboard-grid-main">
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '360px' }}>
          <h3 className="title-md mb-2">Ingresos (Últimos 7 Días)</h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData7D} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--secondary)" strokeOpacity={0.8} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-bright)', border: '1px solid var(--card-border)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="ingresos" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '360px' }}>
          <h3 className="title-md mb-3">Bitácora Operativa IA</h3>
          <div className="activity-feed" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
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
