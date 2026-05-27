import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Query table RLS and policies
  const { data, error } = await supabase.rpc('get_policies', {});
  
  // Since get_policies rpc might not exist, let's run a raw query on pg_catalog if we can,
  // or we can just fetch from whatsapp_messages to see if we get empty array or error
  console.log("Checking tables...");
  
  const { data: chats, error: chatsErr } = await supabase.from('whatsapp_chats').select('*').limit(1);
  console.log("whatsapp_chats test select:", { count: chats?.length, error: chatsErr });

  const { data: msgs, error: msgsErr } = await supabase.from('whatsapp_messages').select('*').limit(1);
  console.log("whatsapp_messages test select:", { count: msgs?.length, error: msgsErr });
}

run();
