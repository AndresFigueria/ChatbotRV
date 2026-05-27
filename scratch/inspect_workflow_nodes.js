import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT id, name, active, nodes, connections FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    console.log(`=== Workflow ID: ${row.id} | Active: ${row.active} | Name: ${row.name} ===`);
    const nodes = JSON.parse(row.nodes);
    console.log("Nodes count:", nodes.length);
    nodes.forEach(n => {
      if (n.type.includes('webhook') || n.type.includes('Webhook')) {
        console.log("Webhook node configuration:");
        console.log(JSON.stringify(n, null, 2));
      }
    });
  } else {
    console.log("Workflow 7SwRxH0Jx08L3ILP not found!");
  }
} catch (err) {
  console.error(err);
}
