const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureCleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function shouldCopyEntry(entryName) {
  // Evita publicar lixo/artefactos no dist
  const deny = new Set([
    '.git',
    '.cursor',
    'node_modules',
    'dist',
    '.netlify',
  ]);
  return !deny.has(entryName);
}

function copyRepoToDist() {
  const entries = fs.readdirSync(ROOT, { withFileTypes: true });
  for (const entry of entries) {
    if (!shouldCopyEntry(entry.name)) continue;

    const src = path.join(ROOT, entry.name);
    const dest = path.join(DIST, entry.name);

    // Node 16+ suporta fs.cpSync; Netlify normalmente usa Node 18/20.
    fs.cpSync(src, dest, { recursive: true });
  }
}

function upsertTag(html, regex, replacement) {
  if (regex.test(html)) return html.replace(regex, replacement);
  // se não existir, injeta antes de </head>
  return html.replace(/<\/head>/i, `${replacement}\n  </head>`);
}

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildIndexHtmlFromConfig() {
  const siteConfigPath = path.join(ROOT, 'content', 'config', 'site.json');
  const site = readJson(siteConfigPath);

  const srcIndexPath = path.join(ROOT, 'index.html');
  const distIndexPath = path.join(DIST, 'index.html');

  let html = fs.readFileSync(srcIndexPath, 'utf8');

  const title = site.siteTitle ? String(site.siteTitle).trim() : '';
  const description = site.siteDescription ? String(site.siteDescription).trim() : '';

  if (title) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlAttr(title)}</title>`);
    html = upsertTag(
      html,
      /<meta\s+property=["']og:title["'][^>]*>/i,
      `    <meta property="og:title" content="${escapeHtmlAttr(title)}" />`
    );
  }

  if (description) {
    html = upsertTag(
      html,
      /<meta\s+name=["']description["'][^>]*>/i,
      `    <meta name="description" content="${escapeHtmlAttr(description)}" />`
    );
    html = upsertTag(
      html,
      /<meta\s+property=["']og:description["'][^>]*>/i,
      `    <meta property="og:description" content="${escapeHtmlAttr(description)}" />`
    );
  }

  fs.writeFileSync(distIndexPath, html, 'utf8');
}

function main() {
  ensureCleanDir(DIST);
  copyRepoToDist();
  buildIndexHtmlFromConfig();
  // Nota: outros scripts (generate-config/galeria) correm antes via npm run build
  console.log('Build concluído: dist/ pronto para publicar.');
}

main();

