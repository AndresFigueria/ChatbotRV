import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare(`
    SELECT ee.id, ee.startedAt, ed.data 
    FROM execution_entity ee
    JOIN execution_data ed ON ee.id = ed.executionId
    WHERE ee.workflowId = '7SwRxH0Jx08L3ILP'
    ORDER BY ee.id DESC
    LIMIT 20
  `);
  const rows = stmt.all();
  
  for (const row of rows) {
    const data = JSON.parse(row.data);
    const resolveDeep = (val) => {
      if (val === null || val === undefined) return val;
      if (typeof val === 'string' && val.match(/^\d+$/)) {
        return resolveDeep(data[parseInt(val, 10)]);
      }
      if (Array.isArray(val)) return val.map(item => resolveDeep(item));
      if (typeof val === 'object') {
        const res = {};
        for (const k of Object.keys(val)) res[k] = resolveDeep(val[k]);
        return res;
      }
      return val;
    };

    const header = data[5];
    if (header && header['Send WhatsApp Message']) {
      const idx = parseInt(header['Send WhatsApp Message'], 10);
      const swm = resolveDeep(data[idx]);
      const status = swm?.[0]?.executionStatus;
      
      // Look for errors in Send WhatsApp Message
      if (status === 'error' || status === 'crashed') {
         console.log(`\n=== EXECUTION ${row.id} HAS ERROR IN Send WhatsApp Message ===`);
         console.log(JSON.stringify(swm, null, 2));
      }
    }
  }
  console.log("Finished checking last 20 executions.");
} catch (err) {
  console.error(err);
}
