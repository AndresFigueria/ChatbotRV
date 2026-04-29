const url = "https://graph.facebook.com/v25.0/1091076967420278/messages";
const token = "EAAdRNS7bknMBRSwV9UFIl3lIQxJc0dNYDDgamM5kquLkZBCdoD7OGKc1qYOrnCJHRZCpvfgfjtabxF6yTk3NpEJ5LOSoIUpdYMzx7eVnSAxqI4ZAb1MLqdrS36hEf7EpS2GlhTxLY3NuOXplxUbJCBT88zXkfZAN0q72ZA2tlcbMvoTPL8j7ayQ7R4ZAMDPAA1FZAHJuizxJ8mM0YtRlqGzd1KSAXrpGTm6z1qFZB3ZCWjO90GxFXK6sb3YcR6U30hzbGvHPT49wPPa1YZCELnEY4bkQDo6HfQy5eq6CbV4wZDZD";

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
