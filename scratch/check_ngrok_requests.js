async function checkRequests() {
  try {
    const res = await fetch('http://127.0.0.1:4040/api/requests/http?limit=15');
    const data = await res.json();
    console.log("=== NGROK RECENT REQUESTS ===");
    data.requests.forEach(req => {
      console.log(`[${req.start}] ${req.request.method} ${req.request.uri} -> Status: ${req.response?.status} (${req.response?.proto})`);
    });
  } catch (err) {
    console.error(err);
  }
}

checkRequests();
