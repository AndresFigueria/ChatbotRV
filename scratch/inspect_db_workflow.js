import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT id, name, active FROM workflow_entity");
  console.log("=== DB WORKFLOWS ===");
  console.log(stmt.all());
} catch (err) {
  console.error(err);
}
