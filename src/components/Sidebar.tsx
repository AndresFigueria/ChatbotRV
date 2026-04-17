import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/', label: 'Panel de Control', icon: 'dashboard' },
  { path: '/orders', label: 'Pedidos / Logística', icon: 'shopping_cart' },
  { path: '/kitchen', label: 'Terminal Cocina', icon: 'outdoor_grill' },
  { path: '/customers', label: 'Clientes', icon: 'group' },
  { path: '/menu', label: 'Menú', icon: 'restaurant_menu' },
  { path: '/analytics', label: 'Analíticas', icon: 'analytics' },
  { path: '/bot-status', label: 'Estado del Bot', icon: 'robot_2' },
  { path: '/marketing', label: 'Marketing Bot', icon: 'campaign' },
  { path: '/whatsapp', label: 'Centro WhatsApp', icon: 'forum' },
  { path: '/settings', label: 'Configuración', icon: 'settings' },
  { path: '/history', label: 'Archivo y Auditoría', icon: 'history' },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [restName, setRestName] = useState('Elegancia Operativa');
  const [userName] = useState('Administrador');

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('rest-settings');
      if (saved) {
        setRestName(JSON.parse(saved).restName || 'Elegancia Operativa');
      }
    };
    loadSettings();
    window.addEventListener('settingsUpdated', loadSettings);
    return () => window.removeEventListener('settingsUpdated', loadSettings);
  }, []);

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-visible' : 'mobile-hidden'}`}>
      <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="sidebar-brand">{restName}</h1>
          <p className="sidebar-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.25rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>account_circle</span>
            Sesión: {userName}
          </p>
        </div>
        <button 
          className="mobile-only" 
          onClick={onClose}
          style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--secondary)' }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth <= 768) onClose();
            }}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-primary" style={{ width: '100%', fontSize: '0.875rem' }}>
          Nueva Automatización
        </button>
      </div>
    </aside>
  );
}
