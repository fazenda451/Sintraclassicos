const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');

function ensureDistExists() {
  if (!fs.existsSync(DIST_DIR)) {
    console.warn(`[sitemap] Diretório dist não encontrado em: ${DIST_DIR}`);
    process.exit(0);
  }
}

function getBaseUrl() {
  const raw =
    process.env.SITE_URL ||
    process.env.URL ||
    'https://sintraclassicos.pt';

  return raw.replace(/\/+$/, '');
}

function collectHtmlFiles(dir, baseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(fullPath, baseDir));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.html')) {
      continue;
    }

    const relative = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    // Ignorar CMS e ficheiros de verificação Google
    if (relative.startsWith('admin/')) continue;
    if (/^google[0-9a-f]+\.html$/i.test(path.basename(relative))) continue;

    files.push({ fullPath, relative });
  }

  return files;
}

function buildUrlEntries(htmlFiles, baseUrl) {
  return htmlFiles.map(({ fullPath, relative }) => {
    const stats = fs.statSync(fullPath);
    const lastmod = stats.mtime.toISOString().split('T')[0];

    let pathPart;
    if (relative === 'index.html') {
      pathPart = '/';
    } else {
      pathPart = '/' + relative;
    }

    const loc = baseUrl + pathPart;
    const isHome = pathPart === '/';

    return {
      loc,
      lastmod,
      changefreq: isHome ? 'monthly' : 'yearly',
      priority: isHome ? '1.0' : '0.6',
    };
  });
}

function generateSitemapXml(urlEntries) {
  const urlsXml = urlEntries
    .sort((a, b) => a.loc.localeCompare(b.loc))
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>
`;
}

function writeSitemapFile(xml) {
  const targetPath = path.join(DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(targetPath, xml.trim() + '\n', 'utf8');
  console.log(`[sitemap] sitemap.xml gerado com sucesso em: ${targetPath}`);
}

function main() {
  ensureDistExists();

  const baseUrl = getBaseUrl();
  const htmlFiles = collectHtmlFiles(DIST_DIR, DIST_DIR);

  if (htmlFiles.length === 0) {
    console.warn('[sitemap] Nenhum ficheiro .html encontrado em dist; nada a gerar.');
    process.exit(0);
  }

  const urlEntries = buildUrlEntries(htmlFiles, baseUrl);
  const xml = generateSitemapXml(urlEntries);
  writeSitemapFile(xml);
}

main();

