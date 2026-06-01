const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/Administrator/.n8n/database.sqlite');
try {
  const rows = db.prepare("SELECT id, name, type, createdAt FROM credentials_entity").all();
  console.log('Credentials in local database:');
  rows.forEach(r => {
    console.log(`- ID: ${r.id}, Name: ${r.name}, Type: ${r.type}`);
  });
} catch(e) {
  console.error('Error querying SQLite:', e);
}
