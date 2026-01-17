/**
 * CMS Content Loader - Sintra Clássicos
 * Carrega conteúdo dinamicamente dos ficheiros JSON geridos pelo CMS
 */

// Cache para os dados carregados
const cmsCache = {};

/**
 * Carrega um ficheiro JSON
 */
async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Erro ao carregar ${path}:`, error);
    return null;
  }
}

/**
 * Carrega todos os ficheiros de uma pasta
 */
async function loadCollection(folder) {
  try {
    // Lista de ficheiros conhecidos (pode ser melhorado com uma API que liste ficheiros)
    const files = await fetch(`${folder}/.index.json`).catch(() => null);
    if (files && files.ok) {
      const fileList = await files.json();
      const data = await Promise.all(
        fileList.map(file => loadJSON(`${folder}/${file}`))
      );
      return data.filter(item => item !== null);
    }
    
    // Fallback: tentar carregar ficheiros conhecidos
    // Para produção, seria melhor ter um endpoint que liste os ficheiros
    return [];
  } catch (error) {
    console.error(`Erro ao carregar coleção ${folder}:`, error);
    return [];
  }
}

/**
 * Carrega dados do Hero
 */
async function loadHero() {
  if (cmsCache.hero) return cmsCache.hero;
  const data = await loadJSON('content/hero/hero.json');
  if (data) cmsCache.hero = data;
  return data;
}

/**
 * Carrega eventos
 */
async function loadEventos() {
  if (cmsCache.eventos) return cmsCache.eventos;
  
  // Tenta carregar um índice de ficheiros, senão usa lista padrão
  let eventFiles = [];
  try {
    const index = await loadJSON('content/eventos/.index.json');
    if (index && Array.isArray(index)) {
      eventFiles = index.map(f => `content/eventos/${f}`);
    }
  } catch (e) {
    // Fallback: lista de eventos conhecidos
    eventFiles = [
      'content/eventos/evento-1.json',
      'content/eventos/evento-2.json',
      'content/eventos/evento-3.json'
    ];
  }
  
  const eventos = await Promise.all(
    eventFiles.map(file => loadJSON(file))
  );
  
  const published = eventos.filter(e => e && e.published !== false);
  if (published.length > 0) cmsCache.eventos = published;
  return published;
}

/**
 * Carrega agenda
 */
async function loadAgenda() {
  if (cmsCache.agenda) return cmsCache.agenda;
  
  let agendaFiles = [];
  try {
    const index = await loadJSON('content/agenda/.index.json');
    if (index && Array.isArray(index)) {
      agendaFiles = index.map(f => `content/agenda/${f}`);
    }
  } catch (e) {
    agendaFiles = [
      'content/agenda/agenda-fevereiro.json',
      'content/agenda/agenda-marco.json',
      'content/agenda/agenda-abril.json',
      'content/agenda/agenda-ano.json'
    ];
  }
  
  const agenda = await Promise.all(
    agendaFiles.map(file => loadJSON(file))
  );
  
  const sorted = agenda
    .filter(a => a !== null)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  if (sorted.length > 0) cmsCache.agenda = sorted;
  return sorted;
}

/**
 * Carrega galeria
 */
async function loadGaleria() {
  if (cmsCache.galeria) return cmsCache.galeria;
  
  let galeriaFiles = [];
  try {
    const index = await loadJSON('content/galeria/.index.json');
    if (index && Array.isArray(index)) {
      galeriaFiles = index.map(f => `content/galeria/${f}`);
    }
  } catch (e) {
    galeriaFiles = [
      'content/galeria/galeria-1.json',
      'content/galeria/galeria-2.json',
      'content/galeria/galeria-3.json',
      'content/galeria/galeria-4.json'
    ];
  }
  
  const galeria = await Promise.all(
    galeriaFiles.map(file => loadJSON(file))
  );
  
  const sorted = galeria
    .filter(g => g !== null)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  if (sorted.length > 0) cmsCache.galeria = sorted;
  return sorted;
}

/**
 * Carrega produtos da loja
 */
async function loadLoja() {
  if (cmsCache.loja) return cmsCache.loja;
  
  let lojaFiles = [];
  try {
    const index = await loadJSON('content/loja/.index.json');
    if (index && Array.isArray(index)) {
      lojaFiles = index.map(f => `content/loja/${f}`);
    }
  } catch (e) {
    lojaFiles = [
      'content/loja/produto-1.json',
      'content/loja/produto-2.json',
      'content/loja/produto-3.json',
      'content/loja/produto-4.json',
      'content/loja/produto-5.json',
      'content/loja/produto-6.json'
    ];
  }
  
  const produtos = await Promise.all(
    lojaFiles.map(file => loadJSON(file))
  );
  
  const available = produtos.filter(p => p && p.available !== false);
  if (available.length > 0) cmsCache.loja = available;
  return available;
}

/**
 * Carrega dados da comunidade
 */
async function loadComunidade() {
  if (cmsCache.comunidade) return cmsCache.comunidade;
  const data = await loadJSON('content/comunidade/comunidade.json');
  if (data) cmsCache.comunidade = data;
  return data;
}

/**
 * Carrega contactos
 */
async function loadContactos() {
  if (cmsCache.contactos) return cmsCache.contactos;
  const data = await loadJSON('content/contactos/contactos.json');
  if (data) cmsCache.contactos = data;
  return data;
}

/**
 * Renderiza o Hero
 */
function renderHero(data) {
  if (!data) return;
  
  const subtitleEl = document.querySelector('.hero-subtitle');
  if (subtitleEl && data.subtitle) {
    subtitleEl.textContent = data.subtitle;
  }
  
  const button1 = document.querySelector('.hero-section a[href="#proximos-eventos"]');
  if (button1 && data.button1Text) {
    button1.textContent = data.button1Text;
    if (data.button1Link) button1.href = data.button1Link;
  }
  
  const button2 = document.querySelector('.hero-section a[href="#comunidade"]');
  if (button2 && data.button2Text) {
    button2.textContent = data.button2Text;
    if (data.button2Link) button2.href = data.button2Link;
  }
}

/**
 * Renderiza eventos
 */
function renderEventos(eventos) {
  if (!eventos || eventos.length === 0) return;
  
  const container = document.querySelector('#proximos-eventos .row.g-4');
  if (!container) return;
  
  container.innerHTML = eventos.map(evento => `
    <div class="col-md-6 col-lg-4">
      <article class="event-card h-100 d-flex flex-column">
        <img
          src="${evento.image || 'img/MESFEVEREIROW123.jpeg'}"
          class="w-100"
          style="height: 180px"
          alt="${evento.title}"
        />
        <div class="p-3 p-md-4 d-flex flex-column flex-grow-1">
          <div class="d-flex justify-content-between align-items-center mb-2 small text-secondary">
            <span>${evento.location || 'Data e localização'}</span>
            <span class="badge-soft text-success">${evento.price || 'Gratuito'}</span>
          </div>
          <h3 class="h5 mb-2">${evento.title}</h3>
          <p class="text-secondary small mb-3 flex-grow-1">
            ${evento.description || ''}
          </p>
          <ul class="small text-secondary mb-3 ps-3">
            ${evento.startTime ? `<li>${evento.startTime}</li>` : ''}
            ${evento.endTime ? `<li>${evento.endTime}</li>` : ''}
            ${evento.limit ? `<li>${evento.limit}</li>` : ''}
          </ul>
          <button class="btn btn-outline-info btn-sm mt-auto w-100" data-event="${evento.title}">
            Quero participar
          </button>
        </div>
      </article>
    </div>
  `).join('');
  
  // Re-inicializar event listeners dos botões
  if (window.sintraClassicos && window.sintraClassicos.abrirModal) {
    container.querySelectorAll('[data-event]').forEach(btn => {
      btn.addEventListener('click', function() {
        const nomeEvento = btn.getAttribute('data-event') || 'neste evento';
        window.sintraClassicos.abrirModal(
          'Registámos o teu interesse em "' + nomeEvento + '". Preenche o formulário para completar a tua inscrição.',
          true
        );
      });
    });
  }
}

/**
 * Renderiza agenda
 */
function renderAgenda(agenda) {
  if (!agenda || agenda.length === 0) return;
  
  const container = document.querySelector('#agenda .col-lg-7 .d-flex.flex-column');
  if (!container) return;
  
  container.innerHTML = agenda.map(item => `
    <div class="d-flex gap-3">
      <div class="d-none d-md-flex flex-column align-items-center pt-1">
        <div class="timeline-dot"></div>
      </div>
      <div class="flex-grow-1">
        ${item.month ? `<div class="badge-soft text-secondary mb-1">${item.month}</div>` : ''}
        ${item.title ? `<h3 class="h6 text-light mb-1">${item.title}</h3>` : ''}
        <p class="text-secondary small mb-1">
          ${item.description || ''}
        </p>
        ${item.type ? `<span class="small text-info">${item.type}</span>` : ''}
      </div>
    </div>
  `).join('');
}

/**
 * Renderiza galeria
 */
function renderGaleria(galeria) {
  if (!galeria || galeria.length === 0) return;
  
  const container = document.querySelector('#galeria .gallery-grid');
  if (!container) return;
  
  container.innerHTML = galeria.map(item => `
    <div class="col-6 col-lg-3">
      <article class="gallery-item">
        <div class="gallery-image" style="background-image: url('${item.image || 'img/preview.png'}')"></div>
        <div class="gallery-overlay">
          <h3>${item.title || ''}</h3>
          <p>${item.description || ''}</p>
        </div>
      </article>
    </div>
  `).join('');
}

/**
 * Renderiza loja
 */
function renderLoja(produtos) {
  if (!produtos || produtos.length === 0) return;
  
  const container = document.querySelector('#loja .row.g-4.mt-3');
  if (!container) return;
  
  container.innerHTML = produtos.map(produto => `
    <div class="col-md-6 col-lg-4">
      <article class="product-card h-100 d-flex flex-column">
        <div class="product-media position-relative">
          <img src="${produto.image || 'img/stickers.png'}" class="w-100 product-img" alt="${produto.title}">
          <div class="product-badge">Loja Oficial</div>
        </div>
        <div class="p-3 p-md-4 d-flex flex-column flex-grow-1">
          <h3 class="h5 mb-1">${produto.title}</h3>
          <div class="small text-secondary mb-2">Disponível nos nossos eventos</div>
          <p class="text-secondary small mb-3 flex-grow-1">${produto.description || ''}</p>
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <div class="price fw-bold">${produto.price || ''}</div>
            <button class="btn btn-outline-info btn-sm mt-auto" enable>Requisitar no evento</button>
          </div>
        </div>
      </article>
    </div>
  `).join('');
}

/**
 * Renderiza comunidade
 */
function renderComunidade(data) {
  if (!data) return;
  
  const titleEl = document.querySelector('#comunidade .section-heading');
  if (titleEl && data.title) titleEl.textContent = data.title;
  
  const descEl = document.querySelector('#comunidade .col-lg-6 > p.text-secondary');
  if (descEl && data.description) descEl.textContent = data.description;
  
  const ownersTitle = document.querySelector('#comunidade .community-pill:first-child h3');
  if (ownersTitle && data.forOwnersTitle) ownersTitle.textContent = data.forOwnersTitle;
  
  const ownersText = document.querySelector('#comunidade .community-pill:first-child p');
  if (ownersText && data.forOwnersText) ownersText.textContent = data.forOwnersText;
  
  const enthusiastsTitle = document.querySelector('#comunidade .community-pill:last-child h3');
  if (enthusiastsTitle && data.forEnthusiastsTitle) enthusiastsTitle.textContent = data.forEnthusiastsTitle;
  
  const enthusiastsText = document.querySelector('#comunidade .community-pill:last-child p');
  if (enthusiastsText && data.forEnthusiastsText) enthusiastsText.textContent = data.forEnthusiastsText;
  
  const suggestionTitle = document.querySelector('#comunidade .glass-card h3');
  if (suggestionTitle && data.suggestionTitle) suggestionTitle.textContent = data.suggestionTitle;
  
  const suggestionText = document.querySelector('#comunidade .glass-card p.text-secondary.small');
  if (suggestionText && data.suggestionText) suggestionText.textContent = data.suggestionText;
}

/**
 * Renderiza contactos
 */
function renderContactos(data) {
  if (!data) return;
  
  const titleEl = document.querySelector('#contactos .section-heading');
  if (titleEl && data.title) titleEl.textContent = data.title;
  
  const descEl = document.querySelector('#contactos .col-lg-5 > p.text-secondary');
  if (descEl && data.description) descEl.textContent = data.description;
  
  if (data.benefits && Array.isArray(data.benefits)) {
    const listEl = document.querySelector('#contactos .col-lg-5 ul');
    if (listEl) {
      listEl.innerHTML = data.benefits.map(benefit => `<li>${benefit.benefit || benefit}</li>`).join('');
    }
  }
  
  const emailEl = document.querySelector('footer .text-muted-75:last-of-type');
  if (emailEl && data.email) emailEl.textContent = data.email;
  
  const instagramLink = document.querySelector('a[href*="instagram"]');
  if (instagramLink && data.instagramUrl) instagramLink.href = data.instagramUrl;
  
  const facebookLink = document.querySelector('a[href*="facebook"]');
  if (facebookLink && data.facebookUrl) facebookLink.href = data.facebookUrl;
}

/**
 * Inicializa e carrega todo o conteúdo do CMS
 */
async function initCMS() {
  try {
    // Carregar todos os dados em paralelo
    const [hero, eventos, agenda, galeria, loja, comunidade, contactos] = await Promise.all([
      loadHero(),
      loadEventos(),
      loadAgenda(),
      loadGaleria(),
      loadLoja(),
      loadComunidade(),
      loadContactos()
    ]);
    
    // Renderizar tudo
    renderHero(hero);
    renderEventos(eventos);
    renderAgenda(agenda);
    renderGaleria(galeria);
    renderLoja(loja);
    renderComunidade(comunidade);
    renderContactos(contactos);
    
  } catch (error) {
    console.error('Erro ao carregar conteúdo do CMS:', error);
  }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCMS);
} else {
  initCMS();
}

// Exportar funções para uso externo
window.cmsLoader = {
  loadHero,
  loadEventos,
  loadAgenda,
  loadGaleria,
  loadLoja,
  loadComunidade,
  loadContactos,
  initCMS
};

