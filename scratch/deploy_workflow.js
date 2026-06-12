import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';

const conn = new Client();
const host = '147.93.130.148';
const user = 'root';
const password = 'R0botina.2026.Seguridad.Total.!!';
const port = 2244;

const localFile = path.resolve('workflows.json');
const remoteFile = '/root/workflows.json';

console.log('Reading local workflows.json...');
if (!fs.existsSync(localFile)) {
  console.error('Error: workflows.json not found in the root directory.');
  process.exit(1);
}

console.log(`Connecting to ${user}@${host}:${port}...`);
conn.on('ready', () => {
  console.log('SSH connection established. Starting SFTP upload...');
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP Error:', err);
      conn.end();
      return;
    }

    sftp.fastPut(localFile, remoteFile, {}, (err) => {
      if (err) {
        console.error('Upload Error:', err);
        conn.end();
        return;
      }
      console.log(`Successfully uploaded workflows.json to VPS at ${remoteFile}`);

      const command = 'npx n8n import:workflow --input /root/workflows.json && pm2 restart n8n';
      console.log('Executing remote import command:', command);

      conn.exec(command, (err, stream) => {
        if (err) {
          console.error('Execution Error:', err);
          conn.end();
          return;
        }

        stream.on('close', (code, signal) => {
          console.log(`Command closed with code ${code}`);
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
  host,
  port,
  username: user,
  password
});
