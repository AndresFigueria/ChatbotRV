import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("PRAGMA table_info(execution_entity)");
  console.log("=== EXECUTION_ENTITY SCHEMA ===");
  console.log(stmt.all());
} catch (err) {
  console.error(err);
}
