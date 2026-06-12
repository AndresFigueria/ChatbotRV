-- 1. trigger function
CREATE OR REPLACE FUNCTION public.on_whatsapp_message_inserted()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the parent chat record with the new last_message and last_message_at
  UPDATE public.whatsapp_chats
  SET last_message = NEW.message_body,
      last_message_at = NEW.created_at,
      unread_count = CASE 
        WHEN NEW.direction = 'inbound' THEN COALESCE(unread_count, 0) + 1
        ELSE COALESCE(unread_count, 0)
      END
  WHERE id = NEW.chat_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS tr_on_whatsapp_message_inserted ON public.whatsapp_messages;

-- Create the trigger
CREATE TRIGGER tr_on_whatsapp_message_inserted
AFTER INSERT ON public.whatsapp_messages
FOR EACH ROW
EXECUTE FUNCTION public.on_whatsapp_message_inserted();


-- 2. Simplified registrar_mensaje function
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

  -- Upsert del chat (solo asegurar que existe)
  INSERT INTO public.whatsapp_chats
    (customer_id, phone, contact_name, tenant_id)
  VALUES
    (v_customer_id, p_phone, p_customer_name, v_resolved_tenant_id)
  ON CONFLICT (phone, tenant_id) DO NOTHING
  RETURNING id INTO v_chat_id;

  -- Si v_chat_id es NULL (porque DO NOTHING ocurrió), lo consultamos
  IF v_chat_id IS NULL THEN
    SELECT id INTO v_chat_id FROM public.whatsapp_chats WHERE phone = p_phone AND tenant_id = v_resolved_tenant_id;
  END IF;

  -- Insertar mensaje (esto activará el trigger tr_on_whatsapp_message_inserted)
  INSERT INTO public.whatsapp_messages (chat_id, direction, message_body, tenant_id)
  VALUES (v_chat_id, p_direction, p_message, v_resolved_tenant_id);

  SELECT jsonb_build_object(
    'chat_id',     v_chat_id,
    'customer_id', v_customer_id
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
