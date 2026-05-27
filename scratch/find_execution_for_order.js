import { DatabaseSync } from 'node:sqlite';

function flattedParse(text) {
  const arr = JSON.parse(text);
  const resolved = [];
  
  function resolve(val, index) {
    if (typeof val === 'string') {
      const idx = parseInt(val, 10);
      if (!isNaN(idx) && idx.toString() === val) {
        if (resolved[idx]) return resolved[idx];
        const rawVal = arr[idx];
        if (typeof rawVal === 'object' && rawVal !== null) {
          const res = Array.isArray(rawVal) ? [] : {};
          resolved[idx] = res;
          for (const k in rawVal) {
            res[k] = resolve(rawVal[k], idx);
          }
          return res;
        }
        return rawVal;
      }
    } else if (typeof val === 'object' && val !== null) {
      for (const k in val) {
        val[k] = resolve(val[k], index);
      }
    }
    return val;
  }
  
  return resolve(arr[0], 0);
}

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  
  // Get executions
  const stmt = db.prepare("SELECT executionId, data FROM execution_data ORDER BY executionId DESC LIMIT 20");
  const rows = stmt.all();
  
  for (const row of rows) {
    if (row.data.includes("WA-8052") || row.data.includes("8052") || row.data.includes("Crear Pedido")) {
      const parsed = flattedParse(row.data);
      const runData = parsed.resultData?.runData || parsed[0]?.resultData?.runData;
      if (runData && runData['Crear Pedido']) {
        console.log(`=== FOUND EXECUTION ID: ${row.executionId} ===`);
        console.log("Crear Pedido Node Run Data:");
        console.log(JSON.stringify(runData['Crear Pedido'][0], null, 2));
      }
    }
  }
} catch (err) {
  console.error(err);
}
