import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT name, active, nodes, connections FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    console.log("=== WORKFLOW DATA ===");
    console.log("Name:", row.name);
    console.log("Active:", row.active);
    
    const nodes = JSON.parse(row.nodes);
    console.log("Nodes list:", nodes.map(n => n.name));
    
    // Write the full workflow json to a scratch file so we can inspect it or read parts of it if needed
    console.log("Nodes count:", nodes.length);
  }
} catch (err) {
  console.error(err);
}
