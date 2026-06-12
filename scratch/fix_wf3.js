import * as fs from 'fs';
import * as path from 'path';

const file = path.resolve('workflows.json');
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

// Find Workflow 3 (7SwRxH0Jx08L3ILP)
const wf3 = content.find(w => w.id === '7SwRxH0Jx08L3ILP');
if (wf3) {
  const sendWaNode = wf3.nodes.find(n => n.name === 'Send WhatsApp Message');
  if (sendWaNode) {
    sendWaNode.retryOnFail = true;
    sendWaNode.maxTries = 3;
    sendWaNode.waitBetweenTries = 2000;
    console.log('Successfully set retry parameters on Workflow 3 Send WhatsApp Message node!');
  } else {
    console.error('Could not find Send WhatsApp Message node in Workflow 3');
  }
} else {
  console.error('Could not find Workflow 3 (7SwRxH0Jx08L3ILP)');
}

fs.writeFileSync(file, JSON.stringify(content, null, 2), 'utf8');
console.log('Saved workflows.json successfully.');
