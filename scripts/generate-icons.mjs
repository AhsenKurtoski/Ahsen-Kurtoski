/**
 * Genera le icone del sito (monogramma AS con gradiente) senza dipendenze esterne:
 *   public/favicon.ico
 *   public/apple-touch-icon.png
 *   public/icon-192.png
 *   public/icon-512.png
 *
 * Uso: node scripts/generate-icons.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { crc32, deflateSync } from "node:zlib";

const OUT_DIR = path.join(process.cwd(), "public");

const FROM = [0x7c, 0x6c, 0xff]; // viola
const TO = [0x00, 0xd4, 0xff]; // azzurro

/** Font bitmap 5x7 per le lettere del monogramma */
const GLYPHS = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
};

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

/** Disegna l'icona come buffer RGBA */
function renderIcon(size) {
  const radius = Math.round(size * 0.22);
  const scale = Math.max(1, Math.floor(size / 16));
  const glyphW = 5 * scale;
  const glyphH = 7 * scale;
  const gap = scale;
  const textW = glyphW * 2 + gap;
  const startX = Math.round((size - textW) / 2);
  const startY = Math.round((size - glyphH) / 2);

  const insideRounded = (x, y) => {
    let dx = 0;
    let dy = 0;
    const max = size - 1 - radius;
    if (x < radius) dx = radius - x;
    else if (x > max) dx = x - max;
    if (y < radius) dy = radius - y;
    else if (y > max) dy = y - max;
    if (dx === 0 || dy === 0) return true;
    return dx * dx + dy * dy <= radius * radius;
  };

  const inGlyph = (x, y) => {
    const gx = x - startX;
    const gy = y - startY;
    if (gx < 0 || gy < 0 || gy >= glyphH) return false;
    const row = Math.floor(gy / scale);
    let letter;
    let col;
    if (gx < glyphW) {
      letter = "A";
      col = Math.floor(gx / scale);
    } else if (gx >= glyphW + gap) {
      letter = "K";
      col = Math.floor((gx - glyphW - gap) / scale);
    } else {
      return false; // spazio tra le lettere
    }
    if (col < 0 || col > 4) return false;
    return GLYPHS[letter][row][col] === "1";
  };

  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4;
      if (!insideRounded(x, y)) {
        rgba[offset + 3] = 0; // trasparente fuori dall'angolo arrotondato
        continue;
      }
      if (inGlyph(x, y)) {
        rgba[offset] = 0xff;
        rgba[offset + 1] = 0xff;
        rgba[offset + 2] = 0xff;
        rgba[offset + 3] = 0xff;
        continue;
      }
      const t = (x + y) / (2 * (size - 1));
      rgba[offset] = lerp(FROM[0], TO[0], t);
      rgba[offset + 1] = lerp(FROM[1], TO[1], t);
      rgba[offset + 2] = lerp(FROM[2], TO[2], t);
      rgba[offset + 3] = 0xff;
    }
  }
  return rgba;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])) >>> 0, 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

/** Encoder PNG minimale (RGBA, 8 bit, nessun filtro) */
function encodePng(size, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colore RGBA
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filtro "none"
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Contenitore ICO con payload PNG (supportato da tutti i browser moderni) */
function encodeIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // tipo icona
  header.writeUInt16LE(1, 4); // una sola immagine
  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size;
  entry[1] = size >= 256 ? 0 : size;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bit per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12); // offset dei dati
  return Buffer.concat([header, entry, png]);
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { file: "apple-touch-icon.png", size: 180 },
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
];

for (const target of targets) {
  const png = encodePng(target.size, renderIcon(target.size));
  writeFileSync(path.join(OUT_DIR, target.file), png);
  console.log(`✓ ${target.file} (${target.size}×${target.size}, ${png.length} byte)`);
}

const icoSize = 64;
const ico = encodeIco(encodePng(icoSize, renderIcon(icoSize)), icoSize);
writeFileSync(path.join(OUT_DIR, "favicon.ico"), ico);
console.log(`✓ favicon.ico (${icoSize}×${icoSize}, ${ico.length} byte)`);
