const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/root/.n8n/database.sqlite');
try {
  // Delete the other inactive workflows with the same name
  const del = db.prepare("DELETE FROM workflow_entity WHERE id != '7SwRxH0Jx08L3ILP' AND name = 'Robotina WhatsApp Restaurante V1 - Seguro y Escalable'");
  const delResult = del.run();
  console.log(`Deleted duplicate workflows. Rows affected: ${delResult.changes}`);
  
  // Set the main workflow to active
  const update = db.prepare("UPDATE workflow_entity SET active = 1 WHERE id = '7SwRxH0Jx08L3ILP'");
  const updateResult = update.run();
  console.log(`Activated main workflow. Rows affected: ${updateResult.changes}`);
} catch (e) {
  console.error('Error activating workflow:', e);
}
