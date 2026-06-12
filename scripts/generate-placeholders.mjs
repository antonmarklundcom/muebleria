// Generates local SVG placeholder images for every product in data/products.
// Run with: npm run placeholders
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data', 'products');
const outDir = join(root, 'public', 'images', 'products');
mkdirSync(outDir, { recursive: true });

const palette = {
  comedores: ['#a97347', '#764833'],
  roperos: ['#b98a5c', '#623c2f'],
  escritorios: ['#26221f', '#a97347'],
  'sofa-camas': ['#925d3c', '#e0ccb0'],
  zapateros: ['#ccab82', '#523329'],
  'muebles-de-bano': ['#5b7c8d', '#2f4858'],
  'camas-montessori': ['#d9b98c', '#8a6240'],
  'racks-tv': ['#1a1714', '#b98a5c'],
};

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrap(text, max = 28) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max) {
      lines.push(line.trim());
      line = w;
    } else {
      line = `${line} ${w}`;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.slice(0, 3);
}

function svg(product, variant, [bg, accent]) {
  const lines = wrap(product.name);
  const textY = 430;
  const tspans = lines
    .map((l, i) => `<tspan x="400" dy="${i === 0 ? 0 : 38}">${escapeXml(l)}</tspan>`)
    .join('');
  // Simple abstract furniture silhouette: body + legs + top, varied per image.
  const shape =
    variant === 1
      ? `<rect x="250" y="160" width="300" height="160" rx="10" fill="${accent}" opacity="0.9"/>
         <rect x="265" y="320" width="20" height="60" fill="${accent}"/>
         <rect x="515" y="320" width="20" height="60" fill="${accent}"/>
         <rect x="230" y="140" width="340" height="24" rx="6" fill="${accent}" opacity="0.65"/>`
      : `<rect x="270" y="140" width="120" height="240" rx="8" fill="${accent}" opacity="0.9"/>
         <rect x="410" y="140" width="120" height="240" rx="8" fill="${accent}" opacity="0.7"/>
         <circle cx="380" cy="260" r="7" fill="${bg}"/>
         <circle cx="420" cy="260" r="7" fill="${bg}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" role="img" aria-label="${escapeXml(product.name)}">
  <rect width="800" height="600" fill="${bg}"/>
  <rect width="800" height="600" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.18"/>
    </linearGradient>
  </defs>
  ${shape}
  <text x="400" y="${textY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="bold" fill="#ffffff">${tspans}</text>
  <text x="400" y="560" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#ffffff" opacity="0.75">muebleria.com.py — imagen referencial</text>
</svg>
`;
}

let count = 0;
for (const file of readdirSync(dataDir).filter((f) => f.endsWith('.json'))) {
  const products = JSON.parse(readFileSync(join(dataDir, file), 'utf8'));
  for (const product of products) {
    const colors = palette[product.category] ?? ['#a97347', '#523329'];
    for (const variant of [1, 2]) {
      writeFileSync(join(outDir, `${product.slug}-${variant}.svg`), svg(product, variant, colors));
      count++;
    }
  }
}

// Default OG/share image
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#523329"/>
  <rect x="0" y="0" width="1200" height="630" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a97347" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#1a1714" stop-opacity="0.6"/>
    </linearGradient>
  </defs>
  <text x="600" y="290" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="bold" fill="#ffffff">Mueblería</text>
  <text x="600" y="370" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#f0e6d8">Muebles que aguantan la humedad de Paraguay</text>
  <text x="600" y="560" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#e0ccb0">muebleria.com.py</text>
</svg>
`;
writeFileSync(join(root, 'public', 'images', 'og-default.svg'), og);

console.log(`Generated ${count} product placeholders + og-default.svg`);
