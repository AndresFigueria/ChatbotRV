import { spawn, execSync } from 'child_process';

function run() {
  console.log("Locating n8n processes...");
  
  try {
    const stdout = execSync('wmic process where "name=\'node.exe\'" get processid,commandline', { encoding: 'utf8' });
    const lines = stdout.split('\n');
    const pidsToKill = [];
    
    for (const line of lines) {
      if (line.includes('n8n') || line.includes('task-runner')) {
        const match = line.trim().match(/(\d+)\s*$/);
        if (match) {
          pidsToKill.push(parseInt(match[1], 10));
        }
      }
    }
    
    console.log("PIDs to kill:", pidsToKill);
    for (const pid of pidsToKill) {
      try {
        console.log(`Killing process ${pid}...`);
        process.kill(pid, 'SIGKILL');
      } catch (e) {
        console.error(`Failed to kill ${pid}:`, e.message);
      }
    }
  } catch (err) {
    console.error("Error finding processes:", err.message);
  }
  
  // Wait 2 seconds, then start n8n in the background
  setTimeout(() => {
    console.log("Starting n8n in background...");
    const out = spawn('npx', ['n8n'], {
      detached: true,
      stdio: 'ignore',
      shell: true
    });
    out.unref();
    console.log("n8n spawn command initiated.");
  }, 2000);
}

run();
