import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { playNotificationSound } from '../utils/audio';
import { useNavigate } from 'react-router-dom';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'reservation';
  timestamp: number;
  path: string;
}

export default function NotificationToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Escuchar nuevos pedidos
    const ordersChannel = supabase.channel('toast-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new as any;
        addToast({
          id: `order-${newOrder.id}`,
          title: '🍔 ¡Nuevo Pedido Entrante!',
          message: `Pedido ${newOrder.order_code} por $${newOrder.total_amount}`,
          type: 'order',
          timestamp: Date.now(),
          path: '/orders'
        });
        playNotificationSound();
      })
      .subscribe();

    // Escuchar nuevas reservas
    const reservationsChannel = supabase.channel('toast-reservations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reservations' }, (payload) => {
        const newRes = payload.new as any;
        addToast({
          id: `res-${newRes.id}`,
          title: '📅 ¡Nueva Reserva Confirmada!',
          message: `Reserva para el ${newRes.reservation_date} a las ${newRes.reservation_time}`,
          type: 'reservation',
          timestamp: Date.now(),
          path: '/bookings'
        });
        playNotificationSound();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(reservationsChannel);
    };
  }, []);

  const addToast = (toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      removeToast(toast.id);
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className="card"
          style={{
            minWidth: '320px',
            backgroundColor: 'var(--surface-bright)',
            borderLeft: toast.type === 'order' ? '4px solid var(--primary)' : '4px solid var(--emerald-400)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            cursor: 'pointer',
            animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
          onClick={() => {
            navigate(toast.path);
            removeToast(toast.id);
          }}
        >
          <div style={{
            backgroundColor: toast.type === 'order' ? 'rgba(255, 90, 31, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            color: toast.type === 'order' ? 'var(--primary)' : 'var(--emerald-400)',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span className="material-symbols-outlined">
              {toast.type === 'order' ? 'shopping_bag' : 'calendar_month'}
            </span>
          </div>
          
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--on-surface)' }}>
              {toast.title}
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--secondary)' }}>
              {toast.message}
            </p>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--secondary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>close</span>
          </button>
        </div>
      ))}
      
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
