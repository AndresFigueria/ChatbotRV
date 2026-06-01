const CryptoJS = require('crypto-js');

const encryptedData = "U2FsdGVkX19KuENqkXSmzgimrYqjUVDQuYiA/CrfEOwdUJN2EJ9gCuKNIpGVG6f0SKtnQnBgVBH0iDx7Cg35nGWnhlPv3HPYb3m9pm24FLYZoprueAbpyNlndBnTmK6tRC8/jTyzOHjK6LjVl2e7DDMZZg87BG3l3+aEd2ZkBourTiiLOBt9cIO8HbbvuW14fJXUhg4a/AVpf5fBe0ASmvDSg41WN3zBqOhstwg5zSvUrB20xuZQGKTCONwf7rzpOMZpZUaeDKcaiab7JELmTQ==";
const localKey = "u6RnRVRzjMKsp1lIAb0IpSqs2rgoN8Oo";

try {
  const bytes = CryptoJS.AES.decrypt(encryptedData, localKey);
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
  console.log('Decrypted text length:', decryptedText.length);
  console.log('Decrypted content:', decryptedText);
} catch(e) {
  console.error('Decryption failed:', e);
}
