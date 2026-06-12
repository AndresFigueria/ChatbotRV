const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Calling registrar_mensaje RPC with 'inbound' message...");
  const { data, error } = await supabase.rpc('registrar_mensaje', {
    p_phone: '5491165994057',
    p_message: 'Otro mensaje de prueba para verificar incremento de unread_count',
    p_direction: 'inbound',
    p_customer_name: 'Cliente de Prueba Antigravity'
  });

  if (error) {
    console.error("RPC Error:", error);
    return;
  }
  console.log("RPC Success:", data);

  // Now, get the updated unread_count using the returned chat_id
  const { data: chats } = await supabase
    .from('whatsapp_chats')
    .select('id, contact_name, unread_count, phone')
    .eq('id', data.chat_id);
  console.log("Chat state in DB:", chats);
}

run();
