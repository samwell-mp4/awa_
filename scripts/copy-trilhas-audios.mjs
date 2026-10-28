import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const sb = createClient(
  'https://pxabkwabefkajiggcmjq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4YWJrd2FiZWZrYWppZ2djbWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzY2NzksImV4cCI6MjA5NzkxMjY3OX0.6Z67kKN9rn3Mi_OmpiCv3nfm3RP13ghnmbWyP8WpjE0'
);

const FOLDERS = {
  'Saudações': {
    slug: 'saudacoes',
    sourceDir: 'C:\\Users\\User\\Documents\\awa\\Trilha Saudacao',
  },
  'Família': {
    slug: 'familia',
    sourceDir: 'C:\\Users\\User\\Documents\\awa\\Trilha familia\\Pataxo',
  },
  'Natureza': {
    slug: 'natureza',
    sourceDir: 'C:\\Users\\User\\Documents\\awa\\Trilha natureza\\Pataxo',
  },
  'Animais': {
    slug: 'animais',
    sourceDir: 'C:\\Users\\User\\Documents\\awa\\Trilha Animais\\Pataxo',
  },
};

function sanitize(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim();
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'audio';
}

export function normalizeTerm(s) {
  if (!s) return '';
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function run() {
  console.log('Fetching words from Supabase dictionary...');
  const { data: dbWords, error } = await sb
    .from('dictionary')
    .select('id, term_indigenous, term_pt, category')
    .in('category', Object.keys(FOLDERS));

  if (error) {
    console.error('Error fetching words:', error);
    process.exit(1);
  }

  console.log(`Fetched ${dbWords.length} words for the 4 trilhas.`);

  const audioById = {};
  const audioByTerm = {};
  let totalCopied = 0;

  for (const [category, { slug, sourceDir }] of Object.entries(FOLDERS)) {
    const destDir = path.join(projectRoot, 'public', 'audios', 'trilhas', slug);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const files = fs.readdirSync(sourceDir);
    const catWords = dbWords.filter((w) => w.category === category);
    console.log(`\nProcessing ${category} (${slug}): ${catWords.length} words...`);

    for (const w of catWords) {
      const sanitized = sanitize(w.term_indigenous) + '.mp3';
      const raw = w.term_indigenous + '.mp3';
      const cleanTerm = w.term_indigenous.replace(/,+$/, '').trim();

      let sourceFile = null;
      if (files.includes(sanitized)) {
        sourceFile = sanitized;
      } else if (files.includes(raw)) {
        sourceFile = raw;
      } else {
        const found = files.find((f) => {
          const base = path.basename(f, '.mp3').toLowerCase();
          return (
            base === w.term_indigenous.toLowerCase() ||
            base === cleanTerm.toLowerCase() ||
            base === sanitize(w.term_indigenous).toLowerCase() ||
            base === sanitize(cleanTerm).toLowerCase() ||
            (w.term_indigenous === 'do-corpo - ẽká' && base === 'ẽká')
          );
        });
        if (found) sourceFile = found;
      }

      if (!sourceFile) {
        console.error(`ERROR: No audio file found for "${w.term_indigenous}" (${category})`);
        continue;
      }

      const fileSlug = `${slugify(w.term_indigenous)}-${w.id.slice(0, 8)}.mp3`;
      const sourcePath = path.join(sourceDir, sourceFile);
      const destPath = path.join(destDir, fileSlug);
      const publicUrl = `/audios/trilhas/${slug}/${fileSlug}`;

      fs.copyFileSync(sourcePath, destPath);

      audioById[w.id] = publicUrl;
      audioByTerm[normalizeTerm(w.term_indigenous)] = publicUrl;
      audioByTerm[normalizeTerm(cleanTerm)] = publicUrl;
      totalCopied++;
    }
  }

  console.log(`\nTotal copied: ${totalCopied} files!`);

  // Generate src/lib/trilhas-audio-catalog.ts
  const catalogTs = `// Catálogo Estático dos 258 Áudios Oficiais das Trilhas do Awã Tech
// Baixados diretamente da pronúncia oficial para economia total de tokens de IA.

export const TRILHAS_AUDIO_BY_ID: Record<string, string> = ${JSON.stringify(audioById, null, 2)};

export const TRILHAS_AUDIO_BY_TERM: Record<string, string> = ${JSON.stringify(audioByTerm, null, 2)};

export function normalizeAudioTerm(s: string): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Retorna a URL estática do arquivo de áudio para qualquer palavra de trilha.
 * Busca primeiro pelo UUID no banco, e como fallback pelo termo indígena normalizado.
 */
export function getTrilhaAudioUrl(
  wordOrTerm: { id?: string | null; term_indigenous?: string | null; audio_url?: string | null } | string | null | undefined
): string | null {
  if (!wordOrTerm) return null;

  if (typeof wordOrTerm === "string") {
    // Pode ser um ID ou um termo
    if (TRILHAS_AUDIO_BY_ID[wordOrTerm]) return TRILHAS_AUDIO_BY_ID[wordOrTerm];
    const norm = normalizeAudioTerm(wordOrTerm);
    if (TRILHAS_AUDIO_BY_TERM[norm]) return TRILHAS_AUDIO_BY_TERM[norm];
    return null;
  }

  if (wordOrTerm.audio_url) {
    return wordOrTerm.audio_url;
  }

  if (wordOrTerm.id && TRILHAS_AUDIO_BY_ID[wordOrTerm.id]) {
    return TRILHAS_AUDIO_BY_ID[wordOrTerm.id];
  }

  if (wordOrTerm.term_indigenous) {
    const norm = normalizeAudioTerm(wordOrTerm.term_indigenous);
    if (TRILHAS_AUDIO_BY_TERM[norm]) return TRILHAS_AUDIO_BY_TERM[norm];
  }

  return null;
}
`;

  const catalogPath = path.join(projectRoot, 'src', 'lib', 'trilhas-audio-catalog.ts');
  fs.writeFileSync(catalogPath, catalogTs, 'utf8');
  console.log(`Wrote audio catalog to ${catalogPath}`);
}

run();
