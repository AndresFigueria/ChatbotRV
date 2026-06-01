const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/root/.n8n/database.sqlite');
try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables:', tables.map(t => t.name));
  for (const table of tables) {
    try {
      const count = db.prepare(`SELECT count(*) as count FROM ${table.name}`).get();
      console.log(`${table.name}: ${count.count}`);
    } catch(e) {
      console.log(`Error counting ${table.name}: ${e.message}`);
    }
  }
} catch(e) {
  console.error('Error querying SQLite:', e);
}
