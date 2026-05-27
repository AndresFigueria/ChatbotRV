import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT id, name, nodes FROM workflow_entity WHERE id != '7SwRxH0Jx08L3ILP'");
  const rows = stmt.all();
  
  rows.forEach(row => {
    console.log(`=== Workflow ID: ${row.id} | Name: ${row.name} ===`);
    const nodes = JSON.parse(row.nodes);
    nodes.forEach(n => {
      if (n.type.includes('webhook') || n.type.includes('Webhook')) {
        console.log(`Node Name: ${n.name} | Path: ${n.parameters?.path} | WebhookID: ${n.webhookId}`);
      }
    });
  });
} catch (err) {
  console.error(err);
}
