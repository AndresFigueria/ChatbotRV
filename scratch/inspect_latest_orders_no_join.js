import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NzEzODMsImV4cCI6MjA5MDI0NzM4M30.SiFNNR3ixkITh2y5tHbFiCymhRQmAny1CrlMojm3HkA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching orders:", error);
    return;
  }
  
  console.log(JSON.stringify(data, null, 2));
}

inspectOrders();
