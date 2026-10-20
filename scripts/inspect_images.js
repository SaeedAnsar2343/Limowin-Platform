import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const refDir = './public/assets/reference';
const outDir = './public/assets/games';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function inspectAndSlice() {
  const files = fs.readdirSync(refDir);
  console.log('Reference files:', files);

  for (const file of files) {
    const filePath = path.join(refDir, file);
    const meta = await sharp(filePath).metadata();
    console.log(`${file}: width=${meta.width}, height=${meta.height}, format=${meta.format}`);
  }
}

inspectAndSlice();
