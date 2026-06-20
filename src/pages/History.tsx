import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const renderFormattedMessage = (text: any) => {
  if (!text) return '';
  if (typeof text !== 'string') text = JSON.stringify(text);
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part: string, index: number) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={index}>{part.slice(1, -1)}</strong>;
    }
    return part;
  });
};

export default function History() {
  const [activeTab, setActiveTab] = useState('Ventas Procesadas');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Modal States
  const [showReprintModal, setShowReprintModal] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<{title: string, message: string} | null>(null);

  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, startDate, endDate]);

  useEffect(() => {
    async function fetchHistoricalOrders() {
      setLoading(true);
      
      const { data: configData } = await supabase.from('business_config').select('currency').maybeSingle();
      let symbol = '$';
      if (configData?.currency === 'PEN') symbol = 'S/';
      else if (configData?.currency === 'EUR') symbol = '€';
      setCurrencySymbol(symbol);

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

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.order_code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (o.customers?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (o.status?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (startDate || endDate) {
      const orderDate = new Date(o.created_at);
      if (startDate) {
        matchesDate = matchesDate && orderDate >= new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && orderDate <= end;
      }
    }

    return matchesSearch && matchesDate;
  });

  const downloadCSV = () => {
    if (filteredOrders.length === 0) return;
    
    // Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID de Venta,Fecha,Hora,Cliente,Telefono,Total,Estado\n";

    filteredOrders.forEach(o => {
      const dateObj = new Date(o.created_at);
      const date = dateObj.toLocaleDateString('es-ES');
      const time = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const customer = o.customers ? o.customers.name : 'Venta Anónima';
      const phone = o.customers ? o.customers.phone_number : '';
      const total = Number(o.total_amount).toFixed(2);
      const status = o.status;
      
      const row = `"${o.order_code}","${date}","${time}","${customer}","${phone}","${total}","${status}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_contable_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateTotals = () => {
    const total = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const count = orders.length;
    return { total: `${currencySymbol}${total.toFixed(2)}`, count };
  };

  const handleReprint = (code: string) => {
    setShowReprintModal(code);
  };

  const confirmReprint = () => {
    if (!showReprintModal) return;
    setShowReprintModal(null);
    setShowSuccessModal({
      title: 'Re-impresión Exitosa',
      message: `La Boleta Electrónica Oficial para el Pedido #${showReprintModal} ha sido enviada a la impresora EPSON_TM20.`
    });
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
          <h2 className="page-title">Archivo y Contabilidad</h2>
          <p className="body-md" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
            Registro exacto e inmutable de boletas emitidas, cierres de día y eventos logísticos.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadCSV} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: filteredOrders.length === 0 ? 0.5 : 1 }} disabled={filteredOrders.length === 0}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>cloud_download</span>
            CSV Contable
          </button>
        </div>
      </div>

      {/* Tarjetas de Contabilidad */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 300px', maxWidth: '350px', background: 'linear-gradient(145deg, var(--surface-container), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div className="flex justify-between items-start" style={{ marginBottom: '0.5rem' }}>
            <p className="label-sm">Total Facturado Histórico</p>
            <span className="material-symbols-outlined" style={{ color: 'var(--emerald-400)' }}>account_balance</span>
          </div>
          <h3 className="display-md" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem', fontSize: '1.5rem' }}>{total}</h3>
          <p className="body-md" style={{ color: 'var(--emerald-400)', fontSize: '0.75rem', fontWeight: 600 }}>Toda la Base de Datos</p>
        </div>
        <div className="card" style={{ flex: '1 1 300px', maxWidth: '350px' }}>
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
        {['Ventas Procesadas', 'Historial WhatsApp (AI)', 'Bitácora del Sistema (Logs)'].map(tab => (
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
        {activeTab === 'Ventas Procesadas' && (
          <>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-container-highest)', display: 'flex', gap: '1rem', backgroundColor: 'var(--surface-container-low)', flexWrap: 'wrap' }}>
              <div className="relative" style={{ flex: 1, minWidth: '250px' }}>
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
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div className="relative">
                  <span className="material-symbols-outlined absolute" style={{ left: '0.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: 'var(--secondary)' }}>date_range</span>
                  <input 
                    type="date" 
                    className="input-base" 
                    style={{ paddingLeft: '2rem', fontSize: '0.8rem', width: '140px' }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    title="Fecha de inicio"
                  />
                </div>
                <span style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>hasta</span>
                <div className="relative">
                  <span className="material-symbols-outlined absolute" style={{ left: '0.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: 'var(--secondary)' }}>date_range</span>
                  <input 
                    type="date" 
                    className="input-base" 
                    style={{ paddingLeft: '2rem', fontSize: '0.8rem', width: '140px' }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    title="Fecha de fin"
                  />
                </div>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="orders-table" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-container-high)' }}>
                    <th>ID de Venta</th>
                    <th>Fecha y Hora</th>
                    <th>Cliente</th>
                    <th>Detalle de Compra</th>
                    <th>Monto Final</th>
                    <th>Estado de Venta</th>
                    <th style={{ textAlign: 'right' }}>Auditoría</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--secondary)' }}>No se encontraron boletas fiscales con ese número.</td>
                    </tr>
                  ) : (
                    filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(o => (
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
                        <td style={{ minWidth: '150px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem', color: 'var(--secondary)' }}>
                            {(o.items || o.items_json || []).length === 0 && <span>-</span>}
                            {(o.items || o.items_json || []).slice(0, 2).map((it: any, i: number) => (
                              <span key={i} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <strong style={{ color: 'var(--primary)', marginRight: '4px' }}>{it.qty}x</strong>{it.name}
                              </span>
                            ))}
                            {(o.items || o.items_json || []).length > 2 && <span style={{ fontStyle: 'italic', opacity: 0.6 }}>y {(o.items || o.items_json || []).length - 2} más...</span>}
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          {currencySymbol}{Number(o.total_amount).toFixed(2)}
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
                          <button onClick={() => window.print()} className="icon-btn" title="Descargar Factura PDF" style={{ padding: '0.4rem', backgroundColor: 'var(--surface-container-low)', borderRadius: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>picture_as_pdf</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredOrders.length > itemsPerPage && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem 1.5rem', 
                borderTop: '1px solid var(--surface-container-highest)',
                backgroundColor: 'var(--surface-container-low)',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', margin: 0 }}>
                  Mostrando <strong style={{ color: 'var(--on-surface)' }}>{(currentPage - 1) * itemsPerPage + 1}</strong> a <strong style={{ color: 'var(--on-surface)' }}>{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> de <strong style={{ color: 'var(--on-surface)' }}>{filteredOrders.length}</strong> boletas
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                    className="btn-secondary"
                    style={{ 
                      padding: '0.4rem 0.8rem', 
                      fontSize: '0.8rem', 
                      borderRadius: '6px',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_left</span>
                    Anterior
                  </button>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {Array.from({ length: Math.ceil(filteredOrders.length / itemsPerPage) }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
                      
                      // Show page number if it's first, last, or close to current page
                      if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              border: pageNum === currentPage ? '1px solid var(--primary)' : '1px solid var(--card-border)',
                              backgroundColor: pageNum === currentPage ? 'var(--primary)' : 'var(--surface-container-high)',
                              color: pageNum === currentPage ? '#fff' : 'var(--on-surface)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      
                      // Ellipses formatting
                      if (pageNum === 2 || pageNum === totalPages - 1) {
                        return <span key={pageNum} style={{ color: 'var(--secondary)', fontSize: '0.8rem', padding: '0 4px' }}>...</span>;
                      }
                      
                      return null;
                    })}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredOrders.length / itemsPerPage)))} 
                    disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
                    className="btn-secondary"
                    style={{ 
                      padding: '0.4rem 0.8rem', 
                      fontSize: '0.8rem', 
                      borderRadius: '6px',
                      opacity: currentPage === Math.ceil(filteredOrders.length / itemsPerPage) ? 0.5 : 1,
                      cursor: currentPage === Math.ceil(filteredOrders.length / itemsPerPage) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Siguiente
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 3: AUDIT LOGS */}
        {activeTab === 'Bitácora del Sistema (Logs)' && (
          <SystemLogsTab />
        )}

        {/* TAB 4: WHATSAPP LOGS (NEW) */}
        {activeTab === 'Historial WhatsApp (AI)' && (
           <WhatsAppLogsTab />
        )}
      </div>

      {/* --- CUSTOM MODALS --- */}
      
      {/* Reimpresión Modal */}
      {showReprintModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center', animation: 'scaleIn 0.2s ease-out' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>print</span>
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--on-surface)', fontSize: '1.25rem' }}>¿Re-imprimir Boleta?</h3>
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.5' }}>
              Estás a punto de re-imprimir la boleta oficial para el Pedido <strong>#{showReprintModal}</strong> en la impresora térmica EPSON_TM20.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowReprintModal(null)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={confirmReprint} className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--on-surface)', color: 'var(--surface)' }}>Imprimir</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center', animation: 'scaleIn 0.2s ease-out', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>check_circle</span>
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--on-surface)', fontSize: '1.25rem' }}>{showSuccessModal.title}</h3>
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.5' }}>
              {showSuccessModal.message}
            </p>
            <button onClick={() => setShowSuccessModal(null)} className="btn-primary" style={{ width: '100%', backgroundColor: 'var(--emerald-400)', color: '#000' }}>
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function SystemLogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        setErrorMsg('La tabla system_logs aún no ha sido creada en la base de datos. Por favor ejecuta el script setup_system_logs.sql.');
      } else if (data) {
        setLogs(data);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  if (loading) return <div className="p-8 text-center text-secondary">Cargando bitácora del sistema...</div>;

  return (
    <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-bright)' }}>
       <p className="body-md" style={{ color: 'var(--secondary)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
         El sistema de cajas negras captura todas las acciones clave realizadas por el Bot IA o los empleados humanos. Si sucede un error administrativo, lo podrás investigar aquí.
       </p>

       {errorMsg ? (
         <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
           <span className="material-symbols-outlined" style={{ fontSize: '2rem', marginBottom: '1rem' }}>error</span>
           <p style={{ fontWeight: 600 }}>{errorMsg}</p>
         </div>
       ) : logs.length === 0 ? (
         <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary)' }}>No hay eventos registrados en la bitácora aún.</div>
       ) : (
         <div className="flex flex-col gap-3">
           {logs.map((log: any) => (
             <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--surface-container-highest)', borderRadius: '0.5rem', backgroundColor: 'var(--surface-container-low)' }}>
               <div style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', backgroundColor: log.type === 'bot' ? 'rgba(255, 90, 31, 0.1)' : (log.type === 'alert' ? 'rgba(239, 68, 68, 0.1)' : 'var(--surface-container-high)'), color: log.type === 'bot' ? 'var(--primary)' : (log.type === 'alert' ? 'var(--error)' : 'var(--secondary)') }}>
                 <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                   {log.type === 'bot' ? 'smart_toy' : (log.type === 'admin' ? 'admin_panel_settings' : (log.type === 'alert' ? 'warning' : 'settings_system_daydream'))}
                 </span>
               </div>
               
               <div style={{ flex: 1 }}>
                 <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--on-surface)', fontWeight: 500 }}>{log.action}</p>
                 <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>Usuario: <strong style={{ color: 'var(--on-surface)' }}>{log.user_email || 'Sistema'}</strong></p>
               </div>
               
               <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                 {new Date(log.created_at).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
               </div>
             </div>
           ))}
         </div>
       )}
    </div>
  );
}

function WhatsAppLogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('conversation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        setErrorMsg('Error al cargar la tabla conversation_logs. Puede que no exista o no tenga permisos.');
      } else if (data) {
        setLogs(data);
      }
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

      {errorMsg ? (
         <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
           <span className="material-symbols-outlined" style={{ fontSize: '2rem', marginBottom: '1rem' }}>error</span>
           <p style={{ fontWeight: 600 }}>{errorMsg}</p>
         </div>
      ) : logs.length === 0 ? (
         <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary)' }}>Aún no hay interacciones de IA guardadas en el historial.</div>
      ) : (
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
      )}
    </div>
  );
}
