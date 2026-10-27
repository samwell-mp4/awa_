import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const backupDir = path.join(rootDir, 'backup-adulto-novo');

const mode = process.argv[2]; // 'novo' ou 'antigo'

if (mode !== 'novo' && mode !== 'antigo') {
  console.log('Uso: node scripts/alternar-adulto.mjs [novo|antigo]');
  process.exit(1);
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (mode === 'novo') {
  console.log('Restaurando versão nova (/adulto com redesign e sidebar)...');
  copyRecursive(path.join(backupDir, 'src'), path.join(rootDir, 'src'));
  console.log('Versão nova restaurada com sucesso!');
} else {
  console.log('Para voltar para a versão antiga original, use git checkout origin/main.');
}
