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
    const nodeIdx = parseInt(runDataHeader['Crear Pedido'], 10);
    const resolved = resolveDeep(arr[nodeIdx]);
    
    console.log("=== CREAR PEDIDO NODE EXECUTION DATA ===");
    const item = resolved[0];
    console.log("Input to Crear Pedido:", JSON.stringify(item?.inputOverride, null, 2));
    console.log("Output from Crear Pedido:", JSON.stringify(item?.data, null, 2));
    
    // In n8n v1+, HTTP Request node execution data contains the sent request options
    // Let's search inside the resolved node execution data for request details
    console.log("Detailed keys:", Object.keys(item));
    if (item?.data?.main) {
      console.log("main data resolved:", JSON.stringify(item.data.main).slice(0, 1000));
    }
  }
} catch (err) {
  console.error(err);
}
