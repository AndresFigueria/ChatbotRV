import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("=== SQLITE TABLES ===");
  console.log(stmt.all());
} catch (err) {
  console.error(err);
}
