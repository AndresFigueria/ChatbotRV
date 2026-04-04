import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasViewedNotifications, setHasViewedNotifications] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [dismissedOrderIds, setDismissedOrderIds] = useState<string[]>([]);

  // Search state
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{type: string, id: string, label: string, desc: string, path: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode) return savedMode === 'dark';
    return true; // Default to dark mode
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme-mode', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const fetchPending = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'Pendiente')
        .order('created_at', { ascending: false });
      if (data) setPendingOrders(data);
    };
    
    fetchPending();

    const channel = supabase.channel('topbar-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, _payload => {
        fetchPending();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const visibleCount = pendingOrders.filter(o => !dismissedOrderIds.includes(o.id)).length;
    if (visibleCount > prevCount) {
      // Si llegan más notificaciones nuevas, quitamos el estado de "visto" para que vuelva a salir el número.
      setHasViewedNotifications(false);
    }
    setPrevCount(visibleCount);
  }, [pendingOrders.length, dismissedOrderIds, prevCount]);

  const visibleOrders = pendingOrders.filter(o => !dismissedOrderIds.includes(o.id));

  const handleClearAll = () => {
    const allIds = pendingOrders.map(o => o.id);
    setDismissedOrderIds(prev => [...new Set([...prev, ...allIds])]);
    setHasViewedNotifications(true);
  };

  // Global Search Debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (globalSearch.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const query = `%${globalSearch.trim()}%`;
      
      const res: any[] = [];
      
      try {
        // Buscar clientes
        const { data: cData } = await supabase.from('customers').select('*').ilike('name', query).limit(3);
        if (cData) cData.forEach(c => res.push({ type: 'Cliente', id: c.id, label: c.name, desc: c.phone, path: '/customers' }));
        
        // Buscar ordenes
        const { data: oData } = await supabase.from('orders').select('*, customer:customers(name)').ilike('order_code', query).limit(3);
        if (oData) oData.forEach(o => res.push({ type: 'Pedido', id: o.id, label: o.order_code, desc: `Cliente: ${o.customer?.name || 'N/A'}`, path: '/orders' }));
        
        // Buscar menú
        const { data: mData } = await supabase.from('menu_items').select('*').ilike('name', query).limit(3);
        if (mData) mData.forEach(m => res.push({ type: 'Menú', id: m.item_code || m.id, label: m.name, desc: m.category, path: '/menu' }));
        
        setSearchResults(res);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400); 
    
    return () => clearTimeout(timer);
  }, [globalSearch]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleOpenNotifications = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      setHasViewedNotifications(true);
    }
  };

  return (
    <header className="topbar">
      <div className="flex items-center gap-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.25rem', color: 'var(--secondary)' }}>search</span>
          <input 
            type="text" 
            placeholder="Busca pedidos (#), clientes o platos..." 
            className="input-base" 
            style={{ width: '320px' }}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />

          {/* Buscador Global Flotante */}
          {globalSearch.trim().length >= 2 && (
            <div className="card" style={{ position: 'absolute', top: '120%', left: 0, width: '100%', zIndex: 2000, padding: '0.5rem', maxHeight: '400px', overflowY: 'auto', backgroundColor: 'var(--surface-bright)', border: '1px solid var(--card-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
              {isSearching ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite' }}>sync</span> Buscando en la red...
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--secondary)', fontSize: '0.8rem' }}>Sin coincidencias para "{globalSearch}"</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {searchResults.map((res, i) => (
                    <div 
                      key={i} 
                      onClick={() => { setGlobalSearch(''); navigate(res.path); }} 
                      style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px', transition: 'background 0.2s' }} 
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-container-high)'} 
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--on-surface)' }}>{res.label}</span>
                        <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)', fontWeight: 700, textTransform: 'uppercase' }}>{res.type}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>{res.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          style={{ color: 'var(--primary)', position: 'relative' }} 
          className="icon-btn"
          title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        >
          <span className="material-symbols-outlined">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        
        {/* Notificaciones Bell with Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={handleOpenNotifications} 
            style={{ color: 'var(--secondary)', position: 'relative' }} 
            className="icon-btn"
            title="Centro de Alertas"
          >
            <span className="material-symbols-outlined">notifications</span>
            {visibleOrders.length > 0 && (
              <span style={{ 
                position: 'absolute', top: '0', right: '0', 
                backgroundColor: 'var(--error)', color: '#fff', 
                fontSize: '0.6rem', fontWeight: 'bold', 
                width: hasViewedNotifications ? '8px' : '18px', 
                height: hasViewedNotifications ? '8px' : '18px', 
                borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                transition: 'all 0.2s ease'
              }}>
                {!hasViewedNotifications && visibleOrders.length}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="card" style={{ 
              position: 'absolute', top: '130%', right: '-1rem', 
              width: '320px', zIndex: 1000, padding: '1.2rem',
              border: '1px solid var(--card-border)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
              backgroundColor: 'var(--surface-bright)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <h4 style={{ fontWeight: 600, margin: 0, color: 'var(--on-surface)' }}>Alertas Logísticas</h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {visibleOrders.length > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--error)', fontWeight: 'bold', padding: '2px 8px', borderRadius: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>{visibleOrders.length} Por Aceptar</span>}
                  {visibleOrders.length > 0 && (
                    <button onClick={handleClearAll} style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px' }} title="Borrar todas las alertas">
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>clear_all</span>
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                {visibleOrders.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', color: 'var(--secondary)', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '2rem', opacity: 0.5 }}>check_circle</span>
                    <p style={{ fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>Cero pedidos en alerta.</p>
                  </div>
                ) : (
                  visibleOrders.map(o => (
                    <div 
                      key={o.id}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/orders');
                      }}
                      style={{ 
                        padding: '0.75rem', borderRadius: '0.5rem', 
                        backgroundColor: 'var(--surface-container)', 
                        border: '1px solid var(--surface-container-highest)',
                        cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'start', transition: 'background 0.2s' 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container-high)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container)'}
                    >
                      <div style={{ color: 'var(--primary)', marginTop: '2px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>shopping_cart_checkout</span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface)' }}>Pedido de Bot {o.order_code}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>Monto exacto: ${Number(o.total_amount).toFixed(2)}</span>
                      </div>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--error)', marginTop: '6px' }}></div>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/orders');
                }}
                className="btn-secondary" 
                style={{ width: '100%', marginTop: '1rem', fontSize: '0.75rem', padding: '0.6rem' }}
              >
                Ir a Tablero de Órdenes
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
