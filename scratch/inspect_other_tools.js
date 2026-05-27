import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    console.log("=== CHECKING ALL NODES FOR LEGACY REFERENCES ===");
    nodes.forEach(node => {
      const nodeStr = JSON.stringify(node);
      if (nodeStr.includes("$node['") || nodeStr.includes("$node[\"")) {
        console.log(`- Node "${node.name}" (Type: ${node.type}) contains legacy $node reference!`);
        // Print the parameters containing the reference
        console.log("Parameters:", JSON.stringify(node.parameters, null, 2));
      }
    });
  }
} catch (err) {
  console.error(err);
}
