const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/root/.n8n/database.sqlite');
try {
  const row = db.prepare("SELECT name, nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'").get();
  if (row) {
    console.log('Workflow Name:', row.name);
    const nodes = JSON.parse(row.nodes);
    nodes.forEach(n => {
      if (n.name.includes('Agent')) {
        console.log('Agent Node details:');
        console.log(JSON.stringify(n, null, 2));
      }
    });
  } else {
    console.log('Workflow 7SwRxH0Jx08L3ILP not found in workflow_entity.');
  }
} catch(e) {
  console.error('Error:', e);
}
