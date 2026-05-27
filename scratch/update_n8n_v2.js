const fs = require('fs');

const path = 'c:\\Users\\Administrator\\Desktop\\rrrrrrrrrrrrr_modificado.json';
const outPath = 'c:\\Users\\Administrator\\Desktop\\rrrrrrrrrrrrr_modificado_v2.json';

let dataString = fs.readFileSync(path, 'utf8');

// Replace $node['Resolver Tenant'].json with $('Resolver Tenant').first().json 
// to fix n8n tool connectivity issues.
dataString = dataString.replace(/\$node\['Resolver Tenant'\]\.json/g, "$('Resolver Tenant').first().json");

fs.writeFileSync(outPath, dataString);
console.log('Successfully created', outPath);
