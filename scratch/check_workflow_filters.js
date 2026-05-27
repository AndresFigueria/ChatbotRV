import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  if (row) {
    const nodes = JSON.parse(row.nodes);
    for (const node of nodes) {
      if (node.name === 'IF Valid Message' || node.name === 'Check Duplicate Message' || node.name === 'Bot Activo?') {
         console.log(`\n=== NODE: ${node.name} ===`);
         console.log(JSON.stringify(node.parameters, null, 2));
      }
    }
  }
} catch (err) {
  console.error(err);
}
