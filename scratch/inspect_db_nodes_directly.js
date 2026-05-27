import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    const node = nodes.find(n => n.name === 'Crear Pedido');
    console.log("=== DB NODES: Crear Pedido ===");
    console.log(JSON.stringify(node, null, 2));
  } else {
    console.log("Workflow 7SwRxH0Jx08L3ILP not found.");
  }
} catch (err) {
  console.error(err);
}
