import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  
  // 1. Get nodes and connections from workflow_entity
  const getStmt = db.prepare("SELECT nodes, connections FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = getStmt.get();
  
  if (row) {
    console.log("Found workflow in workflow_entity.");
    
    // 2. Update workflow_history
    const updateStmt = db.prepare(
      "UPDATE workflow_history SET nodes = ?, connections = ? WHERE versionId = 'c5f9a0a9-85be-4b51-8e93-b07e5057bd9b'"
    );
    const result = updateStmt.run(row.nodes, row.connections);
    console.log(`Updated workflow_history! Rows affected: ${result.changes}`);
    
    // 3. Verify
    const verifyStmt = db.prepare("SELECT nodes FROM workflow_history WHERE versionId = 'c5f9a0a9-85be-4b51-8e93-b07e5057bd9b'");
    const verifyRow = verifyStmt.get();
    if (verifyRow) {
      const nodes = JSON.parse(verifyRow.nodes);
      const node = nodes.find(n => n.name === 'Crear Pedido');
      console.log("Verified Crear Pedido jsonBody in workflow_history:", node.parameters?.jsonBody);
    }
  } else {
    console.log("Workflow 7SwRxH0Jx08L3ILP not found in workflow_entity.");
  }
} catch (err) {
  console.error("Error syncing workflow history:", err);
}
