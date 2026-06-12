import * as fs from 'fs';
import * as path from 'path';

const file = path.resolve('workflows.json');
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

const wf3 = content[3];
const sendWaNode = wf3.nodes.find(n => n.name === 'Send WhatsApp Message');
const authParam = sendWaNode.parameters.headerParameters.parameters.find(p => p.name === 'Authorization');

console.log('Workflow 3 Send WhatsApp Message Authorization Header:', authParam.value);
