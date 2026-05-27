import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("PRAGMA table_info(workflow_entity)");
  const cols = stmt.all();
  console.log("=== TABLE INFO: workflow_entity ===");
  cols.forEach(c => console.log(`Column: ${c.name} | Type: ${c.type}`));
} catch (err) {
  console.error(err);
}
