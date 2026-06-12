import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vijzjcpkypsmkhywndus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw'
);

async function run() {
  const { data: o, error: oe } = await supabase.from('orders').select('*');
  console.log('Orders length:', o ? o.length : 'null', 'Error:', oe);
  if (o && o.length > 0) {
    console.log('First order:', o[0]);
  }
  
  const { data: c, error: ce } = await supabase.from('customers').select('*');
  console.log('Customers length:', c ? c.length : 'null', 'Error:', ce);
  if (c && c.length > 0) {
    console.log('First customer:', c[0]);
  }
}

run();
