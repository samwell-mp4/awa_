import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://pxabkwabefkajiggcmjq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4YWJrd2FiZWZrYWppZ2djbWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzY2NzksImV4cCI6MjA5NzkxMjY3OX0.6Z67kKN9rn3Mi_OmpiCv3nfm3RP13ghnmbWyP8WpjE0');

const folders = {
  'Saudações': 'C:\\Users\\User\\Documents\\awa\\Trilha Saudacao',
  'Família': 'C:\\Users\\User\\Documents\\awa\\Trilha familia\\Pataxo',
  'Natureza': 'C:\\Users\\User\\Documents\\awa\\Trilha natureza\\Pataxo',
  'Animais': 'C:\\Users\\User\\Documents\\awa\\Trilha Animais\\Pataxo'
};

function sanitize(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim();
}

async function testAll() {
  const { data, error } = await sb.from('dictionary').select('id, term_indigenous, term_pt, category').in('category', Object.keys(folders));
  if (error) {
    console.error(error);
    return;
  }

  for (const [cat, dir] of Object.entries(folders)) {
    const files = fs.readdirSync(dir);
    const fileSet = new Set(files);
    const catWords = data.filter(w => w.category === cat);
    const exact = [];
    const missing = [];
    for (const w of catWords) {
      const sanitized = sanitize(w.term_indigenous) + '.mp3';
      const raw = w.term_indigenous + '.mp3';
      if (fileSet.has(sanitized)) {
        exact.push({ w: w.term_indigenous, f: sanitized });
      } else if (fileSet.has(raw)) {
        exact.push({ w: w.term_indigenous, f: raw });
      } else {
        const cleanTerm = w.term_indigenous.replace(/,+$/, '').trim();
        const found = files.find(f => {
          const base = path.basename(f, '.mp3').toLowerCase();
          return base === w.term_indigenous.toLowerCase() ||
                 base === cleanTerm.toLowerCase() ||
                 base === sanitize(w.term_indigenous).toLowerCase() ||
                 base === sanitize(cleanTerm).toLowerCase() ||
                 (w.term_indigenous === 'do-corpo - ẽká' && base === 'ẽká');
        });
        if (found) {
          exact.push({ w: w.term_indigenous, f: found });
        } else {
          missing.push(w);
        }
      }
    }
    console.log(`${cat} -> matched: ${exact.length}/${catWords.length} (total files in folder: ${files.length})`);
    if (missing.length) {
      console.log(`Missing in ${cat}:`, missing);
    }
  }
}
testAll();
