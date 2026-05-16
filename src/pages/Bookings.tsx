import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Hoy');
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    attendance: 92,
    newToday: 0
  });

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        customer:customers (name, phone_number, status)
      `)
      .order('reservation_time', { ascending: true });

    if (!error && data) {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      const mapped = data.map((b: any) => {
        const timestamp = b.combined_time || `${b.reservation_date}T${b.reservation_time}`;
        const bDate = new Date(timestamp);
        return {
          ...b,
          isToday: b.reservation_date === todayStr,
          time: bDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: bDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
        };
      });

      setBookings(mapped);
      
      // Calculate Stats
      const todayBookings = mapped.filter((b: any) => b.isToday);
      const pendingBookings = mapped.filter((b: any) => b.status === 'Pendiente' || b.status === 'En Espera');
      setStats({
        today: todayBookings.length,
        pending: pendingBookings.length,
        attendance: 94, // Mocked for now
        newToday: todayBookings.filter((b: any) => new Date(b.created_at).toDateString() === now.toDateString()).length
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
    
    const channel = supabase.channel('bookings_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, fetchBookings)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) fetchBookings();
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'Hoy') return b.isToday;
    if (activeTab === 'Pendientes') return b.status === 'Pendiente';
    if (activeTab === 'Completadas') return b.status === 'Completado';
    return true; // Historial
  });

  if (loading && bookings.length === 0) return <div className="p-8 text-center text-secondary">Sincronizando Agenda IA...</div>;

  return (
    <div className="p-8">
      <header className="page-header mb-8">
        <div>
          <h2 className="display-sm" style={{ fontWeight: 800 }}>Gestión de Citas y Agenda</h2>
          <p className="body-md" style={{ color: 'var(--secondary)' }}>Automatización de reservas para servicios profesionales.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
            <span className="material-symbols-outlined">download</span> Exportar Agenda
          </button>
          <button className="btn-primary">
            <span className="material-symbols-outlined">add</span> Nueva Cita Manual
          </button>
        </div>
      </header>

      {/* Quick Stats Dashboard */}
      <div className="metrics-grid mb-8">
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="flex justify-between items-start">
            <p className="label-sm">Citas para Hoy</p>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>today</span>
          </div>
          <h3 className="display-md" style={{ marginTop: '0.5rem' }}>{stats.today}</h3>
          <p className="body-md" style={{ color: 'var(--emerald-400)', fontSize: '0.75rem', fontWeight: 600 }}>
            +{stats.newToday} nuevas agendadas hoy
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--tertiary)' }}>
          <div className="flex justify-between items-start">
            <p className="label-sm">Por Confirmar</p>
            <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)' }}>pending_actions</span>
          </div>
          <h3 className="display-md" style={{ marginTop: '0.5rem' }}>{stats.pending}</h3>
          <p className="body-md" style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>Requieren atención del Bot/Admin</p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--emerald-400)' }}>
          <div className="flex justify-between items-start">
            <p className="label-sm">Tasa de Asistencia</p>
            <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)' }}>check_circle</span>
          </div>
          <h3 className="display-md" style={{ marginTop: '0.5rem' }}>{stats.attendance}%</h3>
          <p className="body-md" style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>Eficiencia de recordatorios WhatsApp</p>
        </div>
      </div>

      {/* Tabs de Filtro */}
      <div className="flex gap-4 mb-6" style={{ borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '1rem' }}>
        {['Hoy', 'Pendientes', 'Completadas', 'Historial'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: activeTab === tab ? 'var(--primary)' : 'var(--secondary)',
              backgroundColor: activeTab === tab ? 'rgba(255, 90, 31, 0.1)' : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List / Agenda */}
      <div className="flex flex-col gap-4">
        {filteredBookings.length === 0 ? (
          <div className="card" style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>calendar_today</span>
            <p className="title-md mt-4">No hay citas registradas en esta sección.</p>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div key={b.id} className="card" style={{ 
              display: 'grid', 
              gridTemplateColumns: '120px 2fr 1.5fr 1fr 1fr', 
              alignItems: 'center',
              gap: '1.5rem',
              padding: '1.25rem 2rem',
              borderLeft: b.status === 'Confirmado' ? '4px solid var(--emerald-400)' : (b.status === 'Pendiente' ? '4px solid var(--tertiary)' : '1px solid var(--card-border)')
            }}>
              {/* Time Slot */}
              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>{b.time}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', textTransform: 'capitalize', margin: 0 }}>{b.date}</p>
              </div>

              {/* Customer Info */}
              <div className="flex items-center gap-3">
                <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '12px' }}>
                  {b.customer?.name?.[0] || 'W'}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{b.customer?.name || 'Cliente WhatsApp'}</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--secondary)' }}>{b.customer?.phone_number || b.customer?.phone}</p>
                </div>
              </div>

              {/* Service Info */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>settings_suggest</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.service_name || 'Servicio Agendado'}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--secondary)' }}>{b.guest_count > 1 ? `${b.guest_count} asistentes` : 'Sesión individual'}</p>
              </div>

              {/* Status Badge */}
              <div>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.65rem', 
                  fontWeight: 900, 
                  letterSpacing: '0.5px',
                  backgroundColor: b.status === 'Confirmado' ? 'rgba(16, 185, 129, 0.1)' : (b.status === 'Pendiente' ? 'rgba(245, 158, 11, 0.1)' : 'var(--surface-container-highest)'),
                  color: b.status === 'Confirmado' ? 'var(--emerald-400)' : (b.status === 'Pendiente' ? 'var(--tertiary)' : 'var(--secondary)'),
                  textTransform: 'uppercase'
                }}>
                  {b.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                {b.status === 'Pendiente' && (
                  <button onClick={() => handleStatusChange(b.id, 'Confirmado')} className="icon-btn" style={{ color: 'var(--emerald-400)' }}>
                    <span className="material-symbols-outlined">check_circle</span>
                  </button>
                )}
                <button className="icon-btn" style={{ color: 'var(--secondary)' }}>
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
