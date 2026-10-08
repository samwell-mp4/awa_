import fs from 'fs';
import path from 'path';

const routesDir = './src/routes';
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.tsx'));

console.log(`Found ${files.length} route files.`);

for (const file of files) {
  const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  const imgImports = [];
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('import') && (line.includes('@/assets') || line.includes('../assets') || line.includes('.jpg') || line.includes('.png') || line.includes('.svg') || line.includes('.asset.json'))) {
      imgImports.push(line.trim());
    }
    // Also check <img src="..."
    const imgMatches = line.matchAll(/<img[^>]*src=\{?["']?([^"'>\s}]+)["']?\}?/g);
    for (const m of imgMatches) {
      if (m[1] && !m[1].startsWith('{') && m[1].length > 2) {
        imgImports.push(`JSX: ${m[1]}`);
      }
    }
  }
  if (imgImports.length > 0) {
    console.log(`\n=== ${file} ===`);
    imgImports.forEach(i => console.log('  ', i));
  }
}
