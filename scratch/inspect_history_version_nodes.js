import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes, connections FROM workflow_history WHERE versionId = 'c5f9a0a9-85be-4b51-8e93-b07e5057bd9b'");
  const row = stmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    const node = nodes.find(n => n.name === 'Crear Pedido');
    console.log("=== HISTORY DB NODES: Crear Pedido ===");
    console.log(JSON.stringify(node, null, 2));
    
    const connections = JSON.parse(row.connections);
    console.log("\n=== HISTORY DB CONNECTIONS FOR HTTP REQUEST ===");
    console.log(JSON.stringify(connections['HTTP Request'], null, 2));
  } else {
    console.log("No row in workflow_history matching activeVersionId.");
  }
} catch (err) {
  console.error(err);
}
