import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  
  // List all tables
  const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table'");
  const tables = stmt.all();
  console.log("Tables in n8n DB:", tables.map(t => t.name));

  // If there's a webhook_entity table
  if (tables.some(t => t.name === 'webhook_entity')) {
    const wStmt = db.prepare("SELECT * FROM webhook_entity");
    console.log("Webhooks:", wStmt.all());
  } else {
    console.log("No webhook_entity table found.");
  }
} catch (err) {
  console.error(err);
}
