import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers (*)
    `)
    .eq('order_code', '#WA-3458')
    .single();
    
  if (orderError) {
    console.error("Error fetching order:", orderError);
    return;
  }
  
  console.log("=== SUPABASE ORDER DETAILS ===");
  console.log(JSON.stringify(order, null, 2));
}

run();
