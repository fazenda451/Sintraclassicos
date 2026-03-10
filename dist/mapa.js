/**
 * Mapa Interativo de Eventos - Sintra Clássicos
 * 
 * Este ficheiro gere o mapa do Google Maps com marcadores personalizados
 * para os eventos da comunidade. A estrutura é escalável e permite
 * adicionar eventos dinamicamente no futuro (ex: via base de dados).
 * 
 * NOTA: Este código usa Marker tradicional (funciona sem Map ID).
 * Para usar AdvancedMarkerElement, é necessário criar um Map ID no Google Cloud Console.
 */

// Variáveis globais
let mapa;
let marcadores = [];
let clusterer;

/**
 * Estrutura de dados dos eventos
 * Esta estrutura pode ser facilmente substituída por uma chamada à API/base de dados
 */
const eventos = [
  {
    id: 1,
    nome: 'Aquecimento Clássicos & Café',
    data: 'Fevereiro 2026',
    localizacao: { lat: 38.8029, lng: -9.3817 }, // Sintra (zona Colares)
    imagem: 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=400',
    descricao: 'Mini encontro em parque privado com pausa para café e apresentação dos novos membros da comunidade.',
    tipo: 'Clássicos & café'
  },
  {
    id: 2,
    nome: 'Sintra Clássicos Festival',
    data: 'Setembro 2026',
    localizacao: { lat: 38.7804, lng: -9.4989 }, // Cabo da Roca (localização diferente)
    imagem: 'https://images.pexels.com/photos/1409992/pexels-photo-1409992.jpeg?auto=compress&cs=tinysrgb&w=400',
    descricao: 'O grande encontro anual com exposição temática, palestras sobre restauro, mercado de peças e zona de carrinhas de comida.',
    tipo: 'Encontros estáticos'
  }
];


function initMap() {
  // Coordenadas do centro de Portugal
  const centroPortugal = { lat: 39.5, lng: -8.0 };

  const opcoesMapa = {
    zoom: 7,
    center: centroPortugal,
    // mapId: 'TEU_MAP_ID_AQUI', // Descomenta e substitui se criaste um Map ID
    mapTypeId: 'roadmap',
    // Estilos personalizados para combinar com o design vintage do website
    styles: [
      // Remove pontos de interesse e labels
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }]
      },
      // Estiliza a água com tons creme/bege suave
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
          { color: '#f5f0e8' }, // Creme claro similar ao --sc-bg-light
          { saturation: -20 }
        ]
      },
      // Estiliza as estradas com tons vintage
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
          { color: '#e8e0d4' }, // Bege suave
          { lightness: 10 }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [
          { color: '#d4c8b8' }, // Bege mais escuro
          { lightness: 5 }
        ]
      },
      // Estiliza áreas administrativas (países, estados)
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [
          { color: '#c9b99b' }, // Castanho claro
          { weight: 0.5 }
        ]
      },
      // Estiliza áreas de parques/natureza
      {
        featureType: 'park',
        elementType: 'geometry',
        stylers: [
          { color: '#e8e0d4' }, // Bege suave
          { saturation: -30 }
        ]
      },
      // Estiliza áreas residenciais
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [
          { color: '#f9f6f0' }, // Creme muito claro
          { lightness: 15 }
        ]
      },
      // Remove labels de estradas
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#8b7355' }, // Castanho médio
          { visibility: 'simplified' }
        ]
      },
      // Estiliza labels de cidades
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#5c4a35' }, // Castanho escuro (--sc-foreground)
          { weight: 0.5 }
        ]
      },
      // Remove transito
      {
        featureType: 'transit',
        stylers: [{ visibility: 'off' }]
      }
    ],
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true
  };

  // Cria o mapa no elemento HTML
  const elementoMapa = document.getElementById('mapa-eventos');
  if (!elementoMapa) {
    console.error('Elemento do mapa não encontrado');
    return;
  }

  mapa = new google.maps.Map(elementoMapa, opcoesMapa);

  // Adiciona os marcadores dos eventos
  adicionarMarcadores();
}

/**
 * Verifica se a Google Maps API está carregada e inicializa o mapa
 * Esta função é chamada pelo callback da Google Maps API
 * DEVE estar no escopo global antes do carregamento da API
 */
function inicializarMapaQuandoPronto() {
  // Verifica se o DOM está pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      verificarEInicializar();
    });
  } else {
    verificarEInicializar();
  }
}

// Garante que a função está no escopo global
window.inicializarMapaQuandoPronto = inicializarMapaQuandoPronto;

/**
 * Verifica se a API está carregada e inicializa o mapa
 */
function verificarEInicializar() {
  if (typeof google !== 'undefined' && google.maps) {
    initMap();
  } else {
    // Tenta novamente após um pequeno delay
    setTimeout(verificarEInicializar, 100);
  }
}

/**
 * Cria um ícone personalizado circular preto com a imagem do evento no centro
 * @param {string} urlImagem - URL da imagem do evento
 * @returns {Promise<google.maps.Icon>} - Promise que resolve para o objeto de ícone personalizado
 */
function criarIconePersonalizado(urlImagem) {
  return new Promise((resolve) => {
    // Cria um canvas para desenhar o marcador circular
    const canvas = document.createElement('canvas');
    const size = 60;
    const pointerHeight = 10;
    canvas.width = size;
    canvas.height = size + pointerHeight;
    const ctx = canvas.getContext('2d');

    // Cor bordô do site (--sc-primary: hsl(350, 45%, 30%))
    const corBordo = '#8B3A4A'; // Equivalente RGB de hsl(350, 45%, 30%)

    // Desenha a sombra primeiro (por baixo)
    ctx.shadowColor = 'rgba(139, 58, 74, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;

    // Desenha o círculo bordô de fundo
    ctx.fillStyle = corBordo;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Remove a sombra para os outros elementos
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Desenha a borda branca
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Desenha a ponta do marcador (triângulo bordô)
    ctx.fillStyle = corBordo;
    ctx.beginPath();
    ctx.moveTo(size / 2 - 8, size);
    ctx.lineTo(size / 2, size + pointerHeight);
    ctx.lineTo(size / 2 + 8, size);
    ctx.closePath();
    ctx.fill();

    // Carrega e desenha a imagem no centro
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      // Desenha a imagem no círculo (com máscara circular)
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
      ctx.clip();
      
      // Calcula o tamanho da imagem para preencher o círculo
      const imgSize = (size / 2 - 6) * 2;
      const x = (size - imgSize) / 2;
      const y = (size - imgSize) / 2;
      
      ctx.drawImage(img, x, y, imgSize, imgSize);
      ctx.restore();

      // Retorna o ícone usando o canvas como imagem
      resolve({
        url: canvas.toDataURL(),
        scaledSize: new google.maps.Size(size, size + pointerHeight),
        size: new google.maps.Size(size, size + pointerHeight),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(size / 2, size + pointerHeight)
      });
    };
    
    img.onerror = function() {
      // Se a imagem falhar, usa apenas o círculo preto
      resolve({
        url: canvas.toDataURL(),
        scaledSize: new google.maps.Size(size, size + pointerHeight),
        size: new google.maps.Size(size, size + pointerHeight),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(size / 2, size + pointerHeight)
      });
    };
    
    img.src = urlImagem;
  });
}

/**
 * Cria o conteúdo HTML para o InfoWindow com design elegante e vintage
 * @param {Object} evento - Objeto do evento
 * @returns {string} - HTML formatado
 */
function criarConteudoInfoWindow(evento) {
  return `
    <div style="
      max-width: 320px; 
      font-family: 'Lato', sans-serif;
      background: linear-gradient(to bottom, #f9f6f0, #f5f0e8);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    ">
      <!-- Imagem do evento com overlay elegante -->
      <div style="position: relative; width: 100%; height: 180px; overflow: hidden;">
        <img 
          src="${evento.imagem}" 
          alt="${evento.nome}"
          style="
            width: 100%; 
            height: 100%; 
            object-fit: cover;
            display: block;
          "
          onerror="this.src='https://via.placeholder.com/320x180?text=Imagem+do+Evento'"
        />
        <!-- Overlay gradiente no topo da imagem -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(to bottom, rgba(139, 58, 74, 0.7), transparent);
        "></div>
        <!-- Badge de tipo no canto superior direito -->
        <div style="
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #8B3A4A;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        ">
          ${evento.tipo}
        </div>
      </div>
      
      <!-- Conteúdo do modal -->
      <div style="padding: 20px;">
        <!-- Título -->
        <h3 style="
          margin: 0 0 12px 0; 
          font-size: 1.3rem; 
          font-weight: 700; 
          color: #5c4a35;
          font-family: 'Playfair Display', serif;
          line-height: 1.3;
        ">
          ${evento.nome}
        </h3>
        
        <!-- Data com ícone -->
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(139, 58, 74, 0.2);
        ">
          <div style="
            width: 20px;
            height: 20px;
            background: #8B3A4A;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.7rem;
            font-weight: bold;
          ">📅</div>
          <p style="
            margin: 0; 
            font-size: 0.9rem; 
            color: #8B3A4A;
            font-weight: 600;
            letter-spacing: 0.3px;
          ">
            ${evento.data}
          </p>
        </div>
        
        <!-- Descrição -->
        <p style="
          margin: 0 0 0 0; 
          font-size: 0.9rem; 
          color: #5c4a35; 
          line-height: 1.6;
          text-align: justify;
        ">
          ${evento.descricao}
        </p>
        
        <!-- Decoração inferior -->
        <div style="
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <div style="
            flex: 1;
            height: 2px;
            background: linear-gradient(to right, #8B3A4A, transparent);
            border-radius: 2px;
          "></div>
          <div style="
            width: 8px;
            height: 8px;
            background: #8B3A4A;
            border-radius: 50%;
          "></div>
          <div style="
            flex: 1;
            height: 2px;
            background: linear-gradient(to left, #8B3A4A, transparent);
            border-radius: 2px;
          "></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Adiciona marcadores ao mapa para cada evento
 * Utiliza Marker tradicional (funciona sem Map ID)
 */
async function adicionarMarcadores() {
  const markersArray = [];
  
  for (const evento of eventos) {
    // Cria o ícone personalizado (aguarda o carregamento da imagem)
    const icon = await criarIconePersonalizado(evento.imagem);
    
    // Cria o marcador com ícone personalizado
    const marcador = new google.maps.Marker({
      position: evento.localizacao,
      map: null, // Não adiciona diretamente ao mapa, o clusterer vai gerir
      title: evento.nome,
      icon: icon,
      animation: google.maps.Animation.DROP
    });

    // Cria o InfoWindow com conteúdo personalizado
    const infoWindow = new google.maps.InfoWindow({
      content: criarConteudoInfoWindow(evento),
      maxWidth: 320
    });

    // Adiciona evento de clique no marcador
    marcador.addListener('click', () => {
      // Fecha outros InfoWindows abertos
      marcadores.forEach((m) => {
        if (m.infoWindow) {
          m.infoWindow.close();
        }
      });

      // Abre o InfoWindow do marcador clicado
      infoWindow.open(mapa, marcador);
    });

    // Guarda referências do marcador e InfoWindow
    marcadores.push({
      marcador: marcador,
      infoWindow: infoWindow,
      evento: evento
    });

    markersArray.push(marcador);
  }

  // Cria o MarkerClusterer com estilo personalizado
  if (typeof window.markerClusterer !== 'undefined' && window.markerClusterer.MarkerClusterer) {
    // Cria um renderer personalizado para os clusters
    const renderer = {
      render: ({ count, position }) => {
        // Cria um marcador de cluster personalizado com animação
        // O número já está desenhado no ícone, não precisa de label
        return new google.maps.Marker({
          position: position,
          icon: criarIconeCluster(count),
          zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
          animation: google.maps.Animation.DROP
        });
      }
    };

    // Cria o clusterer usando o algoritmo padrão
    clusterer = new window.markerClusterer.MarkerClusterer({
      map: mapa,
      markers: markersArray,
      renderer: renderer
    });
  } else {
    // Fallback: se o MarkerClusterer não estiver disponível, adiciona os marcadores normalmente
    markersArray.forEach(marker => {
      marker.setMap(mapa);
    });
  }

  // Ajusta o zoom para mostrar todos os marcadores
  ajustarZoomParaMarcadores();
}

/**
 * Cria um ícone personalizado para o cluster (quando waypoints se juntam)
 * @param {number} count - Número de waypoints agrupados
 * @returns {google.maps.Icon} - Ícone do cluster
 */
function criarIconeCluster(count) {
  const canvas = document.createElement('canvas');
  const size = 60;
  const pointerHeight = 10;
  canvas.width = size;
  canvas.height = size + pointerHeight;
  const ctx = canvas.getContext('2d');

  // Cor bordô do site (--sc-primary: hsl(350, 45%, 30%))
  const corBordo = '#8B3A4A'; // Equivalente RGB de hsl(350, 45%, 30%)

  // Desenha a sombra
  ctx.shadowColor = 'rgba(139, 58, 74, 0.5)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 3;

  // Desenha o círculo bordô de fundo
  ctx.fillStyle = corBordo;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // Remove a sombra
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Desenha a borda branca
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Desenha a ponta do marcador
  ctx.fillStyle = corBordo;
  ctx.beginPath();
  ctx.moveTo(size / 2 - 8, size);
  ctx.lineTo(size / 2, size + pointerHeight);
  ctx.lineTo(size / 2 + 8, size);
  ctx.closePath();
  ctx.fill();

  // Desenha o número no centro
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(count.toString(), size / 2, size / 2);

  return {
    url: canvas.toDataURL(),
    scaledSize: new google.maps.Size(size, size + pointerHeight),
    size: new google.maps.Size(size, size + pointerHeight),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(size / 2, size + pointerHeight)
  };
}

/**
 * Ajusta o zoom e centro do mapa para mostrar todos os marcadores
 */
function ajustarZoomParaMarcadores() {
  if (marcadores.length === 0) return;

  const bounds = new google.maps.LatLngBounds();

  marcadores.forEach((item) => {
    bounds.extend(item.marcador.getPosition());
  });

  // Se houver apenas um marcador, define um zoom mais próximo
  if (marcadores.length === 1) {
    mapa.setCenter(marcadores[0].marcador.getPosition());
    mapa.setZoom(12);
  } else {
    mapa.fitBounds(bounds);
    // Ajusta o padding para não cortar os marcadores
    mapa.fitBounds(bounds, { padding: 50 });
  }
}

/**
 * Função pública para adicionar eventos dinamicamente
 * Útil para integração futura com base de dados ou API
 * @param {Object} novoEvento - Objeto do evento a adicionar
 */
function adicionarEvento(novoEvento) {
  // Validação básica
  if (!novoEvento.nome || !novoEvento.localizacao) {
    console.error('Evento inválido: nome e localizacao são obrigatórios');
    return;
  }

  // Adiciona à lista de eventos
  eventos.push(novoEvento);

  // Cria e adiciona o marcador
  const marcador = new google.maps.Marker({
    position: novoEvento.localizacao,
    map: mapa,
    title: novoEvento.nome,
    icon: criarIconePersonalizado(novoEvento.imagem || 'https://via.placeholder.com/50'),
    animation: google.maps.Animation.DROP
  });

  const infoWindow = new google.maps.InfoWindow({
    content: criarConteudoInfoWindow(novoEvento),
    maxWidth: 320
  });

  marcador.addListener('click', () => {
    marcadores.forEach((m) => {
      if (m.infoWindow) {
        m.infoWindow.close();
      }
    });
    infoWindow.open(mapa, marcador);
  });

  marcadores.push({
    marcador: marcador,
    infoWindow: infoWindow,
    evento: novoEvento
  });

  // Reajusta o zoom
  ajustarZoomParaMarcadores();
}

/**
 * Função pública para remover um evento
 * @param {number} idEvento - ID do evento a remover
 */
function removerEvento(idEvento) {
  const index = marcadores.findIndex((item) => item.evento.id === idEvento);
  
  if (index !== -1) {
    // Remove o marcador do mapa
    marcadores[index].marcador.setMap(null);
    
    // Remove da lista
    marcadores.splice(index, 1);
    
    // Remove da lista de eventos
    const eventoIndex = eventos.findIndex((e) => e.id === idEvento);
    if (eventoIndex !== -1) {
      eventos.splice(eventoIndex, 1);
    }
    
    // Reajusta o zoom
    ajustarZoomParaMarcadores();
  }
}

// Exporta funções para uso externo (se necessário)
window.mapaEventos = {
  adicionarEvento,
  removerEvento,
  obterEventos: () => eventos,
  obterMarcadores: () => marcadores
};
