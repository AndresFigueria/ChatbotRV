const fs = require('fs');
const path = require('path');

function searchFiles(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === '.next') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchFiles(fullPath, pattern);
    } else if (stat.isFile()) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(pattern)) {
          console.log(`Found pattern in file: ${fullPath}`);
          // Print matching line(s)
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes(pattern)) {
              console.log(`  L${index + 1}: ${line.trim()}`);
            }
          });
        }
      } catch (e) {}
    }
  }
}

console.log('Searching for supabase.co references in /root/robotina...');
searchFiles('/root/robotina', 'supabase.co');
