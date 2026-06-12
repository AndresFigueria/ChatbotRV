import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('tenants')
    .update({
      whatsapp_token: 'EAAdRNS7bknMBRomg1KXdRhrOfMg8i3QA1Y71Ocv8ZCHIiN9RujAorQGZAZB6T5TCcNg2bQx99qrLMlQWIlKInAimhZB7OQQOy6ngiQJBZA3ZBbZBcRchn66K4GRkDnnhGkazlwC3uPSqt0DQk6LkmrVJvmwvr3elV2XUAjhBWLkcwGLEfNkRi0MRBL7YQBOolFTugZDZD',
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
