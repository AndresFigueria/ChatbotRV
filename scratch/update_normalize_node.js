import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

const newCode = `// Lee explícitamente del Webhook inicial
const webhookItem = $('WhatsApp Webhook POST').item;
let body = webhookItem.json.body || webhookItem.json;

// Intentar leer de binary si existe (porque n8n recorta campos como 'from' y 'wa_id' en JSON en algunas versiones)
try {
  if (webhookItem.binary && webhookItem.binary.data && webhookItem.binary.data.data) {
    const decoded = Buffer.from(webhookItem.binary.data.data, 'base64').toString('utf8');
    body = JSON.parse(decoded);
  }
} catch (e) {
  // Ignorar error, usar JSON por defecto
}

const value = body?.entry?.[0]?.changes?.[0]?.value || {};
const message = value?.messages?.[0] || null;
const contact = value?.contacts?.[0] || {};
const status = value?.statuses?.[0] || null;

if (status && !message) {
  return [{
    json: {
      is_valid_message: false,
      event_type: 'status',
      reason: 'WhatsApp status event ignored',
      status_id: status.id || null,
      status_value: status.status || null,
      raw: body
    }
  }];
}

if (!message) {
  return [{
    json: {
      is_valid_message: false,
      event_type: 'unknown',
      reason: 'No message object found',
      raw: body
    }
  }];
}

const type = message.type;
let text = '';
let media_id = null;

if (type === 'text') {
  text = message?.text?.body || '';
}

if (type === 'audio') {
  media_id = message?.audio?.id || null;
}

if (type === 'image') {
  text = message?.image?.caption || '';
  media_id = message?.image?.id || null;
}

if (type === 'document') {
  text = message?.document?.caption || '';
  media_id = message?.document?.id || null;
}

return [{
  json: {
    is_valid_message: true,
    event_type: 'message',
    from: message.from,
    customer_name: contact?.profile?.name || contact?.wa_id || null,
    message_id: message.id,
    message_type: type,
    text,
    media_id,
    timestamp: message.timestamp,
    session_id: message.from,
    business_phone_number_id: value?.metadata?.phone_number_id || null,
    display_phone_number: value?.metadata?.display_phone_number || null,
    raw_message: message
  }
}];`;

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  if (row) {
    const nodes = JSON.parse(row.nodes);
    let found = false;
    for (const n of nodes) {
      if (n.name === 'Normalize WhatsApp Message') {
        n.parameters.jsCode = newCode;
        found = true;
        break;
      }
    }
    
    if (found) {
      const updateStmt = db.prepare("UPDATE workflow_entity SET nodes = ? WHERE id = '7SwRxH0Jx08L3ILP'");
      updateStmt.run(JSON.stringify(nodes));
      console.log("Successfully updated workflow in database!");
    } else {
      console.log("Node not found!");
    }
  }
} catch (err) {
  console.error(err);
}
