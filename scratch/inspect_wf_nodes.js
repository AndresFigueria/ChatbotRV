import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT name, active, nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    console.log(`Workflow Name: ${row.name}`);
    console.log(`Is Active: ${row.active}`);
    const nodes = JSON.parse(row.nodes);
    console.log("All Webhook type nodes inside the workflow:");
    nodes.forEach(n => {
      if (n.type.includes('webhook') || n.type.includes('Webhook')) {
        console.log(JSON.stringify(n, null, 2));
      }
    });
  } else {
    console.log("Workflow not found.");
  }
} catch (err) {
  console.error(err);
}
