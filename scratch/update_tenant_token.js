import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('tenants')
    .update({
      whatsapp_token: 'EAAdRNS7bknMBRkOysf0s4b0pS5HbrrMF5r8reghoBkZASgKVz1wm0gZAZBetPJOMrYHDVYa3gBlElbZAQjuJbY5gj9QuF4EOk6xAw7QPLCES5KEDeRS72uFh7SCnARShxocKbI3sNtAliGEsZAttGu8RwjWQhtFFkMDxzqDQ4GLZBhvVFcygF4I80L4ZAvYaoWy1QZDZD',
      waba_id: '1598375971257952'
    })
    .eq('id', '4c652a69-006f-4194-9436-fd281d55e644')
    .select();
    
  if (error) {
    console.error("Error updating:", error);
  } else {
    console.log("Tenant updated successfully:");
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
