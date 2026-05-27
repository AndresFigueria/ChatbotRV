-- ============================================================
-- 🚀 SINCRONIZACIÓN DE TENANT N8N CON EL DASHBOARD FRONTEND
-- ============================================================

DO $$
DECLARE
    v_n8n_tenant_id UUID;
    v_user_tenant_id UUID;
    v_phone_id TEXT;
    v_token TEXT;
BEGIN
    -- 1. Identificar el Tenant que está usando n8n (el que tiene el phone_number_id de Meta)
    SELECT id, phone_number_id, whatsapp_token 
    INTO v_n8n_tenant_id, v_phone_id, v_token 
    FROM public.tenants 
    WHERE phone_number_id IS NOT NULL AND phone_number_id != '' 
    LIMIT 1;

    -- 2. Identificar el Tenant al que tú tienes acceso en el Dashboard (tu usuario logueado)
    -- Tomamos el tenant del usuario más reciente (tú)
    SELECT tenant_id INTO v_user_tenant_id 
    FROM public.tenant_users 
    ORDER BY created_at DESC 
    LIMIT 1;

    -- 3. Si son diferentes, significa que n8n está guardando en un lado y tú estás viendo en otro
    IF v_n8n_tenant_id IS NOT NULL AND v_user_tenant_id IS NOT NULL AND v_n8n_tenant_id != v_user_tenant_id THEN
        
        -- Mover la configuración de WhatsApp al tenant de tu Dashboard
        UPDATE public.tenants 
        SET phone_number_id = v_phone_id, 
            whatsapp_token = v_token
        WHERE id = v_user_tenant_id;

        -- Vaciar el phone_id del tenant viejo para evitar conflictos
        UPDATE public.tenants SET phone_number_id = NULL WHERE id = v_n8n_tenant_id;

        -- Mover TODOS los chats y mensajes al tenant de tu Dashboard
        UPDATE public.whatsapp_chats SET tenant_id = v_user_tenant_id WHERE tenant_id = v_n8n_tenant_id;
        UPDATE public.whatsapp_messages SET tenant_id = v_user_tenant_id WHERE tenant_id = v_n8n_tenant_id;
        
        -- Mover también la configuración de negocio
        UPDATE public.business_config SET tenant_id = v_user_tenant_id WHERE tenant_id = v_n8n_tenant_id;

    END IF;

    -- 4. Asegurarnos finalmente de que no haya chats huérfanos sin tenant
    UPDATE public.whatsapp_chats SET tenant_id = v_user_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.whatsapp_messages SET tenant_id = v_user_tenant_id WHERE tenant_id IS NULL;

END $$;
