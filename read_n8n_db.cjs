const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join('C:', 'Users', 'Administrator', '.n8n', 'database.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
    process.exit(1);
  }
});

db.serialize(() => {
  // Query all workflows
  db.all("SELECT id, name, nodes, connections FROM workflow_entity", (err, rows) => {
    if (err) {
      console.error('Error querying workflows', err);
      process.exit(1);
    }
    
    console.log(`Found ${rows.length} workflows in n8n database.`);
    
    rows.forEach(row => {
      console.log(`\nWorkflow ID: ${row.id}, Name: ${row.name}`);
      const nodesText = row.nodes;
      
      // Let's search for "EAA" in nodesText
      const regex = /EAA[a-zA-Z0-9]+/g;
      const matches = nodesText.match(regex);
      if (matches) {
        console.log("Found matching tokens:");
        matches.forEach(m => {
          if (m.length > 50) {
            console.log(`- ${m.substring(0, 30)}... (Length: ${m.length})`);
            console.log(`Full Token: ${m}`);
          }
        });
      } else {
        console.log("No long EAA tokens found in workflow nodes.");
      }
    });
    
    db.close();
  });
});
