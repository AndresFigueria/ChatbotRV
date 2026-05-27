import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers (*)
    `)
    .eq('id', '8298e857-0ae0-4611-9ad3-d8ea25769cd9')
    .single();
    
  if (error) {
    console.error("Error fetching order:", error);
    return;
  }
  
  console.log("=== ORDER 8298e857-0ae0-4611-9ad3-d8ea25769cd9 DETAILS ===");
  console.log(JSON.stringify(order, null, 2));
}

run();
