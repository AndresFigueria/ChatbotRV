import * as fs from 'fs';
import * as path from 'path';

const file = path.resolve('workflows.json');
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

content.forEach((wf, index) => {
  console.log(`\nWorkflow [${index}] - ID: ${wf.id}, Name: ${wf.name}`);
  const webhookNode = wf.nodes.find(n => n.type === 'n8n-nodes-base.webhook');
  console.log('Webhook Path:', webhookNode ? webhookNode.parameters.path : 'None');
  console.log('Active in json:', wf.active);
});
