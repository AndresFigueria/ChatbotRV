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
    LIMIT 50
  `);
  const rows = stmt.all();
  
  const fromNumbers = new Set();
  
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
    if (header && header['WhatsApp Webhook POST']) {
      const idx = parseInt(header['WhatsApp Webhook POST'], 10);
      const web = resolveDeep(data[idx]);
      const item = web?.[0]?.data?.main?.[0]?.[0];
      const binaryData = item?.binary?.data?.data;
      if (binaryData) {
        try {
          const decoded = Buffer.from(binaryData, 'base64').toString('utf8');
          const body = JSON.parse(decoded);
          const value = body?.entry?.[0]?.changes?.[0]?.value || {};
          const msg = value?.messages?.[0];
          if (msg && msg.from) {
             fromNumbers.add(msg.from);
          }
        } catch(e) {}
      }
    }
  }
  console.log("Numbers that sent a message in the last 50 executions:");
  console.log(Array.from(fromNumbers));
} catch (err) {
  console.error(err);
}
