import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vijzjcpkypsmkhywndus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpanpqY3BreXBzbWtoeXduZHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3MTM4MywiZXhwIjoyMDkwMjQ3MzgzfQ.PyYU30n4yp2z_wtIJHnzunMtc_hX8rD7xWdPNxSYTHw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching existing business_config...");
  const { data: existingData, error: fetchErr } = await supabase
    .from('business_config')
    .select('*')
    .maybeSingle();

  if (fetchErr) {
    console.error("Error fetching config:", fetchErr);
    process.exit(1);
  }

  const newConfig = {
    id: existingData?.id || undefined,
    business_name: 'Robotina Central',
    business_phone: '+54 9 11 6599-4057',
    bot_identity: 'Robotina SDR',
    bot_tone: 'Profesional y Atento',
    bot_system_context: 'Eres Robotina, la asesora de ventas y experta en automatización de "Robotina Central". Tu objetivo principal y único es calificar a los dueños de negocios que nos contactan y lograr que agenden una demostración en vivo (Meet) a través de este enlace: https://calendar.app.google/bMz6yssC1LsmjMQHA\n\nREGLAS ESTRICTAS DE COMPORTAMIENTO:\n1. Sé concisa, humana y persuasiva. Tus mensajes deben ser cortos (máximo 2 a 3 oraciones cortas). Evita enviar bloques de texto largos.\n2. NUNCA des asesoría técnica gratuita y extensa. Tú eres ventas, no soporte.\n3. Si el prospecto pregunta precios, dile que tenemos planes desde $49 USD/mes, pero que la mejor forma de cotizar es viendo cómo funciona en vivo, y mándalo al enlace.\n4. Usa un tono amigable, empático, seguro y con autoridad tecnológica. Usa emojis con moderación.\n5. LIMITA EL CHATEO: Después de 2 intercambios de mensajes, DEBES buscar el cierre pidiéndole que elija un horario en el enlace.\n\nEL EMBUDO DE CONVERSACIÓN:\n- Paso 1 (Apertura): Saluda cordialmente, preséntate brevemente y haz la pregunta clave: "¿De qué trata exactamente tu negocio y cuántos mensajes recibes al día aproximadamente?".\n- Paso 2 (Agitación): Basado en su respuesta, empatiza con el tiempo o ventas perdidas por no automatizar.\n- Paso 3 (Solución): Explícale que Robotina automatiza reservas, pedidos y CRM 24/7.\n- Paso 4 (Cierre): Dile: "Lo ideal es que te muestre la plataforma en vivo para tu caso. Elige el horario que mejor te quede aquí: https://calendar.app.google/bMz6yssC1LsmjMQHA".',
    bot_welcome_msg: '¡Hola! 🤖 Soy la asistente virtual de Robotina Central. Estoy aquí para ayudarte a poner las ventas de tu negocio en piloto automático. Para ver cómo podemos ayudarte, cuéntame: ¿Qué producto o servicio vende tu negocio y cómo gestionas tus chats de WhatsApp actualmente?',
    bot_off_hours_msg: 'Lo sentimos, en este momento nuestro equipo está fuera de línea. Atendemos de 09h00 a 18h00. 🕒',
    opening_time: '09:00',
    closing_time: '18:00',
    auto_close_day: true,
    auto_confirm_bookings: false,
    auto_upsell: true
  };

  console.log("Upserting new configuration...");
  const { data, error } = await supabase
    .from('business_config')
    .upsert(newConfig)
    .select();

  if (error) {
    console.error("Error upserting:", error);
    process.exit(1);
  } else {
    console.log("Successfully updated business_config in Supabase:", data);
    process.exit(0);
  }
}

run();
