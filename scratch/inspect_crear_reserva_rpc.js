import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('crear_reserva', {
    p_customer_name: 'Test Customer',
    p_phone: '123456789',
    p_reservation_date: '2026-06-01',
    p_reservation_time: '19:00',
    p_guest_count: 2,
    p_notes: 'Test note'
  });
  
  console.log("crear_reserva test result:", { data, error });
}

run();
