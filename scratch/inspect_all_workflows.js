import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT id, name, active FROM workflow_entity");
  const rows = stmt.all();
  console.log("=== WORKFLOWS IN DB ===");
  rows.forEach(r => {
    console.log(`ID: ${r.id} | Name: ${r.name} | Active: ${r.active}`);
  });
} catch (err) {
  console.error(err);
}
