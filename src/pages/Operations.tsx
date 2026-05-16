import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function Operations() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/dinner_bell_triangle.ogg');
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnifiedTasks = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['Pendiente', 'Preparando'])
      .order('created_at', { ascending: true });

    const today = new Date().toISOString().split('T')[0];
    const { data: bookings } = await supabase
      .from('reservations')
      .select('*, customer:customers(name)')
      .eq('status', 'Confirmado')
      .eq('reservation_date', today); // Usamos el campo date que n8n también entiende

    const unified: any[] = [];
    
    if (orders) {
      orders.forEach(o => unified.push({ ...o, taskType: 'order', id: o.order_code, time: o.created_at }));
    }
    
    if (bookings) {
      bookings.forEach(b => unified.push({ 
        ...b, 
        taskType: 'booking', 
        id: `CIT-${b.id.slice(0,4).toUpperCase()}`, 
        time: b.combined_time || `${b.reservation_date}T${b.reservation_time}`,
        order_code: `CIT-${b.id.slice(0,4).toUpperCase()}`,
        items_json: [{ name: b.service_name || 'Cita / Consulta', qty: 1 }]
      }));
    }

    unified.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    setTasks(unified);
    setLoading(false);
  };

  useEffect(() => {
    fetchUnifiedTasks();

    const channel = supabase
      .channel('operations-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchUnifiedTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, fetchUnifiedTasks)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handlePrint = (orderId: string) => {
    alert(`GENERANDO TICKET OPERATIVO\n--------------------------\nREF: #${orderId}\n\n[x] Enviando a procesador...`);
  };

  const handleDone = async (task: any) => {
    if (task.taskType === 'order') {
      const newStatus = task.status === 'Pendiente' ? 'Preparando' : 'Listo';
      await supabase.from('orders').update({ status: newStatus }).eq('order_code', task.order_code);
    } else {
      await supabase.from('reservations').update({ status: 'Completado' }).eq('id', task.id.replace('CIT-', ''));
    }
    fetchUnifiedTasks();
  };

  if (loading) return <div className="p-8"><h2 style={{ color: 'var(--on-surface)' }}>Sincronizando Centro de Operaciones...</h2></div>;

  return (
    <div style={{ padding: '2rem', backgroundColor: 'var(--background)', minHeight: 'calc(100vh - 60px)', color: 'var(--on-surface)', transition: 'all 0.3s' }}>
      
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem', borderBottom: '2px solid var(--surface-container-highest)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--on-surface)', margin: 0, letterSpacing: '-1px' }}>CENTRO DE OPERACIONES</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--secondary)', margin: 0 }}>Flujo de trabajo unificado (Ventas + Citas)</p>
        </div>
        <div className="flex gap-4 items-center">
          <div style={{ backgroundColor: 'var(--primary)', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', fontWeight: 800, fontSize: '1.5rem', color: '#fff' }}>
            {tasks.length} TAREAS
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {tasks.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '5rem', textAlign: 'center', backgroundColor: 'var(--surface-container-low)', borderRadius: '1rem', border: '1px dashed var(--outline)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '5rem', color: 'var(--outline)' }}>engineering</span>
            <h2 style={{ color: 'var(--secondary)', marginTop: '1rem', fontSize: '2rem' }}>Todo al día. No hay tareas pendientes.</h2>
          </div>
        ) : (
          tasks.map((task) => {
            const taskDate = new Date(task.time);
            const diffMinutes = Math.floor((now.getTime() - taskDate.getTime()) / 60000);
            const isDelayed = task.taskType === 'order' && diffMinutes >= 15;
            const isBooking = task.taskType === 'booking';

            return (
               <div key={task.id} style={{ 
                  backgroundColor: isBooking ? 'var(--surface-container-high)' : (task.status === 'Pendiente' ? 'var(--surface-container)' : 'rgba(16, 185, 129, 0.05)'), 
                  border: isDelayed ? '2px solid var(--error)' : (isBooking ? '2px solid var(--primary-dim)' : (task.status === 'Pendiente' ? '2px solid var(--outline-variant)' : '2px solid var(--emerald-400)')), 
                  borderRadius: '1rem', 
                  padding: '1.5rem', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: isDelayed ? '0 0 20px rgba(239, 68, 68, 0.1)' : 'var(--shadow-sm)'
               }}>
                 
                 <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
                   <div>
                     <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--on-surface)', margin: 0 }}>{task.order_code}</h2>
                     <div className="flex gap-2 mt-2">
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: isBooking ? 'var(--tertiary)' : 'var(--primary)', textTransform: 'uppercase', padding: '4px 8px', backgroundColor: 'var(--surface-container-highest)', borderRadius: '4px' }}>
                          {isBooking ? 'CITAS / RESERVA' : 'VENTA DIRECTA'}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--on-surface-variant)', textTransform: 'uppercase', padding: '4px 8px', backgroundColor: 'var(--surface-container-low)', borderRadius: '4px' }}>
                          {task.status || 'Confirmada'}
                        </span>
                     </div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                       {taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </div>
                     <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', margin: 0, fontWeight: 700 }}>
                        {isBooking ? 'Hora Agendada' : `Hace ${diffMinutes} min`}
                     </p>
                   </div>
                 </div>

                 <div style={{ backgroundColor: '#fff', color: '#000', padding: '1rem', borderRadius: '0.5rem', fontFamily: '"Courier New", Courier, monospace', fontSize: '1rem', marginBottom: '1.5rem', flex: 1, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' }}>
                   <div style={{ textAlign: 'center', fontWeight: 800, borderBottom: '2px dashed #ccc', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                     {isBooking ? 'ORDEN DE CITA' : 'TICKET DE VENTA'}
                   </div>
                   
                   <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                     {(task.items_json || []).map((item: any, idx: number) => (
                        <li key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                           <span style={{ width: '25px', fontWeight: 900 }}>{item.qty}x</span>
                           <span style={{ flex: 1 }}>{item.name}</span>
                        </li>
                     ))}
                   </ul>
                   
                   {isBooking && task.customer && (
                     <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee', fontSize: '0.85rem' }}>
                        <strong>Cliente:</strong> {task.customer.name}
                     </div>
                   )}
                 </div>

                 <div className="flex gap-3">
                   <button 
                     onClick={() => handlePrint(task.order_code)}
                     style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                   >
                     <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '1.1rem' }}>print</span> TICKET
                   </button>
                   <button 
                     onClick={() => handleDone(task)}
                     style={{ flex: 1, padding: '0.75rem', backgroundColor: isBooking ? 'var(--tertiary)' : (task.status === 'Pendiente' ? 'var(--primary)' : 'var(--emerald-400)'), color: '#fff', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                   >
                     <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '1.1rem' }}>{isBooking ? 'done_all' : 'play_arrow'}</span> 
                     {isBooking ? 'COMPLETAR' : (task.status === 'Pendiente' ? 'EMPEZAR' : 'LISTO')}
                   </button>
                 </div>
               </div>
            )
          })
        )}
      </div>
    </div>
  );
}
