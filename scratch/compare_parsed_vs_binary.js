import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare(`
    SELECT ed.data 
    FROM execution_data ed
    WHERE ed.executionId = 490
  `);
  const row = stmt.get();
  
  if (row) {
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
    const webIdx = parseInt(runDataHeader['WhatsApp Webhook POST'], 10);
    const resolved = resolveDeep(arr[webIdx]);
    
    const parsedBody = resolved[0]?.data?.main?.[0]?.[0]?.json?.body;
    const binaryData = resolved[0]?.data?.main?.[0]?.[0]?.binary?.data?.data;
    const decodedBinary = JSON.parse(Buffer.from(binaryData, 'base64').toString('utf8'));
    
    console.log("=== COMPARING PARSED VS BINARY ===");
    console.log("Parsed body entry changes value contacts:", JSON.stringify(parsedBody?.entry?.[0]?.changes?.[0]?.value?.contacts));
    console.log("Binary body entry changes value contacts:", JSON.stringify(decodedBinary?.entry?.[0]?.changes?.[0]?.value?.contacts));
    
    console.log("Parsed body entry changes value messages:", JSON.stringify(parsedBody?.entry?.[0]?.changes?.[0]?.value?.messages));
    console.log("Binary body entry changes value messages:", JSON.stringify(decodedBinary?.entry?.[0]?.changes?.[0]?.value?.messages));
  }
} catch (err) {
  console.error(err);
}
