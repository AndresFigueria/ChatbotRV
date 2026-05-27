-- ============================================================
-- 🚀 ROBOTINA SAAS — MEJORAS DE SEGURIDAD Y DEFAULTS MULTI-TENANT
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Añadir tenant_id a business_config
ALTER TABLE public.business_config 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 2. Asegurarse de que processed_messages tiene tenant_id
ALTER TABLE public.processed_messages 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 3. Habilitar RLS en las tablas que faltaban
ALTER TABLE public.whatsapp_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_config    ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas RLS para las tablas que faltaban
DROP POLICY IF EXISTS "tenant_whatsapp_messages" ON public.whatsapp_messages;
CREATE POLICY "tenant_whatsapp_messages" ON public.whatsapp_messages
  FOR ALL
  USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "tenant_processed_messages" ON public.processed_messages;
CREATE POLICY "tenant_processed_messages" ON public.processed_messages
  FOR ALL
  USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "tenant_business_config" ON public.business_config;
CREATE POLICY "tenant_business_config" ON public.business_config
  FOR ALL
  USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

-- 5. Actualizar políticas RLS de tablas existentes para incluir WITH CHECK
-- Esto es crucial para que los INSERTs desde el frontend respeten el RLS
DROP POLICY IF EXISTS "tenant_menu_items" ON public.menu_items;
CREATE POLICY "tenant_menu_items" ON public.menu_items FOR ALL USING (tenant_id = public.get_my_tenant_id()) WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "tenant_orders" ON public.orders;
CREATE POLICY "tenant_orders" ON public.orders FOR ALL USING (tenant_id = public.get_my_tenant_id()) WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "tenant_reservations" ON public.reservations;
CREATE POLICY "tenant_reservations" ON public.reservations FOR ALL USING (tenant_id = public.get_my_tenant_id()) WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "tenant_customers" ON public.customers;
CREATE POLICY "tenant_customers" ON public.customers FOR ALL USING (tenant_id = public.get_my_tenant_id()) WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "tenant_branches" ON public.branches;
CREATE POLICY "tenant_branches" ON public.branches FOR ALL USING (tenant_id = public.get_my_tenant_id()) WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "tenant_chats" ON public.whatsapp_chats;
CREATE POLICY "tenant_chats" ON public.whatsapp_chats FOR ALL USING (tenant_id = public.get_my_tenant_id()) WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "tenant_conv_logs" ON public.conversation_logs;
CREATE POLICY "tenant_conv_logs" ON public.conversation_logs FOR ALL USING (tenant_id = public.get_my_tenant_id()) WITH CHECK (tenant_id = public.get_my_tenant_id());


-- 6. ASIGNAR VALORES POR DEFECTO A NIVEL DE BASE DE DATOS
-- Esto hace que cualquier INSERT automático tome el tenant_id del usuario logueado en Supabase Auth
ALTER TABLE public.menu_items        ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.orders            ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.reservations      ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.customers         ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.branches          ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.whatsapp_chats    ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.whatsapp_messages ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.conversation_logs ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.processed_messages ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();
ALTER TABLE public.business_config   ALTER COLUMN tenant_id SET DEFAULT public.get_my_tenant_id();


-- 7. REPARAR REGISTROS EXISTENTES (Desarrollo)
-- Asignar los registros sin tenant al primer tenant disponible (el de pruebas)
UPDATE public.business_config SET tenant_id = (SELECT id FROM public.tenants LIMIT 1) WHERE tenant_id IS NULL;
UPDATE public.whatsapp_messages SET tenant_id = (SELECT id FROM public.tenants LIMIT 1) WHERE tenant_id IS NULL;
UPDATE public.processed_messages SET tenant_id = (SELECT id FROM public.tenants LIMIT 1) WHERE tenant_id IS NULL;
