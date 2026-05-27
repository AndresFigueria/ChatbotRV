import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('id, business_name, system_prompt');
    
  if (error) {
    console.error("Error fetching tenants:", error);
  } else {
    console.log("=== TENANTS IN SUPABASE ===");
    tenants.forEach(t => {
      console.log(`ID: ${t.id} | Name: ${t.business_name}`);
      console.log(`Prompt: "${t.system_prompt}"\n`);
    });
  }
}

run();
