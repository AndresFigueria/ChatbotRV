import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT name, type FROM credentials_entity");
  console.log("=== N8N CREDENTIALS ===");
  console.log(stmt.all());
} catch (err) {
  console.error(err);
}
