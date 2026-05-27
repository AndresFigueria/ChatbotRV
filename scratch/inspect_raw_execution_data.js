import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare(`
    SELECT ee.id, ed.data 
    FROM execution_entity ee
    JOIN execution_data ed ON ee.id = ed.executionId
    ORDER BY ee.startedAt DESC 
    LIMIT 1
  `);
  const row = stmt.get();
  
  if (row) {
    console.log(`Execution ID: ${row.id}`);
    const data = JSON.parse(row.data);
    console.log("Keys in data:", Object.keys(data));
    if (data.resultData) {
      console.log("Keys in resultData:", Object.keys(data.resultData));
      if (data.resultData.runData) {
        console.log("Keys in runData:", Object.keys(data.resultData.runData));
        for (const nodeName of Object.keys(data.resultData.runData)) {
          console.log(`Node "${nodeName}":`, JSON.stringify(data.resultData.runData[nodeName]?.[0]?.data?.main?.[0]?.[0]?.json));
        }
      }
    }
  }
} catch (err) {
  console.error(err);
}
