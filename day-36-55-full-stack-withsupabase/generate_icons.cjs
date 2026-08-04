const sharp = require('sharp');
const fs = require('fs');

const inputBuffer = fs.readFileSync('./public/logo.png');

sharp(inputBuffer)
  .resize({ width: 192, height: 192, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile('./public/pwa-192x192.png')
  .then(() => console.log('192x192 created'))
  .catch(err => console.error(err));

sharp(inputBuffer)
  .resize({ width: 512, height: 512, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile('./public/pwa-512x512.png')
  .then(() => console.log('512x512 created'))
  .catch(err => console.error(err));
