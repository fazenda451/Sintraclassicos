/**
 * Script para reorganizar os orders da galeria automaticamente
 * Ordena todos os itens por data (mais recente primeiro) e reatribui orders sequencialmente
 * 
 * Executar: node scripts/reorganize-galeria-orders.js
 * Ou adicionar ao package.json como script de build
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const galeriaFolder = path.join(projectRoot, 'content', 'galeria');

try {
  // Ler todos os arquivos na pasta galeria
  const files = fs.readdirSync(galeriaFolder);
  
  // Filtrar apenas arquivos JSON, excluindo index.json
  // Incluir arquivos com nomes longos do CMS (que começam com "map-order")
  const jsonFiles = files.filter(file => 
    file.endsWith('.json') && 
    file !== 'index.json'
  );
  
  if (jsonFiles.length === 0) {
    console.warn('Nenhum arquivo JSON encontrado na pasta galeria');
    return;
  }
  
  // Ler e parsear todos os arquivos
  const items = [];
  for (const file of jsonFiles) {
    try {
      const filePath = path.join(galeriaFolder, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      // Apenas processar itens publicados
      if (data.published !== false) {
        items.push({
          file: file,
          filePath: filePath,
          data: data
        });
      }
    } catch (error) {
      console.warn(`Erro ao ler ${file}:`, error.message);
    }
  }
  
  if (items.length === 0) {
    console.warn('Nenhum item publicado encontrado');
    return;
  }
  
  // Ordenar por data (mais recente primeiro), depois por order atual como desempate
  // Itens sem data são tratados como menos recentes (vão para o final)
  items.sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date).getTime() : 0;
    const dateB = b.data.date ? new Date(b.data.date).getTime() : 0;
    
    // Se as datas forem diferentes, ordenar por data (mais recente primeiro)
    if (dateA !== dateB) {
      return dateB - dateA; // Invertido para mais recente primeiro
    }
    
    // Se as datas forem iguais (ou ambas zero), usar order atual como desempate
    const orderA = a.data.order || 999;
    const orderB = b.data.order || 999;
    
    if (orderA !== orderB) {
      return orderA - orderB; // Menor order = mais recente
    }
    
    // Se tudo for igual, usar nome como último desempate
    const nomeA = (a.data.nome || a.data.title || '').toLowerCase();
    const nomeB = (b.data.nome || b.data.title || '').toLowerCase();
    return nomeA.localeCompare(nomeB);
  });
  
  // Reatribuir orders sequencialmente (1, 2, 3, 4...)
  let updatedCount = 0;
  items.forEach((item, index) => {
    const newOrder = index + 1;
    const oldOrder = item.data.order || 0;
    
    // Só atualizar se o order mudou
    if (newOrder !== oldOrder) {
      item.data.order = newOrder;
      
      // Escrever arquivo atualizado
      const content = JSON.stringify(item.data, null, 2) + '\n';
      fs.writeFileSync(item.filePath, content, 'utf8');
      updatedCount++;
      
      console.log(`✓ ${item.file}: order ${oldOrder} → ${newOrder} (${item.data.nome || item.data.title || 'Sem nome'})`);
    } else {
      console.log(`  ${item.file}: order ${oldOrder} mantido (${item.data.nome || item.data.title || 'Sem nome'})`);
    }
  });
  
  console.log(`\n✓ Reorganização concluída: ${updatedCount} arquivo(s) atualizado(s) de ${items.length} total`);
  
} catch (error) {
  console.error('Erro ao reorganizar orders da galeria:', error);
  process.exit(1);
}

