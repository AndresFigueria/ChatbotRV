import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    console.log("=== ALL TOOL NODES IN WORKFLOW ===");
    nodes.forEach(node => {
      if (node.type.includes('tool')) {
        console.log(`- Name: ${node.name} | Type: ${node.type}`);
        console.log(`  Description: ${node.parameters?.toolDescription}`);
      }
    });
  }
} catch (err) {
  console.error(err);
}
