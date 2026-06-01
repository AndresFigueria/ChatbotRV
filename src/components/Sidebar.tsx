import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const navGroups = [
  {
    group: 'Operaciones',
    items: [
      { path: '/', label: 'Monitor Principal', icon: 'grid_view' },
      { path: '/orders', label: 'Gestión de Ventas', icon: 'shopping_bag' },
      { path: '/bookings', label: 'Agenda de Citas', icon: 'calendar_month' },
      { path: '/catalog', label: 'Catálogo y Servicios', icon: 'inventory_2' },
      { path: '/operations', label: 'Panel de Operaciones', icon: 'engineering' },
      { path: '/customers', label: 'Base de Clientes', icon: 'group' },
      { path: '/whatsapp', label: 'Canal WhatsApp', icon: 'forum' },
      { path: '/notifications', label: 'Centro de Alertas', icon: 'notifications' },
      { path: '/analytics', label: 'Estadísticas IA', icon: 'psychology' },
      { path: '/history', label: 'Historial de Auditoría', icon: 'history' },
    ]
  },
  {
    group: 'Automatización & Mensajería',
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

  useEffect(() => {
    fetchUnreadCount();
    const channel = supabase.channel('sidebar_unread_chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_chats' }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('rest-settings');
      if (saved) {
        setPanelName(JSON.parse(saved).restName || 'Robotina Central');
      }
    };
    loadSettings();
    window.addEventListener('settingsUpdated', loadSettings);
    
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
      window.removeEventListener('settingsUpdated', loadSettings);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-visible' : 'mobile-hidden'}`}>
      <div className="sidebar-header">
        <div className="flex items-center gap-3">
          <div className="brand-icon">
            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#fff' }}>terminal</span>
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
              const isAtWhatsApp = location.pathname === '/whatsapp';
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
                  {item.path === '/whatsapp' && totalUnread > 0 && !isAtWhatsApp && (
                    <span className="unread-dot" style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--emerald-400)',
                      boxShadow: '0 0 10px var(--emerald-400)',
                      marginLeft: 'auto',
                      marginRight: '0.5rem',
                      animation: 'pulse 1.5s infinite'
                    }}></span>
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
