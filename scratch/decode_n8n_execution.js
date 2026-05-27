import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare(`
    SELECT ee.id, ed.data 
    FROM execution_entity ee
    JOIN execution_data ed ON ee.id = ed.executionId
    WHERE ee.id = 493
  `);
  const row = stmt.get();
  
  if (row) {
    console.log(`Execution ID: ${row.id}`);
    
    // Custom flatted array parser
    const arr = JSON.parse(row.data);
    
    // Resolve references
    const resolve = (val) => {
      if (typeof val === 'string' && val.match(/^\d+$/)) {
        const index = parseInt(val, 10);
        return arr[index];
      }
      return val;
    };
    
    console.log("Array length:", arr.length);
    
    // Find keys in the deserialized structure
    // Typically the structure is [ {resultData: "1", ...}, rootObj, runDataObj, ... ]
    // Let's print the first 10 elements to see the structure
    for (let i = 0; i < Math.min(arr.length, 15); i++) {
      console.log(`\n--- Element ${i} ---`);
      console.log(JSON.stringify(arr[i]).slice(0, 500));
    }
  }
} catch (err) {
  console.error(err);
}
