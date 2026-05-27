import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT id, workflowId, status, startedAt, stoppedAt FROM execution_entity ORDER BY startedAt DESC LIMIT 5");
  const rows = stmt.all();
  console.log("=== RECENT EXECUTIONS ===");
  rows.forEach(r => {
    console.log(`ID: ${r.id} | WorkflowID: ${r.workflowId} | Status: ${r.status} | StartedAt: ${r.startedAt} | StoppedAt: ${r.stoppedAt}`);
  });
} catch (err) {
  console.error(err);
}
