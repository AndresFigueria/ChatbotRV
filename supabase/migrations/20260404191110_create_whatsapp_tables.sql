-- Creación de la tabla de Chats (contactos que nos escriben)
CREATE TABLE public.whatsapp_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    contact_name TEXT,
    unread_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creación de la tabla de Mensajes (el historial de chat)
CREATE TABLE public.whatsapp_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES public.whatsapp_chats(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')), -- inbound = cliente a negocio, outbound = negocio a cliente
    message_body TEXT,
    status TEXT DEFAULT 'received', -- 'received', 'sent', 'delivered', 'read'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar algunos índices para hacer que recuperar mensajes sea muy rápido
CREATE INDEX idx_whatsapp_messages_chat_id ON public.whatsapp_messages(chat_id);
CREATE INDEX idx_whatsapp_chats_last_message ON public.whatsapp_chats(last_message_at DESC);

-- Habilitar características de tiempo real (Realtime) para que el frontend escuche los cambios al instante
alter publication supabase_realtime add table public.whatsapp_chats;
alter publication supabase_realtime add table public.whatsapp_messages;

-- (Opcional) Políticas de seguridad RLS básicas para que el Dashboard pueda leer y escribir libremente
ALTER TABLE public.whatsapp_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activar lectura/escritura pública en chats" ON public.whatsapp_chats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Activar lectura/escritura pública en mensajes" ON public.whatsapp_messages FOR ALL USING (true) WITH CHECK (true);
