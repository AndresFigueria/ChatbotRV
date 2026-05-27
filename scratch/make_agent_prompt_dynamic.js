import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  
  // 1. Get nodes from workflow_entity
  const getStmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = getStmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    const agentNode = nodes.find(n => n.name === 'AI Agent');
    
    if (agentNode) {
      console.log("Old AI Agent systemMessage:", agentNode.parameters?.options?.systemMessage);
      
      // Update systemMessage to be dynamic
      if (!agentNode.parameters.options) {
        agentNode.parameters.options = {};
      }
      agentNode.parameters.options.systemMessage = "={{ $('HTTP Request').first().json.system_prompt }}";
      
      const nodesJson = JSON.stringify(nodes);
      
      // 2. Update workflow_entity
      const updateEntityStmt = db.prepare("UPDATE workflow_entity SET nodes = ? WHERE id = '7SwRxH0Jx08L3ILP'");
      updateEntityStmt.run(nodesJson);
      console.log("Updated AI Agent systemMessage in workflow_entity!");
      
      // 3. Update workflow_history
      const updateHistoryStmt = db.prepare(
        "UPDATE workflow_history SET nodes = ? WHERE versionId = 'c5f9a0a9-85be-4b51-8e93-b07e5057bd9b'"
      );
      updateHistoryStmt.run(nodesJson);
      console.log("Updated AI Agent systemMessage in workflow_history!");
    } else {
      console.log("AI Agent node not found.");
    }
  } else {
    console.log("Workflow 7SwRxH0Jx08L3ILP not found.");
  }
} catch (err) {
  console.error("Error making agent prompt dynamic:", err);
}
