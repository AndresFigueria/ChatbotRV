const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Setting unread_count to 5 for Cliente de Prueba Antigravity...");
  const { data, error } = await supabase
    .from('whatsapp_chats')
    .update({ unread_count: 5, last_message: "Hola, me interesa el menú" })
    .eq('contact_name', 'Cliente de Prueba Antigravity')
    .select();
  
  if (error) {
    console.error("Error updating unread_count:", error);
  } else {
    console.log("Success! Updated row:", data);
  }
}

run();
