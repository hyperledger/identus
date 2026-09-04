/**
 * Generates placeholder PNG assets required by Expo prebuild.
 * Run once: node scripts/generate-assets.js
 * Uses only built-in Node.js modules — no extra dependencies needed.
 */
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

// ─── CRC32 ────────────────────────────────────────────────────────────────────
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[i] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return ((crc ^ 0xffffffff) >>> 0);
}

// ─── PNG chunk helper ─────────────────────────────────────────────────────────
function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

// ─── Solid-colour PNG ────────────────────────────────────────────────────────
function makePNG(w, h, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  // bytes 10-12 = 0 (compression/filter/interlace)

  // Raw scanlines: filter-byte(0) + R G B * width
  const row = Buffer.alloc(1 + w * 3);
  row[0] = 0; // None filter
  for (let x = 0; x < w; x++) {
    row[1 + x * 3] = r;
    row[2 + x * 3] = g;
    row[3 + x * 3] = b;
  }
  // All rows are identical — deflate compresses this to near-zero size
  const raw = Buffer.concat(Array(h).fill(row));
  const compressed = zlib.deflateSync(raw, { level: 1 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ─── Write assets ─────────────────────────────────────────────────────────────
const assetsDir = path.join(__dirname, "..", "assets");
fs.mkdirSync(assetsDir, { recursive: true });

const assets = [
  // [filename,          width, height,  R   G   B]  (colour = #0f172a slate-900)
  ["icon.png",           1024,  1024,   15,  23,  42],
  ["adaptive-icon.png",  1024,  1024,   99, 102, 241],  // indigo-500
  ["splash.png",         1284,  2778,   15,  23,  42],  // iPhone 14 Pro Max
];

for (const [name, w, h, r, g, b] of assets) {
  const dest = path.join(assetsDir, name);
  fs.writeFileSync(dest, makePNG(w, h, r, g, b));
  console.log(`✓ ${name}  (${w}×${h})`);
}
console.log("Assets ready.");
