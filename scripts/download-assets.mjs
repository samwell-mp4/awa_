import fs from 'fs';
import path from 'path';
import https from 'https';

function getAssetFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAssetFiles(fullPath));
    } else if (file.endsWith('.asset.json')) {
      results.push(fullPath);
    }
  }
  return results;
}

const assets = getAssetFiles('./src/assets');
console.log(`Total asset.json files: ${assets.length}`);

// Download helper
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      return resolve({ cached: true });
    }

    const dir = path.dirname(destPath);
    fs.mkdirSync(dir, { recursive: true });

    const fullUrl = `https://www.awa-tech.store${encodeURI(url)}`;
    
    const tryDownload = (currentUrl, redirects = 0) => {
      if (redirects > 3) return reject(new Error('Too many redirects'));

      https.get(currentUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return tryDownload(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${currentUrl}`));
        }

        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve({ cached: false, size: fs.statSync(destPath).size });
        });
        fileStream.on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      }).on('error', reject);
    };

    tryDownload(fullUrl);
  });
}

async function main() {
  let downloadedCount = 0;
  let cachedCount = 0;
  let errorCount = 0;

  for (const assetPath of assets) {
    try {
      const data = JSON.parse(fs.readFileSync(assetPath, 'utf8'));
      if (!data.url || !data.url.startsWith('/__l5e/assets-v1/')) {
        continue;
      }

      // decode URL to path
      // data.url: /__l5e/assets-v1/37c1c2a0-ca08-458c-b641-10d08883347d/paj%C3%A9.jpg or pajé.jpg
      const urlDecoded = decodeURIComponent(data.url);
      const destPath = path.join(process.cwd(), 'public', urlDecoded.replace(/^\//, ''));

      // If it's a huge video (> 20MB), let's skip downloading during build if not needed,
      // but let's download all images and small media!
      if (data.size && data.size > 25 * 1024 * 1024) {
        console.log(`Skipping large file (>25MB): ${data.original_filename} (${(data.size / 1024 / 1024).toFixed(1)}MB)`);
        continue;
      }

      const res = await downloadFile(data.url, destPath);
      if (res.cached) {
        cachedCount++;
      } else {
        downloadedCount++;
        console.log(`[OK] Downloaded: ${data.original_filename} -> ${destPath} (${res.size} bytes)`);
      }
    } catch (err) {
      errorCount++;
      console.error(`[ERR] Failed for ${assetPath}:`, err.message);
    }
  }

  console.log(`\nFinished! Downloaded: ${downloadedCount}, Cached: ${cachedCount}, Errors: ${errorCount}`);
}

main();
