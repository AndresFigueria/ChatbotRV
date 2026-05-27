-- ============================================================
-- 🚀 REPARACIÓN DEFINITIVA DE DATOS CRUZADOS
-- ============================================================
-- Lo que pasó fue que al ejecutar los scripts anteriores, dividimos el cerebro 
-- del sistema en dos: tú estás mirando el Restaurante A (con los chats viejos), 
-- pero n8n está escribiendo los chats nuevos en el Restaurante B.
-- Este script fusionará todo en el Restaurante B y te dará acceso a él.

DO $$
DECLARE
    v_active_tenant UUID;
    v_old_tenant UUID;
    v_user_email TEXT := 'aafztate@gmail.com';
BEGIN
    -- 1. Identificamos el tenant VIVO (el que tiene conectado a WhatsApp)
    SELECT id INTO v_active_tenant FROM public.tenants WHERE phone_number_id IS NOT NULL LIMIT 1;
    
    -- Si por alguna razón no hay tenant activo, abortamos para no romper nada
    IF v_active_tenant IS NULL THEN
        RAISE EXCEPTION 'No se encontró ningún tenant conectado a WhatsApp.';
    END IF;

    -- 2. Identificamos el tenant VIEJO (el de los chats de las 6pm)
    -- Asumimos que es el que no tiene phone_number_id o es distinto al activo
    SELECT id INTO v_old_tenant FROM public.tenants WHERE id != v_active_tenant LIMIT 1;

    -- 3. Movemos TODOS los chats e historiales viejos al tenant VIVO
    IF v_old_tenant IS NOT NULL THEN
        UPDATE public.whatsapp_chats SET tenant_id = v_active_tenant WHERE tenant_id = v_old_tenant;
        UPDATE public.whatsapp_messages SET tenant_id = v_active_tenant WHERE tenant_id = v_old_tenant;
        UPDATE public.orders SET tenant_id = v_active_tenant WHERE tenant_id = v_old_tenant;
        UPDATE public.reservations SET tenant_id = v_active_tenant WHERE tenant_id = v_old_tenant;
    END IF;

    -- 4. Nos aseguramos de que tú (aafztate@gmail.com) estés mirando el tenant VIVO
    UPDATE public.tenant_users
    SET tenant_id = v_active_tenant
    WHERE user_id = (SELECT id FROM auth.users WHERE email = v_user_email);

END $$;
