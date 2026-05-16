-- ==========================================
-- 🚀 SCRIPT MAESTRO DE INTEGRACIÓN ROBOTINA
-- Une Dashboard React + n8n Workflow + Supabase
-- ==========================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Configuración Global (El "Cerebro" del Bot)
CREATE TABLE IF NOT EXISTS public.business_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_name TEXT DEFAULT 'Robotina Business',
    business_phone TEXT,
    bot_identity TEXT DEFAULT 'Asistente Virtual',
    bot_tone TEXT DEFAULT 'Profesional',
    bot_system_context TEXT, -- Aquí n8n leerá el System Prompt
    opening_time TIME DEFAULT '09:00',
    closing_time TIME DEFAULT '18:00',
    auto_close_day BOOLEAN DEFAULT true,
    auto_confirm_bookings BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO public.business_config (bot_identity, bot_system_context)
VALUES ('Agente Robotina', 'Eres una IA de servicio al cliente. Ayuda con pedidos y citas.')
ON CONFLICT DO NOTHING;

-- 3. Tabla de Clientes (CRM Unificado)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    customer_code TEXT,
    last_order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Sedes (Utilizada por n8n)
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    google_maps_url TEXT,
    opening_hours TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de Menú / Catálogo
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_code TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT,
    img_url TEXT,
    stock_status TEXT DEFAULT 'Disponible',
    is_available BOOLEAN DEFAULT true,
    keywords TEXT[],
    sales_30d INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de Órdenes (Ventas)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_code TEXT UNIQUE,
    customer_id UUID REFERENCES public.customers(id),
    items_json JSONB, -- Estructura de productos
    total_amount NUMERIC,
    status TEXT DEFAULT 'Pendiente', -- Pendiente, Preparando, Listo, Despachado
    source TEXT DEFAULT 'whatsapp',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla de Reservas (Citas) - Ajustada para n8n
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name TEXT,
    phone TEXT,
    reservation_date DATE, -- Usado por n8n
    reservation_time TIME, -- Usado por n8n
    combined_time TIMESTAMP WITH TIME ZONE, -- Usado por Dashboard
    guest_count INTEGER DEFAULT 1,
    service_name TEXT,
    status TEXT DEFAULT 'Pendiente', -- Pendiente, Confirmado, Completado, Cancelado
    source TEXT DEFAULT 'whatsapp',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Control de Mensajes de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id),
    phone_number TEXT UNIQUE,
    contact_name TEXT,
    is_bot_active BOOLEAN DEFAULT true, -- Control de Modo Humano
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES public.whatsapp_chats(id) ON DELETE CASCADE,
    direction TEXT NOT NULL, -- inbound / outbound
    message_body TEXT,
    status TEXT DEFAULT 'received',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tablas de Auditoría y Logs (n8n)
CREATE TABLE IF NOT EXISTS public.processed_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    whatsapp_message_id TEXT UNIQUE,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone TEXT,
    customer_name TEXT,
    inbound_message TEXT,
    inbound_type TEXT,
    agent_response TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. FUNCIONES RPC (EL MOTOR DE n8n)

-- RPC: registrar_mensaje
CREATE OR REPLACE FUNCTION public.registrar_mensaje(
    p_phone TEXT,
    p_message TEXT,
    p_direction TEXT,
    p_customer_name TEXT DEFAULT 'Cliente WhatsApp'
) RETURNS JSONB AS $$
DECLARE
    v_customer_id UUID;
    v_chat_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Upsert del cliente
    INSERT INTO public.customers (phone_number, name)
    VALUES (p_phone, p_customer_name)
    ON CONFLICT (phone_number) DO UPDATE 
    SET name = EXCLUDED.name
    RETURNING id INTO v_customer_id;

    -- 2. Upsert del chat
    INSERT INTO public.whatsapp_chats (customer_id, phone_number, contact_name, last_message, last_message_at)
    VALUES (v_customer_id, p_phone, p_customer_name, p_message, NOW())
    ON CONFLICT (phone_number) DO UPDATE 
    SET last_message = EXCLUDED.last_message, 
        last_message_at = EXCLUDED.last_message_at
    RETURNING id INTO v_chat_id;

    -- 3. Insertar el mensaje
    INSERT INTO public.whatsapp_messages (chat_id, direction, message_body)
    VALUES (v_chat_id, p_direction, p_message);

    SELECT jsonb_build_object('chat_id', v_chat_id, 'customer_id', v_customer_id) INTO v_result;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: crear_pedido
CREATE OR REPLACE FUNCTION public.crear_pedido(
    p_phone TEXT,
    p_customer_name TEXT,
    p_items JSONB,
    p_total NUMERIC,
    p_source TEXT DEFAULT 'whatsapp'
) RETURNS JSONB AS $$
DECLARE
    v_customer_id UUID;
    v_order_code TEXT;
    v_new_id UUID;
BEGIN
    -- 1. Obtener o crear cliente
    INSERT INTO public.customers (phone_number, name)
    VALUES (p_phone, p_customer_name)
    ON CONFLICT (phone_number) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_customer_id;

    -- 2. Generar código de pedido
    v_order_code := '#WA-' || floor(random() * (9999-1000+1) + 1000)::text;

    -- 3. Insertar pedido
    INSERT INTO public.orders (order_code, customer_id, items_json, total_amount, source, status)
    VALUES (v_order_code, v_customer_id, p_items, p_total, p_source, 'Pendiente')
    RETURNING id INTO v_new_id;

    RETURN jsonb_build_object('id', v_new_id, 'order_code', v_order_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_chats;
