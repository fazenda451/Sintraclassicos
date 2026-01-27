/**
 * CMS Content Loader - Sintra Clássicos
 * Carrega conteúdo dinamicamente dos ficheiros JSON geridos pelo CMS
 */

// Cache para os dados carregados
const cmsCache = {};

// Desabilitar cache por padrão em desenvolvimento
// Para habilitar cache, defina window.ENABLE_CMS_CACHE = true
const ENABLE_CACHE = window.ENABLE_CMS_CACHE !== false && 
                     !window.location.hostname.includes('localhost') && 
                     !window.location.hostname.includes('127.0.0.1');

/**
 * Limpa o cache do CMS
 */
function clearCMSCache() {
  Object.keys(cmsCache).forEach(key => delete cmsCache[key]);
  console.log('Cache do CMS limpo');
}

/**
 * Força recarregamento de todos os dados do CMS
 */
async function reloadCMS() {
  clearCMSCache();
  await initCMS(true);
}

/**
 * Carrega um ficheiro JSON
 * @param {string} path - Caminho do ficheiro JSON
 * @param {boolean} bypassCache - Se true, adiciona timestamp para forçar recarregamento
 */
async function loadJSON(path, bypassCache = false) {
  try {
    // Adiciona cache-busting se necessário
    const url = bypassCache ? `${path}?t=${Date.now()}` : path;
    const response = await fetch(url, {
      cache: bypassCache ? 'no-cache' : 'default'
    });
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
    const files = await fetch(`${folder}/index.json`).catch(() => null);
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
 * @param {boolean} forceReload - Se true, força recarregamento ignorando cache
 */
async function loadHero(forceReload = false) {
  if (!forceReload && ENABLE_CACHE && cmsCache.hero) return cmsCache.hero;
  const data = await loadJSON('content/hero/hero.json', forceReload || !ENABLE_CACHE);
  if (data && ENABLE_CACHE) cmsCache.hero = data;
  return data;
}

/**
 * Carrega eventos
 * @param {boolean} forceReload - Se true, força recarregamento ignorando cache
 */
async function loadEventos(forceReload = false) {
  if (!forceReload && ENABLE_CACHE && cmsCache.eventos) return cmsCache.eventos;
  
  // Tenta carregar um índice de ficheiros, senão usa lista padrão
  let eventFiles = [];
  try {
    const index = await loadJSON('content/eventos/index.json', forceReload || !ENABLE_CACHE);
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
    eventFiles.map(file => loadJSON(file, forceReload || !ENABLE_CACHE))
  );
  
  const published = eventos.filter(e => e && e.published !== false);
  if (published.length > 0 && ENABLE_CACHE) cmsCache.eventos = published;
  return published;
}

/**
 * Carrega agenda (secções da timeline no lado direito)
 * Usa content/agenda/agenda.json com lista "sections" gerida no admin.
 * @param {boolean} forceReload - Se true, força recarregamento ignorando cache
 */
async function loadAgenda(forceReload = false) {
  if (!forceReload && ENABLE_CACHE && cmsCache.agenda) return cmsCache.agenda;

  try {
    const data = await loadJSON('content/agenda/agenda.json', forceReload || !ENABLE_CACHE);
    if (data && Array.isArray(data.sections)) {
      const sorted = data.sections
        .filter(s => s && s.published !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      if (sorted.length > 0 && ENABLE_CACHE) cmsCache.agenda = sorted;
      return sorted;
    }
  } catch (e) {
    /* fallback: método antigo com index + ficheiros separados */
  }

  let agendaFiles = [];
  try {
    const index = await loadJSON('content/agenda/index.json', forceReload || !ENABLE_CACHE);
    if (index && Array.isArray(index)) {
      agendaFiles = index.map(f => `content/agenda/${f}`);
    }
  } catch (e2) {
    agendaFiles = [
      'content/agenda/agenda-fevereiro.json',
      'content/agenda/agenda-marco.json',
      'content/agenda/agenda-abril.json',
      'content/agenda/agenda-ano.json'
    ];
  }

  const agenda = await Promise.all(
    agendaFiles.map(file => loadJSON(file, forceReload || !ENABLE_CACHE))
  );
  const sorted = agenda
    .filter(a => a !== null)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  if (sorted.length > 0 && ENABLE_CACHE) cmsCache.agenda = sorted;
  return sorted;
}

/**
 * Normaliza dados da galeria para garantir estrutura consistente
 * @param {Object} item - Item da galeria
 */
function normalizeGaleriaItem(item) {
  if (!item) return null;
  
  // Gerar ID automaticamente se não existir
  if (!item.id) {
    // Tentar gerar ID a partir do nome, title ou slug
    let nome = item.nome || item.title || '';
    
    // Se ainda não houver nome, tentar usar o nome do arquivo (slug)
    if (!nome && item.slug) {
      nome = item.slug.replace(/\.json$/, '').replace(/-/g, ' ');
    }
    
    // Gerar ID a partir do nome
    item.id = nome.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-') // Substitui espaços e caracteres especiais por hífen
      .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
    
    // Se ainda não houver ID, usar order como fallback
    if (!item.id && item.order !== undefined) {
      item.id = `galeria-${item.order}`;
    }
  }
  
  // Normalizar estrutura de fotos
  // O CMS pode retornar como array de objetos {foto: "path"} ou array de strings
  if (item.fotos && Array.isArray(item.fotos)) {
    item.fotos = item.fotos.map(foto => {
      // Se for objeto, extrair a propriedade 'foto'
      if (typeof foto === 'object' && foto !== null) {
        return foto.foto || foto.image || foto;
      }
      return foto;
    }).filter(foto => foto); // Remover valores vazios
  }
  
  // Garantir que há pelo menos a imagem principal nas fotos
  if (!item.fotos || item.fotos.length === 0) {
    const imagemPrincipal = item.imagemPrincipal || item.image;
    if (imagemPrincipal) {
      item.fotos = [imagemPrincipal];
    }
  }
  
  return item;
}

/**
 * Carrega galeria
 * @param {boolean} forceReload - Se true, força recarregamento ignorando cache
 */
async function loadGaleria(forceReload = false) {
  if (!forceReload && ENABLE_CACHE && cmsCache.galeria) return cmsCache.galeria;
  
  let galeriaFiles = [];
  try {
    const index = await loadJSON('content/galeria/index.json', forceReload || !ENABLE_CACHE);
    if (index && Array.isArray(index)) {
      galeriaFiles = index.map(f => `content/galeria/${f}`);
    }
  } catch (e) {
    // Fallback: tentar carregar todos os arquivos JSON da pasta galeria
    // O CMS gerencia isso automaticamente, mas podemos ter uma lista padrão
    galeriaFiles = [
      'content/galeria/galeria-1.json',
      'content/galeria/galeria-2.json',
      'content/galeria/galeria-3.json',
      'content/galeria/galeria-4.json'
    ];
  }
  
  const galeria = await Promise.all(
    galeriaFiles.map(file => loadJSON(file, forceReload || !ENABLE_CACHE))
  );
  
  // Normalizar e filtrar itens válidos
  const normalized = galeria
    .map(normalizeGaleriaItem)
    .filter(g => g !== null);
  
  // Ordenar por data PRIMEIRO (mais recente primeiro), depois por order como desempate
  // Isso garante que mesmo com conflitos de order, a data prevalece
  const sorted = normalized.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    
    // PRIORIDADE 1: Se as datas forem diferentes, ordenar por data (mais recente primeiro)
    if (dateA !== dateB) {
      return dateB - dateA; // Invertido para mais recente primeiro (maior timestamp = mais recente)
    }
    
    // PRIORIDADE 2: Se as datas forem iguais, usar order como desempate
    const orderA = a.order || 999;
    const orderB = b.order || 999;
    
    if (orderA !== orderB) {
      return orderA - orderB; // Menor order = mais recente
    }
    
    // PRIORIDADE 3: Se tudo for igual, manter ordem original (por nome)
    const nomeA = (a.nome || a.title || '').toLowerCase();
    const nomeB = (b.nome || b.title || '').toLowerCase();
    return nomeA.localeCompare(nomeB);
  });
  
  if (sorted.length > 0 && ENABLE_CACHE) cmsCache.galeria = sorted;
  return sorted;
}

/**
 * Carrega produtos da loja
 * @param {boolean} forceReload - Se true, força recarregamento ignorando cache
 */
async function loadLoja(forceReload = false) {
  if (!forceReload && ENABLE_CACHE && cmsCache.loja) return cmsCache.loja;
  
  let lojaFiles = [];
  try {
    const index = await loadJSON('content/loja/index.json', forceReload || !ENABLE_CACHE);
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
    lojaFiles.map(file => loadJSON(file, forceReload || !ENABLE_CACHE))
  );
  
  const available = produtos.filter(p => p && p.available !== false);
  if (available.length > 0 && ENABLE_CACHE) cmsCache.loja = available;
  return available;
}

/**
 * Carrega dados da comunidade
 * @param {boolean} forceReload - Se true, força recarregamento ignorando cache
 */
async function loadComunidade(forceReload = false) {
  if (!forceReload && ENABLE_CACHE && cmsCache.comunidade) return cmsCache.comunidade;
  const data = await loadJSON('content/comunidade/comunidade.json', forceReload || !ENABLE_CACHE);
  if (data && ENABLE_CACHE) cmsCache.comunidade = data;
  return data;
}

/**
 * Carrega contactos
 * @param {boolean} forceReload - Se true, força recarregamento ignorando cache
 */
async function loadContactos(forceReload = false) {
  if (!forceReload && ENABLE_CACHE && cmsCache.contactos) return cmsCache.contactos;
  const data = await loadJSON('content/contactos/contactos.json', forceReload || !ENABLE_CACHE);
  if (data && ENABLE_CACHE) cmsCache.contactos = data;
  return data;
}

/**
 * Carrega regras
 * @param {boolean} forceReload - Se true, força recarregamento ignorando cache
 */
async function loadRegras(forceReload = false) {
  if (!forceReload && ENABLE_CACHE && cmsCache.regras) return cmsCache.regras;
  const data = await loadJSON('content/regras/regras.json', forceReload || !ENABLE_CACHE);
  if (data && ENABLE_CACHE) cmsCache.regras = data;
  return data;
}

/**
 * Carrega configurações gerais do site
 * @param {boolean} forceReload - Se true, força recarregamento ignorando cache
 */
async function loadConfig(forceReload = false) {
  if (!forceReload && ENABLE_CACHE && cmsCache.config) return cmsCache.config;
  const data = await loadJSON('content/config/site.json', forceReload || !ENABLE_CACHE);
  if (data && ENABLE_CACHE) cmsCache.config = data;
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
  if (!eventos || eventos.length === 0) {
    console.warn('renderEventos: Nenhum evento para renderizar');
    return;
  }
  
  const container = document.querySelector('#proximos-eventos .row.g-4');
  if (!container) {
    console.error('renderEventos: Container não encontrado (#proximos-eventos .row.g-4)');
    return;
  }
  
  console.log('renderEventos: Renderizando', eventos.length, 'eventos');
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
            ${evento.Registration ? `<li>${evento.Registration}</li>` : ''}
            ${evento.visitantFee ? `<li>${evento.visitantFee}</li>` : ''}
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
        // Usar texto do CMS se disponível, senão usar texto padrão
        let mensagem = 'Agradecemos pelo seu interesse em "' + nomeEvento + '". Para proceder com a sua inscrição, preencha o formulário abaixo';
        if (window.modalTexts && window.modalTexts.participarEvento) {
          mensagem = window.modalTexts.participarEvento.replace('{{evento}}', nomeEvento);
        }
        window.sintraClassicos.abrirModal(
          mensagem,
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
  if (!agenda || agenda.length === 0) {
    console.warn('renderAgenda: Nenhum item de agenda para renderizar');
    return;
  }
  
  const container = document.querySelector('#agenda .col-lg-7 .d-flex.flex-column');
  if (!container) {
    console.error('renderAgenda: Container não encontrado (#agenda .col-lg-7 .d-flex.flex-column)');
    return;
  }
  
  console.log('renderAgenda: Renderizando', agenda.length, 'itens');
  container.innerHTML = agenda.map(item => `
    <div class="d-flex gap-3">
      <div class="d-none d-md-flex flex-column align-items-center pt-1">
        <div class="timeline-dot"></div>
      </div>
      <div class="flex-grow-1">
        ${item.month ? `<div class="badge-soft text-secondary mb-1">${item.month}</div>` : ''}
        ${item.title ? `<h3 class="h6 mb-1" style="color: var(--sc-gold) !important;">${item.title}</h3>` : ''}
        <p class="text-secondary small mb-1">
          ${item.description || ''}
        </p>
        ${item.type ? `<span class="small text-info">${item.type}</span>` : ''}
      </div>
    </div>
  `).join('');
}

// Variáveis globais para a galeria
let galeriaData = [];
let galeriaOffset = 0;
const ITEMS_PER_PAGE = 4;

/**
 * Renderiza galeria com navegação
 * @param {number} offset - Offset para mostrar os meses (0 = primeiros 4, 4 = próximos 4, etc)
 * @param {string} direction - Direção da animação: 'left', 'right', ou null
 */
function renderGallery(offset = 0, direction = null) {
  if (!galeriaData || galeriaData.length === 0) {
    console.warn('renderGallery: Nenhum item de galeria para renderizar');
    return;
  }
  
  const container = document.querySelector('#gallery-grid');
  if (!container) {
    console.error('renderGallery: Container não encontrado (#gallery-grid)');
    return;
  }
  
  // Calcular quais meses mostrar
  const startIndex = offset;
  const endIndex = Math.min(offset + ITEMS_PER_PAGE, galeriaData.length);
  const mesesParaMostrar = galeriaData.slice(startIndex, endIndex);
  
  console.log('renderGallery: Renderizando meses', startIndex + 1, 'a', endIndex, 'de', galeriaData.length);
  
  // Adicionar classe de animação se houver direção
  if (direction) {
    container.classList.add(`gallery-slide-${direction}`);
    // Remover classe após animação
    setTimeout(() => {
      container.classList.remove(`gallery-slide-${direction}`);
    }, 500);
  }
  
  container.innerHTML = mesesParaMostrar.map(item => {
    // Usar nova estrutura (imagemPrincipal) ou fallback para estrutura antiga (image)
    const imagemPrincipal = item.imagemPrincipal || item.image || 'img/preview.png';
    const nome = item.nome || item.title || '';
    const descricao = item.descricao || item.description || '';
    const id = item.id || `galeria-${item.order || 0}`;
    
    return `
      <div class="col-6 col-lg-3">
        <article class="gallery-item" data-month-id="${id}">
          <div class="gallery-image" style="background-image: url('${imagemPrincipal}')"></div>
          <div class="gallery-overlay">
            <h3>${nome}</h3>
            <p>${descricao}</p>
          </div>
        </article>
      </div>
    `;
  }).join('');
  
  // Adicionar event listeners aos itens da galeria
  container.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function() {
      const monthId = this.getAttribute('data-month-id');
      openCarousel(monthId);
    });
  });
  
  // Atualizar estado da navegação
  updateNavigationState();
}

/**
 * Avança para o próximo grupo de meses
 */
function nextGroup() {
  const maxOffset = Math.max(0, galeriaData.length - ITEMS_PER_PAGE);
  if (galeriaOffset < maxOffset) {
    galeriaOffset += ITEMS_PER_PAGE;
    renderGallery(galeriaOffset, 'left'); // Animação para a esquerda (novo conteúdo vem da direita)
  }
}

/**
 * Volta para o grupo anterior de meses
 */
function prevGroup() {
  if (galeriaOffset > 0) {
    galeriaOffset = Math.max(0, galeriaOffset - ITEMS_PER_PAGE);
    renderGallery(galeriaOffset, 'right'); // Animação para a direita (novo conteúdo vem da esquerda)
  }
}

/**
 * Atualiza o estado dos botões de navegação e indicador de posição
 */
function updateNavigationState() {
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const positionIndicator = document.getElementById('gallery-position');
  const navigationContainer = document.querySelector('.gallery-navigation');
  
  if (!prevBtn || !nextBtn || !positionIndicator) return;
  
  const totalMeses = galeriaData.length;
  const maxOffset = Math.max(0, totalMeses - ITEMS_PER_PAGE);
  const startIndex = galeriaOffset + 1;
  const endIndex = Math.min(galeriaOffset + ITEMS_PER_PAGE, totalMeses);
  
  // Se há 4 ou menos meses, esconder navegação completamente
  if (totalMeses <= ITEMS_PER_PAGE) {
    if (navigationContainer) {
      navigationContainer.style.display = 'none';
    }
    return;
  }
  
  // Mostrar navegação se há mais de 4 meses
  if (navigationContainer) {
    navigationContainer.style.display = 'flex';
  }
  
  // Atualizar indicador de posição
  positionIndicator.innerHTML = `<span>Mostrando meses ${startIndex}-${endIndex} de ${totalMeses}</span>`;
  
  // Desabilitar/habilitar botões
  prevBtn.disabled = galeriaOffset === 0;
  nextBtn.disabled = galeriaOffset >= maxOffset;
  
  // Adicionar classe disabled visual
  if (prevBtn.disabled) {
    prevBtn.classList.add('disabled');
  } else {
    prevBtn.classList.remove('disabled');
  }
  
  if (nextBtn.disabled) {
    nextBtn.classList.add('disabled');
  } else {
    nextBtn.classList.remove('disabled');
  }
}

/**
 * Abre o modal com carrossel de fotos do mês selecionado
 * @param {string} monthId - ID do mês
 */
function openCarousel(monthId) {
  const month = galeriaData.find(m => (m.id || `galeria-${m.order || 0}`) === monthId);
  if (!month) {
    console.error('openCarousel: Mês não encontrado:', monthId);
    return;
  }
  
  // Obter array de fotos (nova estrutura) ou usar imagem única (estrutura antiga)
  const fotos = month.fotos || (month.image || month.imagemPrincipal ? [month.image || month.imagemPrincipal] : []);
  
  if (fotos.length === 0) {
    console.warn('openCarousel: Nenhuma foto encontrada para o mês:', monthId);
    return;
  }
  
  const modal = document.getElementById('galleryCarouselModal');
  const carouselInner = document.getElementById('gallery-carousel-inner');
  const photoCounter = document.getElementById('gallery-photo-counter');
  const modalTitle = document.getElementById('galleryCarouselModalLabel');
  
  if (!modal || !carouselInner) return;
  
  // Atualizar título do modal
  if (modalTitle) {
    modalTitle.textContent = month.nome || month.title || 'Galeria de Fotos';
  }
  
  // Limpar carrossel anterior
  carouselInner.innerHTML = '';
  
  // Adicionar itens ao carrossel
  fotos.forEach((foto, index) => {
    const isActive = index === 0 ? 'active' : '';
    const item = document.createElement('div');
    item.className = `carousel-item ${isActive}`;
    item.innerHTML = `
      <img src="${foto}" class="d-block w-100" alt="Foto ${index + 1}" style="max-height: 70vh; object-fit: contain;">
    `;
    carouselInner.appendChild(item);
  });
  
  // Atualizar contador de fotos
  if (photoCounter) {
    photoCounter.innerHTML = `<span>Foto 1 de ${fotos.length}</span>`;
  }
  
  // Inicializar carrossel Bootstrap (se disponível)
  const carouselElement = document.getElementById('galleryCarousel');
  if (carouselElement && window.bootstrap && window.bootstrap.Carousel) {
    // Remover instância anterior se existir
    const existingCarousel = bootstrap.Carousel.getInstance(carouselElement);
    if (existingCarousel) {
      existingCarousel.dispose();
    }
    
    // Esconder controles se houver apenas uma foto
    const prevControl = carouselElement.querySelector('.carousel-control-prev');
    const nextControl = carouselElement.querySelector('.carousel-control-next');
    if (fotos.length <= 1) {
      if (prevControl) prevControl.style.display = 'none';
      if (nextControl) nextControl.style.display = 'none';
    } else {
      if (prevControl) prevControl.style.display = 'flex';
      if (nextControl) nextControl.style.display = 'flex';
    }
    
    const carousel = new bootstrap.Carousel(carouselElement, {
      interval: false, // Desabilitar transição automática
      wrap: true, // Não fazer loop
      keyboard: true, // Permitir navegação por teclado
      pause: false // Não pausar (mas como interval é false, não faz diferença)
    });
    
    // Garantir que não há transição automática (forçar múltiplas vezes)
    carousel._config.interval = false;
    if (carousel._interval) {
      clearInterval(carousel._interval);
      carousel._interval = null;
    }
    
    // Remover qualquer intervalo que possa ter sido criado
    setTimeout(() => {
      if (carousel._interval) {
        clearInterval(carousel._interval);
        carousel._interval = null;
      }
      carousel._config.interval = false;
    }, 100);
    
    // Prevenir qualquer transição automática através de event listeners
    carouselElement.addEventListener('slide.bs.carousel', function(e) {
      // Se não foi acionado por controle manual, prevenir
      if (!e.relatedTarget && carousel._config.interval !== false) {
        e.preventDefault();
      }
    });
    
    // Atualizar contador quando o slide muda
    carouselElement.addEventListener('slid.bs.carousel', function(event) {
      if (photoCounter) {
        const activeIndex = event.to;
        photoCounter.innerHTML = `<span>Foto ${activeIndex + 1} de ${fotos.length}</span>`;
      }
    });
  }
  
  // Mostrar modal (se Bootstrap estiver disponível)
  if (window.bootstrap && window.bootstrap.Modal) {
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  } else {
    // Fallback: mostrar modal sem Bootstrap (caso não esteja carregado ainda)
    modal.style.display = 'block';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
  }
}

/**
 * Renderiza galeria (função principal chamada pelo CMS)
 */
function renderGaleria(galeria) {
  if (!galeria || galeria.length === 0) {
    console.warn('renderGaleria: Nenhum item de galeria para renderizar');
    return;
  }
  
  // Filtrar apenas itens publicados e ordenar por order
  galeriaData = galeria
    .filter(item => item.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // Resetar offset para mostrar os 4 mais recentes
  galeriaOffset = 0;
  
  // Renderizar galeria
  renderGallery(galeriaOffset);
  
  // Adicionar event listeners aos botões de navegação
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', prevGroup);
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', nextGroup);
  }
}

/**
 * Renderiza loja
 */
function renderLoja(produtos) {
  if (!produtos || produtos.length === 0) {
    console.warn('renderLoja: Nenhum produto para renderizar');
    return;
  }
  
  const container = document.querySelector('#loja .row.g-4.mt-3');
  if (!container) {
    console.error('renderLoja: Container não encontrado (#loja .row.g-4.mt-3)');
    return;
  }
  
  console.log('renderLoja: Renderizando', produtos.length, 'produtos');
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
  
  // Bloco para proprietários
  const ownersTitle = document.getElementById('community-owners-title');
  if (ownersTitle && data.forOwnersTitle) ownersTitle.textContent = data.forOwnersTitle;
  
  const ownersText = document.getElementById('community-owners-text');
  if (ownersText && data.forOwnersText) ownersText.textContent = data.forOwnersText;
  
  // Bloco para entusiastas
  const enthusiastsTitle = document.getElementById('community-enthusiasts-title');
  if (enthusiastsTitle && data.forEnthusiastsTitle) enthusiastsTitle.textContent = data.forEnthusiastsTitle;
  
  const enthusiastsText = document.getElementById('community-enthusiasts-text');
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
 * Renderiza regras
 */
function renderRegras(data) {
  if (!data) return;
  
  // Atualizar subtítulo e descrição
  const subtitleEl = document.getElementById('regras-subtitle');
  if (subtitleEl && data.subtitle) subtitleEl.textContent = data.subtitle;
  
  const descEl = document.getElementById('regras-description');
  if (descEl && data.description) descEl.textContent = data.description;
  
  // Atualizar parágrafos de introdução
  const introContainer = document.getElementById('regras-intro');
  if (introContainer && data.introParagraph1 && data.introParagraph2 && data.introParagraph3) {
    introContainer.innerHTML = `
      <p class="mb-3">${data.introParagraph1}</p>
      <p class="mb-3">${data.introParagraph2}</p>
      <p class="mb-0">${data.introParagraph3}</p>
    `;
  }
  
  // Atualizar definição de Clássicos
  const classicosTitle = document.getElementById('regras-classicos-title');
  if (classicosTitle && data.classicosTitle) classicosTitle.textContent = data.classicosTitle;
  
  const classicosDesc = document.getElementById('regras-classicos-desc');
  if (classicosDesc && data.classicosDescription) classicosDesc.textContent = data.classicosDescription;
  
  const classicosNote = document.getElementById('regras-classicos-note');
  if (classicosNote && data.classicosNote) {
    classicosNote.innerHTML = `<strong>Nota:</strong> ${data.classicosNote}`;
  }
  
  // Atualizar definição de Desportivos
  const desportivosTitle = document.getElementById('regras-desportivos-title');
  if (desportivosTitle && data.desportivosTitle) desportivosTitle.textContent = data.desportivosTitle;
  
  const desportivosBadge = document.getElementById('regras-desportivos-badge');
  if (desportivosBadge && data.desportivosBadge) desportivosBadge.textContent = data.desportivosBadge;
  
  const desportivosDesc = document.getElementById('regras-desportivos-desc');
  if (desportivosDesc && data.desportivosDescription) desportivosDesc.textContent = data.desportivosDescription;
  
  const desportivosNote = document.getElementById('regras-desportivos-note');
  if (desportivosNote && data.desportivosNote) {
    desportivosNote.innerHTML = `<strong>*</strong>${data.desportivosNote}`;
  }
  
  // Atualizar lista de regras
  const rulesContainer = document.getElementById('regras-list');
  if (rulesContainer && data.rules && Array.isArray(data.rules)) {
    rulesContainer.innerHTML = data.rules.map(rule => `
      <li class="mb-3 d-flex align-items-start">
        <i class="fa fa-check-circle text-primary me-3 mt-1" style="color: var(--sc-primary);"></i>
        <span>${rule}</span>
      </li>
    `).join('');
  }
}

/**
 * Renderiza configurações gerais do site
 */
function renderConfig(data) {
  if (!data) return;
  
  // Atualizar tagline do footer
  const footerTaglineEl = document.getElementById('footer-tagline');
  if (footerTaglineEl && data.footerTagline) {
    footerTaglineEl.textContent = `"${data.footerTagline}"`;
  }
  
  // Atualizar footer text se necessário
  const footerTextEl = document.querySelector('footer .text-muted-75');
  if (footerTextEl && data.footerText) {
    footerTextEl.textContent = data.footerText;
  }
  
  // Atualizar textos das modais se a função estiver disponível
  if (window.atualizarTextosModais) {
    window.atualizarTextosModais(data);
  }
}

/**
 * Inicializa e carrega todo o conteúdo do CMS
 * @param {boolean} forceReload - Se true, força recarregamento ignorando cache
 */
async function initCMS(forceReload = false) {
  try {
    console.log('initCMS: Iniciando carregamento do CMS...');
    
    // Carregar todos os dados em paralelo
    const [hero, eventos, agenda, galeria, loja, comunidade, contactos, regras, config] = await Promise.all([
      loadHero(forceReload),
      loadEventos(forceReload),
      loadAgenda(forceReload),
      loadGaleria(forceReload),
      loadLoja(forceReload),
      loadComunidade(forceReload),
      loadContactos(forceReload),
      loadRegras(forceReload),
      loadConfig(forceReload)
    ]);
    
    console.log('initCMS: Dados carregados:', {
      hero: !!hero,
      eventos: eventos?.length || 0,
      agenda: agenda?.length || 0,
      galeria: galeria?.length || 0,
      loja: loja?.length || 0,
      comunidade: !!comunidade,
      contactos: !!contactos,
      regras: !!regras,
      config: !!config
    });
    
    // Renderizar tudo
    renderHero(hero);
    renderEventos(eventos);
    renderAgenda(agenda);
    renderGaleria(galeria);
    renderLoja(loja);
    renderComunidade(comunidade);
    renderContactos(contactos);
    renderRegras(regras);
    renderConfig(config);
    
    console.log('initCMS: Renderização concluída');
    
  } catch (error) {
    console.error('Erro ao carregar conteúdo do CMS:', error);
  }
}

// Inicializar quando o DOM estiver pronto
function startCMS() {
  // Aguardar um pouco para garantir que o DOM está completamente renderizado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => initCMS(), 100);
    });
  } else {
    setTimeout(() => initCMS(), 100);
  }
}

startCMS();

// Exportar funções para uso externo
window.cmsLoader = {
  loadHero,
  loadEventos,
  loadAgenda,
  loadGaleria,
  loadLoja,
  loadComunidade,
  loadContactos,
  loadRegras,
  loadConfig,
  initCMS,
  clearCMSCache,
  reloadCMS
};

// Detectar quando o Netlify CMS salva alterações e recarregar
(function() {
  // Verificar se há parâmetro na URL para forçar recarregamento
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('reload') === 'true') {
    setTimeout(() => initCMS(true), 100);
  }
  
  // Adicionar listener para eventos de storage (útil quando o CMS salva)
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('netlify-cms')) {
      reloadCMS();
    }
  });
  
  // Polling para verificar se os arquivos foram atualizados (fallback)
  // Verifica a cada 5 segundos se estamos na página do admin
  if (window.location.pathname.includes('/admin')) {
    let lastCheck = Date.now();
    setInterval(async () => {
      try {
        // Verifica se algum arquivo foi modificado recentemente
        const checkTime = Date.now();
        const response = await fetch('content/hero/hero.json?t=' + checkTime, { method: 'HEAD' });
        const lastModified = response.headers.get('last-modified');
        if (lastModified) {
          const modifiedTime = new Date(lastModified).getTime();
          if (modifiedTime > lastCheck) {
            console.log('Alterações detectadas no CMS - recarregando...');
            reloadCMS();
            lastCheck = modifiedTime;
          }
        }
      } catch (e) {
        // Ignorar erros de polling
      }
    }, 5000);
  }
  
  // Detectar quando o Netlify CMS salva (usando eventos customizados)
  if (window.CMS) {
    window.CMS.registerEventListener({
      name: 'preSave',
      handler: () => {
        console.log('CMS: Salvando alterações...');
      }
    });
    
    window.CMS.registerEventListener({
      name: 'postSave',
      handler: () => {
        console.log('CMS: Alterações salvas - recarregando site...');
        setTimeout(() => reloadCMS(), 1000);
      }
    });
  }
})();

