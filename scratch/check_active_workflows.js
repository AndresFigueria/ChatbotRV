import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT id, name, active FROM workflow_entity");
  const rows = stmt.all();
  console.log("=== ALL WORKFLOWS IN DB ===");
  rows.forEach(r => {
    console.log(`ID: ${r.id} | Active: ${r.active} | Name: ${r.name}`);
  });
} catch (err) {
  console.error(err);
}
