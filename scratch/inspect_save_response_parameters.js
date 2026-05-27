import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    const saveNode = nodes.find(n => n.name === 'Guardar Respuesta Bot');
    console.log("=== GUARDAR RESPUESTA BOT PARAMETERS ===");
    console.log(JSON.stringify(saveNode.parameters, null, 2));
  }
} catch (err) {
  console.error(err);
}
