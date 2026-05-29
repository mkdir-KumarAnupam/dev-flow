import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPng = join(__dirname, '..', 'build', 'icon.png');
const outIco = join(__dirname, '..', 'build', 'icon.ico');

// ICO format: concatenate multiple PNG sizes with ICO header
const sizes = [16, 24, 32, 48, 64, 128, 256];

async function main() {
  console.log('Reading source PNG...');
  const pngs = await Promise.all(
    sizes.map(size =>
      sharp(srcPng)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  );

  // Build ICO binary
  const numImages = sizes.length;
  const headerSize = 6 + numImages * 16;
  let offset = headerSize;

  // ICO header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);   // reserved
  header.writeUInt16LE(1, 2);   // type: 1 = ICO
  header.writeUInt16LE(numImages, 4);

  // Directory entries
  const directory = Buffer.alloc(numImages * 16);
  for (let i = 0; i < numImages; i++) {
    const size = sizes[i];
    const imgSize = pngs[i].length;
    const entry = directory.subarray(i * 16, i * 16 + 16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);  // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1);  // height
    entry.writeUInt8(0, 2);    // color count
    entry.writeUInt8(0, 3);    // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(imgSize, 8);  // image size
    entry.writeUInt32LE(offset, 12);  // offset
    offset += imgSize;
  }

  const ico = Buffer.concat([header, directory, ...pngs]);
  writeFileSync(outIco, ico);
  console.log(`✅ Written ${outIco} (${(ico.length / 1024).toFixed(1)} KB)`);

  // Also write a 512x512 PNG for reference
  await sharp(srcPng).resize(512, 512).png().toFile(join(__dirname, '..', 'build', 'icon-512.png'));
  console.log('✅ Written 512px PNG');
}

main().catch(console.error);
