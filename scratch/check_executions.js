const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/root/.n8n/database.sqlite');
try {
  const rows = db.prepare("SELECT id, status, workflowId, mode, startedAt FROM execution_entity ORDER BY id DESC LIMIT 10").all();
  console.log('Recent executions:');
  rows.forEach(r => {
    console.log(`- ID: ${r.id}, Status: ${r.status}, WorkflowId: ${r.workflowId}, Mode: ${r.mode}, Started: ${r.startedAt}`);
  });
} catch(e) {
  console.error('Error querying SQLite:', e);
}
