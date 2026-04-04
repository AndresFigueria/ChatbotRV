const url = "https://graph.facebook.com/v22.0/1044099008789735/messages";
const token = "EAAdRNS7bknMBRGs7PZCv8r4rvoou4DW4dOnuFK6f4zwFMyAA5CUsBzZCdT9YvX8IY3LjwP3UXhmY0JBmggnCTcpxQg4FnuoeNGJlSpjUDUQpAHvjngCapDf8NlHpO6lz6QoSPPjZCTZAeCbcW1h0E3dm8Yp5lXUc92nILr8NuuxIZBPTbXhuftmjaZCZBtleN2J1nRZCVR8OEDDVOU6wB5ZC5YD3apmIwhzpbCHitTIjCzXxpmeHTMf33";

const payload = {
  "messaging_product": "whatsapp",
  "to": "51957363566",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": {
      "code": "en_US"
    }
  }
};

fetch(url, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
.then(r => r.json())
.then(data => {
    console.log("Respuesta de Meta:");
    console.log(data);
})
.catch(console.error);
