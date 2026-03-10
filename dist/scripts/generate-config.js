const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const outPath = path.join(projectRoot, 'config.js');

const env = {};

// Primeiro, tenta ler de variáveis de ambiente (Netlify/CI)
if (process.env.GOOGLE_API_KEY) {
  env.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  console.log('Using GOOGLE_API_KEY from environment variables');
}

// Se não encontrar, tenta ler do ficheiro .env (desenvolvimento local)
if (!env.GOOGLE_API_KEY && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  
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
  
  console.log('Using GOOGLE_API_KEY from .env file');
}

// Verifica se tem a chave
if (!env.GOOGLE_API_KEY) {
  console.error('GOOGLE_API_KEY not found!');
  console.error('For local development: Copy .env.example to .env and add your GOOGLE_API_KEY');
  console.error('For Netlify: Add GOOGLE_API_KEY as environment variable in Netlify settings');
  process.exit(1);
}

const out = `// GENERATED FROM .env or environment variables — DO NOT COMMIT SECRETS\nwindow.__ENV = ${JSON.stringify(env, null, 2)};\n`;
fs.writeFileSync(outPath, out, 'utf8');
console.log('✓ Generated config.js successfully');
