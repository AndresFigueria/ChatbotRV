import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: items, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('tenant_id', '4c652a69-006f-4194-9436-fd281d55e644');
    
  if (error) {
    console.error("Error fetching menu items:", error);
  } else {
    console.log(`=== MENU ITEMS FOR ROBOTINA PRINCIPAL (${items?.length} items) ===`);
    items.forEach(item => {
      console.log(`- ${item.name} | Price: $${item.price} | Available: ${item.is_available}`);
      console.log(`  Description: ${item.description}\n`);
    });
  }
}

run();
