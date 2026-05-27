import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    console.log("=== NODES WITH 'delete' OR PROPERTY MUTATIONS ===");
    nodes.forEach(node => {
      const code = node.parameters?.jsCode || node.parameters?.code || '';
      if (code.includes('delete') || code.includes('from') || code.includes('wa_id')) {
        console.log(`\nNode: "${node.name}" (Type: ${node.type})`);
        console.log(code);
      }
    });
  }
} catch (err) {
  console.error(err);
}
