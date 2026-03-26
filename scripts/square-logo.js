#!/usr/bin/env node
/**
 * Writes a 1024×1024 PNG: same artwork scaled to fit inside the square (transparent
 * margins) so Expo icon / adaptive-icon checks pass. Re-run after replacing the source art.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const logoPath = path.join(root, 'assets/images/NepChefXlogo.png');
const OUT = 1024;

async function main() {
  const tmp = logoPath + '.tmp';

  const fitted = await sharp(logoPath)
    .rotate()
    .resize(OUT, OUT, { fit: 'inside' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: OUT,
      height: OUT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: fitted, gravity: 'center' }])
    .png()
    .toFile(tmp);

  fs.renameSync(tmp, logoPath);
  console.log('Updated NepChefXlogo.png to %d×%d (square, logo centered, fit inside).', OUT, OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
