async function checkRequestDetails() {
  try {
    const res = await fetch('http://127.0.0.1:4040/api/requests/http?limit=15');
    const data = await res.json();
    console.log("=== NGROK RECENT HTTP REQUEST DETAILS ===");
    for (const r of data.requests) {
      // Fetch detail
      const detailRes = await fetch(`http://127.0.0.1:4040/api/requests/http/${r.id}`);
      const req = await detailRes.json();
      
      console.log(`\n=========================================`);
      console.log(`ID: ${req.id}`);
      console.log(`Time: ${req.start}`);
      console.log(`Request: ${req.request.method} ${req.request.uri}`);
      console.log(`Status: ${req.response?.status}`);
      if (req.request.raw_text) {
        console.log(`Request Body: ${req.request.raw_text}`);
      } else if (req.request.body) {
        try {
          const rawBody = Buffer.from(req.request.body, 'base64').toString('utf8');
          console.log(`Request Body: ${rawBody}`);
        } catch (e) {
          console.log(`Request Body (Raw): ${req.request.body}`);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

checkRequestDetails();
