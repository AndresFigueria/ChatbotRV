import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    console.log("=== NODES REFERENCING NORMALIZE WHATSAPP MESSAGE ===");
    nodes.forEach(node => {
      const nodeStr = JSON.stringify(node);
      if (nodeStr.includes('Normalize WhatsApp Message')) {
        console.log(`\n- Node: "${node.name}" (Type: ${node.type})`);
        // Find expressions
        const matches = nodeStr.match(/(\$[a-zA-Z0-9_$.'"()[\]{} -]+Normalize WhatsApp Message[a-zA-Z0-9_$.'"()[\]{} -]+)/g);
        if (matches) {
          console.log("Matches:", matches);
        } else {
          console.log("No specific regex match found, printing node parameters:");
          console.log(JSON.stringify(node.parameters, null, 2));
        }
      }
    });
  }
} catch (err) {
  console.error(err);
}
