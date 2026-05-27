import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT name, nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    console.log(`Workflow: ${row.name}`);
    const nodes = JSON.parse(row.nodes);
    const webhookNode = nodes.find(n => n.type === 'n8n-nodes-base.webhook');
    if (webhookNode) {
      console.log("Found Webhook Node:", JSON.stringify(webhookNode, null, 2));
    } else {
      console.log("No Webhook Node found in this workflow.");
    }
  } else {
    console.log("Workflow not found.");
  }
} catch (err) {
  console.error(err);
}
