const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/root/.n8n/database.sqlite');
try {
  const rows = db.prepare("SELECT name, active FROM workflow_entity").all();
  console.log('Workflows in database:');
  rows.forEach(r => {
    console.log(`- ${r.name}: ${r.active === 1 || r.active === true ? 'ACTIVE' : 'INACTIVE'}`);
  });
} catch(e) {
  console.error('Error querying SQLite:', e);
}
