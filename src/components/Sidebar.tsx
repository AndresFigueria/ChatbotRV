import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const navGroups = [
  {
    group: 'Operaciones',
    items: [
      { path: '/', label: 'Monitor Principal', icon: 'grid_view' },
      { path: '/whatsapp', label: 'Canal WhatsApp', icon: 'forum' },
      { path: '/catalog', label: 'Productos y Servicios', icon: 'inventory_2' },
      { path: '/orders', label: 'Gestión de Ventas', icon: 'shopping_bag' },
      { path: '/bookings', label: 'Agenda de Citas', icon: 'calendar_month' },
      { path: '/operations', label: 'Panel de Operaciones', icon: 'engineering' },
      { path: '/customers', label: 'Base de Clientes', icon: 'group' },
      { path: '/notifications', label: 'Centro de Alertas', icon: 'notifications' },
      { path: '/analytics', label: 'Estadísticas IA', icon: 'psychology' },
      { path: '/history', label: 'Historial de Auditoría', icon: 'history' },
    ]
  },
  {
    group: 'Automatización',
    items: [
      { path: '/marketing', label: 'Campañas IA', icon: 'campaign' },
    ]
  },
  {
    group: 'Sistema',
    items: [
      { path: '/settings', label: 'Configuración', icon: 'settings' },
    ]
  }
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const location = useLocation();
  const [panelName, setPanelName] = useState('Robotina Central');
  const [userName] = useState('Senior Admin');
  const [isConnected, setIsConnected] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);

  const fetchUnreadCount = async () => {
    const { data } = await supabase
      .from('whatsapp_chats')
      .select('unread_count')
      .gt('unread_count', 0);
    if (data) {
      const sum = data.reduce((acc, curr) => acc + (curr.unread_count || 0), 0);
      setTotalUnread(sum);
    } else {
      setTotalUnread(0);
    }
  };

  const fetchPendingOrders = async () => {
    let count = 0;
    const { count: ordersCount, error: ordersError } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Pendiente');
    if (!ordersError && ordersCount !== null) count += ordersCount;

    const { count: leadsCount, error: leadsError } = await supabase.from('landing_leads').select('*', { count: 'exact', head: true });
    if (!leadsError && leadsCount !== null) count += leadsCount;

    setPendingOrders(count);
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchPendingOrders();

    const handleUnreadUpdate = () => {
      fetchUnreadCount();
    };

    const handleOrdersUpdate = () => {
      fetchPendingOrders();
    };

    window.addEventListener('unreadUpdated', handleUnreadUpdate);
    window.addEventListener('ordersUpdated', handleOrdersUpdate);

    const channelWhatsapp = supabase.channel('sidebar_unread_chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_chats' }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    const channelOrders = supabase.channel('sidebar_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchPendingOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'landing_leads' }, () => {
        fetchPendingOrders();
      })
      .subscribe();

    return () => {
      window.removeEventListener('unreadUpdated', handleUnreadUpdate);
      window.removeEventListener('ordersUpdated', handleOrdersUpdate);
      supabase.removeChannel(channelWhatsapp);
      supabase.removeChannel(channelOrders);
    };
  }, []);

  useEffect(() => {
    const fetchBusinessName = async () => {
      try {
        const { data, error } = await supabase
          .from('business_config')
          .select('business_name')
          .maybeSingle();
        if (!error && data?.business_name) {
          setPanelName(data.business_name);
        } else {
          const saved = localStorage.getItem('rest-settings');
          if (saved) {
            setPanelName(JSON.parse(saved).restName || 'Robotina Central');
          }
        }
      } catch (err) {
        console.error("Failed to load business name:", err);
      }
    };

    fetchBusinessName();
    window.addEventListener('settingsUpdated', fetchBusinessName);
    
    // Test initial connection and monitor WebSocket realtime health
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('menu_items').select('id').limit(1);
        if (error && error.code !== 'PGRST116') setIsConnected(false);
      } catch (e) {
        setIsConnected(false);
      }
    };
    checkConnection();

    const channel = supabase.channel('system_health_sidebar');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') setIsConnected(true);
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') setIsConnected(false);
    });

    return () => {
      window.removeEventListener('settingsUpdated', fetchBusinessName);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-visible' : 'mobile-hidden'}`}>
      <div className="sidebar-header">
        <div className="flex items-center gap-3">
          <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 48 48" className="robot-logo" style={{ width: '40px', height: '40px' }}>
              {/* Antenna */}
              <line x1="24" y1="14" x2="24" y2="8" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="24" cy="5" r="3" fill="currentColor" />
              {/* Ears */}
              <path d="M 10 21 A 4 4 0 0 0 6 25 L 6 27 A 4 4 0 0 0 10 31" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 38 21 A 4 4 0 0 1 42 25 L 42 27 A 4 4 0 0 1 38 31" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              {/* Head */}
              <rect x="10" y="14" width="28" height="24" rx="6" fill="none" stroke="currentColor" strokeWidth="3.5" />
              {/* Eyes */}
              <circle cx="18" cy="24" r="2.5" fill="currentColor" />
              <circle cx="30" cy="24" r="2.5" fill="currentColor" />
              {/* Smile */}
              <path d="M 18 30 Q 24 34 30 30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="sidebar-brand">{panelName}</h1>
            <div className="pulse-indicator" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span className="dot" style={{ 
                 width: '8px', height: '8px', borderRadius: '50%', 
                 backgroundColor: isConnected ? 'var(--emerald-400)' : 'var(--error)',
                 animation: isConnected ? 'pulse 2s infinite' : 'none'
              }}></span>
              <span className="label-sm" style={{ color: isConnected ? 'var(--emerald-400)' : 'var(--error)', textTransform: 'none', fontWeight: 700 }}>
                 {isConnected ? 'Live System' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        <button className="mobile-only" onClick={onClose} style={{ color: 'var(--secondary)' }}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.group} className="nav-group">
            <p className="nav-group-title">{group.group}</p>
            {group.items.map((item) => {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => { if (window.innerWidth <= 768) onClose(); }}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', width: '100%' }}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.path === '/whatsapp' && totalUnread > 0 && location.pathname !== '/whatsapp' && (
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', marginRight: '0.5rem', gap: '6px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--emerald-400)' }}>{totalUnread}</span>
                      <span className="unread-dot" style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--emerald-400)',
                        boxShadow: '0 0 10px var(--emerald-400)',
                        animation: 'pulse 1.5s infinite'
                      }}></span>
                    </div>
                  )}
                  {item.path === '/orders' && pendingOrders > 0 && location.pathname !== '/orders' && (
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', marginRight: '0.5rem', gap: '6px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#C9A84C' }}>{pendingOrders}</span>
                      <span className="unread-dot" style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#C9A84C',
                        boxShadow: '0 0 10px #C9A84C',
                        animation: 'pulse 1.5s infinite'
                      }}></span>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-profile">
          <div className="avatar">AD</div>
          <div className="admin-info">
            <span className="admin-name">{userName}</span>
            <span className="admin-role">Root Access</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>verified_user</span>
        </div>
      </div>
    </aside>
  );
}
