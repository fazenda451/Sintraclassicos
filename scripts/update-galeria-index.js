/**
 * Script para atualizar content/galeria/index.json
 * Lista todos os arquivos JSON na pasta galeria (exceto index.json)
 * e atualiza o index.json com a lista
 * 
 * Executar: node scripts/update-galeria-index.js
 * Ou adicionar ao package.json como script de build
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const galeriaFolder = path.join(projectRoot, 'content', 'galeria');
const indexFile = path.join(galeriaFolder, 'index.json');

try {
  // Ler todos os arquivos na pasta galeria
  const files = fs.readdirSync(galeriaFolder);
  
  // Filtrar apenas arquivos JSON, excluindo index.json
  const jsonFiles = files
    .filter(file => file.endsWith('.json') && file !== 'index.json')
    .sort(); // Ordenar alfabeticamente
  
  if (jsonFiles.length === 0) {
    console.warn('Nenhum arquivo JSON encontrado na pasta galeria (exceto index.json)');
    return;
  }
  
  // Escrever index.json
  const indexContent = JSON.stringify(jsonFiles, null, 2) + '\n';
  fs.writeFileSync(indexFile, indexContent, 'utf8');
  
  console.log(`✓ Atualizado content/galeria/index.json com ${jsonFiles.length} arquivo(s):`);
  jsonFiles.forEach(file => console.log(`  - ${file}`));
  
} catch (error) {
  console.error('Erro ao atualizar index.json da galeria:', error);
  process.exit(1);
}

