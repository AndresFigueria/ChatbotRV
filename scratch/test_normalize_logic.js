import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare(`
    SELECT ed.data 
    FROM execution_data ed
    WHERE ed.executionId = 490
  `);
  const row = stmt.get();
  
  if (row) {
    const arr = JSON.parse(row.data);
    const resolveDeep = (val) => {
      if (val === null || val === undefined) return val;
      if (typeof val === 'string' && val.match(/^\d+$/)) {
        const idx = parseInt(val, 10);
        return resolveDeep(arr[idx]);
      }
      if (Array.isArray(val)) {
        return val.map(item => resolveDeep(item));
      }
      if (typeof val === 'object') {
        const res = {};
        for (const k of Object.keys(val)) {
          res[k] = resolveDeep(val[k]);
        }
        return res;
      }
      return val;
    };
    
    const runDataHeader = arr[5];
    const webIdx = parseInt(runDataHeader['WhatsApp Webhook POST'], 10);
    const resolvedWebhook = resolveDeep(arr[webIdx]);
    
    console.log("resolvedWebhook keys:", Object.keys(resolvedWebhook));
    console.log("resolvedWebhook[0] keys:", Object.keys(resolvedWebhook[0]));
    
    // In our check_webhook_keys.js script, resolved was an array:
    // resolved[0].data.main[0][0] was the node item containing json and binary
    const item = resolvedWebhook[0]?.data?.main?.[0]?.[0];
    console.log("item keys:", item ? Object.keys(item) : 'null');
    
    const webhookData = item?.json;
    const binaryData = item?.binary?.data?.data;
    
    let body = webhookData?.body || webhookData;
    if (binaryData) {
      try {
        const decoded = Buffer.from(binaryData, 'base64').toString('utf8');
        body = JSON.parse(decoded);
        console.log("Successfully parsed body from binary data!");
      } catch (e) {
        console.log("Failed to parse body from binary:", e.message);
      }
    }
    
    const value = body?.entry?.[0]?.changes?.[0]?.value || {};
    const message = value?.messages?.[0] || null;
    const contact = value?.contacts?.[0] || {};
    const status = value?.statuses?.[0] || null;
    
    console.log("=== SIMULATED NORMALIZATION ===");
    console.log("from:", message?.from);
    console.log("customer_name:", contact?.profile?.name || contact?.wa_id || null);
    console.log("display_phone_number:", value?.metadata?.display_phone_number || null);
  }
} catch (err) {
  console.error(err);
}
