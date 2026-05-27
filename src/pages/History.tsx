import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const renderFormattedMessage = (text: string) => {
  if (!text) return '';
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={index}>{part.slice(1, -1)}</strong>;
    }
    return part;
  });
};

export default function History() {
  const [activeTab, setActiveTab] = useState('Boletas Electrónicas');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock de Cierres de Caja
  const dailyClosures = [
    { id: 1, date: '2026-05-14', totalSales: 842.50, totalBookings: 12, status: 'Cerrado (Auto)', created_at: '2026-05-14T18:00:00Z' },
    { id: 2, date: '2026-05-13', totalSales: 715.00, totalBookings: 8, status: 'Cerrado (Manual)', created_at: '2026-05-13T17:45:00Z' },
    { id: 3, date: '2026-05-12', totalSales: 920.15, totalBookings: 15, status: 'Cerrado (Auto)', created_at: '2026-05-12T18:00:00Z' },
  ];

  // Mock de Logs del Sistema (Faltaba esto)
  const systemLogs = [
    { id: 1, type: 'bot', action: 'Actualización de Prompts completada', user: 'AI Agent', time: 'Hace 5 min' },
    { id: 2, type: 'admin', action: 'Cambio de horario de apertura', user: 'Andrés (Admin)', time: 'Hace 20 min' },
    { id: 3, type: 'alert', action: 'Falla en conexión Webhook Meta', user: 'System', time: 'Hace 1 hora' },
  ];

  useEffect(() => {
    async function fetchHistoricalOrders() {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers(name, phone_number)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      } else {
        console.error("No se pudo cargar el historial", error);
      }
      setLoading(false);
    }

    fetchHistoricalOrders();
  }, []);

  const filteredOrders = orders.filter(o => 
    o.order_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.customers && o.customers.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    o.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotals = () => {
    const total = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const count = orders.length;
    return { total: `$${total.toFixed(2)}`, count };
  };

  const handleReprint = (code: string) => {
    alert(`Re-imprimiendo Boleta Electrónica Oficial para el Pedido #${code}...\nConectando a impresora térmica EPSON_TM20...`);
  };

  const handleManualClose = () => {
    const confirm = window.confirm('¿Deseas realizar el CIERRE DE DÍA ahora? Se guardará el resumen de ventas y citas actual.');
    if (confirm) {
      alert('Cierre de Día procesado con éxito. El resumen ha sido archivado.');
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center items-center" style={{ minHeight: '50vh' }}>
      <p className="body-md" style={{ color: 'var(--secondary)' }}>Accediendo a la caja fuerte de datos...</p>
    </div>;
  }

  const { total, count } = calculateTotals();

  return (
    <div className="p-8 relative">
      <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="display-md">Archivo y Contabilidad</h2>
          <p className="body-md" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
            Registro exacto e inmutable de boletas emitidas, cierres de día y eventos logísticos.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>cloud_download</span>
            CSV Contable
          </button>
          <button onClick={handleManualClose} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>receipt_long</span>
            Cerrar Día Manual
          </button>
        </div>
      </div>

      {/* Tarjetas de Contabilidad */}
      <div className="metrics-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ background: 'linear-gradient(145deg, var(--surface-container), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div className="flex justify-between items-start" style={{ marginBottom: '0.5rem' }}>
            <p className="label-sm">Total Facturado Histórico</p>
            <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)' }}>account_balance</span>
          </div>
          <h3 className="display-md" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem', fontSize: '1.5rem' }}>{total}</h3>
          <p className="body-md" style={{ color: 'var(--emerald-400)', fontSize: '0.75rem', fontWeight: 600 }}>Toda la Base de Datos</p>
        </div>
        <div className="card">
          <div className="flex justify-between items-start" style={{ marginBottom: '0.5rem' }}>
            <p className="label-sm">Boletas Emitidas</p>
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>receipt</span>
          </div>
          <h3 className="display-md" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem', fontSize: '1.5rem' }}>{count}</h3>
          <p className="body-md" style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>Contabilidad limpia</p>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex gap-4" style={{ marginBottom: '1.5rem', borderBottom: 'var(--table-border)', paddingBottom: '0.5rem' }}>
        {['Boletas Electrónicas', 'Cierres de Caja (Día)', 'Historial WhatsApp (AI)', 'Bitácora del Sistema (Logs)'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: 'none', border: 'none', color: activeTab === tab ? 'var(--primary)' : 'var(--secondary)', 
              fontWeight: activeTab === tab ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer', padding: '0.5rem 0',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* TAB 1: BOLETAS */}
        {activeTab === 'Boletas Electrónicas' && (
          <>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-container-highest)', display: 'flex', gap: '1rem', backgroundColor: 'var(--surface-container-low)' }}>
              <div className="relative" style={{ flex: 1, maxWidth: '400px' }}>
                <span className="material-symbols-outlined absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.25rem', color: 'var(--secondary)' }}>search</span>
                <input 
                  type="text" 
                  placeholder="Buscar boleta # o cliente..." 
                  className="input-base" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="orders-table" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-container-high)' }}>
                    <th>Nro. Documento</th>
                    <th>Fecha y Hora del Timbre</th>
                    <th>Comprador (WhatsApp)</th>
                    <th>Monto Final</th>
                    <th>Estado de Venta</th>
                    <th style={{ textAlign: 'right' }}>Auditoría</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--secondary)' }}>No se encontraron boletas fiscales con ese número.</td>
                    </tr>
                  ) : (
                    filteredOrders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--surface-container-highest)' }}>
                        <td style={{ fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'monospace' }}>
                          #{o.order_code}
                        </td>
                        <td style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                          {new Date(o.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{o.customers ? o.customers.name : 'Venta Anónima'}</span>
                            <span style={{ color: 'var(--secondary)', fontSize: '0.7rem' }}>{o.customers ? o.customers.phone_number : '--'}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          ${Number(o.total_amount).toFixed(2)}
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 600, textTransform: 'uppercase',
                            backgroundColor: o.status === 'Despachado' || o.status === 'Listo' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(238, 172, 108, 0.15)',
                            color: o.status === 'Despachado' || o.status === 'Listo' ? 'var(--emerald-400)' : 'var(--tertiary)'
                          }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => handleReprint(o.order_code)} className="icon-btn" title="Reimprimir Boleta Física" style={{ padding: '0.4rem', backgroundColor: 'var(--surface-container-low)', borderRadius: '8px', marginRight: '0.5rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>print</span>
                          </button>
                          <button className="icon-btn" title="Descargar Factura PDF" style={{ padding: '0.4rem', backgroundColor: 'var(--surface-container-low)', borderRadius: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>picture_as_pdf</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 2: CIERRES DE CAJA */}
        {activeTab === 'Cierres de Caja (Día)' && (
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-bright)' }}>
             <p className="body-md" style={{ color: 'var(--secondary)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
               Resumen histórico de cierres diarios. Cada entrada representa la consolidación final de ventas y servicios prestados.
             </p>

             <div style={{ overflowX: 'auto' }}>
               <table className="orders-table" style={{ margin: 0 }}>
                 <thead>
                   <tr style={{ backgroundColor: 'var(--surface-container-high)' }}>
                     <th>Fecha de Operación</th>
                     <th>Ventas Totales</th>
                     <th>Citas / Servicios</th>
                     <th>Tipo de Cierre</th>
                     <th>Hora de Guardado</th>
                     <th style={{ textAlign: 'right' }}>Acciones</th>
                   </tr>
                 </thead>
                 <tbody>
                   {dailyClosures.map(closure => (
                     <tr key={closure.id} style={{ borderBottom: '1px solid var(--surface-container-highest)' }}>
                       <td style={{ fontWeight: 700, color: 'var(--on-surface)' }}>
                         {new Date(closure.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                       </td>
                       <td style={{ fontWeight: 800, color: 'var(--emerald-400)' }}>
                         ${closure.totalSales.toFixed(2)}
                       </td>
                       <td style={{ fontWeight: 600 }}>
                         {closure.totalBookings} Citas
                       </td>
                       <td>
                         <span style={{ 
                           fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 800,
                           backgroundColor: 'var(--surface-container-highest)', color: 'var(--secondary)'
                         }}>
                           {closure.status}
                         </span>
                       </td>
                       <td style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                         {new Date(closure.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </td>
                       <td style={{ textAlign: 'right' }}>
                          <button className="icon-btn" style={{ padding: '0.4rem', backgroundColor: 'var(--surface-container-low)', borderRadius: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>visibility</span>
                          </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* TAB 3: AUDIT LOGS */}
        {activeTab === 'Bitácora del Sistema (Logs)' && (
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-bright)' }}>
             <p className="body-md" style={{ color: 'var(--secondary)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
               El sistema de cajas negras captura todas las acciones clave realizadas por el Bot IA o los empleados humanos. Si sucede un error administrativo, lo podrás investigar aquí.
             </p>

             <div className="flex flex-col gap-3">
               {systemLogs.map((log: any) => (
                 <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--surface-container-highest)', borderRadius: '0.5rem', backgroundColor: 'var(--surface-container-low)' }}>
                   <div style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', backgroundColor: log.type === 'bot' ? 'rgba(255, 90, 31, 0.1)' : (log.type === 'alert' ? 'rgba(239, 68, 68, 0.1)' : 'var(--surface-container-high)'), color: log.type === 'bot' ? 'var(--primary)' : (log.type === 'alert' ? 'var(--error)' : 'var(--secondary)') }}>
                     <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                       {log.type === 'bot' ? 'smart_toy' : (log.type === 'kitchen' ? 'outdoor_grill' : (log.type === 'alert' ? 'warning' : 'admin_panel_settings'))}
                     </span>
                   </div>
                   
                   <div style={{ flex: 1 }}>
                     <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--on-surface)', fontWeight: 500 }}>{log.action}</p>
                     <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>Usuario: <strong style={{ color: 'var(--on-surface)' }}>{log.user}</strong></p>
                   </div>
                   
                   <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                     {log.time}
                   </div>
                 </div>
               ))}
             </div>
             
             <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
               <button className="btn-secondary" style={{ fontSize: '0.75rem' }}>Cargar logs anteriores</button>
             </div>
          </div>
        )}

        {/* TAB 4: WHATSAPP LOGS (NEW) */}
        {activeTab === 'Historial WhatsApp (AI)' && (
           <WhatsAppLogsTab />
        )}
      </div>
    </div>
  );
}

function WhatsAppLogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from('conversation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (data) setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  if (loading) return <div className="p-8 text-center text-secondary">Cargando bitácora de IA...</div>;

  return (
    <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-bright)' }}>
      <p className="body-md" style={{ color: 'var(--secondary)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
        Registro de interacciones procesadas por Robotina vía n8n. Puedes auditar cada respuesta del bot aquí.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table className="orders-table" style={{ margin: 0 }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-container-high)' }}>
              <th>Fecha/Hora</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Mensaje Recibido</th>
              <th>Respuesta Robotina</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--surface-container-highest)' }}>
                <td style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                  {new Date(log.created_at).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ fontWeight: 700 }}>{log.customer_name || 'N/A'}</td>
                <td style={{ fontSize: '0.85rem' }}>{log.phone}</td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                  {log.inbound_message}
                </td>
                <td style={{ maxWidth: '300px', fontSize: '0.85rem', color: 'var(--primary)', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                   "{renderFormattedMessage(log.agent_response)}"
                </td>
                <td>
                   <span style={{ fontSize: '0.65rem', color: 'var(--emerald-400)', fontWeight: 900 }}>{log.status?.toUpperCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
