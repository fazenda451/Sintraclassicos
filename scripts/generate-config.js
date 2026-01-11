const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const outPath = path.join(projectRoot, 'config.js');

if (!fs.existsSync(envPath)) {
  console.error('.env not found. Copy .env.example to .env and add your GOOGLE_API_KEY');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const env = {};

content.split(/\r?\n/).forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const idx = line.indexOf('=');
  if (idx === -1) return;
  const key = line.slice(0, idx).trim();
  let val = line.slice(idx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  env[key] = val;
});

const out = `// GENERATED FROM .env — DO NOT COMMIT SECRETS\nwindow.__ENV = ${JSON.stringify(env, null, 2)};\n`;
fs.writeFileSync(outPath, out, 'utf8');
console.log('Wrote', outPath);
