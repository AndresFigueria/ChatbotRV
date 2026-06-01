import { Client } from 'ssh2';

const conn = new Client();
const host = '147.93.130.148';
const user = 'root';
const password = 'R0botina.2026.Seguridad.Total.!!';
const command = process.argv.slice(2).join(' ') || 'uname -a && docker --version && pm2 --version && node -v';

console.log(`Connecting to ${user}@${host}...`);

conn.on('ready', () => {
  console.log('SSH connection ready. Executing command:', command);
  conn.exec(command, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log(`Command stream closed. Code: ${code}, Signal: ${signal}`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
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
