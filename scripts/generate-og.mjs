import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

const og = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#111112"/>
  <circle cx="1060" cy="96" r="26" fill="#C8FF3D"/>
  <circle cx="990" cy="150" r="12" fill="#FF3D8A"/>
  <text x="70" y="330" font-family="Arial Black, Arial, sans-serif" font-size="230" font-weight="900" fill="#F2F0E9" letter-spacing="-6">SUGA</text>
  <rect x="76" y="372" width="430" height="12" fill="#FF3D8A"/>
  <rect x="520" y="372" width="120" height="12" fill="#C8FF3D"/>
  <text x="76" y="452" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="bold" fill="#F2F0E9">SEAN O'MALLEY — THE SUGA SHOW</text>
  <text x="76" y="524" font-family="Courier New, monospace" font-size="24" fill="#8A8A8F">3D FAN CONCEPT · REACT THREE FIBER · UNOFFICIAL</text>
</svg>`

await sharp(Buffer.from(og)).jpeg({ quality: 88 }).toFile(join(ROOT, 'public', 'og-image.jpg'))
console.log('✓ public/og-image.jpg')

const icon = `<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="40" fill="#111112"/>
  <text x="82" y="126" font-family="Arial Black, Arial, sans-serif" font-size="102" font-weight="900" text-anchor="middle" fill="#FF3D8A">S</text>
  <circle cx="140" cy="46" r="14" fill="#C8FF3D"/>
</svg>`

await sharp(Buffer.from(icon)).png().toFile(join(ROOT, 'public', 'apple-touch-icon.png'))
console.log('✓ public/apple-touch-icon.png')
