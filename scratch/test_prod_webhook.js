const webhookUrl = "https://n8n-whatsappa-central.robotina-ia.com/webhook/whatsapp-webhook";

const fakePayload = {
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "1111633475368085",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "5491165994057",
              "phone_number_id": "1111633475368085"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Cliente de Prueba Antigravity"
                },
                "wa_id": "5491165994057"
              }
            ],
            "messages": [
              {
                "from": "5491165994057",
                "id": "wamid.antigravity_test_" + Date.now(),
                "timestamp": Math.floor(Date.now() / 1000).toString(),
                "text": {
                  "body": "Hola, ¿cuál es el menú del día de hoy?"
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
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)).catch(() => globalThis.fetch(...args));
console.log("🤖 Simulando llegada de cliente en WhatsApp a n8n Producción...");
console.log("=========================================");

fetch(webhookUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(fakePayload)
})
.then(async r => {
  console.log("Status Code:", r.status);
  const text = await r.text();
  console.log("Respuesta:");
  console.log(text);
})
.catch(console.error);
