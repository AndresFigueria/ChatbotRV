import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export default function Menu() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [reservationsCount, setReservationsCount] = useState(0); 
  const [reservationsList, setReservationsList] = useState<any[]>([]); // NUEVO: Lista de reservas
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // NUEVO: Estado del modal calendario
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '', 
    name: '',
    category: 'Hamburguesas',
    price: '',
    cost: '', // NUEVO: Costo
    upsell: '', // NUEVO: Upsell sugerido
    modifiers: false, // NUEVO: Permite extras
    keywords: '', 
    img: ''
  });

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('sales_30d', { ascending: false });

    if (error) {
      console.error('Error fetching menu:', error);
    } else if (data) {
      const mapped = data.map((item: any) => ({
        id: item.item_code,
        name: item.name,
        category: item.category,
        price: `$${Number(item.price).toFixed(2)}`,
        rawPrice: item.price,
        cost: item.cost_price || 0,
        upsell: item.upsell_item_code || '',
        modifiers: item.has_modifiers || false,
        stock: item.stock_status,
        keywords: item.keywords || [],
        sales30d: item.sales_30d,
        img: item.img_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400',
        available: item.is_available
      }));
      setMenuItems(mapped);
    }

    // NUEVO: Consultar total de reservas pendientes para el panel y la agenda
    const { data: resData, count: resCount } = await supabase
      .from('reservations')
      .select(`
        *,
        customer:customers (name, phone_number)
      `, { count: 'exact', head: false })
      .eq('status', 'Pendiente')
      .order('reservation_time', { ascending: true });
    
    if (resData) {
      setReservationsList(resData);
    }
    setReservationsCount(resCount || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const categories = ['Todos', 'Hamburguesas', 'Pizzas', 'Tacos', 'Sushi', 'Postres', 'Bebidas', 'Acompañantes'];

  const filteredMenu = menuItems.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(searchLower) || 
                          m.keywords.some((k: string) => k.toLowerCase().includes(searchLower));
    const matchesTab = activeCategory === 'Todos' || m.category === activeCategory;
    return matchesSearch && matchesTab;
  });

  const topProduct = menuItems.length > 0 ? [...menuItems].sort((a,b) => b.sales30d - a.sales30d)[0] : null;

  const handleToggle = async (id: string, currentAvailable: boolean) => {
    const { error } = await supabase.from('menu_items').update({ 
      is_available: !currentAvailable,
      stock_status: !currentAvailable ? 'Disponible' : 'Agotado'
    }).eq('item_code', id);
    if (!error) fetchMenu();
  };

  const openNewItem = () => {
    setFormData({ id: '', name: '', category: 'Hamburguesas', price: '', cost: '', upsell: '', modifiers: false, keywords: '', img: '' });
    setIsModalOpen(true);
  };

  const openEditItem = (item: any) => {
    setFormData({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.rawPrice,
      cost: item.cost,
      upsell: item.upsell,
      modifiers: item.modifiers,
      keywords: item.keywords.join(', '),
      img: item.img
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemCode = formData.id || 'P-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const payload: any = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      cost_price: Number(formData.cost) || 0,
      upsell_item_code: formData.upsell || null,
      has_modifiers: formData.modifiers,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k !== ''),
    };
    if (formData.img) payload.img_url = formData.img;

    if (formData.id) {
      const { error } = await supabase.from('menu_items').update(payload).eq('item_code', formData.id);
      if (error) alert("Error actualizando: " + error.message);
    } else {
      payload.item_code = itemCode;
      payload.is_available = true;
      payload.stock_status = 'Disponible';
      payload.sales_30d = 0;
      const { error } = await supabase.from('menu_items').insert(payload);
      if (error) alert("Error creando: " + error.message);
    }
    setIsModalOpen(false);
    fetchMenu();
  };

  if (loading && menuItems.length === 0) return <div className="p-8 text-center text-secondary">Cargando Catálogo Maestro...</div>;

  return (
    <div className="p-8">
      {/* Header Premium */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="display-sm" style={{ fontWeight: 800 }}>Inventario & Inteligencia Comercial</h2>
          <p className="body-md" style={{ color: 'var(--secondary)' }}>Gestión de productos, márgenes de ganancia y reglas de upsell IA.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsCalendarOpen(true)} className="btn-secondary" style={{ height: '44px', padding: '0 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
             <span className="material-symbols-outlined">calendar_month</span> Agenda de Reservas
          </button>
          <button onClick={openNewItem} className="btn-primary" style={{ height: '44px', padding: '0 1.5rem', borderRadius: '8px', boxShadow: '0 4px 14px rgba(255, 90, 31, 0.2)' }}>
             + Nuevo Producto
          </button>
        </div>
      </div>

      {/* METRICS GRID OPERATIVO (Enfoque Trabajador) */}
      <div className="metrics-grid mb-8">
        {/* 1. Estado del Catálogo (Activos / Total) */}
        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <p className="label-sm">Platos Activos</p>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>inventory_2</span>
          </div>
          <h3 className="display-md" style={{ fontSize: '1.8rem', color: menuItems.filter(m => m.available).length === menuItems.length ? 'var(--emerald-400)' : 'var(--on-surface)' }}>
             {menuItems.filter(m => m.available).length} <span style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>/ {menuItems.length}</span>
          </h3>
          <p className="body-md" style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Listos para la venta</p>
        </div>

        {/* 2. Reservas IA (Reemplaza a Agotados) */}
        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <p className="label-sm">Reservas Activas</p>
            <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)' }}>event_seat</span>
          </div>
          <h3 className="display-md" style={{ fontSize: '1.8rem', color: reservationsCount > 0 ? 'var(--tertiary)' : 'var(--on-surface)' }}>
             {reservationsCount}
          </h3>
          <p className="body-md" style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
             Asignadas por Robotina
          </p>
        </div>

        {/* 3. Salud del Bot (Sin Keywords) */}
        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <p className="label-sm">Alerta de Config. (IA)</p>
            <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)' }}>warning</span>
          </div>
          <h3 className="display-md" style={{ fontSize: '1.8rem', color: menuItems.filter(m => m.keywords.length === 0).length > 0 ? 'var(--tertiary)' : 'var(--emerald-400)' }}>
             {menuItems.filter(m => m.keywords.length === 0).length}
          </h3>
          <p className="body-md" style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
             {menuItems.filter(m => m.keywords.length === 0).length > 0 ? 'Platos invisibles para el bot' : 'Catálogo 100% optimizado'}
          </p>
        </div>

        {/* 4. TARJETA DE TOP RENDIMIENTO CON IMAGEN AJUSTADA */}
        <div className="card" style={{ border: '1px solid var(--primary-dim)' }}>
          <div className="flex justify-between items-start mb-2">
            <p className="label-sm" style={{ color: 'var(--primary)' }}>Plato Estrella</p>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>trending_up</span>
          </div>
          {topProduct ? (
            <div className="flex items-center gap-3 mt-1">
              <img src={topProduct.img} alt={topProduct.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontWeight: 800, fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topProduct.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', margin: 0 }}>{topProduct.sales30d} ventas (30d)</p>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--secondary)' }}>Sin datos</p>
          )}
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', backgroundColor: 'var(--surface-container-low)', borderRadius: '12px' }}>
         <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-2 flex-wrap">
               {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: activeCategory === cat ? 'var(--primary)' : 'var(--surface-container-highest)', color: activeCategory === cat ? '#fff' : 'var(--on-surface)' }}>
                     {cat}
                  </button>
               ))}
            </div>
            <div style={{ position: 'relative', width: '280px' }}>
               <input type="text" placeholder="Buscar por nombre o keyword..." className="input-base" style={{ width: '100%', borderRadius: '8px', paddingLeft: '2.5rem', height: '40px', backgroundColor: 'var(--surface-bright)' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
               <span className="material-symbols-outlined absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: '1.2rem' }}>search</span>
            </div>
         </div>
      </div>

      {/* CATÁLOGO DE PRODUCTOS (PRO) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
         {filteredMenu.map(item => {
            const profit = item.rawPrice - item.cost;
            const margin = item.rawPrice > 0 ? Math.round((profit / item.rawPrice) * 100) : 0;
            const upsellObj = menuItems.find(m => m.id === item.upsell);

            return (
               <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', transition: 'all 0.2s', opacity: item.available ? 1 : 0.6, borderLeft: item.upsell ? '3px solid var(--tertiary)' : '1px solid var(--surface-container-highest)' }}>
                  <img src={item.img} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                     <div className="flex justify-between items-start">
                       <div>
                         <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>{item.category}</span>
                         <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0.1rem 0 0.25rem 0', color: 'var(--on-surface)' }}>{item.name}</h4>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, display: 'block' }}>{item.price}</span>
                          {/* Margen de ganancia */}
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: margin > 50 ? 'var(--emerald-400)' : 'var(--tertiary)' }}>{margin}% Mg.</span>
                       </div>
                     </div>
                     
                     {/* Tags de Inteligencia (Upsell / Modificadores) */}
                     <div className="flex gap-1 mt-1 mb-2">
                        {item.modifiers && <span style={{ fontSize: '0.6rem', padding: '2px 6px', backgroundColor: 'var(--surface-container-highest)', borderRadius: '4px', color: 'var(--on-surface)' }}>Acepta Extras</span>}
                        {upsellObj && <span style={{ fontSize: '0.6rem', padding: '2px 6px', backgroundColor: 'var(--tertiary)', color: '#fff', borderRadius: '4px' }}>Upsell: {upsellObj.name}</span>}
                     </div>

                     <div className="flex justify-between items-center border-top" style={{ borderTop: '1px solid var(--surface-container-highest)', paddingTop: '0.5rem', marginTop: 'auto' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', margin: 0 }}>{item.sales30d} vendidos</p>
                        
                        <div className="flex gap-2">
                           <button onClick={() => openEditItem(item)} className="icon-btn" style={{ padding: '0.2rem' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>edit</span>
                           </button>
                           <div onClick={() => handleToggle(item.id, item.available)} style={{ width: '36px', height: '20px', borderRadius: '10px', backgroundColor: item.available ? 'var(--primary)' : 'var(--surface-container-highest)', display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer', justifyContent: item.available ? 'flex-end' : 'flex-start' }}>
                              <div style={{ width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )
         })}
      </div>

      {/* MODAL CONFIGURACIÓN PRO */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', backgroundColor: 'var(--surface-bright)', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="display-sm mb-6" style={{ fontWeight: 800 }}>{formData.id ? 'Editar Producto IA' : 'Nuevo Producto IA'}</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
               {/* 1. Datos Básicos */}
               <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.5rem' }}>1. DATOS BÁSICOS</h4>
               <div className="flex gap-4">
                  <div className="flex flex-col gap-1" style={{ flex: 2 }}>
                     <label className="label-sm">Nombre del Plato *</label>
                     <input required className="input-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1" style={{ flex: 1 }}>
                     <label className="label-sm">Categoría *</label>
                     <select className="input-base" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
               </div>

               {/* 2. Finanzas */}
               <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.5rem', marginTop: '1rem' }}>2. ESTRUCTURA FINANCIERA</h4>
               <div className="flex gap-4">
                  <div className="flex flex-col gap-1" style={{ flex: 1 }}>
                     <label className="label-sm">Precio de Venta ($) *</label>
                     <input required type="number" step="0.01" className="input-base" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1" style={{ flex: 1 }}>
                     <label className="label-sm">Costo Real ($)</label>
                     <input type="number" step="0.01" className="input-base" placeholder="Ej: 3.50" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1" style={{ flex: 1, backgroundColor: 'var(--surface-container-low)', padding: '0.5rem', borderRadius: '8px', justifyContent: 'center', alignItems: 'center' }}>
                     <label className="label-sm">Margen Bruto</label>
                     <span style={{ fontWeight: 800, color: 'var(--emerald-400)', fontSize: '1.2rem' }}>
                        {Number(formData.price) > 0 ? Math.round(((Number(formData.price) - Number(formData.cost)) / Number(formData.price)) * 100) : 0}%
                     </span>
                  </div>
               </div>

               {/* 3. Inteligencia Artificial y Reglas */}
               <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.5rem', marginTop: '1rem' }}>3. REGLAS PARA EL BOT (IA)</h4>
               
               <div className="flex gap-4 items-end">
                  <div className="flex flex-col gap-1" style={{ flex: 2 }}>
                     <label className="label-sm">Sugerencia de Upsell (Venta Cruzada)</label>
                     <select className="input-base" value={formData.upsell} onChange={e => setFormData({...formData, upsell: e.target.value})}>
                        <option value="">Ninguna sugerencia</option>
                        {menuItems.filter(m => m.id !== formData.id).map(m => (
                           <option key={m.id} value={m.id}>Ofrecer: {m.name} ({m.price})</option>
                        ))}
                     </select>
                     <span style={{ fontSize: '0.65rem', color: 'var(--secondary)' }}>El bot ofrecerá esto automáticamente.</span>
                  </div>
                  <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                        <input type="checkbox" checked={formData.modifiers} onChange={e => setFormData({...formData, modifiers: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                        Acepta Extras / Cambios
                     </label>
                  </div>
               </div>

               <div className="flex flex-col gap-1">
                  <label className="label-sm">Keywords (bot)</label>
                  <input className="input-base" placeholder="carne, doble, hamburguesa..." value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} />
               </div>
               
               <div className="flex flex-col gap-1 mt-2">
                  <label className="label-sm">URL Imagen (Cuadrada recomendada)</label>
                  <input className="input-base" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} />
               </div>

               <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar Plato</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CALENDARIO DE RESERVAS */}
      {isCalendarOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', backgroundColor: 'var(--surface-bright)', borderRadius: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-6">
               <h3 className="display-sm" style={{ fontWeight: 800 }}>Agenda de Reservas</h3>
               <button onClick={() => setIsCalendarOpen(false)} className="icon-btn" style={{ padding: '0.5rem', backgroundColor: 'var(--surface-container-highest)', borderRadius: '50%' }}>
                  <span className="material-symbols-outlined">close</span>
               </button>
            </div>
            
            {reservationsList.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--secondary)', backgroundColor: 'var(--surface-container-low)', borderRadius: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }}>event_available</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>El calendario está libre.</p>
                  <p style={{ fontSize: '0.85rem' }}>Las reservas tomadas por Robotina aparecerán aquí automáticamente.</p>
               </div>
            ) : (
               <div className="flex flex-col gap-3">
                  {reservationsList.map((res) => {
                     const dateObj = new Date(res.reservation_time);
                     return (
                        <div key={res.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--surface-container-highest)', borderRadius: '16px', backgroundColor: 'var(--surface-container-low)' }}>
                           <div style={{ backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '0.5rem 1rem', borderRadius: '12px', textAlign: 'center', minWidth: '85px' }}>
                              <p style={{ fontSize: '0.75rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{dateObj.toLocaleDateString('es-ES', { month: 'short' })}</p>
                              <p style={{ fontSize: '1.8rem', fontWeight: 900, margin: '-4px 0' }}>{dateObj.getDate()}</p>
                           </div>
                           <div style={{ flex: 1 }}>
                              <h4 style={{ fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>{res.customer?.name || 'Cliente WhatsApp'}</h4>
                              <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                 <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat</span> {res.customer?.phone_number || 'Sin número'}
                              </p>
                           </div>
                           <div style={{ textAlign: 'right' }}>
                              <p style={{ fontWeight: 900, margin: 0, fontSize: '1.2rem', color: 'var(--on-surface)' }}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              <p style={{ color: 'var(--tertiary)', fontSize: '0.85rem', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
                                 <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>group</span> {res.guest_count} Personas
                              </p>
                           </div>
                        </div>
                     )
                  })}
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
