import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
  console.log("Checking business_config policies...");
  
  // Since we are using anon key, we can't easily query pg_policies directly via postgrest 
  // unless there's a specific rpc or we just test insert/update.
  
  // Let's test a simple update with anon key to see if it works
  const { data, error } = await supabase.from('business_config').select('*').limit(1);
  console.log("SELECT:", { data, error });

  if (data && data.length > 0) {
    const { error: updateError } = await supabase.from('business_config').update({ business_name: data[0].business_name }).eq('id', data[0].id);
    console.log("UPDATE:", { updateError });
  } else {
    console.log("No data found to test update.");
    
    // Test insert
    const { error: insertError } = await supabase.from('business_config').insert({ id: 1, business_name: "Test" });
    console.log("INSERT:", { insertError });
  }
}

checkRLS();
