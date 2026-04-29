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
      const messageBody = msg.text?.body || "Mensaje multimedia"
      const customerName = body.entry[0].changes[0].value.contacts?.[0]?.profile?.name || "Cliente WhatsApp"

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
        message_body: messageBody
      })

      // --- LOGICA DE DETECCION DE PEDIDO ---
      const triggerWords = ["pedido", "quiero", "ordenar", "hamburguesa", "pizza", "menú", "cuenta"];
      const isOrderIntent = triggerWords.some(word => messageBody.toLowerCase().includes(word));

      let botReply = `¡Hola ${customerName}! Soy Robotina Central. ¿En qué puedo ayudarte hoy?`

      if (isOrderIntent) {
        // Simular creación de pedido real en la DB
        const orderCode = "#WA-" + Math.floor(1000 + Math.random() * 9000);
        const { error: orderErr } = await supabase.from('orders').insert({
          order_code: orderCode,
          customer_id: customer.id,
          items_count: Math.floor(Math.random() * 3) + 1,
          total_amount: (Math.random() * 25 + 10).toFixed(2),
          status: 'Pendiente'
        });

        if (!orderErr) {
          botReply = `¡Excelente elección! He registrado tu pedido ${orderCode}. Ya lo puedes ver en nuestro monitor. ¿Algo más?`
        }
      }

      // 4. Enviar respuesta por Meta API
      const phoneNumberId = Deno.env.get("PHONE_NUMBER_ID") || "1091076967420278"
      const metaToken = Deno.env.get("META_API_TOKEN") || "EAAdRNS7bknMBRZA88CYISBt0ZBZA3WAshaA6nJZAup0mo7ZCsvAswHIX8kFStS0rvRrhuS9le217XLQ0dX6gKbJnZBDAU2HDpA9ntzEZAI73rbSga1mXfo1XRZAkLOGqB3DtZChah255jJcAHWqxXKfd26utRec6KYtfw89hN8vKj95KzuU33JHcGLKwPw8tQsq4gKbk9mD2cwEksObLcCQ9IjxoAZCUnONGIwKHqE5jJN1U16Y8HAtuYIBK3ZBEIxVAqowcWavWwERozUxMAUBESlvQlyGiS1MS7MAlZB5CLFUZD"

      const metaResponse = await fetch(`https://graph.facebook.com/v25.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${metaToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: { body: botReply }
        })
      })

      const metaData = await metaResponse.json()
      console.log("Meta Response:", metaData)

      // 5. Guardar Respuesta del Bot
      await supabase.from('whatsapp_messages').insert({
        chat_id: chat.id,
        direction: 'outbound',
        message_body: botReply
      })
    }

    return new Response("OK", { status: 200 })
  } catch (err) {
    console.error("Critical Webhook Error:", err)
    return new Response("Internal Error", { status: 500 })
  }
})
