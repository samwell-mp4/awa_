import fs from 'fs';
import path from 'path';

function scanDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(scanDir(full));
    } else if (/\.(tsx|ts|jsx|js)$/.test(item)) {
      results.push(full);
    }
  }
  return results;
}

const files = [...scanDir('./src/routes'), ...scanDir('./src/components'), ...scanDir('./src/lib')];
const importedAssets = new Set();
const assetJsonImports = new Set();

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach(l => {
    const m = l.match(/import\s+.*?\s+from\s+["'](.*assets.*)["']/);
    if (m) {
      importedAssets.add(m[1]);
      if (m[1].includes('.asset.json')) {
        assetJsonImports.add(m[1]);
      }
    }
  });
});

console.log('Total asset imports:', importedAssets.size);
console.log('Asset JSON imports:', assetJsonImports.size);
for (const a of assetJsonImports) {
  console.log(' -', a);
}
