import fs from 'fs';

try {
  const data = JSON.parse(fs.readFileSync('workflows.json', 'utf8'));
  console.log("=== WORKFLOWS.JSON KEYS ===");
  console.log(Object.keys(data));
  
  if (data.nodes) {
    console.log("Number of nodes:", data.nodes.length);
    console.log("Node names:", data.nodes.map(n => n.name));
  } else if (Array.isArray(data)) {
    console.log("workflows.json is an array of length:", data.length);
    data.forEach((wf, i) => {
      console.log(`\nWorkflow ${i}: "${wf.name}"`);
      if (wf.nodes) {
        console.log("Node names:", wf.nodes.map(n => n.name));
      }
    });
  }
} catch (err) {
  console.error(err);
}
