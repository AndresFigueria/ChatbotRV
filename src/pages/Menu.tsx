import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export default function Menu() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '', 
    name: '',
    category: 'Principales',
    price: '',
    keywords: '', 
    img: ''
  });

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching menu:', error);
    } else if (data) {
      const mapped = data.map((item: any) => ({
        id: item.item_code,
        name: item.name,
        category: item.category,
        price: `$${Number(item.price).toFixed(2)}`,
        rawPrice: item.price,
        stock: item.stock_status,
        keywords: item.keywords || [],
        sales30d: item.sales_30d,
        img: item.img_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=200&h=200&fit=crop',
        available: item.is_available
      }));
      setMenuItems(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const categories = ['Todos', 'Principales', 'Combos', 'Bebidas', 'Postres'];

  const filteredMenu = menuItems.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(searchLower) || 
                          m.keywords.some((k: string) => k.toLowerCase().includes(searchLower));
    const matchesTab = activeCategory === 'Todos' || m.category === activeCategory;
    return matchesSearch && matchesTab;
  });

  const handleToggle = async (id: string, currentAvailable: boolean) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ 
        is_available: !currentAvailable,
        stock_status: !currentAvailable ? 'Disponible' : 'Agotado'
      })
      .eq('item_code', id);
    if (!error) {
      fetchMenu();
    }
  };

  const openNewItem = () => {
    setFormData({ id: '', name: '', category: 'Principales', price: '', keywords: '', img: '' });
    setIsModalOpen(true);
  };

  const openEditItem = (item: any) => {
    setFormData({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.rawPrice,
      keywords: item.keywords.join(', '),
      img: item.img // In a real app we might allow null, but here we enforce strings
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemCode = formData.id || 'P-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const kwArray = formData.keywords.split(',').map(k => k.trim()).filter(k => k !== '');

    const payload: any = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      keywords: kwArray,
    };

    if (formData.img && formData.img.startsWith('http')) {
      payload.img_url = formData.img;
    }

    if (formData.id) {
      // Update
      const { error } = await supabase.from('menu_items').update(payload).eq('item_code', formData.id);
      if (error) alert("Error: " + error.message);
    } else {
      // Insert
      payload.item_code = itemCode;
      payload.is_available = true;
      payload.stock_status = 'Disponible';
      payload.sales_30d = 0;
      
      const { error } = await supabase.from('menu_items').insert(payload);
      if (error) alert("Error: " + error.message);
    }
    
    setIsModalOpen(false);
    fetchMenu();
  };


  if (loading && menuItems.length === 0) {
    return (
      <div className="p-8 flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <p className="body-md" style={{ color: 'var(--secondary)' }}>Obteniendo menú desde Supabase...</p>
      </div>
    );
  }

  return (
    <div className="p-8 relative">
      {/* Header Section */}
      <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="display-md">Ingeniería de Menú</h2>
          <p className="body-md" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
            Gestiona tu catálogo, disponibilidad y palabras clave para el Bot de IA.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>category</span>
            Categorías
          </button>
          <button onClick={openNewItem} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>add_circle</span>
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="metrics-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          { label: 'Productos Activos', value: menuItems.filter(m => m.available).length.toString(), change: 'En el catálogo web y chat', icon: 'restaurant_menu', highlight: false },
          { label: 'Agotados (Out of Stock)', value: menuItems.filter(m => !m.available).length.toString(), change: 'Apagados temporalmente', icon: 'remove_shopping_cart', highlight: menuItems.filter(m => !m.available).length > 0 },
          { label: 'Top Ventas Bot', value: menuItems.length > 0 ? [...menuItems].sort((a,b)=>b.sales30d - a.sales30d)[0].name : 'N/A', change: 'Más popular del catálogo', icon: 'local_fire_department', highlight: false },
          { label: 'Tasa de Éxito', value: '88%', change: 'Pedidos validados por bot', icon: 'trending_up', highlight: false },
        ].map((m, i) => (
          <div key={i} className="card" style={m.highlight ? { border: '1px solid var(--error-dim)', background: 'linear-gradient(145deg, var(--surface-container), rgba(239, 68, 68, 0.05))' } : {}}>
            <div className="flex justify-between items-start" style={{ marginBottom: '0.5rem' }}>
              <p className="label-sm">{m.label}</p>
              <span className="material-symbols-outlined" style={{ color: m.highlight ? 'var(--error)' : 'var(--primary)' }}>{m.icon}</span>
            </div>
            <h3 className="display-md" style={{ color: m.highlight ? 'var(--error)' : 'var(--on-surface)', marginBottom: '0.25rem', fontSize: '1.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.value}</h3>
            <p className="body-md" style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>{m.change}</p>
          </div>
        ))}
      </div>

      {/* Main Content: Filtros y Cuadrícula de Menú */}
      <div className="orders-table-wrapper" style={{ padding: '0', overflowX: 'visible' }}>
        <div style={{ padding: '1.5rem', borderBottom: 'var(--table-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-container-low)', flexWrap: 'wrap', gap: '1rem', borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem' }}>
          
          {/* Tabs Categorias */}
          <div className="flex gap-2" style={{ overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                style={{ 
                  borderRadius: '2rem', padding: '0.4rem 1rem', fontSize: '0.75rem', fontWeight: 600,
                  backgroundColor: activeCategory === cat ? 'var(--primary)' : 'var(--surface-container-highest)',
                  color: activeCategory === cat ? 'var(--on-primary)' : 'var(--on-surface)',
                  transition: 'background 0.2s', border: 'none', cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.25rem', color: 'var(--secondary)' }}>search</span>
            <input 
              type="text" 
              placeholder="Buscar platillo o keyword..." 
              className="input-base" 
              style={{ width: '100%', minWidth: '280px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredMenu.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--secondary)' }}>
              No se encontraron platillos o keywords coincidiendo con tu búsqueda.
            </div>
          )}
          {filteredMenu.map((item) => (
            <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', opacity: item.available ? 1 : 0.65, border: item.available ? '1px solid transparent' : '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div className="flex gap-3">
                {/* Imagen Cuadrada con gradiente/blur si está agotado */}
                <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '0.5rem', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: item.available ? 'none' : 'grayscale(100%) opacity(0.5)' }} />
                  {!item.available && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                      <span className="material-symbols-outlined" style={{ color: '#fff' }}>block</span>
                    </div>
                  )}
                </div>
                
                {/* Textos del platillo */}
                <div className="flex flex-col flex-1 justify-center">
                  <div className="flex justify-between items-start">
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', backgroundColor: 'var(--surface-container-highest)', borderRadius: '4px', color: 'var(--on-surface)' }}>{item.category}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{item.price}</span>
                  </div>
                  <h4 style={{ fontWeight: 600, color: item.available ? 'var(--on-surface)' : 'var(--secondary)', lineHeight: '1.2', marginTop: '0.4rem', fontSize: '0.95rem' }}>
                    {item.name}
                  </h4>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: item.available ? 'var(--emerald-400)' : 'var(--error)' }}>
                    {item.stock}
                  </div>
                </div>
              </div>
              
              <div style={{ borderTop: 'var(--table-border)', paddingTop: '0.75rem', paddingBottom: '0.25rem' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.8rem' }}>smart_toy</span> Keywords del Bot:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {item.keywords.length === 0 && <span style={{ fontSize: '0.65rem', color: 'var(--error)' }}>Sin keywords asignadas</span>}
                  {item.keywords.map((kw: string) => (
                    <span key={kw} style={{ padding: '0.15rem 0.5rem', backgroundColor: 'var(--surface-container-highest)', borderRadius: '4px', fontSize: '0.65rem', color: 'var(--on-surface)' }}>
                      "{kw}"
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 500 }}>
                  <strong style={{ color: 'var(--on-surface)' }}>{item.sales30d}</strong> vendidos
                </div>
                {/* Acciones */}
                <div className="flex gap-3 items-center">
                  <button onClick={() => openEditItem(item)} className="icon-btn" title="Editar Platillo" style={{ padding: '0.25rem', color: 'var(--secondary)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span>
                  </button>
                  {/* Botón Switch visual de activado/desactivado */}
                  <div 
                    onClick={() => handleToggle(item.id, item.available)}
                    title={item.available ? "Desactivar Producto" : "Activar Producto"}
                    style={{ 
                      width: '36px', height: '20px', borderRadius: '1rem', 
                      backgroundColor: item.available ? 'var(--emerald-400)' : 'var(--surface-container-highest)',
                      display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer',
                      justifyContent: item.available ? 'flex-end' : 'flex-start', transition: 'all 0.3s ease'
                    }}>
                    <div style={{ width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL PARA CREAR / EDITAR PRODUCTO */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', backgroundColor: 'var(--surface-bright)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h3 className="display-md" style={{ fontSize: '1.5rem' }}>{formData.id ? 'Editar Platillo' : 'Nuevo Platillo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="icon-btn" style={{ padding: '0.2rem' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre del Producto *</label>
                <input required type="text" className="input-base" style={{ width: '100%', paddingLeft: '1rem' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Hamburguesa Doble" />
              </div>

              <div className="flex gap-4">
                <div style={{ flex: 1 }}>
                  <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Categoría</label>
                  <select className="input-base" style={{ width: '100%', paddingLeft: '1rem', appearance: 'none', backgroundColor: 'var(--surface-container-low)' }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Principales">Principales</option>
                    <option value="Combos">Combos</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Postres">Postres</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Precio ($) *</label>
                  <input required min="0" step="0.01" type="number" className="input-base" style={{ width: '100%', paddingLeft: '1rem' }} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Ej. 12.50" />
                </div>
              </div>

              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Keywords (Para el Bot de WhatsApp)</label>
                <input type="text" className="input-base" style={{ width: '100%', paddingLeft: '1rem' }} value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} placeholder="Separa por comas: hamburguesa, doble, promo" />
                <p style={{ fontSize: '0.65rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>Las palabras que el cliente podría escribir en WhatsApp para buscar este plato.</p>
              </div>

              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>URL de Fotografía (Opcional)</label>
                <input type="url" className="input-base" style={{ width: '100%', paddingLeft: '1rem' }} value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} placeholder="https://ejemplo.com/foto.jpg" />
                {formData.img && formData.img.startsWith('http') && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <img src={formData.img} alt="Vista previa" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--emerald-400)' }}>Vista previa cargada</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3" style={{ marginTop: '1rem', borderTop: 'var(--table-border)', paddingTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem', boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)' }}>{formData.id ? 'Guardar Cambios' : 'Crear Producto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
