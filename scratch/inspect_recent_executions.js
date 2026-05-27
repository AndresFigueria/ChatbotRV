import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare(`
    SELECT ee.id, ee.workflowId, ee.status, ee.startedAt, ed.data 
    FROM execution_entity ee
    JOIN execution_data ed ON ee.id = ed.executionId
    ORDER BY ee.startedAt DESC 
    LIMIT 3
  `);
  const rows = stmt.all();
  
  console.log("=== RECENT N8N EXECUTIONS ===");
  for (const row of rows) {
    console.log(`\nExecution ID: ${row.id}`);
    console.log(`Workflow ID: ${row.workflowId}`);
    console.log(`Status: ${row.status}`);
    console.log(`Started At: ${row.startedAt}`);
    
    try {
      const data = JSON.parse(row.data);
      if (data.resultData && data.resultData.runData) {
        const runData = data.resultData.runData;
        console.log("Run nodes:", Object.keys(runData));
        
        if (runData['Crear Pedido']) {
          console.log("Crear Pedido node runs:", JSON.stringify(runData['Crear Pedido'], null, 2));
        }
        if (runData['Normalize WhatsApp Message']) {
          console.log("Normalize WhatsApp Message output:", JSON.stringify(runData['Normalize WhatsApp Message'][0]?.data?.main?.[0]?.[0]?.json, null, 2));
        }
        if (runData['WhatsApp Webhook POST']) {
          console.log("WhatsApp Webhook POST output:", JSON.stringify(runData['WhatsApp Webhook POST'][0]?.data?.main?.[0]?.[0]?.json, null, 2));
        }
        if (runData['AI Agent']) {
          console.log("AI Agent output (last message):", JSON.stringify(runData['AI Agent'][0]?.data?.main?.[0]?.slice(-1)[0]?.json, null, 2));
        }
      }
    } catch (e) {
      console.log("Could not parse data:", e.message);
    }
  }
} catch (err) {
  console.error(err);
}
