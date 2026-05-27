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
    
    // Recursive resolver that walks through references
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
    
    console.log("=== DEEP RESOLVED EXECUTION 490 DATA ===");
    
    const runDataHeader = arr[5];
    const crearPedidoIdx = parseInt(runDataHeader['Crear Pedido'], 10);
    console.log("Index for Crear Pedido:", crearPedidoIdx);
    
    const cpResolved = resolveDeep(arr[crearPedidoIdx]);
    console.log("Crear Pedido Resolved Execution Data:");
    console.log(JSON.stringify(cpResolved, null, 2));
  }
} catch (err) {
  console.error(err);
}
