const fs = require('fs');
const file = 'src/pages/Landing.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('--- gridTemplateColumns matches ---');
lines.forEach((line, idx) => {
  if (line.includes('gridTemplateColumns')) {
    console.log(`L${idx + 1}: ${line.trim()}`);
  }
});

console.log('\n--- display: \'flex\' / \'grid\' matches ---');
lines.forEach((line, idx) => {
  if ((line.includes("display: 'flex'") || line.includes("display: 'grid'")) && !line.includes('flexDirection')) {
    // Print lines around it or just the line itself
    console.log(`L${idx + 1}: ${line.trim()}`);
  }
});
