import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  
  // Table info
  const infoStmt = db.prepare("PRAGMA table_info(workflow_history)");
  const cols = infoStmt.all();
  console.log("=== TABLE INFO: workflow_history ===");
  cols.forEach(c => console.log(`Column: ${c.name} | Type: ${c.type}`));
  
  // Check rows matching versionId
  const rowsStmt = db.prepare("SELECT * FROM workflow_history WHERE workflowId = '7SwRxH0Jx08L3ILP' LIMIT 5");
  const rows = rowsStmt.all();
  console.log(`\n=== HISTORY ROWS: ${rows.length} ===`);
  rows.forEach(r => {
    console.log(`Workflow ID: ${r.workflowId} | Version ID: ${r.versionId} | Authors: ${r.authors}`);
  });
} catch (err) {
  console.error(err);
}
