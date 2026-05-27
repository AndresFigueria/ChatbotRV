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
  const stmt = db.prepare("SELECT executionId, data FROM execution_data ORDER BY executionId DESC LIMIT 100");
  const rows = stmt.all();
  
  console.log("=== REGISTRAR CITA O RESERVA RUNS ===");
  for (const row of rows) {
    const parsed = flattedParse(row.data);
    const runData = parsed.resultData?.runData || parsed[0]?.resultData?.runData;
    if (runData && runData['Registrar Cita o Reserva']) {
      const run = runData['Registrar Cita o Reserva'][0];
      console.log(`Execution ${row.executionId}: Status: ${run.executionStatus}`);
      console.log(`Input query:`, run.inputOverride?.ai_tool?.[0]?.[0]?.json?.query);
      console.log(`Response:`, run.data?.ai_tool?.[0]?.[0]?.json?.response);
      console.log("-----------------------------------------");
    }
  }
} catch (err) {
  console.error(err);
}
