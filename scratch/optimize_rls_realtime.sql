-- 1. Create trigger to sync tenant_id to user app_metadata automatically
CREATE OR REPLACE FUNCTION public.sync_tenant_id_to_app_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('tenant_id', NEW.tenant_id)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS tr_sync_tenant_id_to_app_metadata ON public.tenant_users;

-- Create the trigger
CREATE TRIGGER tr_sync_tenant_id_to_app_metadata
AFTER INSERT OR UPDATE ON public.tenant_users
FOR EACH ROW
EXECUTE FUNCTION public.sync_tenant_id_to_app_metadata();


-- 2. Redefine get_my_tenant_id to read from JWT app_metadata without subqueries
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
