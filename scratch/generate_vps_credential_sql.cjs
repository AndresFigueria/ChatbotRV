const CryptoJS = require('crypto-js');

const decryptedText = `{"apiKey":"sk-proj-PLACEHOLDER_DE_CONFIANZA_PARA_EVITAR_GITHUB_PUSH_PROTECTION"}`;
const vpsKey = "CcCssfAsq306kE1wlZWlhzOavz3jkWDR";

try {
  const encrypted = CryptoJS.AES.encrypt(decryptedText, vpsKey).toString();
  console.log('Encrypted for VPS:');
  console.log(encrypted);
  
  // Now write a VPS node script that will insert this encrypted row
  const vpsScriptContent = `
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/root/.n8n/database.sqlite');
try {
  // First, delete any existing credential with this ID
  db.prepare("DELETE FROM credentials_entity WHERE id = 'CFMyPrlFJum28GvJ'").run();
  
  // Insert the encrypted credential row
  const stmt = db.prepare(\`
    INSERT INTO credentials_entity (
      id, name, data, type, createdAt, updatedAt, 
      isManaged, isGlobal, isResolvable, resolvableAllowFallback, resolverId
    ) VALUES (
      'CFMyPrlFJum28GvJ', 'OpenAI account', ?, 'openAiApi', '2026-05-06 05:37:13.075', '2026-05-06 05:39:37.090',
      0, 0, 0, 0, null
    )
  \`);
  
  const result = stmt.run('${encrypted}');
  console.log('Inserted OpenAI credentials on VPS. Rows affected:', result.changes);
} catch (e) {
  console.error('Error inserting credential on VPS:', e);
}
  `;
  
  const fs = require('fs');
  fs.writeFileSync('scratch/insert_vps_credentials.js', vpsScriptContent.trim());
  console.log('Generated scratch/insert_vps_credentials.js');
} catch(e) {
  console.error('Encryption failed:', e);
}
