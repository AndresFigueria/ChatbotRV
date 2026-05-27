import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  // Get the most recent execution for the active workflow
  const stmt = db.prepare(`
    SELECT ee.id, ee.startedAt, ed.data 
    FROM execution_entity ee
    JOIN execution_data ed ON ee.id = ed.executionId
    WHERE ee.workflowId = '7SwRxH0Jx08L3ILP'
    ORDER BY ee.id DESC
    LIMIT 1
  `);
  const row = stmt.get();
  
  if (row) {
    console.log(`=== LATEST EXECUTION: ${row.id} (${new Date(row.startedAt).toISOString()}) ===`);
    const data = JSON.parse(row.data);
    
    // Find the header item to locate "Crear Pedido" and "Normalize WhatsApp Message"
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

    const header = data[5]; // Usually at index 5
    if (header) {
      if (header['Normalize WhatsApp Message']) {
        const normIdx = parseInt(header['Normalize WhatsApp Message'], 10);
        console.log("\n--- NORMALIZE OUTPUT ---");
        console.log(JSON.stringify(resolveDeep(data[normIdx]), null, 2));
      }
      if (header['Crear Pedido']) {
        const cpIdx = parseInt(header['Crear Pedido'], 10);
        console.log("\n--- CREAR PEDIDO OUTPUT ---");
        console.log(JSON.stringify(resolveDeep(data[cpIdx]), null, 2));
      } else {
         console.log("\nNo Crear Pedido node found in this execution.");
      }
    }
  } else {
    console.log("No recent executions found.");
  }
} catch (err) {
  console.error(err);
}
