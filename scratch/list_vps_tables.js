const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/root/.n8n/database.sqlite');
try {
  const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables in SQLite db:');
  rows.forEach(r => console.log('-', r.name));
} catch(e) {
  console.error(e);
}
