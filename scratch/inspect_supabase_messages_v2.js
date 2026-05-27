import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: messages, error: messagesError } = await supabase
    .from('whatsapp_messages')
    .select(`
      *,
      chat:whatsapp_chats (*)
    `)
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
    return;
  }
  
  console.log("=== SUPABASE WHATSAPP MESSAGES ===");
  console.log(JSON.stringify(messages, null, 2));
}

run();
