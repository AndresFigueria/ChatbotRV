import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    const node = nodes.find(n => n.name === 'Registrar Cita o Reserva');
    console.log("=== REGISTRAR CITA O RESERVA TOOL DETAILS ===");
    console.log(JSON.stringify(node.parameters, null, 2));
  }
} catch (err) {
  console.error(err);
}
