-- ============================================================
-- 🚀 SCRIPT DE EMERGENCIA: Base de Datos Reencuentro Venezuela
-- Ejecuta esto de una sola vez en el SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Configuración (Para tu Token de Meta)
CREATE TABLE IF NOT EXISTS public.tenants (
  id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_name     TEXT        NOT NULL DEFAULT 'Reencuentro Venezuela',
  phone_number_id   TEXT        UNIQUE NOT NULL,
  whatsapp_token    TEXT        NOT NULL DEFAULT '',
  is_active         BOOLEAN     DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Clientes
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    name TEXT,
    tenant_id UUID REFERENCES public.tenants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(phone_number, tenant_id)
);

-- 3. Chats de WhatsApp (Para modo voluntario)
CREATE TABLE IF NOT EXISTS public.whatsapp_chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id),
    phone TEXT NOT NULL,
    contact_name TEXT,
    is_bot_active BOOLEAN DEFAULT true,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- 4. Mensajes de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES public.whatsapp_chats(id) ON DELETE CASCADE,
    direction TEXT NOT NULL,
    message_body TEXT,
    tenant_id UUID REFERENCES public.tenants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Control Anti-Spam
CREATE TABLE IF NOT EXISTS public.processed_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    whatsapp_message_id TEXT UNIQUE,
    phone TEXT,
    tenant_id UUID REFERENCES public.tenants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Registro de Conversaciones
CREATE TABLE IF NOT EXISTS public.conversation_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone TEXT,
    customer_name TEXT,
    agent_response TEXT,
    status TEXT,
    tenant_id UUID REFERENCES public.tenants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. FUNCIONES DEL SISTEMA
CREATE OR REPLACE FUNCTION public.resolver_tenant(p_phone_number_id TEXT)
RETURNS JSONB AS $$
  SELECT jsonb_build_object(
    'id',             id,
    'whatsapp_token', whatsapp_token
  )
  FROM public.tenants
  WHERE phone_number_id = p_phone_number_id
    AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.registrar_mensaje(
  p_phone         TEXT,
  p_message       TEXT,
  p_direction     TEXT,
  p_customer_name TEXT    DEFAULT 'Cliente WhatsApp',
  p_tenant_id     UUID    DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_customer_id UUID;
  v_chat_id     UUID;
  v_result      JSONB;
BEGIN
  INSERT INTO public.customers (phone_number, name, tenant_id)
  VALUES (p_phone, p_customer_name, p_tenant_id)
  ON CONFLICT (phone_number, tenant_id) DO UPDATE
    SET name = EXCLUDED.name
  RETURNING id INTO v_customer_id;

  INSERT INTO public.whatsapp_chats
    (customer_id, phone, contact_name, last_message, last_message_at, tenant_id)
  VALUES
    (v_customer_id, p_phone, p_customer_name, p_message, NOW(), p_tenant_id)
  ON CONFLICT (customer_id) DO UPDATE
    SET last_message    = EXCLUDED.last_message,
        last_message_at = EXCLUDED.last_message_at
  RETURNING id INTO v_chat_id;

  INSERT INTO public.whatsapp_messages (chat_id, direction, message_body, tenant_id)
  VALUES (v_chat_id, p_direction, p_message, p_tenant_id);

  SELECT jsonb_build_object('chat_id', v_chat_id, 'customer_id', v_customer_id) INTO v_result;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
