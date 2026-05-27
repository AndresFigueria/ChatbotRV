import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT id, startedAt, stoppedAt, status FROM execution_entity WHERE id = 490");
  console.log("=== EXECUTION 490 TIME ===");
  console.log(stmt.get());
} catch (err) {
  console.error(err);
}
