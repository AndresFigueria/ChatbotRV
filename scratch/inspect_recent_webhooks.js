import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare(`
    SELECT ee.id, ee.startedAt, ed.data 
    FROM execution_entity ee
    JOIN execution_data ed ON ee.id = ed.executionId
    ORDER BY ee.startedAt DESC 
    LIMIT 6
  `);
  const rows = stmt.all();
  
  console.log("=== MOST RECENT WEBHOOK PAYLOADS ===");
  for (const row of rows) {
    console.log(`\nExecution ID: ${row.id} at ${row.startedAt}`);
    const arr = JSON.parse(row.data);
    
    const resolveDeep = (val) => {
      if (val === null || val === undefined) return val;
      if (typeof val === 'string' && val.match(/^\d+$/)) {
        const idx = parseInt(val, 10);
        return resolveDeep(arr[idx]);
      }
      if (Array.isArray(val)) {
        return val.map(item => resolveDeep(item));
      }
      if (typeof val === 'object') {
        const res = {};
        for (const k of Object.keys(val)) {
          res[k] = resolveDeep(val[k]);
        }
        return res;
      }
      return val;
    };
    
    // Find Webhook payload
    const runDataHeader = arr[5];
    if (runDataHeader && runDataHeader['WhatsApp Webhook POST']) {
      const webIdx = parseInt(runDataHeader['WhatsApp Webhook POST'], 10);
      const webNodeResolved = resolveDeep(arr[webIdx]);
      
      try {
        const bodyObj = webNodeResolved[0]?.data?.main?.[0]?.[0]?.json?.body;
        console.log("Parsed body object:", JSON.stringify(bodyObj, null, 2));
      } catch (e) {
        console.log("Could not parse body:", e.message);
      }
    }
  }
} catch (err) {
  console.error(err);
}
