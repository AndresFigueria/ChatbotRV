import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT versionId, name FROM workflow_history WHERE versionId = 'c5f9a0a9-85be-4b51-8e93-b07e5057bd9b'");
  const row = stmt.get();
  
  if (row) {
    console.log("Found row in workflow_history matching activeVersionId c5f9a0a9-85be-4b51-8e93-b07e5057bd9b!");
  } else {
    console.log("No row in workflow_history matching activeVersionId c5f9a0a9-85be-4b51-8e93-b07e5057bd9b.");
  }
} catch (err) {
  console.error(err);
}
