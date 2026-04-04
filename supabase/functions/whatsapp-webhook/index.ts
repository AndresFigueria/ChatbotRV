import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "maitre-silencioso-token-123";

// Instanciamos el cliente de Supabase usando las variables de entorno inyectadas automáticamente por Edge Functions
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  const url = new URL(req.url);
  const method = req.method;

  // 1. Verificación del Webhook (GET request by Meta)
  if (method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode && token) {
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("🟢 WEBHOOK_VERIFIED");
        return new Response(challenge, { status: 200 });
      } else {
        return new Response("Forbidden", { status: 403 });
      }
    }
    return new Response("WhatsApp Webhook is running 🚀", { status: 200 });
  }

  // 2. Recepción de mensajes (POST request by Meta)
  if (method === "POST") {
    try {
      const body = await req.json();

      if (body.object === "whatsapp_business_account") {
        for (const entry of body.entry) {
          if (!entry.changes) continue;
          
          for (const change of entry.changes) {
            // Verificar si hay mensajes entrantes
            if (change.value && change.value.messages) {
              const messageInfo = change.value.messages[0];
              const contactInfo = change.value.contacts?.[0];
              
              const fromPhonenumber = messageInfo.from;
              const customerName = contactInfo?.profile?.name || "Desconocido";
              const messageBody = messageInfo.text?.body || "(Mensaje Multimedia)";
              
              console.log(`💬 Entrante - De: ${customerName} (${fromPhonenumber}) | Texto: ${messageBody}`);
              
              // PASO 1: Upsert del Chat (crearlo si no existe, actualizar fecha y nombre si existe)
              const { data: upsertedChat, error: upsertError } = await supabase
                .from('whatsapp_chats')
                .upsert(
                  { 
                    phone_number: fromPhonenumber, 
                    contact_name: customerName,
                    last_message_at: new Date().toISOString()
                  },
                  { onConflict: 'phone_number', ignoreDuplicates: false }
                )
                .select('id')
                .single();
              
              if (upsertError) {
                  console.error("❌ Error al guardar el chat:", upsertError);
                  continue; // Saltamos este mensaje
              }
              
              const chatId = upsertedChat.id;

              // PASO 2: Insertamos el mensaje en el historial del chat
              const { error: msgError } = await supabase
                .from('whatsapp_messages')
                .insert([{
                    chat_id: chatId,
                    direction: 'inbound',
                    message_body: messageBody,
                    status: 'received'
                }]);
                
              if (msgError) {
                  console.error("❌ Error guardando el mensaje:", msgError);
              } else {
                  console.log("✅ Mensaje inyectado a Supabase.");
                  
                  // ==========================================
                  // 🧠 PASO 3: EL CEREBRO DEL BOT AUTO-RESPUESTA
                  // ==========================================
                  const txt = messageBody.toLowerCase();
                  let autoReplyText = "";

                  if (txt.includes("hola") || txt.includes("buenas")) {
                      autoReplyText = "¡Hola! Bienvenido a Elegancia Operativa 🍽️. Soy tu mesero virtual. Escribe 'menú' para ver nuestros platos o 'quiero la hamburguesa' para hacer un pedido rápido.";
                  } else if (txt.includes("menú") || txt.includes("menu") || txt.includes("carta")) {
                      autoReplyText = "¡Excelente elección! 🍔 Hoy tenemos:\n1. Hamburguesa Doble Smash ($8.50)\n\nEscribe 'quiero la hamburguesa' para enviarlo a cocina.";
                  } else if (txt.includes("quiero") && (txt.includes("hamburguesa") || txt.includes("burger"))) {
                      // ====== LÓGICA DE PEDIDO AUTOMÁTICO =======
                      const orderCode = "#" + Math.floor(1000 + Math.random() * 9000); // Ej: #4592
                      
                      // Inyectar el pedido en la base de datos de la Cocina
                      const { error: orderError } = await supabase.from('orders').insert([{
                          order_code: orderCode,
                          items_count: 1,
                          total_amount: 8.50,
                          status: 'Pendiente'
                      }]);

                      if (orderError) {
                          console.error("Error creando comanda:", orderError);
                          autoReplyText = "Ups, hubo un problema técnico en la cocina, pero un mesero humano te atenderá en breve.";
                      } else {
                          autoReplyText = `¡Pedido confirmado! 🧑‍🍳🍔\n\nTu número de comanda es *${orderCode}*. Ya está sonando en la Terminal de Cocina.`;
                      }
                  } else if (txt.includes("reserva") || txt.includes("mesa")) {
                      autoReplyText = "¡Claro que sí! 📅 Por favor dime: ¿Para cuántas personas y a qué hora aproximada de la noche?";
                  }
                  
                  // Si el bot detectó algo que sabe responder, lo lanza:
                  if (autoReplyText !== "") {
                      // 3.1 Lo guarda en Supabase (Para que tú lo veas en el Dashboard)
                      await supabase.from('whatsapp_messages').insert([{
                          chat_id: chatId,
                          direction: 'outbound',
                          message_body: autoReplyText,
                          status: 'sent'
                      }]);

                      // 3.2 Llama a la API Real de Meta para que el cliente lo reciba en su celular
                      // (Esto está comentado momentáneamente hasta que conectes tu número real para que no de error)
                      /*
                      const META_TOKEN = Deno.env.get("META_API_TOKEN");
                      const PHONE_ID = "el-id-de-tu-numero-verificado";
                      await fetch(`https://graph.facebook.com/v22.0/${PHONE_ID}/messages`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${META_TOKEN}`, 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                              messaging_product: "whatsapp",
                              to: fromPhonenumber,
                              type: "text",
                              text: { body: autoReplyText }
                          })
                      });
                      */
                  }
              }
              
            }
          }
        }
        
        return new Response("EVENT_RECEIVED", { status: 200 });
      } else {
        return new Response("Not Found", { status: 404 });
      }
    } catch (error) {
      console.error("Error procesando Webhook POST:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
});
