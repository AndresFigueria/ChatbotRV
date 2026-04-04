import { useState, useRef, useEffect } from 'react';

export default function BotStatus() {
  const [activeChatId, setActiveChatId] = useState<number>(1);
  const [humanModeIds, setHumanModeIds] = useState<number[]>([2]); // El chat 2 ya está en modo humano por defecto
  const [inputText, setInputText] = useState('');
  
  const [messagesDB, setMessagesDB] = useState<Record<number, any[]>>({
    1: [
      { id: 1, sender: 'bot', text: '¡Hola Carlos! 🤖 Soy el Bot de tu Restaurante. Veo que hace un mes pediste el Ribeye. ¿Quieres repetir o te muestro el menú de hoy?', time: '12:05 PM' },
      { id: 2, sender: 'user', text: 'Hola! Sí por fa envíame 2 de esos con papas.', time: '12:06 PM' },
      { id: 3, sender: 'bot', text: '¡Anotado! 🥩 2 x Ribeye con Papas Fritas.\nTotal: $78.00\n¿Deseas confirmar este pedido para pasarlo a la cocina en este instante?', time: '12:06 PM' },
      { id: 4, sender: 'user', text: 'Sí, confirmado. Para llevar porfa.', time: '12:07 PM' },
      { id: 5, sender: 'bot', text: '✅ ¡Pedido #4029 confirmado y enviado a la banda de cocina! 🍳 Te avisaré por aquí mismo apenas esté listo para recoger. ¡Gracias Carlos!', time: '12:07 PM' }
    ],
    2: [
      { id: 1, sender: 'user', text: 'Llevo 40 minutos esperando mi comida y el repartidor no llega, qué pasa?', time: '11:58 AM' },
      { id: 2, sender: 'bot', text: 'Hola Elena, lamento muchísimo la demora. 😞 Déjame revisar inmediatamente el estado de tu pedido #9832 con la cocina o el motorizado.', time: '11:58 AM' },
      { id: 3, sender: 'sys', text: '⚠️ La IA ha pausado sus respuestas automáticas y solicita intervención de un administrador humano por frustración o queja operativa.', time: '11:58 AM' }
    ],
    3: [
      { id: 1, sender: 'user', text: 'Hasta qué hora abren hoy mi estimado?', time: '10:15 AM' },
      { id: 2, sender: 'bot', text: '¡Hola! 🕒 Atendemos con mucho gusto hasta las 22h00. ¿Te gustaría que te envíe nuestra carta digital o prefieres reservar una mesa?', time: '10:15 AM' },
      { id: 3, sender: 'user', text: 'No gracias, era solo una consulta iré más tarde a comer.', time: '10:16 AM' },
      { id: 4, sender: 'bot', text: '¡Perfecto! Aquí te esperaremos con los fogones encendidos. Que tengas una excelente mañana. ✨', time: '10:16 AM' }
    ]
  });

  const chatsMeta = [
    { id: 1, customer: 'Carlos Mendoza', phone: '+593 98 765 4321', status: 'Atendiendo Automático', intent: 'Crear Pedido Nuevo', confidence: '98%', badge: 'bg-emerald-400' },
    { id: 2, customer: 'Elena Rodríguez', phone: '+593 99 123 4567', status: 'Requiere Atención Humana', intent: 'Queja De Logística', confidence: '82%', badge: 'bg-error' },
    { id: 3, customer: 'Usuario Nuevo', phone: '+1 305 444 5555', status: 'Conversación Cerrada', intent: 'Consulta de Horarios', confidence: '99%', badge: 'bg-secondary' }
  ];

  const currentChat = chatsMeta.find(c => c.id === activeChatId) || chatsMeta[0];
  const currentMessages = messagesDB[activeChatId] || [];
  const isHumanControlled = humanModeIds.includes(activeChatId) || currentChat.id === 2; // Forzar el 2 a estar en rojo en UI pero controlable

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al fondo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, activeChatId]);

  const toggleHumanMode = () => {
    if (humanModeIds.includes(activeChatId)) {
      setHumanModeIds(humanModeIds.filter(id => id !== activeChatId));
      // Loggear que el bot retoma el control
      const newMsg = { id: Date.now(), sender: 'sys', text: '🔄 El administrador ha devuelto el control al Bot de Inteligencia Artificial.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessagesDB(prev => ({ ...prev, [activeChatId]: [...prev[activeChatId], newMsg] }));
    } else {
      setHumanModeIds([...humanModeIds, activeChatId]);
      // Loggear que un humano toma el control
      const newMsg = { id: Date.now(), sender: 'sys', text: '👨‍💻 Un Humano (Administrador) ha tomado el control de esta sala de chat de WhatsApp. El bot guardará silencio.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessagesDB(prev => ({ ...prev, [activeChatId]: [...prev[activeChatId], newMsg] }));
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    // Solo permitimos mandar mensajes si está en modo humano, claro.
    // Si no, forzamos modo humano primero.
    if (!humanModeIds.includes(activeChatId)) {
      setHumanModeIds([...humanModeIds, activeChatId]);
      setMessagesDB(prev => ({ ...prev, [activeChatId]: [...prev[activeChatId], { id: Date.now(), sender: 'sys', text: '👨‍💻 Control asumido automáticamente por envío manual.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }));
    }

    const newMsg = { id: Date.now(), sender: 'human', text: inputText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessagesDB(prev => ({ ...prev, [activeChatId]: [...prev[activeChatId], newMsg] }));
    setInputText('');
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="display-md">Auditoría del Agente IA</h2>
          <p className="body-md" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
            Bandeja de mensajes de WhatsApp en tiempo real. Interviene si la IA no logra cerrar una venta.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 200px)', minHeight: '600px' }}>
        
        {/* Panel Izquierdo: Lista de Chats */}
        <div className="card" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--surface-container-highest)', backgroundColor: 'var(--surface-container-low)' }}>
            <h3 className="label-sm" style={{ color: 'var(--on-surface)' }}>Conversaciones Vivas (3)</h3>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {chatsMeta.map(chat => (
              <div 
                key={chat.id} 
                className="activity-feed-item"
                onClick={() => setActiveChatId(chat.id)}
                style={{ 
                  padding: '1rem', borderBottom: '1px solid var(--surface-container-highest)', cursor: 'pointer',
                  backgroundColor: activeChatId === chat.id ? 'var(--surface-container)' : 'transparent',
                  borderLeft: activeChatId === chat.id ? '4px solid var(--primary)' : '4px solid transparent',
                  borderRadius: 0, margin: 0
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', flexShrink: 0 }}>
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--on-surface)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{chat.customer}</p>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.7rem', marginTop: '0.2rem' }}>{chat.phone}</p>
                  <span style={{ display: 'inline-block', padding: '0.15rem 0.4rem', backgroundColor: `var(--${chat.badge.replace('bg-', '')}-dim)`, color: `var(--${chat.badge.replace('bg-', '')})`, borderRadius: '4px', fontSize: '0.6rem', marginTop: '0.4rem', fontWeight: 700 }}>
                    {humanModeIds.includes(chat.id) ? 'CONTROL HUMANO' : chat.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Central: WhatsApp Web Clone */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, backgroundColor: 'var(--surface-bright)', border: isHumanControlled ? '2px solid var(--error-dim)' : '1px solid var(--card-border)' }}>
          {/* Header del Chat */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-container-highest)', backgroundColor: 'var(--surface-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex items-center gap-3">
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <h3 className="title-md" style={{ marginBottom: '0.2rem', color: 'var(--on-surface)' }}>{currentChat.customer}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--emerald-400)' }}></span> WhatsApp Business Válido
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600, marginRight: '1rem' }}>Estado: {isHumanControlled ? 'Humano' : 'Bot Activo'}</span>
              <button onClick={toggleHumanMode} className={isHumanControlled ? "btn-primary" : "btn-secondary"} style={isHumanControlled ? { backgroundColor: 'var(--error)' } : {}}>
                {isHumanControlled ? 'Devolver al Bot' : 'Tomar Control (Habilitar Chat)'}
              </button>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div style={{ flex: 1, backgroundColor: 'var(--background)', backgroundImage: 'radial-gradient(var(--surface-container-highest) 1px, transparent 0)', backgroundSize: '20px 20px', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{ backgroundColor: 'var(--surface-container)', color: 'var(--secondary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.65rem' }}>HOY</span>
            </div>

            {currentMessages.map((msg, i) => (
              <div key={i} style={{ 
                display: 'flex',
                justifyContent: msg.sender === 'bot' || msg.sender === 'human' ? 'flex-end' : (msg.sender === 'sys' ? 'center' : 'flex-start'),
                width: '100%'
              }}>
                {msg.sender === 'sys' ? (
                  <div style={{ backgroundColor: 'var(--surface-container)', color: 'var(--error-dim)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', border: '1px solid var(--error-dim)', maxWidth: '80%', textAlign: 'center' }}>
                    {msg.text}
                  </div>
                ) : (
                  <div style={{ 
                    maxWidth: '65%', 
                    padding: '0.75rem 1rem', 
                    borderRadius: '0.75rem',
                    backgroundColor: msg.sender === 'bot' ? 'var(--surface-container)' : (msg.sender === 'human' ? 'var(--primary-container)' : 'var(--surface-container-low)'),
                    color: msg.sender === 'bot' ? 'var(--on-surface)' : (msg.sender === 'human' ? 'var(--on-primary-container)' : 'var(--on-surface)'),
                    border: msg.sender === 'user' ? '1px solid var(--surface-container-high)' : 'none',
                    borderBottomRightRadius: (msg.sender === 'bot' || msg.sender === 'human') ? '0' : '0.75rem',
                    borderBottomLeftRadius: msg.sender === 'user' ? '0' : '0.75rem',
                    position: 'relative',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}>
                    {msg.sender === 'bot' && (
                      <div style={{ fontSize: '0.6rem', color: 'var(--secondary)', marginBottom: '0.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '0.8rem' }}>robot_2</span> INTELIGENCIA ARTIFICIAL
                      </div>
                    )}
                    {msg.sender === 'human' && (
                      <div style={{ fontSize: '0.6rem', color: 'var(--primary)', marginBottom: '0.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '0.8rem' }}>support_agent</span> ADMINISTRADOR SALA (TÚ)
                      </div>
                    )}
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                    <div style={{ textAlign: 'right', fontSize: '0.6rem', color: msg.sender === 'human' ? 'var(--primary)' : 'var(--secondary)', marginTop: '0.4rem' }}>{msg.time}</div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Controles de Teclado */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--surface-container)', borderTop: '1px solid var(--surface-container-highest)' }}>
            {isHumanControlled ? (
              <form onSubmit={sendMessage} className="flex gap-3">
                <input 
                  type="text" 
                  className="input-base" 
                  style={{ flex: 1, padding: '0.75rem 1rem', outline: 'none', border: '1px solid var(--primary-container)' }} 
                  placeholder="Escribe un mensaje por WhatsApp al cliente..." 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn-primary" style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>lock</span> El Bot está conduciendo. Toma el control arriba para enviar mensajes manuales.
              </div>
            )}
          </div>
        </div>

        {/* Panel Derecho: Cerebro NLP / Debugger */}
        <div className="card" style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--surface-container-low)' }}>
          <h3 className="title-md" style={{ borderBottom: '1px solid var(--surface-container-highest)', paddingBottom: '0.5rem' }}>Telemetría NLP</h3>
          
          <div>
            <p className="label-sm" style={{ color: 'var(--secondary)', marginBottom: '0.25rem' }}>Intención de Compra (Intent)</p>
            <p style={{ fontWeight: 700, color: 'var(--on-surface)', fontSize: '0.9rem' }}>{currentChat.intent}</p>
          </div>

          <div>
            <p className="label-sm" style={{ color: 'var(--secondary)', marginBottom: '0.25rem' }}>Nivel de Confianza (Confidence)</p>
            <div className="flex items-center gap-2">
              <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--surface-container-highest)', borderRadius: '3px' }}>
                 <div style={{ width: currentChat.confidence, height: '100%', backgroundColor: parseInt(currentChat.confidence) > 90 ? 'var(--emerald-400)' : 'var(--error)', borderRadius: '3px' }}></div>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentChat.confidence}</span>
            </div>
          </div>

          <div>
            <p className="label-sm" style={{ color: 'var(--secondary)', marginBottom: '0.25rem' }}>Base de Datos Relacional</p>
            <button className="btn-secondary" style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>visibility</span> Ver Ticket Actual
            </button>
          </div>

          <div style={{ marginTop: 'auto', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--error-dim)', lineHeight: 1.4 }}>
              <strong>Importante:</strong> Si el bot sufre alucinación, presiona el botón rojo "Tomar Control" para aislarlo de procesar más mensajes del cliente.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
