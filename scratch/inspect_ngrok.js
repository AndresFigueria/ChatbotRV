fetch('http://127.0.0.1:4040/api/requests/http')
  .then(r => r.json())
  .then(data => {
    console.log("=== NGROK RECENT REQUESTS ===");
    if (!data.requests || data.requests.length === 0) {
      console.log("No requests inspected by ngrok yet.");
      return;
    }
    data.requests.slice(0, 10).forEach(req => {
      console.log(`- Method: ${req.method} | URI: ${req.uri} | Status: ${req.response?.status || 'N/A'} | Time: ${req.start_time}`);
    });
  })
  .catch(console.error);
