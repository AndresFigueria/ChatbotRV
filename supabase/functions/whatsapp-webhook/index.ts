import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
)

serve(async (req) => {
  const { method } = req
  if (method === "GET") {
    const url = new URL(req.url)
    const mode = url.searchParams.get("hub.mode")
    const token = url.searchParams.get("hub.verify_token")
    const challenge = url.searchParams.get("hub.challenge")
    if (mode === "subscribe" && token === "robotina_token_2024") {
      return new Response(challenge, { status: 200 })
    }
    return new Response("Forbidden", { status: 403 })
  }

  try {
    const body = await req.json()
    console.log("Webhook received:", JSON.stringify(body, null, 2))

    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const msg = body.entry[0].changes[0].value.messages[0]
      const from = msg.from
      const customerName = body.entry[0].changes[0].value.contacts?.[0]?.profile?.name || "Cliente WhatsApp"
      const incomingPhoneNumberId = body.entry[0].changes[0].value.metadata?.phone_number_id || "1091076967420278";
      
      // Obtener token de Meta
      const { data: tenantInfo } = await supabase
        .from('tenants')
        .select('whatsapp_token')
        .eq('phone_number_id', incomingPhoneNumberId)
        .single();

      const metaToken = tenantInfo?.whatsapp_token || Deno.env.get("META_API_TOKEN") || "";

      let messageBody = msg.text?.body || "";
      let mediaUrl = null;
      let mediaType = null;

      // Procesamiento de multimedia (video o imagen)
      if (msg.type === 'video' && msg.video?.id) {
        mediaType = 'video';
        messageBody = msg.video.caption || "Video";
        try {
          const getMediaResponse = await fetch(`https://graph.facebook.com/v25.0/${msg.video.id}`, {
            headers: { "Authorization": `Bearer ${metaToken}` }
          });
          const mediaMetadata = await getMediaResponse.json();
          if (mediaMetadata.url) {
            const downloadResponse = await fetch(mediaMetadata.url, {
              headers: { "Authorization": `Bearer ${metaToken}` }
            });
            const fileBlob = await downloadResponse.blob();
            const filePath = `${msg.video.id}.mp4`;
            
            const { error: uploadError } = await supabase.storage
              .from('chat_media')
              .upload(filePath, fileBlob, {
                contentType: mediaMetadata.mime_type || 'video/mp4',
                upsert: true
              });
              
            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('chat_media')
                .getPublicUrl(filePath);
              mediaUrl = publicUrl;
            } else {
              console.error("Storage upload error:", uploadError);
            }
          }
        } catch (mediaErr) {
          console.error("Error downloading video from Meta:", mediaErr);
        }
      } else if (msg.type === 'image' && msg.image?.id) {
        mediaType = 'image';
        messageBody = msg.image.caption || "Imagen";
        try {
          const getMediaResponse = await fetch(`https://graph.facebook.com/v25.0/${msg.image.id}`, {
            headers: { "Authorization": `Bearer ${metaToken}` }
          });
          const mediaMetadata = await getMediaResponse.json();
          if (mediaMetadata.url) {
            const downloadResponse = await fetch(mediaMetadata.url, {
              headers: { "Authorization": `Bearer ${metaToken}` }
            });
            const fileBlob = await downloadResponse.blob();
            const filePath = `${msg.image.id}.jpg`;
            
            const { error: uploadError } = await supabase.storage
              .from('chat_media')
              .upload(filePath, fileBlob, {
                contentType: mediaMetadata.mime_type || 'image/jpeg',
                upsert: true
              });
              
            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('chat_media')
                .getPublicUrl(filePath);
              mediaUrl = publicUrl;
            }
          }
        } catch (mediaErr) {
          console.error("Error downloading image from Meta:", mediaErr);
        }
      } else if (!messageBody) {
        messageBody = "Mensaje multimedia";
      }

      // 1. Upsert del Cliente
      const { data: customer, error: custError } = await supabase
        .from('customers')
        .upsert({ phone_number: from, name: customerName, last_order_date: new Date().toISOString() }, { onConflict: 'phone_number' })
        .select()
        .single()

      if (custError) throw custError

      // 2. Upsert del Chat
      const { data: chat, error: chatError } = await supabase
        .from('whatsapp_chats')
        .upsert({ 
          customer_id: customer.id, 
          last_message: messageBody, 
          contact_name: customerName, 
          last_message_at: new Date().toISOString() 
        }, { onConflict: 'customer_id' })
        .select()
        .single()

      if (chatError) throw chatError

      // 3. Guardar Mensaje Entrante
      await supabase.from('whatsapp_messages').insert({
        chat_id: chat.id,
        direction: 'inbound',
        message_body: messageBody,
        media_url: mediaUrl,
        media_type: mediaType
      })

      // Si el bot ya está inactivo (modo humano), salir de inmediato y no responder
      if (chat.is_bot_active === false) {
        console.log(`Human mode is active for chat ${chat.id}. Skipping auto-response.`);
        return new Response("OK", { status: 200 });
      }

      // -------------------------------------------------------
      // FLUJO DE EMERGENCIA - REENCUENTRO VENEZUELA
      // Etapas basadas en cuántos mensajes SALIENTES ha enviado el bot:
      //   0 → Menú principal
      //   1 → Petición de datos o handoff humano
      //   2+ → Recepción de datos separados por comas
      // -------------------------------------------------------
      const msg_lower = messageBody.toLowerCase().trim();

      // Contar mensajes SALIENTES del bot en este chat
      const { count: outboundCount } = await supabase
        .from('whatsapp_messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', chat.id)
        .eq('direction', 'outbound');

      const botStep = outboundCount ?? 0;

      let botReply = "";
      let triggerHumanMode = false;

      // ── Etapa 0: Primer contacto (Menú Principal) ──
      if (botStep === 0) {
        botReply = `Hola. Soy Reencuentro Venezuela 🇻🇪\n\nPuedo ayudarte con:\n\n1️⃣ Estoy bien\n2️⃣ Busco a alguien\n3️⃣ Encontré a alguien\n4️⃣ Información y ayuda\n5️⃣ Hablar con un voluntario\n\nResponde con el número correspondiente.`;

      // ── Etapa 1: Selección del menú ──
      } else if (botStep === 1) {
        if (msg_lower === "1" || msg_lower === "2" || msg_lower === "3") {
          botReply = `Por favor, responde en un solo mensaje con los siguientes datos separados por comas:\n\nNombre completo, Edad, Sexo, Ciudad/Ubicación, Fecha del último contacto.\n\n(Ejemplo: Juan Pérez, 45, Masculino, Caracas, 24 de junio)`;
        } else if (msg_lower === "4" || msg_lower === "5") {
          botReply = `Entendido. Un voluntario de nuestro equipo se contactará contigo por esta misma vía lo antes posible. Fuerza y esperanza. 🇻🇪`;
          triggerHumanMode = true;
        } else {
          botReply = `Por favor, responde solo con el número:\n\n1️⃣ Estoy bien\n2️⃣ Busco a alguien\n3️⃣ Encontré a alguien\n4️⃣ Información y ayuda\n5️⃣ Hablar con un voluntario`;
        }

      // ── Etapa 2+: Recepción de datos ──
      } else {
        if (messageBody.includes(',')) {
          botReply = `Datos registrados correctamente. Si hay alguna coincidencia, un voluntario te contactará por esta misma vía. Fuerza y esperanza. 🇻🇪`;
          triggerHumanMode = true;
        } else {
          botReply = `Para registrar la información correctamente, por favor asegúrate de separar los datos con comas ( , ). \n\nEjemplo: Nombre completo, Edad, Sexo, Ciudad/Ubicación, Fecha del último contacto.`;
        }
      }

      // Aplicar handoff humano si fue solicitado
      if (triggerHumanMode) {
        await supabase
          .from('whatsapp_chats')
          .update({ is_bot_active: false })
          .eq('id', chat.id);
      }

      // Construir payload de Meta
      const metaPayload = {
        messaging_product: "whatsapp",
        to: from,
        text: { body: botReply }
      };

      const metaResponse = await fetch(`https://graph.facebook.com/v25.0/${incomingPhoneNumberId}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${metaToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(metaPayload)
      })

      const metaData = await metaResponse.json()
      console.log("Meta Response:", metaData)

      // 5. Guardar Respuesta del Bot
      await supabase.from('whatsapp_messages').insert({
        chat_id: chat.id,
        direction: 'outbound',
        message_body: botReply,
        media_url: null,
        media_type: null
      })
    }

    return new Response("OK", { status: 200 })
  } catch (err) {
    console.error("Critical Webhook Error:", err)
    return new Response("Internal Error", { status: 500 })
  }
})
