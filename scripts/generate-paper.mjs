// Generates two tileable paper-grain PNGs in assets/textures:
//   paper-ink.png   dark specks with pale fibres, for light backgrounds
//   paper-chalk.png light specks and fibres, for dark backgrounds
// Run with `npm run paper`. Pure Node, no image libraries.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const SIZE = 384;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'textures');

let seed = 7_2026;
const random = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

// Periodic value noise, so the soft mottling wraps seamlessly at the tile edges.
function mottling(cells) {
  const grid = Array.from({ length: cells * cells }, random);
  const at = (x, y) => grid[((y + cells) % cells) * cells + ((x + cells) % cells)];
  const smooth = (t) => t * t * (3 - 2 * t);
  const out = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const gx = (x / SIZE) * cells;
      const gy = (y / SIZE) * cells;
      const x0 = Math.floor(gx);
      const y0 = Math.floor(gy);
      const tx = smooth(gx - x0);
      const ty = smooth(gy - y0);
      const top = at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx;
      const bottom = at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx;
      out[y * SIZE + x] = top * (1 - ty) + bottom * ty;
    }
  }
  return out;
}

// Specks and mottling darken the paper; fibres are the paler strands pressed into it.
function paperLayers() {
  const specks = new Float32Array(SIZE * SIZE);
  const fibres = new Float32Array(SIZE * SIZE);
  const soft = mottling(6);
  const finer = mottling(24);
  for (let i = 0; i < specks.length; i++) {
    const grain = Math.pow(random(), 4) * 0.08;
    specks[i] = grain + soft[i] * 0.016 + finer[i] * 0.01;
  }
  for (let f = 0; f < 45; f++) {
    let x = random() * SIZE;
    let y = random() * SIZE;
    let angle = random() * Math.PI * 2;
    const length = 16 + random() * 50;
    const strength = 0.05 + random() * 0.07;
    for (let s = 0; s < length; s++) {
      angle += (random() - 0.5) * 0.25;
      x += Math.cos(angle);
      y += Math.sin(angle);
      // A soft two-pixel strand rather than a hard one-pixel line.
      for (const [dx, dy, w] of [[0, 0, 1], [1, 0, 0.45], [0, 1, 0.45]]) {
        const px = (((Math.round(x) + dx) % SIZE) + SIZE) % SIZE;
        const py = (((Math.round(y) + dy) % SIZE) + SIZE) % SIZE;
        fibres[py * SIZE + px] = Math.max(fibres[py * SIZE + px], strength * w);
      }
    }
  }
  return { specks, fibres };
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png({ specks, fibres }, speckColor, fibreColor) {
  const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
  for (let y = 0; y < SIZE; y++) {
    const row = y * (SIZE * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < SIZE; x++) {
      const o = row + 1 + x * 4;
      const i = y * SIZE + x;
      const fibre = fibres[i] > specks[i];
      const [r, g, b] = fibre ? fibreColor : speckColor;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = Math.round(Math.min(1, fibre ? fibres[i] : specks[i]) * 255);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(SIZE, 0);
  header.writeUInt32BE(SIZE, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT_DIR, { recursive: true });
const layers = paperLayers();
for (const [name, speck, fibre] of [
  ['paper-ink', [46, 38, 28], [255, 253, 247]],
  ['paper-chalk', [240, 234, 222], [250, 246, 238]],
]) {
  const file = join(OUT_DIR, `${name}.png`);
  writeFileSync(file, png(layers, speck, fibre));
  console.log(`wrote ${file}`);
}
