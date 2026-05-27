-- ============================================================
-- 🚀 CONFIGURACIÓN DE TU NÚMERO DE WHATSAPP REAL
-- ============================================================
-- Ejecuta esto en tu SQL Editor de Supabase después de rellenar los datos.

DO $$
DECLARE
    v_user_email TEXT := 'aafztate@gmail.com'; -- Tu correo de administrador
    v_tenant_id UUID;
    
    -- ⚠️ CAMBIA ESTOS VALORES POR LOS DE TU NÚMERO REAL
    -- Los encuentras en: Meta Developers -> Tu App -> WhatsApp -> Configuración de la API
    v_real_phone_number_id TEXT := 'REEMPLAZA_CON_EL_PHONE_NUMBER_ID_REAL'; 
    v_real_whatsapp_token TEXT := 'REEMPLAZA_CON_EL_TOKEN_PERMANENTE_REAL';
BEGIN
    -- 1. Buscamos tu tenant vinculado
    SELECT tenant_id INTO v_tenant_id 
    FROM public.tenant_users 
    WHERE user_id = (SELECT id FROM auth.users WHERE email = v_user_email)
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró ningún restaurante vinculado a tu usuario %', v_user_email;
    END IF;

    -- 2. Actualizamos las credenciales en la base de datos
    UPDATE public.tenants
    SET phone_number_id = v_real_phone_number_id,
        whatsapp_token = v_real_whatsapp_token
    WHERE id = v_tenant_id;

    RAISE NOTICE 'WhatsApp configurado correctamente para el Tenant ID: %', v_tenant_id;
END $$;
