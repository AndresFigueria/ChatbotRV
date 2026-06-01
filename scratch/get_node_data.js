const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/root/.n8n/database.sqlite');
try {
  const row = db.prepare("SELECT * FROM execution_data WHERE executionId = 3").get();
  if (row) {
    const parsed = JSON.parse(row.data);
    const lookup = (indexStr) => {
      const idx = parseInt(indexStr, 10);
      return parsed[idx];
    };
    
    const lookupDeep = (val) => {
      if (typeof val === 'string' && /^\d+$/.test(val)) {
        const resolved = lookup(val);
        return lookupDeep(resolved);
      }
      if (Array.isArray(val)) {
        return val.map(lookupDeep);
      }
      if (val && typeof val === 'object') {
        const res = {};
        for (const key of Object.keys(val)) {
          res[key] = lookupDeep(val[key]);
        }
        return res;
      }
      return val;
    };
    
    const runDataIdx = parsed[2].runData;
    const runData = lookup(runDataIdx);
    const sendWANodeTasksIdx = runData['Send WhatsApp Message'];
    
    if (sendWANodeTasksIdx) {
      const sendWANodeTasks = lookup(sendWANodeTasksIdx);
      const rawTask = lookup(sendWANodeTasks[0]);
      const resolvedTask = lookupDeep(rawTask);
      console.log('Resolved Task Keys:', Object.keys(resolvedTask));
      console.log('Execution Status:', resolvedTask.executionStatus);
      console.log('Error Details:', JSON.stringify(resolvedTask.error, null, 2));
      console.log('Full Resolved Task:', JSON.stringify(resolvedTask, null, 2).slice(0, 3000));
    } else {
      console.log('Send WhatsApp Message node not found in runData.');
    }
  }
} catch(e) {
  console.error('Error:', e);
}
