-- ============================================================
-- 🚀 REPARACIÓN DE LA FUNCIÓN REGISTRAR_MENSAJE
-- ============================================================

-- 1. Eliminar la función vieja para evitar conflictos de firma
DROP FUNCTION IF EXISTS public.registrar_mensaje(text, text, text, text, uuid);

-- 2. Crear la función con la lógica de ON CONFLICT (customer_id)
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

  -- Upsert del chat (conflicto en customer_id para actualizar el chat existente)
  INSERT INTO public.whatsapp_chats
    (customer_id, phone, contact_name, last_message, last_message_at, tenant_id)
  VALUES
    (v_customer_id, p_phone, p_customer_name, p_message, NOW(), v_resolved_tenant_id)
  ON CONFLICT (customer_id) DO UPDATE
    SET last_message    = EXCLUDED.last_message,
        last_message_at = EXCLUDED.last_message_at,
        phone           = EXCLUDED.phone,
        contact_name    = EXCLUDED.contact_name
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
