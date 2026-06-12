import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';

const conn = new Client();
const host = '147.93.130.148';
const user = 'root';
const password = 'R0botina.2026.Seguridad.Total.!!';
const port = 2244;

const localFile = path.resolve('scratch/check_db.py');
const remoteFile = '/root/check_db.py';

conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) {
      console.error(err);
      conn.end();
      return;
    }
    sftp.fastPut(localFile, remoteFile, {}, (err) => {
      if (err) {
        console.error(err);
        conn.end();
        return;
      }
      conn.exec('python3 /root/check_db.py && rm /root/check_db.py', (err, stream) => {
        if (err) {
          console.error(err);
          conn.end();
          return;
        }
        stream.on('close', () => {
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data.toString());
        }).stderr.on('data', (data) => {
          process.stderr.write(data.toString());
        });
      });
    });
  });
}).connect({
  host,
  port,
  username: user,
  password
});
