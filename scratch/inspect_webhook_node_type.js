import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    const node = nodes.find(n => n.name === 'WhatsApp Webhook POST');
    console.log("=== WEBHOOK NODE TYPE ===");
    console.log(`Type: ${node.type}, TypeVersion: ${node.typeVersion}`);
    console.log(JSON.stringify(node.parameters, null, 2));
  }
} catch (err) {
  console.error(err);
}
