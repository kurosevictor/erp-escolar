/**
 * Gera ícones PNG sólidos para PWA sem dependências externas.
 * Cor de fundo: #1e293b, letra "F" em branco (bitmap 5x7 escalonado).
 * Execute: node scripts/generate-icons.mjs
 */
import { createWriteStream, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'icons')
mkdirSync(OUT, { recursive: true })

// CRC32 lookup table
const crcTable = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  crcTable[i] = c
}
function crc32(buf) {
  let crc = 0xffffffff
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const crcIn = Buffer.concat([t, data])
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(crcIn))
  return Buffer.concat([len, t, data, crcBuf])
}

// Bitmap 5x7 do "F" (cada número = linha de 5 bits, MSB à esquerda)
const F_BITMAP = [0b11110, 0b10000, 0b11100, 0b10000, 0b10000, 0b10000, 0b10000]

function makePNG(size) {
  const BG = [0x1e, 0x29, 0x3b]   // #1e293b
  const FG = [0xff, 0xff, 0xff]   // #ffffff

  // Escala do "F": ~30% do tamanho
  const scale = Math.floor(size * 0.06)
  const fW = 5 * scale
  const fH = 7 * scale
  const offX = Math.floor((size - fW) / 2)
  const offY = Math.floor((size - fH) / 2)

  // Pixels: array de [r,g,b] por pixel
  const pixels = []
  for (let y = 0; y < size; y++) {
    const row = []
    for (let x = 0; x < size; x++) {
      const lx = x - offX
      const ly = y - offY
      const bx = Math.floor(lx / scale)
      const by = Math.floor(ly / scale)
      const inF = bx >= 0 && bx < 5 && by >= 0 && by < 7 &&
        ((F_BITMAP[by] >> (4 - bx)) & 1) === 1
      row.push(inF ? FG : BG)
    }
    pixels.push(row)
  }

  // Scanlines (filter byte 0 + RGB per pixel)
  const raw = Buffer.alloc((1 + size * 3) * size)
  for (let y = 0; y < size; y++) {
    const off = y * (1 + size * 3)
    raw[off] = 0
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixels[y][x]
      raw[off + 1 + x * 3] = r
      raw[off + 2 + x * 3] = g
      raw[off + 3 + x * 3] = b
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8   // bit depth
  ihdrData[9] = 2   // color type RGB
  // compression, filter, interlace = 0

  const idat = chunk('IDAT', deflateSync(raw))
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([sig, chunk('IHDR', ihdrData), idat, iend])
}

for (const size of [192, 512]) {
  const buf = makePNG(size)
  const path = join(OUT, `icon-${size}.png`)
  createWriteStream(path).end(buf)
  console.log(`✓ ${path} (${size}×${size})`)
}
