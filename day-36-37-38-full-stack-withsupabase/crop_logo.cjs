const sharp = require('sharp');
const fs = require('fs');

const inputPath = './public/logo.png';
const outputPath = './public/logo-cropped.png';

sharp(inputPath)
  .trim() // Automatically removes transparent background
  .toFile(outputPath)
  .then(info => {
    console.log('Logo cropped successfully:', info);
    fs.renameSync(outputPath, inputPath); // Overwrite original logo
    console.log('Original logo overwritten with cropped version.');
  })
  .catch(err => {
    console.error('Error cropping logo:', err);
  });
