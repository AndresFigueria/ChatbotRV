const webhookUrl = "https://rxonfjssqnflqgqpjefu.supabase.co/functions/v1/whatsapp-webhook";

const fakePayload = {
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "1044099008789735",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15551868964",
              "phone_number_id": "1044099008789735"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Cliente de Prueba"
                },
                "wa_id": "51987654321"
              }
            ],
            "messages": [
              {
                "from": "51987654321",
                "id": "wamid.fakemessageid123456",
                "timestamp": Math.floor(Date.now() / 1000).toString(),
                "text": {
                  "body": "quiero la hamburguesa"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
};

console.log("=========================================");
console.log("🤖 Simulando llegada de cliente en WhatsApp...");
console.log("=========================================");

fetch(webhookUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(fakePayload)
})
.then(r => {
    if(!r.ok) console.log("Status: " + r.status);
    return r.text();
})
.then(res => {
  console.log("Respuesta de nuestro servidor Supabase:");
  console.log(res);
})
.catch(console.error);
