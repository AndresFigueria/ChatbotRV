import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('get_function_def', { function_name: 'registrar_mensaje' });
  if (error) {
    // If get_function_def helper doesn't exist, we can query pg_proc directly
    const { data: rawProc, error: procError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT prosrc 
        FROM pg_proc 
        WHERE proname = 'registrar_mensaje'
      `
    });
    if (procError) {
      console.error("Error fetching pg_proc:", procError);
      // Let's try running query with supabase.from
      return;
    }
    console.log("=== FUNCTION DEFINITION (pg_proc) ===");
    console.log(rawProc);
    return;
  }
  console.log("=== FUNCTION DEFINITION ===");
  console.log(data);
}

run();
