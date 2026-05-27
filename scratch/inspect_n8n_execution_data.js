import { DatabaseSync } from 'node:sqlite';

// Simple flatted parser
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
    console.log("=== PARSED EXECUTION 446 DATA ===");
    
    // Look for node runs
    const runData = parsed[0]?.resultData?.runData;
    if (runData) {
      Object.keys(runData).forEach(nodeName => {
        console.log(`\nNode: ${nodeName}`);
        const run = runData[nodeName][0];
        if (run) {
          if (run.error) {
            console.log("  Error:", run.error);
          } else {
            console.log("  Input (First item):", JSON.stringify(run.data?.main?.[0]?.[0]?.json || run.data?.main?.[0]?.[0] || {}, null, 2));
            console.log("  Output (First item):", JSON.stringify(run.data?.main?.[0]?.[0]?.json || run.data?.main?.[0]?.[0] || {}, null, 2));
          }
        }
      });
    } else {
      console.log("Could not find runData inside parsed execution.");
      console.log(JSON.stringify(parsed, null, 2).substring(0, 1000));
    }
  } else {
    console.log("Execution 446 data not found in DB.");
  }
} catch (err) {
  console.error(err);
}
