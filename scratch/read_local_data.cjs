const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/Administrator/.n8n/database.sqlite');
try {
  const row = db.prepare("SELECT * FROM credentials_entity WHERE id = 'CFMyPrlFJum28GvJ'").get();
  console.log(JSON.stringify(row, null, 2));
} catch(e) {
  console.error('Error querying SQLite:', e);
}
