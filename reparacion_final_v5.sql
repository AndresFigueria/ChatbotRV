-- ============================================================
-- 🚀 REPARACIÓN DEFINITIVA DE DATOS CRUZADOS (V5)
-- ============================================================

-- 1. Actualizar la función registrar_mensaje
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

  -- Upsert del chat
  INSERT INTO public.whatsapp_chats
    (customer_id, phone, contact_name, last_message, last_message_at, tenant_id)
  VALUES
    (v_customer_id, p_phone, p_customer_name, p_message, NOW(), v_resolved_tenant_id)
  ON CONFLICT (phone, tenant_id) DO UPDATE
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


-- 2. Algoritmo de deduplicación definitivo con fusión de chats e historiales
DO $$
DECLARE
    v_active_tenant UUID;
    r_bad_customer RECORD;
    v_good_customer_id UUID;
    v_bad_chat_id UUID;
    v_good_chat_id UUID;
BEGIN
    -- Obtener el tenant activo
    SELECT id INTO v_active_tenant FROM public.tenants WHERE phone_number_id IS NOT NULL LIMIT 1;
    
    IF v_active_tenant IS NULL THEN
        RAISE NOTICE 'No hay ningún tenant activo para realizar la migración.';
        RETURN;
    END IF;

    -- Iterar sobre todos los clientes huérfanos (tenant_id IS NULL)
    FOR r_bad_customer IN 
        SELECT id, phone_number FROM public.customers WHERE tenant_id IS NULL
    LOOP
        -- Buscar si ya existe el mismo cliente en el tenant activo
        SELECT id INTO v_good_customer_id 
        FROM public.customers 
        WHERE phone_number = r_bad_customer.phone_number AND tenant_id = v_active_tenant 
        LIMIT 1;

        IF v_good_customer_id IS NOT NULL THEN
            -- CASO DUPLICADO: Ya existe un cliente "bueno" en el tenant activo.
            
            -- 1. Buscar si el cliente "malo" tiene un chat asociado
            SELECT id INTO v_bad_chat_id FROM public.whatsapp_chats WHERE customer_id = r_bad_customer.id LIMIT 1;
            
            -- 2. Buscar si el cliente "bueno" tiene un chat asociado
            SELECT id INTO v_good_chat_id FROM public.whatsapp_chats WHERE customer_id = v_good_customer_id LIMIT 1;

            -- 3. Fusionar chats si ambos existen
            IF v_bad_chat_id IS NOT NULL AND v_good_chat_id IS NOT NULL THEN
                -- Mover los mensajes del chat malo al bueno
                UPDATE public.whatsapp_messages 
                SET chat_id = v_good_chat_id, tenant_id = v_active_tenant 
                WHERE chat_id = v_bad_chat_id;
                
                -- Eliminar el chat del cliente malo
                DELETE FROM public.whatsapp_chats WHERE id = v_bad_chat_id;
                
            ELSIF v_bad_chat_id IS NOT NULL THEN
                -- Solo el cliente malo tiene chat. Se lo pasamos al bueno de forma segura.
                UPDATE public.whatsapp_chats 
                SET customer_id = v_good_customer_id, tenant_id = v_active_tenant 
                WHERE id = v_bad_chat_id;
            END IF;

            -- 4. Redirigir pedidos y reservas al cliente bueno
            UPDATE public.orders SET customer_id = v_good_customer_id WHERE customer_id = r_bad_customer.id;
            UPDATE public.reservations SET customer_id = v_good_customer_id WHERE customer_id = r_bad_customer.id;

            -- 5. Eliminar el cliente malo duplicado
            DELETE FROM public.customers WHERE id = r_bad_customer.id;
        ELSE
            -- CASO ÚNICO: No existe el cliente en el tenant activo.
            -- Simplemente le asignamos el tenant
            UPDATE public.customers SET tenant_id = v_active_tenant WHERE id = r_bad_customer.id;
        END IF;
    END LOOP;

    -- B. Limpiar chats huérfanos que puedan haber quedado sueltos
    FOR r_bad_chat IN 
        SELECT id, phone FROM public.whatsapp_chats WHERE tenant_id IS NULL
    LOOP
        SELECT id INTO v_good_chat_id 
        FROM public.whatsapp_chats 
        WHERE phone = r_bad_chat.phone AND tenant_id = v_active_tenant 
        LIMIT 1;

        IF v_good_chat_id IS NOT NULL THEN
            UPDATE public.whatsapp_messages 
            SET chat_id = v_good_chat_id, tenant_id = v_active_tenant 
            WHERE chat_id = r_bad_chat.id;
            
            DELETE FROM public.whatsapp_chats WHERE id = r_bad_chat.id;
        ELSE
            UPDATE public.whatsapp_chats SET tenant_id = v_active_tenant WHERE id = r_bad_chat.id;
        END IF;
    END LOOP;

    -- C. Asegurar que todos los mensajes y chats tengan el tenant
    UPDATE public.whatsapp_messages SET tenant_id = v_active_tenant WHERE tenant_id IS NULL;
    UPDATE public.whatsapp_chats SET tenant_id = v_active_tenant WHERE tenant_id IS NULL;
    UPDATE public.customers SET tenant_id = v_active_tenant WHERE tenant_id IS NULL;

END $$;
