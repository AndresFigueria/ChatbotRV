import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

interface Chat {
  id: string;
  phone_number: string;
  contact_name: string;
  last_message_at: string;
  unread_count: number;
  is_bot_active: boolean;
}

interface Message {
  id: string;
  chat_id: string;
  direction: 'inbound' | 'outbound';
  message_body: string;
  created_at: string;
  status: string;
}

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

export default function WhatsApp() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const isHumanControlled = activeChat ? !activeChat.is_bot_active : false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch initial chats
  useEffect(() => {
    fetchChats();
    
    // Suscripción de Realtime a nuevos chats
    const chatSubscription = supabase
      .channel('dashboard-whatsapp-chats-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_chats' }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatSubscription);
    };
  }, []);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
      
      const clearUnread = async () => {
        await supabase
          .from('whatsapp_chats')
          .update({ unread_count: 0 })
          .eq('id', activeChatId);
        window.dispatchEvent(new Event('unreadUpdated'));
      };
      clearUnread();

      // Usar Supabase Realtime para capturar nuevos mensajes al vuelo!
      const msgSubscription = supabase
        .channel(`chat-messages-${activeChatId}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'whatsapp_messages',
            filter: `chat_id=eq.${activeChatId}`
        }, (payload) => {
          setIsTyping(true);
          setTimeout(() => {
            setMessages(prev => [...prev, payload.new as Message]);
            setIsTyping(false);
          }, 800); // Pequeño delay para que se vea el "escribiendo"
          
          // Clear unread count immediately since the user is actively viewing this chat
          clearUnread();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(msgSubscription);
      };
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  const fetchChats = async () => {
    const { data, error } = await supabase
      .from('whatsapp_chats')
      .select('*')
      .order('last_message_at', { ascending: false });
    if (!error && data) setChats(data);
  };

  const fetchMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    if (!error && data) setMessages(data);
  };

  const handleSendMessage = async () => {
    if (!replyText.trim() || !activeChatId) return;
    
    // Inyectamos a Supabase como mensaje de salida. 
    // NOTA: Para producción real, aquí también haríamos fetch a nuestro backend para que 
    // le diga a Meta Graph API que envíe el mensaje al teléfono físico del cliente.
    const outboundText = replyText;
    setReplyText('');

    await supabase.from('whatsapp_messages').insert([{
      chat_id: activeChatId,
      direction: 'outbound',
      message_body: outboundText,
      status: 'sent'
    }]);
  };

  const toggleHumanMode = async () => {
    if (!activeChatId || !activeChat) return;
    
    // Actualizamos en la DB para que n8n se entere inmediatamente
    const { error } = await supabase
      .from('whatsapp_chats')
      .update({ is_bot_active: !activeChat.is_bot_active })
      .eq('id', activeChatId);

    if (error) {
      console.error('Error toggling bot:', error);
    } else {
      fetchChats(); // Refrescar UI
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4.5rem)', overflow: 'hidden', padding: '0.5rem 1.5rem', boxSizing: 'border-box' }}>
      <header style={{ marginBottom: '1rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Atención WhatsApp 📱</h2>
      </header>

      <div className="chat-layout" style={{ display: 'flex', flex: 1, gap: '1.5rem', minHeight: 0, width: '100%' }}>
        
        {/* Columna Izquierda: Lista de Chats */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '380px', minWidth: '380px' }}>
          
          <div className="chat-sidebar" style={{ flex: 1, backgroundColor: 'var(--surface-container)', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '2px solid var(--outline-variant)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--surface-container-highest)', backgroundColor: '#10b981', color: '#ffffff', fontWeight: 600, display: 'flex', gap: '8px', alignItems:'center' }}>
            <span className="material-symbols-outlined" style={{color: '#ffffff'}}>chat</span>
            Bandeja de Entrada
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chats.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay chats aún</div>
            ) : chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChatId(chat.id)}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--surface-container-highest)', 
                  cursor: 'pointer',
                  backgroundColor: activeChatId === chat.id ? 'rgba(74, 158, 255, 0.1)' : 'transparent',
                  borderLeft: activeChatId === chat.id ? '3px solid var(--primary-color)' : '3px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: chat.unread_count > 0 ? 800 : 600, color: 'var(--text-primary)' }}>{chat.contact_name}</div>
                  <div style={{ fontSize: '0.75rem', color: chat.unread_count > 0 ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    {new Date(chat.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: chat.unread_count > 0 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: chat.unread_count > 0 ? 600 : 400 }}>+{chat.phone_number}</div>
                  <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                    {chat.unread_count > 0 && (
                      <span style={{ backgroundColor: 'var(--primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                        {chat.unread_count}
                      </span>
                    )}
                    <span style={{ 
                      fontSize: '0.6rem', 
                      fontWeight: 800, 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      backgroundColor: chat.is_bot_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: chat.is_bot_active ? '#10b981' : '#ef4444'
                    }}>
                      {chat.is_bot_active ? 'BOT' : 'HUMANO'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Panel Derecho: Ventana del Chat Activo */}
        <div style={{ flex: 1, backgroundColor: 'var(--surface-container-low)', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid var(--outline-variant)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {activeChatId ? (
            <>
              {/* Header del chat */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <span className="material-symbols-outlined" style={{color: '#10b981'}}>account_circle</span>
                   </div>
                   <div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{chats.find(c => c.id === activeChatId)?.contact_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Cliente Frecuente</div>
                   </div>
                 </div>
                 
                 <button 
                   onClick={toggleHumanMode} 
                   className={isHumanControlled ? "btn-primary" : "btn-secondary"} 
                   style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '8px',
                     backgroundColor: isHumanControlled ? 'var(--error)' : undefined,
                     boxShadow: isHumanControlled ? '0 0 15px rgba(239, 68, 68, 0.3)' : undefined
                   }}
                 >
                   <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                     {isHumanControlled ? 'smart_toy' : 'support_agent'}
                   </span>
                   {isHumanControlled ? 'Devolver al Bot' : 'Tomar Control Humano'}
                 </button>
              </div>
              
              {/* Burbujas de mensajes */}
              <div id="messages-container" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '2rem', color: 'rgba(255,255,255,0.3)' }}>Cargando mensajes...</div>
                ) : messages.map((msg, idx) => {
                  const isInbound = msg.direction === 'inbound';
                  return (
                    <div key={msg.id || idx} style={{
                      alignSelf: isInbound ? 'flex-start' : 'flex-end',
                      width: 'fit-content',
                      maxWidth: '85%',
                    }} className="chat-bubble-anim">
                      <div style={{
                          backgroundColor: isInbound ? '#005c4b' : 'var(--primary)', 
                          color: '#ffffff',
                          padding: '14px 18px',
                          borderRadius: '16px',
                          borderTopLeftRadius: isInbound ? '0' : '16px',
                          borderTopRightRadius: !isInbound ? '0' : '16px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          lineHeight: 1.5,
                          fontSize: '0.95rem'
                      }}>
                        <div style={{wordBreak: 'break-word', whiteSpace: 'pre-wrap'}}>{renderFormattedMessage(msg.message_body)}</div>
                        <div style={{fontSize: '0.65rem', textAlign: 'right', marginTop: '6px', opacity: 0.6, letterSpacing: '0.5px', color: '#ffffff'}}>
                          {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {!isInbound && <span className="material-symbols-outlined" style={{fontSize: '12px', verticalAlign: 'middle', marginLeft: '4px'}}>done_all</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="typing-bubble chat-bubble-anim">
                    <div className="dot-typing"></div>
                    <div className="dot-typing"></div>
                    <div className="dot-typing"></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input para responder */}
              <div style={{ padding: '1rem', backgroundColor: 'var(--surface-container)', borderTop: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className="chat-input-container" style={{display: 'flex', flex: 1, backgroundColor: 'var(--surface-container-low)', borderRadius: '8px', border: '2px solid var(--outline)'}}>
                      <textarea 
                        placeholder="Escribe un mensaje al cliente..."
                        rows={2}
                        style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '12px', fontSize: '0.85rem', outline: 'none', resize: 'none', fontFamily: 'inherit', scrollbarWidth: 'none' }}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                  </div>
                  <button className="btn-primary" onClick={handleSendMessage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px', width: '44px', borderRadius: '50%', padding: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div id="messages-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 10, padding: '2rem', backgroundColor: 'var(--surface-container-low)', borderRadius: '24px', border: '2px solid var(--primary)', boxShadow: '0 0 20px rgba(255, 90, 31, 0.2)' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', opacity: 0.5 }}>forum</span>
                </div>
                <h3>Central de <span style={{ color: '#25D366' }}>WhatsApp</span></h3>
                <p style={{ marginTop: '0.5rem', opacity: 0.6 }}>Selecciona un chat en la bandeja izquierda<br/>para empezar a responder.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
