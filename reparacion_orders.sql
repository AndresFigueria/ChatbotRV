-- ============================================================
-- 🚀 REPARACIÓN DE DETALLES, PEDIDOS Y RESERVAS (RPC: crear_pedido, crear_reserva)
-- ============================================================

-- ------------------------------------------------------------
-- 1. DROP DE FUNCIONES ANTERIORES PARA EVITAR CONFLICTOS DE SOBRECARGA (OVERLOADING)
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.crear_reserva(TEXT, TEXT, DATE, TIME, INTEGER, TEXT);
DROP FUNCTION IF EXISTS public.crear_reserva(TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS public.crear_reserva(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, UUID);

-- ------------------------------------------------------------
-- 2. NUEVA FUNCIÓN UNIFICADA: crear_reserva (CON SOPORTE MULTI-TENANT)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crear_reserva(
  p_customer_name    TEXT,
  p_phone            TEXT,
  p_reservation_date TEXT,
  p_reservation_time TEXT,
  p_guest_count      NUMERIC,
  p_notes            TEXT,
  p_tenant_id        UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_customer_id UUID;
  v_res_date DATE;
  v_res_time TIME;
  v_new_id UUID;
BEGIN
  -- Normalizar teléfono y nombre
  IF p_phone IS NULL OR p_phone = '' THEN
    p_phone := '000000000';
  END IF;
  
  IF p_customer_name IS NULL OR p_customer_name = '' THEN
    p_customer_name := 'Cliente WhatsApp';
  END IF;

  -- Intentar parsear fecha y hora
  BEGIN
    v_res_date := p_reservation_date::DATE;
  EXCEPTION WHEN OTHERS THEN
    v_res_date := CURRENT_DATE;
  END;

  BEGIN
    v_res_time := p_reservation_time::TIME;
  EXCEPTION WHEN OTHERS THEN
    v_res_time := '12:00:00'::TIME;
  END;

  -- Obtener o crear cliente con el tenant_id correcto
  INSERT INTO public.customers (phone_number, name, tenant_id)
  VALUES (p_phone, p_customer_name, p_tenant_id)
  ON CONFLICT (phone_number, tenant_id) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_customer_id;

  -- Insertar la reserva
  INSERT INTO public.reservations (
    customer_name,
    phone,
    reservation_date,
    reservation_time,
    combined_time,
    guest_count,
    notes,
    status,
    source,
    tenant_id,
    customer_id
  ) VALUES (
    p_customer_name,
    p_phone,
    v_res_date,
    v_res_time,
    (v_res_date + v_res_time)::timestamp with time zone,
    COALESCE(p_guest_count::integer, 1),
    p_notes,
    'Pendiente',
    'whatsapp',
    p_tenant_id,
    v_customer_id
  ) RETURNING id INTO v_new_id;

  RETURN jsonb_build_object('id', v_new_id, 'status', 'success');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ------------------------------------------------------------
-- 3. NUEVA FUNCIÓN: crear_pedido (CON CÁLCULO DE TOTALES AUTOMÁTICO Y SOPORTE MULTI-TENANT)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crear_pedido(
  p_phone         TEXT,
  p_customer_name TEXT,
  p_items         JSONB,
  p_total         NUMERIC,
  p_source        TEXT  DEFAULT 'whatsapp',
  p_tenant_id     UUID  DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_customer_id UUID;
  v_order_code  TEXT;
  v_new_id      UUID;
  v_item RECORD;
  v_item_price NUMERIC;
  v_calculated_total NUMERIC := 0;
  v_items_count INT := 0;
BEGIN
  -- Normalizar nombre y teléfono
  IF p_phone IS NULL OR p_phone = '' THEN
    p_phone := '000000000';
  END IF;
  
  IF p_customer_name IS NULL OR p_customer_name = '' THEN
    p_customer_name := 'Cliente WhatsApp';
  END IF;

  -- Obtener o crear cliente
  INSERT INTO public.customers (phone_number, name, tenant_id)
  VALUES (p_phone, p_customer_name, p_tenant_id)
  ON CONFLICT (phone_number, tenant_id) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_customer_id;

  -- Generar código de pedido
  v_order_code := '#WA-' || floor(random() * (9999-1000+1) + 1000)::text;

  -- Calcular el total y la cantidad de items si p_total no es válido o es <= 0
  -- p_items tiene formato [{"name": "Plato", "qty": X}]
  IF p_items IS NOT NULL AND jsonb_typeof(p_items) = 'array' THEN
    -- Contar cantidad total de items
    SELECT COALESCE(SUM((item->>'qty')::int), 0) INTO v_items_count
    FROM jsonb_array_elements(p_items) AS item;
    
    -- Calcular el total
    IF p_total IS NULL OR p_total <= 0 THEN
      FOR v_item IN SELECT (item->>'name')::text AS name, (item->>'qty')::int AS qty FROM jsonb_array_elements(p_items) AS item LOOP
        -- Buscar precio del plato en el catálogo
        SELECT price INTO v_item_price FROM public.menu_items
        WHERE LOWER(name) = LOWER(v_item.name) AND tenant_id = p_tenant_id;
        
        IF v_item_price IS NOT NULL THEN
          v_calculated_total := v_calculated_total + (v_item_price * v_item.qty);
        END IF;
      END LOOP;
      p_total := v_calculated_total;
    END IF;
  END IF;

  -- Insertar pedido
  INSERT INTO public.orders
    (order_code, customer_id, items_json, total_amount, source, status, tenant_id, items_count)
  VALUES
    (v_order_code, v_customer_id, p_items, p_total, p_source, 'Pendiente', p_tenant_id, COALESCE(v_items_count, 1))
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object('id', v_new_id, 'order_code', v_order_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
