// Generates local SVG placeholder images for every product in data/products.
// Run with: npm run placeholders
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data', 'products');
const outDir = join(root, 'public', 'images', 'products');
mkdirSync(outDir, { recursive: true });

// Light neutral placeholders for a minimalist, editorial look.
// Each entry is [background, silhouette] — all very light neutrals with a
// soft tonal silhouette; no brown, no heavy color blocks.
const palette = {
  comedores: ['#EDEAE5', '#C7A684'],
  roperos: ['#ECEAE6', '#D7D1C7'],
  escritorios: ['#EAE8E4', '#C0B9AD'],
  'sofa-camas': ['#EEEBE6', '#DCC4AC'],
  zapateros: ['#EDEBE7', '#CEC7BB'],
  'muebles-de-bano': ['#EAEBEA', '#C3C9C5'],
  'camas-montessori': ['#EFEBE6', '#D6C3AC'],
  'racks-tv': ['#EAE9E6', '#C3BCB1'],
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
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  ${shape}
  <text x="400" y="${textY}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="30" fill="#1A1A1A">${tspans}</text>
  <text x="400" y="560" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="1" fill="#555555">muebleria.com.py — imagen referencial</text>
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
  <rect width="1200" height="630" fill="#FAFAF8"/>
  <rect x="80" y="80" width="1040" height="470" fill="none" stroke="#ECECEC" stroke-width="1"/>
  <rect x="540" y="408" width="120" height="2" fill="#B08968"/>
  <text x="600" y="290" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="76" fill="#1A1A1A">Mueblería</text>
  <text x="600" y="360" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#555555">Muebles que aguantan la humedad de Paraguay</text>
  <text x="600" y="480" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" letter-spacing="2" fill="#B08968">muebleria.com.py</text>
</svg>
`;
writeFileSync(join(root, 'public', 'images', 'og-default.svg'), og);

console.log(`Generated ${count} product placeholders + og-default.svg`);
