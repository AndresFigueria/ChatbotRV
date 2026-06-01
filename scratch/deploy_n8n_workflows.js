import { Client } from 'ssh2';
import fs from 'fs';

const host = '147.93.130.148';
const user = 'root';
const password = 'R0botina.2026.Seguridad.Total.!!';

const conn = new Client();

conn.on('ready', () => {
  console.log(`SSH connection ready. Opening SFTP...`);
  
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    console.log(`SFTP ready. Uploading workflows.json and import_workflows.sh...`);
    
    sftp.fastPut('workflows.json', '/tmp/workflows.json', (err) => {
      if (err) {
        console.error('SFTP upload error workflows.json:', err);
        conn.end();
        return;
      }
      
      sftp.fastPut('scratch/import_workflows.sh', '/tmp/import.sh', (err) => {
        if (err) {
          console.error('SFTP upload error import.sh:', err);
          conn.end();
          return;
        }
        
        console.log(`Uploaded successfully. Making import.sh executable...`);
        
        conn.exec('chmod +x /tmp/import.sh && /tmp/import.sh', (err, execStream) => {
          if (err) throw err;
          
          execStream.on('close', (code) => {
            console.log(`import.sh finished with code: ${code}`);
            
            if (code === 0) {
              console.log('Import command finished. Restarting n8n in PM2...');
              conn.exec('pm2 restart n8n', (err, restartStream) => {
                if (err) throw err;
                restartStream.on('close', (rCode) => {
                  console.log(`PM2 restart finished with code: ${rCode}`);
                  conn.end();
                }).on('data', (data) => {
                  process.stdout.write(data.toString());
                });
              });
            } else {
              console.error('import.sh failed. Check output.');
              conn.end();
            }
          }).on('data', (data) => {
            process.stdout.write(data.toString());
          }).stderr.on('data', (data) => {
            process.stderr.write(data.toString());
          });
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
