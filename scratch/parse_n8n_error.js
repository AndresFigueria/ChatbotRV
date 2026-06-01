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
    
    const errIdx = parsed[2].error;
    const errObj = lookup(errIdx);
    
    // errObj.node is an object but we need to resolve its strings
    const nodeObj = lookup(errObj.node);
    console.log('Node Name:', lookup(nodeObj.name));
    console.log('Node Type:', lookup(nodeObj.type));
  }
} catch(e) {
  console.error('Error:', e);
}
