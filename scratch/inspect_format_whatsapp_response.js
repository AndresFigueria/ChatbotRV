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
  const stmt = db.prepare("SELECT data FROM execution_data WHERE executionId = 446");
  const row = stmt.get();
  
  if (row && row.data) {
    const parsed = flattedParse(row.data);
    const runData = parsed.resultData?.runData || parsed[0]?.resultData?.runData;
    
    if (runData && runData['AI Agent']) {
      console.log("=== AI AGENT RUN DATA ===");
      const run = runData['AI Agent'][0];
      console.log("Output:", JSON.stringify(run.data?.main?.[0]?.[0]?.json || run.data?.main?.[0]?.[0] || {}, null, 2));
    } else {
      console.log("AI Agent node run data not found.");
    }
  } else {
    console.log("Execution 446 data not found.");
  }
} catch (err) {
  console.error(err);
}
