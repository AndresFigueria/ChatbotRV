import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare(`
    SELECT ee.id, ee.startedAt, ed.data 
    FROM execution_entity ee
    JOIN execution_data ed ON ee.id = ed.executionId
    ORDER BY ee.startedAt DESC 
    LIMIT 50
  `);
  const rows = stmt.all();
  
  console.log("=== SEARCHING FOR CREAR PEDIDO EXECUTIONS ===");
  for (const row of rows) {
    const arr = JSON.parse(row.data);
    const runDataHeader = arr[5]; // Usually Element 5 holds the node dictionary of runData
    
    if (runDataHeader && typeof runDataHeader === 'object') {
      const nodeNames = Object.keys(runDataHeader);
      if (nodeNames.includes('Crear Pedido')) {
        console.log(`\nFound execution ${row.id} at ${row.startedAt}`);
        console.log("Nodes executed:", nodeNames);
        
        // Find which array index corresponds to 'Crear Pedido'
        const runDataIdx = runDataHeader['Crear Pedido'];
        // Let's resolve the execution data of Crear Pedido
        const runDataArr = arr[parseInt(runDataIdx, 10)];
        console.log("Crear Pedido Execution details:", JSON.stringify(runDataArr, null, 2));
      }
    }
  }
} catch (err) {
  console.error(err);
}
