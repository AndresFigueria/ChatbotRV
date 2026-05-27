-- ============================================================
-- 🚀 REPARACIÓN DEFINITIVA DE DATOS CRUZADOS (V2)
-- ============================================================

-- 1. Actualizar la función registrar_mensaje para que resuelva el tenant automáticamente si llega NULL
-- Esto evita tener que modificar n8n de inmediato.
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
  v_resolved_tenant_id UUID := p_tenant_id;
BEGIN
  -- Si p_tenant_id es NULL, resolvemos el primer tenant activo
  IF v_resolved_tenant_id IS NULL THEN
    SELECT id INTO v_resolved_tenant_id FROM public.tenants WHERE phone_number_id IS NOT NULL AND phone_number_id != '' LIMIT 1;
    -- Fallback si no hay ninguno activo configurado
    IF v_resolved_tenant_id IS NULL THEN
      SELECT id INTO v_resolved_tenant_id FROM public.tenants LIMIT 1;
    END IF;
  END IF;

  -- Upsert del cliente con el tenant correcto
  INSERT INTO public.customers (phone_number, name, tenant_id)
  VALUES (p_phone, p_customer_name, v_resolved_tenant_id)
  ON CONFLICT (phone_number, tenant_id) DO UPDATE
    SET name = EXCLUDED.name
  RETURNING id INTO v_customer_id;

  -- Upsert del chat
  INSERT INTO public.whatsapp_chats
    (customer_id, phone, contact_name, last_message, last_message_at, tenant_id)
  VALUES
    (v_customer_id, p_phone, p_customer_name, p_message, NOW(), v_resolved_tenant_id)
  ON CONFLICT (phone, tenant_id) DO UPDATE -- Aseguramos conflicto en la clave única principal
    SET last_message    = EXCLUDED.last_message,
        last_message_at = EXCLUDED.last_message_at,
        customer_id     = EXCLUDED.customer_id
  RETURNING id INTO v_chat_id;

  -- Insertar mensaje
  INSERT INTO public.whatsapp_messages (chat_id, direction, message_body, tenant_id)
  VALUES (v_chat_id, p_direction, p_message, v_resolved_tenant_id);

  SELECT jsonb_build_object(
    'chat_id',     v_chat_id,
    'customer_id', v_customer_id
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Corregir TODOS los registros huérfanos sin tenant_id en la base de datos
-- Asignamos los mensajes y chats con tenant_id NULL al tenant activo
DO $$
DECLARE
    v_active_tenant UUID;
BEGIN
    SELECT id INTO v_active_tenant FROM public.tenants WHERE phone_number_id IS NOT NULL LIMIT 1;
    
    IF v_active_tenant IS NOT NULL THEN
        -- Actualizar chats sin tenant
        UPDATE public.whatsapp_chats SET tenant_id = v_active_tenant WHERE tenant_id IS NULL;
        -- Actualizar mensajes sin tenant
        UPDATE public.whatsapp_messages SET tenant_id = v_active_tenant WHERE tenant_id IS NULL;
        -- Actualizar clientes sin tenant
        UPDATE public.customers SET tenant_id = v_active_tenant WHERE tenant_id IS NULL;
    END IF;
END $$;
