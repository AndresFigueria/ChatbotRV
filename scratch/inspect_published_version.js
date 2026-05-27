import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  
  // Pragma info
  const infoStmt = db.prepare("PRAGMA table_info(workflow_published_version)");
  const cols = infoStmt.all();
  console.log("=== TABLE INFO: workflow_published_version ===");
  cols.forEach(c => console.log(`Column: ${c.name} | Type: ${c.type}`));
  
  // Rows
  const rowsStmt = db.prepare("SELECT * FROM workflow_published_version");
  const rows = rowsStmt.all();
  console.log(`\n=== ROWS COUNT: ${rows.length} ===`);
  rows.forEach(r => {
    console.log(`Workflow ID: ${r.workflowId} | Version ID: ${r.versionId} | Created: ${r.createdAt}`);
  });
} catch (err) {
  console.error(err);
}
