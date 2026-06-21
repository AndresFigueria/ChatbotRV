-- 1. Habilitar la extensión pg_net para solicitudes HTTP
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. Crear función segura para obtener el correo del dueño del tenant (con privilegios de SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_tenant_owner_email(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT u.email INTO v_email
  FROM public.tenant_users tu
  JOIN auth.users u ON tu.user_id = u.id
  WHERE tu.tenant_id = p_tenant_id AND tu.role = 'owner'
  LIMIT 1;
  
  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear función de trigger para notificar nuevo pedido por webhook a n8n
CREATE OR REPLACE FUNCTION public.notify_new_order_webhook()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://n8n-whatsappa-central.robotina-ia.com/webhook/db_email_notifier_wf/webhook/db-new-sale',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'type', 'order',
        'record', row_to_json(NEW)
      )::jsonb
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear trigger para pedidos
DROP TRIGGER IF EXISTS tr_notify_new_order_webhook ON public.orders;
CREATE TRIGGER tr_notify_new_order_webhook
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_order_webhook();

-- 5. Crear función de trigger para notificar nueva reserva por webhook a n8n
CREATE OR REPLACE FUNCTION public.notify_new_reservation_webhook()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://n8n-whatsappa-central.robotina-ia.com/webhook/db_email_notifier_wf/webhook/db-new-sale',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'type', 'reservation',
        'record', row_to_json(NEW)
      )::jsonb
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Crear trigger para reservas
DROP TRIGGER IF EXISTS tr_notify_new_reservation_webhook ON public.reservations;
CREATE TRIGGER tr_notify_new_reservation_webhook
AFTER INSERT ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_reservation_webhook();
