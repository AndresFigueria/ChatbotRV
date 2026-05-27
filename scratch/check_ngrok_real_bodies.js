async function checkRealBodies() {
  try {
    const res = await fetch('http://127.0.0.1:4040/api/requests/http?limit=5');
    const data = await res.json();
    console.log("=== DECODING NGROK REQUESTS (LAST 5) ===");
    for (const r of data.requests) {
      const detailRes = await fetch(`http://127.0.0.1:4040/api/requests/http/${r.id}`);
      const req = await detailRes.json();
      
      console.log(`\n=========================================`);
      console.log(`ID: ${req.id} | Time: ${req.start}`);
      console.log(`Request: ${req.request.method} ${req.request.uri}`);
      console.log(`Status: ${req.response?.status}`);
      
      if (req.request.raw) {
        const decoded = Buffer.from(req.request.raw, 'base64').toString('utf8');
        const parts = decoded.split('\r\n\r\n');
        const body = parts[1] || parts[0];
        console.log(`Body: ${body}`);
      } else {
        console.log("No raw request data found.");
      }
    }
  } catch (err) {
    console.error(err);
  }
}

checkRealBodies();
