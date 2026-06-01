import { Client } from 'ssh2';
import fs from 'fs';

const localFile = process.argv[2] || 'scratch/vps_check.js';
const remotePath = process.argv[3] || '/tmp/run.js';

if (!fs.existsSync(localFile)) {
  console.error(`Local file ${localFile} not found`);
  process.exit(1);
}

const host = '147.93.130.148';
const user = 'root';
const password = 'R0botina.2026.Seguridad.Total.!!';

const conn = new Client();

conn.on('ready', () => {
  console.log(`SSH connection ready. Opening SFTP...`);
  
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    console.log(`SFTP ready. Uploading ${localFile} to ${remotePath}...`);
    sftp.fastPut(localFile, remotePath, (err) => {
      if (err) {
        console.error('SFTP upload error:', err);
        conn.end();
        return;
      }
      
      console.log(`Uploaded successfully. Executing remote file...`);
      
      // Execute the uploaded script using Node v22 path
      const nodePath = '/root/.local/share/pnpm/store/v11/links/@/node/22.22.3/8900afdd38c8bbff16c18040d415cc2b5697706817bd30c0e37fd388a10edb00/node_modules/node/bin/node';
      conn.exec(`${nodePath} ${remotePath}`, (err, execStream) => {
        if (err) throw err;
        
        execStream.on('close', (code) => {
          console.log(`Execution finished with code: ${code}`);
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data.toString());
        }).stderr.on('data', (data) => {
          process.stderr.write(data.toString());
        });
      });
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection Error:', err);
}).connect({
  host: host,
  port: 22,
  username: user,
  password: password
});
