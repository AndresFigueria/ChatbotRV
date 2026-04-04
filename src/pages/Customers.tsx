import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Todos');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    status: 'Nuevo',
    favorite_dish: '',
    dietary_notes: ''
  });

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
    } else if (data) {
      const mapped = data.map((c: any) => ({
        id: c.customer_code,
        name: c.name,
        phone: c.phone,
        ltv: `$${Number(c.ltv).toFixed(2)}`,
        ordersCount: c.orders_count,
        aov: `$${Number(c.aov).toFixed(2)}`,
        favoriteDish: c.favorite_dish,
        dietary: c.dietary_notes,
        lastOrder: c.last_order ? new Date(c.last_order).toLocaleDateString() : 'hace 2 días',
        lastRating: c.last_rating,
        status: c.status,
        statusClass: c.status === 'VIP' ? 'bg-primary' : (c.status === 'En Riesgo' ? 'bg-error' : (c.status === 'Nuevo' ? 'bg-emerald-400' : 'bg-tertiary')),
        whatsappOptIn: c.whatsapp_opt_in,
        churnRisk: 'Bajo'
      }));
      setCustomers(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const renderStars = (rating: number | null) => {
    if (!rating) return <span style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>Pendiente</span>;
    return (
      <div className="flex gap-1" style={{ marginTop: '0.2rem' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: i < rating ? '#FFB800' : 'var(--surface-container-high)' }}>
            star
          </span>
        ))}
      </div>
    );
  };

  const filteredCustomers = customers.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(searchLower) || 
                          c.phone.includes(searchLower) || 
                          c.favoriteDish.toLowerCase().includes(searchLower);
    
    const matchesTab = activeTab === 'Todos' || 
                       (activeTab === 'VIPs' && c.status === 'VIP') ||
                       (activeTab === 'Nuevos' && c.status === 'Nuevo') ||
                       (activeTab === 'En Riesgo (Recuperación)' && c.status === 'En Riesgo');
    
    return matchesSearch && matchesTab;
  });

  const openNewCustomer = () => {
    setFormData({ id: '', name: '', phone: '', status: 'Nuevo', favorite_dish: 'Ninguno', dietary_notes: 'Ninguna' });
    setIsModalOpen(true);
  };

  const openEditCustomer = (c: any) => {
    setFormData({
      id: c.id,
      name: c.name,
      phone: c.phone,
      status: c.status,
      favorite_dish: c.favoriteDish || 'Ninguno',
      dietary_notes: c.dietary || 'Ninguna'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      phone: formData.phone,
      status: formData.status,
      favorite_dish: formData.favorite_dish,
      dietary_notes: formData.dietary_notes
    };

    if (formData.id) {
      // Update
      const { error } = await supabase.from('customers').update(payload).eq('customer_code', formData.id);
      if (error) alert("Error actualizando cliente: " + error.message);
    } else {
      // Insert
      const newCode = 'USR-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const { error } = await supabase.from('customers').insert({ ...payload, customer_code: newCode });
      if (error) alert("Error guardando cliente: " + error.message);
    }
    
    setIsModalOpen(false);
    fetchCustomers();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('customers').delete().eq('customer_code', deleteId);
    if (error) {
      alert("No se puede eliminar el cliente porque tiene pedidos asociados. Debes borrar sus pedidos primero.");
    } else {
      fetchCustomers();
    }
    setDeleteId(null);
  };


  if (loading && customers.length === 0) {
    return (
      <div className="p-8 flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <p className="body-md" style={{ color: 'var(--secondary)' }}>Sincronizando con la nube de Supabase...</p>
      </div>
    );
  }

  return (
    <div className="p-8 relative">
      {/* Header Section */}
      <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="display-md">Inteligencia de Clientes (CRM)</h2>
          <p className="body-md" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
            Directorio maestro para fidelización y automatización de marketing.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>campaign</span>
            Difusión Vía Bot
          </button>
          <button onClick={openNewCustomer} className="btn-primary" style={{ boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>person_add</span>
            Añadir Cliente
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="metrics-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          { label: 'Valor Promedio (LTV Global)', value: '$145.20', change: 'En toda tu base de datos', icon: 'diamond', highlight: true },
          { label: 'Ticket Medio (AOV)', value: '$24.50', change: '+2.4% usando upselling', icon: 'receipt_long', highlight: false },
          { label: 'Total Clientes (Base Data)', value: customers.length.toString(), change: 'Perfiles registrados', icon: 'group', highlight: false },
          { label: 'Satisfacción (CSAT)', value: '4.8 / 5', change: 'Calificación automática bot', icon: 'sentiment_satisfied', highlight: false },
        ].map(m => (
          <div key={m.label} className="card" style={m.highlight ? { background: 'linear-gradient(145deg, var(--surface-container), rgba(255, 90, 31, 0.05))', border: '1px solid rgba(255, 90, 31, 0.2)' } : {}}>
            <div className="flex justify-between items-start" style={{ marginBottom: '0.5rem' }}>
              <p className="label-sm">{m.label}</p>
              <span className="material-symbols-outlined" style={{ color: m.highlight ? 'var(--primary)' : 'var(--secondary)' }}>{m.icon}</span>
            </div>
            <h3 className="display-md" style={{ color: m.highlight ? 'var(--primary)' : 'var(--on-surface)', marginBottom: '0.25rem', fontSize: '1.5rem' }}>{m.value}</h3>
            <p className="body-md" style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>{m.change}</p>
          </div>
        ))}
      </div>

      {/* Tab Management */}
      <div className="flex gap-4" style={{ marginBottom: '1.5rem', borderBottom: 'var(--table-border)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {['Todos', 'VIPs', 'Nuevos', 'En Riesgo (Recuperación)'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: 'none', border: 'none', color: activeTab === tab ? 'var(--primary)' : 'var(--secondary)', 
              fontWeight: activeTab === tab ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer', padding: '0.5rem 0',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="orders-table-wrapper">
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(64, 73, 82, 0.1)', display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--surface-container-low)', flexWrap: 'wrap' }}>
          <div className="relative" style={{ flex: 1, minWidth: '280px' }}>
            <span className="material-symbols-outlined absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.25rem', color: 'var(--secondary)' }}>search</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre, teléfono, notas o plato frecuente..." 
              className="input-base" 
              style={{ width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="orders-table">
          <thead>
            <tr>
              <th>Cliente & Categoría</th>
              <th>Contacto Validado</th>
              <th>Inteligencia Culinaria</th>
              <th>Última Visita</th>
              <th style={{ textAlign: 'right' }}>Gestión Maestra</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--secondary)' }}>No se encontraron perfiles con esos datos.</td>
              </tr>
            )}
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} style={{ transition: 'all 0.2s ease', verticalAlign: 'top' }}>
                <td style={{ paddingTop: '1.2rem', paddingBottom: '1.2rem' }}>
                  <div className="flex items-center gap-3">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=random&color=fff&rounded=true&size=150`} alt={customer.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div className="flex flex-col gap-1">
                      <span style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: '0.9rem' }}>{customer.name}</span>
                      <span style={{ padding: '2px 6px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', display: 'inline-flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: `var(--${customer.statusClass.replace('bg-', '')})` }}></div>
                        {customer.status}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={{ paddingTop: '1.2rem', paddingBottom: '1.2rem' }}>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2" style={{ color: 'var(--on-surface)', fontWeight: 500, fontSize: '0.85rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--emerald-400)' }}>chat</span>
                      {customer.phone}
                    </div>
                    {customer.whatsappOptIn ? (
                      <span className="label-sm" style={{ color: 'var(--emerald-400)', fontSize: '0.65rem' }}>Suscrito al Bot</span>
                    ) : (
                      <span className="label-sm" style={{ color: 'var(--error-dim)', fontSize: '0.65rem' }}>No Suscrito</span>
                    )}
                  </div>
                </td>
                <td style={{ paddingTop: '1.2rem', paddingBottom: '1.2rem' }}>
                  <div className="flex flex-col gap-1">
                    <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>
                      {customer.ltv} <span style={{ fontWeight: 400, color: 'var(--secondary)', fontSize: '0.75rem' }}>en {customer.ordersCount} tickets</span>
                    </div>
                    <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '0.8rem' }}>restaurant</span>
                      {customer.favoriteDish}
                    </div>
                    {customer.dietary !== 'Ninguna' && (
                      <div style={{ color: 'var(--tertiary)', fontSize: '0.7rem', display: 'inline-block', backgroundColor: 'var(--surface-container)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', alignSelf: 'flex-start', border: '1px solid var(--surface-container-highest)' }}>
                        ⚠️ Nota: {customer.dietary}
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ paddingTop: '1.2rem', paddingBottom: '1.2rem' }}>
                  <div className="flex flex-col gap-0">
                    <span style={{ fontSize: '0.85rem', color: 'var(--on-surface)' }}>{customer.lastOrder}</span>
                    {renderStars(customer.lastRating)}
                  </div>
                </td>
                
                {/* Nuevas Acciones (Editar y Borrar CRM) */}
                <td style={{ textAlign: 'right', paddingTop: '1.2rem', paddingBottom: '1.2rem' }}>
                  <div className="flex gap-2 justify-end items-center">
                    {/* Botón Editar */}
                    <button 
                      onClick={() => openEditCustomer(customer)}
                      className="icon-btn" 
                      style={{ padding: '0.4rem', backgroundColor: 'var(--surface-container-high)', borderRadius: '8px' }} 
                      title="Actualizar Ficha de Cliente"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--secondary)' }}>edit</span>
                    </button>
                    {/* Botón Borrar */}
                    <button 
                      onClick={() => setDeleteId(customer.id)}
                      className="icon-btn" 
                      style={{ padding: '0.4rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }} 
                      title="Eliminar Cliente del CRM"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--error)' }}>delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--surface-container-low)', borderTop: '1px solid rgba(64, 73, 82, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="label-sm" style={{ letterSpacing: '0' }}>Base de datos: {filteredCustomers.length} perfiles</span>
        </div>
      </div>

      {/* Modal CRUD (Crear y Editar) Cliente */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2rem', backgroundColor: 'var(--surface-bright)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="display-md" style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>{formData.id ? 'Ficha del Cliente' : 'Añadir al CRM'}</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre Completo</label>
                <input required type="text" className="input-base" style={{ width: '100%', paddingLeft: '1rem' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Juan Pérez" />
              </div>
              
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>WhatsApp (Teléfono de Pedidos)</label>
                <input required type="text" className="input-base" style={{ width: '100%', paddingLeft: '1rem', fontFamily: 'monospace' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+593 99 999 9999" />
              </div>

              <div className="flex gap-4">
                <div style={{ flex: 1 }}>
                  <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Nivel de Fidelidad</label>
                  <select className="input-base" style={{ width: '100%', paddingLeft: '1rem', appearance: 'none', backgroundColor: 'var(--surface-container-low)' }} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Nuevo">Nuevo</option>
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="En Riesgo">En Riesgo</option>
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--surface-container-highest)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--tertiary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Notas para Inteligencia Artificial</h4>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Plato Favorito Detectado</label>
                  <input type="text" className="input-base" style={{ width: '100%', paddingLeft: '1rem' }} value={formData.favorite_dish} onChange={e => setFormData({...formData, favorite_dish: e.target.value})} placeholder="Ej. Tacos al Pastor" />
                </div>

                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Restricciones o Notas (Celiaquismo, Alergias)</label>
                  <input type="text" className="input-base" style={{ width: '100%', paddingLeft: '1rem' }} value={formData.dietary_notes} onChange={e => setFormData({...formData, dietary_notes: e.target.value})} placeholder="Ej. Vegano, Sin Cebolla" />
                </div>
              </div>

              <div className="flex gap-3" style={{ marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>Anular</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem', boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)' }}>{formData.id ? 'Guardar Cambios' : 'Crear Perfil'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación Borrar */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '380px', padding: '2rem', textAlign: 'center', backgroundColor: 'var(--surface-bright)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--error)', marginBottom: '1rem' }}>person_remove</span>
            <h3 className="title-md" style={{ marginBottom: '0.5rem', color: 'var(--on-surface)' }}>¿Eliminar este cliente?</h3>
            <p className="body-md" style={{ color: 'var(--secondary)', marginBottom: '2rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Estás a punto de borrar definitivamente este cliente y todo su historial de inteligencia del restaurante. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>Cancelar</button>
              <button 
                onClick={confirmDelete} 
                className="btn-primary" 
                style={{ flex: 1, backgroundColor: 'var(--error)', color: 'white', padding: '0.75rem' }}
              >
                Eliminar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
