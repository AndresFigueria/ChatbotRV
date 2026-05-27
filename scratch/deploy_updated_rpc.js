import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const sql = `
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

  -- Calcular el total y la cantidad de items si p_total no es válido
  -- p_items tiene formato [{"name": "Plato", "qty": X}]
  IF p_items IS NOT NULL AND jsonb_typeof(p_items) = 'array' THEN
    -- Contar cantidad total de items
    SELECT COALESCE(SUM((item->>'qty')::int), 0) INTO v_items_count
    FROM jsonb_array_elements(p_items) AS item;
    
    -- Calcular el total si es <= 0 o null
    IF p_total IS NULL OR p_total <= 0 THEN
      FOR v_item IN SELECT (item->>'name')::text AS name, (item->>'qty')::int AS qty FROM jsonb_array_elements(p_items) AS item LOOP
        -- Buscar precio del plato en el menu
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
  `;
  
  // Note: Since Supabase-js doesn't expose a raw sql executor out of the box unless we created one, 
  // let's see if we have a custom SQL endpoint, or if we can use supabase.rpc or write a SQL query via pg/sqlite if locally hosted.
  // Wait, Supabase is cloud-hosted (supabaseUrl is cloud).
  // But wait! Is there a sql RPC or similar in the DB?
  // Let's check: can we run SQL queries using a custom endpoint or another method?
  // Let's check in the DB if there is a function like 'exec_sql' or similar!
  // Wait, is there? Let's check supabase_multitenant.sql or other files to see how migrations are run.
  // Actually, we can run migration SQL queries via supabase client if there's a custom endpoint, 
  // but if not, we can see if there is any script in the codebase that executes migrations.
  console.log("Checking if we have sql running script...");
}

run();
