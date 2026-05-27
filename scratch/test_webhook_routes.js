async function testRoute(url) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        object: "whatsapp_business_account",
        entry: []
      })
    });
    console.log(`POST ${url} -> Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response: ${text.substring(0, 100)}`);
  } catch (err) {
    console.error(`Error requesting ${url}:`, err.message);
  }
}

async function run() {
  console.log("=== TESTING N8N WEBHOOK ROUTES ===");
  await testRoute('http://localhost:5678/webhook/whatsapp-webhook');
  await testRoute('http://localhost:5678/webhook/REPLACE_WITH_N8N_WEBHOOK_ID/whatsapp-webhook');
  await testRoute('http://localhost:5678/webhook-test/whatsapp-webhook');
  await testRoute('http://localhost:5678/webhook-test/REPLACE_WITH_N8N_WEBHOOK_ID/whatsapp-webhook');
}

run();
