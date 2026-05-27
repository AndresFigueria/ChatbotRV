import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    console.log("=== NODE TYPES IN ACTIVE WORKFLOW ===");
    nodes.forEach(node => {
      console.log(`Node: "${node.name}", Type: ${node.type}`);
    });
  }
} catch (err) {
  console.error(err);
}
