import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealtime() {
  console.log('Logging in...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@prueba.com',
    password: 'admin' // Usually admin/123456 etc.
  });
  
  if (error) {
    console.error('Login error:', error.message);
    // Let's print the token if it works
    return;
  }
  
  console.log('Logged in! JWT App Metadata:', data.user.app_metadata);
  
  console.log('Subscribing to whatsapp_chats...');
  const channel = supabase.channel('test_realtime_chats')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_chats' }, (payload) => {
      console.log('REALTIME EVENT RECEIVED:', payload);
    })
    .subscribe((status, err) => {
      console.log('Subscription status:', status);
      if (err) console.error('Subscription error:', err);
    });
    
  console.log('Waiting 5 seconds for events...');
  
  // Wait a bit to ensure subscription is active
  await new Promise(r => setTimeout(r, 2000));
  
  // Now let's trigger an update
  console.log('Triggering an update...');
  // Since we are logged in as admin, let's fetch a chat and update it
  const { data: chats } = await supabase.from('whatsapp_chats').select('*').limit(1);
  if (chats && chats.length > 0) {
    const chat = chats[0];
    console.log('Updating chat:', chat.id);
    const { error: updErr } = await supabase.from('whatsapp_chats').update({ contact_name: chat.contact_name + ' (test)' }).eq('id', chat.id);
    if (updErr) console.error('Update error:', updErr.message);
    else console.log('Update successful, waiting for Realtime event...');
  }
  
  await new Promise(r => setTimeout(r, 3000));
  
  // Revert
  if (chats && chats.length > 0) {
    const chat = chats[0];
    await supabase.from('whatsapp_chats').update({ contact_name: chat.contact_name }).eq('id', chat.id);
  }
  
  console.log('Done.');
  process.exit(0);
}

testRealtime();
