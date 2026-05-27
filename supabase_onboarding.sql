-- ============================================================================
-- SCRIPT: CREACIÓN AUTOMÁTICA DE TENANTS AL REGISTRO
-- Este script crea un trigger que se ejecuta cada vez que un usuario nuevo
-- se registra en Supabase Auth. Automáticamente le crea un espacio de trabajo
-- (Tenant) y le asigna el rol de propietario (owner).
-- ============================================================================

-- 1. Función que ejecuta el Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS trigger AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- 1. Insertar un Tenant "En blanco" para este usuario
  -- Usamos un UUID temporal para phone_number_id y whatsapp_token para no violar la restricción UNIQUE NOT NULL
  INSERT INTO public.tenants (business_name, is_active, phone_number_id, owner_user_id, whatsapp_token)
  VALUES ('Nuevo Negocio (Completar Setup)', false, 'temp_' || gen_random_uuid()::text, NEW.id, 'temp_token_' || gen_random_uuid()::text)
  RETURNING id INTO v_tenant_id;

  -- 2. Vincular al usuario con este nuevo Tenant
  INSERT INTO public.tenant_users (tenant_id, user_id, role)
  VALUES (v_tenant_id, NEW.id, 'owner');

  -- 3. Crear una configuración de negocio por defecto para este Tenant
  INSERT INTO public.business_config (tenant_id, business_name, bot_identity)
  VALUES (v_tenant_id, 'Nuevo Negocio', 'Asistente Virtual');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Borrar el trigger si existía previamente (para evitar errores)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Crear el Trigger en la tabla auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_registration();

-- 4. Habilitar inserciones desde anon/authenticated en tenants si es necesario
-- (Usualmente no se necesita porque el trigger corre como SECURITY DEFINER)
