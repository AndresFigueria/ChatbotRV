fetch('http://127.0.0.1:4040/api/tunnels')
  .then(r => r.json())
  .then(data => {
    console.log("=== NGROK ACTIVE TUNNELS ===");
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(console.error);
