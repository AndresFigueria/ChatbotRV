import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT * FROM webhook_entity");
  const rows = stmt.all();
  console.log("=== WEBHOOKS IN DB ===");
  console.log(`Found ${rows.length} webhooks.`);
  rows.forEach(r => {
    console.log(JSON.stringify(r, null, 2));
  });
} catch (err) {
  console.error(err);
}
