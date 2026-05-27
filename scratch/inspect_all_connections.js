import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT connections FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const connections = JSON.parse(row.connections);
    console.log("=== ALL CONNECTIONS ===");
    console.log(JSON.stringify(connections, null, 2));
  }
} catch (err) {
  console.error(err);
}
