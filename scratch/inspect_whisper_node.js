import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/Administrator/.n8n/database.sqlite';

try {
  const db = new DatabaseSync(dbPath);
  const stmt = db.prepare("SELECT nodes FROM workflow_entity WHERE id = '7SwRxH0Jx08L3ILP'");
  const row = stmt.get();
  
  if (row) {
    const nodes = JSON.parse(row.nodes);
    const whisperNode = nodes.find(n => n.name.toLowerCase().includes('whisper') || n.type.toLowerCase().includes('whisper'));
    
    if (whisperNode) {
      console.log("Found Whisper node:", JSON.stringify(whisperNode, null, 2));
    } else {
      console.log("No Whisper node found in workflow.");
    }
  }
} catch (err) {
  console.error(err);
}
