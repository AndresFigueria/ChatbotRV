import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare(`
    SELECT ed.data 
    FROM execution_data ed
    ORDER BY ed.executionId DESC 
    LIMIT 1
  `);
  const row = stmt.get();
  
  if (row) {
    console.log("Type of row.data:", typeof row.data);
    if (row.data instanceof Buffer) {
      console.log("It is a Buffer! Size:", row.data.length);
      console.log("First 20 bytes:", row.data.slice(0, 20));
    } else {
      console.log("It is a string! Length:", row.data.length);
      console.log("First 100 chars:", row.data.slice(0, 100));
    }
  }
} catch (err) {
  console.error(err);
}
