import * as fs from 'fs';
import * as path from 'path';

const file = path.resolve('workflows.json');
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

const wf0 = content[0];
const wf3 = content[3];

console.log('--- WORKFLOW 0 (CFNI5u9l6blnNkG0) Nodes:');
wf0.nodes.forEach(n => {
  console.log(`- ${n.name} (${n.type})`);
  if (n.name === 'AI Agent') {
    console.log('  System Message:', n.parameters?.options?.systemMessage?.substring(0, 100));
  }
});

console.log('\n--- WORKFLOW 3 (7SwRxH0Jx08L3ILP) Nodes:');
wf3.nodes.forEach(n => {
  console.log(`- ${n.name} (${n.type})`);
  if (n.name === 'AI Agent') {
    console.log('  System Message:', n.parameters?.options?.systemMessage?.substring(0, 100));
  }
});
