import { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface Chat {
  id: string;
  contact_name: string;
  phone_number: string;
  last_message: string;
  last_message_at: string;
  status: string;
  is_bot_active: boolean;
}

interface Message {
  id: string;
  sender: 'bot' | 'user' | 'human' | 'sys';
  text: string;
  time: string;
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

export default function BotStatus() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const isHumanControlled = activeChat ? !activeChat.is_bot_active : false;

  useEffect(() => {
    fetchChats();
    const sub = supabase.channel('bot_status_chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_chats' }, () => fetchChats())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
      const sub = supabase.channel(`msgs_${activeChatId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'whatsapp_messages', filter: `chat_id=eq.${activeChatId}` }, () => {
          setIsTyping(true);
          setTimeout(() => {
            fetchMessages(activeChatId);
            setIsTyping(false);
          }, 800);
        })
        .subscribe();
      return () => { supabase.removeChannel(sub); };
    }
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    const { data } = await supabase.from('whatsapp_chats').select('*').order('last_message_at', { ascending: false });
    if (data) setChats(data as Chat[]);
  };

  const fetchMessages = async (chatId: string) => {
    const { data } = await supabase.from('whatsapp_messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true });
    if (data) {
      setMessages(data.map(m => ({
        id: m.id,
        sender: m.direction === 'inbound' ? 'user' : (m.status === 'sent' ? 'bot' : 'human'),
        text: m.message_body,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })));
    }
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;
    
    await supabase.from('whatsapp_messages').insert([{
      chat_id: activeChatId,
      direction: 'outbound',
      message_body: inputText,
      status: 'human' // Lo marcamos como humano
    }]);
    
    setInputText('');
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title">Auditoría del Agente IA 🤖</h2>
          <p className="body-md" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
            Monitor real de Robotina Central. Toma el control si el cliente necesita un humano.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 200px)', minHeight: '600px' }}>
        <div className="card" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--surface-container-highest)', backgroundColor: 'var(--surface-container-low)' }}>
            <h3 className="label-sm">Conversaciones Reales ({chats.length})</h3>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {chats.map(chat => (
              <div key={chat.id} onClick={() => setActiveChatId(chat.id)} style={{ padding: '1rem', borderBottom: '1px solid var(--surface-container-highest)', cursor: 'pointer', backgroundColor: activeChatId === chat.id ? 'var(--surface-container)' : 'transparent', borderLeft: activeChatId === chat.id ? '4px solid var(--primary)' : '4px solid transparent' }}>
                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{chat.contact_name || 'Cliente Nuevo'}</p>
                <p style={{ color: 'var(--secondary)', fontSize: '0.7rem' }}>{chat.phone_number}</p>
                <span style={{ fontSize: '0.6rem', color: chat.is_bot_active ? 'var(--primary)' : 'var(--error)', fontWeight: 700 }}>
                  {chat.is_bot_active ? 'BOT ACTIVO' : 'CONTROL HUMANO'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, backgroundColor: 'var(--surface-bright)', border: isHumanControlled ? '2px solid var(--error-dim)' : '1px solid var(--card-border)' }}>
          {activeChatId ? (
            <>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-container-highest)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 className="title-md">{activeChat?.contact_name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Robotina Central Monitor</p>
                </div>
                <button onClick={toggleHumanMode} className={isHumanControlled ? "btn-primary" : "btn-secondary"} style={isHumanControlled ? { backgroundColor: 'var(--error)' } : {}}>
                  {isHumanControlled ? 'Devolver al Bot' : 'Tomar Control Humano'}
                </button>
              </div>
              {/* Área de Mensajes */}
              <div style={{ flex: 1, backgroundColor: 'var(--surface-container-highest)', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-start' : 'flex-end' }} className="chat-bubble-anim">
                    <div style={{ 
                      maxWidth: '70%', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '0.75rem', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
                      backgroundColor: msg.sender === 'user' ? '#005c4b' : (msg.sender === 'bot' ? 'var(--surface-container-high)' : 'var(--primary-container)'),
                      color: msg.sender === 'user' ? '#ffffff' : 'inherit'
                    }}>
                      <div style={{ fontSize: '0.6rem', color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--secondary)', marginBottom: '0.2rem', fontWeight: 700 }}>{msg.sender.toUpperCase()}</div>
                      <div style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{renderFormattedMessage(msg.text)}</div>
                      <div style={{ textAlign: 'right', fontSize: '0.6rem', color: msg.sender === 'user' ? 'rgba(255,255,255,0.5)' : 'var(--secondary)', marginTop: '0.4rem' }}>{msg.time}</div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="typing-bubble chat-bubble-anim" style={{ backgroundColor: 'var(--surface-container-high)' }}>
                    <div className="dot-typing"></div>
                    <div className="dot-typing"></div>
                    <div className="dot-typing"></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div style={{ padding: '1rem', borderTop: '1px solid var(--surface-container-highest)' }}>
                {isHumanControlled ? (
                  <form onSubmit={sendMessage} className="flex gap-3">
                    <input type="text" className="input-base" style={{ flex: 1 }} placeholder="Escribe al cliente..." value={inputText} onChange={e => setInputText(e.target.value)} />
                    <button type="submit" className="btn-primary">Enviar</button>
                  </form>
                ) : (
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--secondary)' }}>El Bot está gestionando esta conversación.</p>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Selecciona un chat para auditar</div>
          )}
        </div>
      </div>
    </div>
  );
}
