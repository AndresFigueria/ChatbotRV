import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT id, versionId, activeVersionId FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  console.log("=== WORKFLOW VERSION DETAILS ===");
  console.log(JSON.stringify(row, null, 2));
} catch (err) {
  console.error(err);
}
