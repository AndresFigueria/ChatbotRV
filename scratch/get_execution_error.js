const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/root/.n8n/database.sqlite');
try {
  const row = db.prepare("SELECT * FROM execution_data WHERE executionId = 3").get();
  if (row) {
    console.log('Execution Data length:', row.data?.length);
    try {
      const parsed = JSON.parse(row.data);
      console.log('Keys in parsed data:', Object.keys(parsed));
      console.log('resultData:', JSON.stringify(parsed.resultData, null, 2).slice(0, 2000));
    } catch(err) {
      console.log('Failed to parse json:', err);
      console.log('Data string:', row.data?.slice(0, 1000));
    }
  } else {
    console.log('No execution data found for ID 3.');
  }
} catch(e) {
  console.error('Error querying SQLite:', e);
}
