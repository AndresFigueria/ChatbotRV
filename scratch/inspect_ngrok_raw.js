fetch('http://127.0.0.1:4040/api/requests/http')
  .then(r => r.json())
  .then(data => {
    console.log("=== FIRST NGROK REQUEST DETAIL ===");
    if (data.requests && data.requests.length > 0) {
      const first = data.requests[0];
      console.log("Keys:", Object.keys(first));
      console.log("URI:", first.uri);
      console.log("Request Object:", JSON.stringify(first.request, null, 2));
      console.log("Response Object:", JSON.stringify(first.response, null, 2));
    } else {
      console.log("No requests.");
    }
  })
  .catch(console.error);
