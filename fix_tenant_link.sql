-- 1. Asegurarnos de que tu usuario esté vinculado al Tenant principal
-- Si la tabla tenant_users está vacía para tu usuario, RLS oculta todo.
INSERT INTO public.tenant_users (tenant_id, user_id, role)
SELECT 
    (SELECT id FROM public.tenants LIMIT 1),
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
    'owner'
WHERE NOT EXISTS (
    SELECT 1 FROM public.tenant_users 
    WHERE tenant_id = (SELECT id FROM public.tenants LIMIT 1)
      AND user_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
);

-- 2. Asegurarnos de que todos los chats nuevos creados por n8n (que entran por service_role)
-- tengan asignado el tenant correcto. 
-- Si n8n no está enviando el tenant_id por alguna razón, esto lo repara retroactivamente.
UPDATE public.whatsapp_chats 
SET tenant_id = (SELECT id FROM public.tenants LIMIT 1) 
WHERE tenant_id IS NULL;

UPDATE public.whatsapp_messages 
SET tenant_id = (SELECT id FROM public.tenants LIMIT 1) 
WHERE tenant_id IS NULL;
