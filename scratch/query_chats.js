import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== TENANTS ===");
  const { data: tenants, error: tenantsErr } = await supabase.from('tenants').select('*');
  console.log("Tenants:", tenantsErr || tenants);

  console.log("\n=== BUSINESS CONFIG ===");
  const { data: configs, error: configsErr } = await supabase.from('business_config').select('*');
  console.log("Configs:", configsErr || configs);

  console.log("\n=== WHATSAPP CONFIG ===");
  const { data: waConfigs, error: waConfigsErr } = await supabase.from('whatsapp_config').select('*');
  console.log("WA Configs:", waConfigsErr || waConfigs);
}

run();
