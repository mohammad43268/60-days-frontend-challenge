const sharp = require('sharp');
const fs = require('fs');

const svgBuffer = fs.readFileSync('./public/zaforge-icon.svg');

sharp(svgBuffer)
  .resize(192, 192)
  .png()
  .toFile('./public/zaforge-192x192.png')
  .then(() => console.log('192x192 created'))
  .catch(err => console.error(err));

sharp(svgBuffer)
  .resize(512, 512)
  .png()
  .toFile('./public/zaforge-512x512.png')
  .then(() => console.log('512x512 created'))
  .catch(err => console.error(err));
