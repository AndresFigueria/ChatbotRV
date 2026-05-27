import { DatabaseSync } from 'node:sqlite';
import * as fs from 'node:fs';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';
const jsonPath = 'c:/Users/Administrator/Desktop/proyectos/Robotina-Ccentral/workflows.json'.replace('Ccentral', 'Céntral');

try {
  const db = new DatabaseSync(dbPath);
  
  // Get the active workflow details
  const getStmt = db.prepare("SELECT * FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const activeWf = getStmt.get();
  
  if (activeWf) {
    console.log("Found active workflow in database.");
    
    // Read workflows.json
    let workflows = [];
    if (fs.existsSync(jsonPath)) {
      workflows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }
    
    // Update or append
    let updated = false;
    workflows = workflows.map(wf => {
      if (wf.id === activeWf.id) {
        wf.nodes = JSON.parse(activeWf.nodes);
        wf.connections = JSON.parse(activeWf.connections);
        wf.settings = JSON.parse(activeWf.settings);
        wf.staticData = activeWf.staticData ? JSON.parse(activeWf.staticData) : null;
        wf.meta = activeWf.meta ? JSON.parse(activeWf.meta) : null;
        wf.versionId = activeWf.versionId;
        wf.active = activeWf.active === 1 || activeWf.active === true;
        updated = true;
        console.log(`Updated workflow ID: ${wf.id} in workflows.json`);
      }
      return wf;
    });
    
    if (!updated) {
      workflows.push({
        id: activeWf.id,
        name: activeWf.name,
        active: activeWf.active === 1 || activeWf.active === true,
        nodes: JSON.parse(activeWf.nodes),
        connections: JSON.parse(activeWf.connections),
        settings: JSON.parse(activeWf.settings),
        staticData: activeWf.staticData ? JSON.parse(activeWf.staticData) : null,
        meta: activeWf.meta ? JSON.parse(activeWf.meta) : null,
        versionId: activeWf.versionId
      });
      console.log(`Appended workflow ID: ${activeWf.id} to workflows.json`);
    }
    
    fs.writeFileSync(jsonPath, JSON.stringify(workflows, null, 2), 'utf8');
    console.log("workflows.json written successfully!");
  } else {
    console.log("Active workflow not found in database.");
  }
} catch (err) {
  console.error("Error updating workflows.json:", err);
}
