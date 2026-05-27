import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare(`
    SELECT ee.id, ee.startedAt, ed.data 
    FROM execution_entity ee
    JOIN execution_data ed ON ee.id = ed.executionId
    ORDER BY ee.startedAt DESC 
    LIMIT 5
  `);
  const rows = stmt.all();
  
  console.log("=== DECODED BINARY PAYLOADS ===");
  for (const row of rows) {
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
    
    const runDataHeader = arr[5];
    if (runDataHeader && runDataHeader['WhatsApp Webhook POST']) {
      const webIdx = parseInt(runDataHeader['WhatsApp Webhook POST'], 10);
      const webNodeResolved = resolveDeep(arr[webIdx]);
      
      try {
        const binaryData = webNodeResolved[0]?.data?.main?.[0]?.[0]?.binary?.data;
        if (binaryData && binaryData.data) {
          const decoded = Buffer.from(binaryData.data, 'base64').toString('utf8');
          console.log(`\nExecution ID ${row.id} decoded binary body:`);
          console.log(JSON.stringify(JSON.parse(decoded), null, 2));
        } else {
          console.log(`\nExecution ID ${row.id} has no binary data.`);
        }
      } catch (e) {
        console.log(`\nExecution ID ${row.id} binary parse error:`, e.message);
      }
    }
  }
} catch (err) {
  console.error(err);
}
