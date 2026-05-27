import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('get_my_tenant_id'); // Just to see if connection is ok
  
  // Let's run a query to get column details from information_schema
  const { data: columns, error: colError } = await supabase
    .from('orders')
    .select('*')
    .limit(0); // We just want to inspect fields if we can, but query information_schema.columns is better:
    
  const { data: details, error: detailsError } = await supabase
    .rpc('crear_pedido', {
      p_phone: '123456789',
      p_customer_name: 'Test Test',
      p_items: [{ name: 'Hamburguesa Robotina', qty: 2 }],
      p_total: 0,
      p_tenant_id: '4c652a69-006f-4194-9436-fd281d55e644'
    });
    
  console.log("Create order test details:", { details, detailsError });
}

run();
