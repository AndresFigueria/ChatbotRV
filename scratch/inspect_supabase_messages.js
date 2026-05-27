import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: chats, error: chatsError } = await supabase
    .from('whatsapp_chats')
    .select(`
      *,
      customer:customers (*)
    `)
    .limit(5);
    
  if (chatsError) {
    console.error("Error fetching chats:", chatsError);
    return;
  }
  
  console.log("=== SUPABASE CHATS ===");
  console.log(JSON.stringify(chats, null, 2));
}

run();
