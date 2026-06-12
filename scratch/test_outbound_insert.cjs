const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const chatId = 'c1aba593-4c6d-4442-8fbd-00ffbb5be450';
  
  // Get initial state
  const { data: initialChats } = await supabase
    .from('whatsapp_chats')
    .select('last_message, last_message_at, unread_count')
    .eq('id', chatId);
  console.log("Initial Chat State:", initialChats[0]);

  // Insert an outbound message
  const testMessage = 'Respuesta de prueba saliente desde script: ' + new Date().toISOString();
  console.log("Inserting outbound message directly...");
  const { data: insertedMsg, error: insertError } = await supabase
    .from('whatsapp_messages')
    .insert([{
      chat_id: chatId,
      direction: 'outbound',
      message_body: testMessage,
      tenant_id: '124193bf-3093-41d0-a424-d9828c15f658'
    }])
    .select();

  if (insertError) {
    console.error("Insert Error:", insertError);
    return;
  }
  console.log("Outbound message inserted:", insertedMsg[0]);

  // Get final state
  const { data: finalChats } = await supabase
    .from('whatsapp_chats')
    .select('last_message, last_message_at, unread_count')
    .eq('id', chatId);
  console.log("Final Chat State after trigger execution:", finalChats[0]);
}

run();
