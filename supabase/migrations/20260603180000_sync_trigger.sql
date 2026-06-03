-- 1. Asegurar que tenant_id de business_config esté asignado si es NULL
UPDATE public.business_config 
SET tenant_id = (SELECT id FROM public.tenants LIMIT 1) 
WHERE tenant_id IS NULL;

-- 2. Crear función de sincronización de business_config a tenants
CREATE OR REPLACE FUNCTION public.sync_business_config_to_tenant()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NOT NULL THEN
    UPDATE public.tenants
    SET system_prompt = NEW.bot_system_context,
        business_name = NEW.business_name
    WHERE id = NEW.tenant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear trigger
DROP TRIGGER IF EXISTS tr_sync_business_config_to_tenant ON public.business_config;

CREATE TRIGGER tr_sync_business_config_to_tenant
AFTER INSERT OR UPDATE ON public.business_config
FOR EACH ROW
EXECUTE FUNCTION public.sync_business_config_to_tenant();
