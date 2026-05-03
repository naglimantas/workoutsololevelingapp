// Pure-Node PNG generator for the Shadow Monarch app icon.
// No external deps: builds a valid PNG using zlib + Buffer.
// Renders a dark Solo-Leveling style icon with an electric-blue diamond
// and a stylized "SM" monogram-like glyph at the center.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZE = 1024;

// Palette
const BG = [5, 5, 12];           // #05050c
const BG_GLOW = [25, 0, 60];     // violet halo
const BORDER = [51, 0, 255];     // electric blue
const ACCENT = [0, 170, 255];    // neon blue
const HIGHLIGHT = [232, 232, 255];

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpColor(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

function render() {
  const px = Buffer.alloc(SIZE * SIZE * 4);
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const maxR = Math.hypot(cx, cy);

  const diamondHalf = SIZE * 0.40;
  const innerHalf = SIZE * 0.36;
  const stroke = SIZE * 0.05;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;

      const dx = x - cx;
      const dy = y - cy;
      const r = Math.hypot(dx, dy) / maxR;
      const halo = Math.max(0, 1 - r * 1.6);
      let col = lerpColor(BG, BG_GLOW, halo * 0.55);

      const manhattan = Math.abs(dx) + Math.abs(dy);
      const ringDist = Math.abs(manhattan - diamondHalf);
      if (ringDist < SIZE * 0.012) {
        const k = 1 - ringDist / (SIZE * 0.012);
        col = lerpColor(col, BORDER, Math.min(1, k * 1.2));
      }
      const innerDist = Math.abs(manhattan - innerHalf);
      if (innerDist < SIZE * 0.004) {
        col = lerpColor(col, ACCENT, 0.45);
      }

      if (Math.abs(dx) < stroke / 2 && Math.abs(dy) < SIZE * 0.18) {
        col = lerpColor(col, HIGHLIGHT, 0.92);
      }
      if (dy < -SIZE * 0.10 && dy > -SIZE * 0.18 - stroke / 2 &&
          Math.abs(dy + SIZE * 0.18) < stroke / 2 &&
          dx > -SIZE * 0.14 && dx < stroke / 2) {
        col = lerpColor(col, HIGHLIGHT, 0.92);
      }
      if (dy > SIZE * 0.10 && dy < SIZE * 0.18 + stroke / 2 &&
          Math.abs(dy - SIZE * 0.18) < stroke / 2 &&
          dx < SIZE * 0.14 && dx > -stroke / 2) {
        col = lerpColor(col, HIGHLIGHT, 0.92);
      }

      if (manhattan < diamondHalf - stroke) {
        const glyphR = Math.min(
          Math.hypot(dx, dy - SIZE * 0.18),
          Math.hypot(dx, dy + SIZE * 0.18),
          Math.abs(dx) + Math.abs(dy) * 0.2
        );
        const glow = Math.max(0, 1 - glyphR / (SIZE * 0.18));
        col = lerpColor(col, ACCENT, glow * 0.18);
      }

      px[i] = Math.max(0, Math.min(255, Math.round(col[0])));
      px[i + 1] = Math.max(0, Math.min(255, Math.round(col[1])));
      px[i + 2] = Math.max(0, Math.min(255, Math.round(col[2])));
      px[i + 3] = 255;
    }
  }
  return px;
}

function encodePng(rgba, width, height) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const outDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(outDir, { recursive: true });

const pixels = render();
const png = encodePng(pixels, SIZE, SIZE);

fs.writeFileSync(path.join(outDir, 'icon.png'), png);
fs.writeFileSync(path.join(outDir, 'adaptive-icon.png'), png);
console.log(`Wrote ${png.length} bytes to assets/icon.png and assets/adaptive-icon.png`);
