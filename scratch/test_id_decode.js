const id = "wamid.HBgLNTE5NTczNjM1NjYVAgASGBYzRUIwNTJBQjQ5NTY3NTdCMUE2OTBEAA==";
const part = id.split('.')[1];
const decoded = Buffer.from(part, 'base64');
console.log("Decoded buffer length:", decoded.length);
console.log("Decoded string (utf8):", decoded.toString('utf8'));
console.log("Decoded hex:", decoded.toString('hex'));
