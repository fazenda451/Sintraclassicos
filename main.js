// Inicializa todas as interações do site
function inicializarInteracoes() {
  // Modal de feedback (reutilizável)
  const feedbackModalEl = document.getElementById('feedbackModal');
  const feedbackModalBody = document.getElementById('feedbackModalBody');
  const feedbackModal = feedbackModalEl ? new bootstrap.Modal(feedbackModalEl) : null;

  function abrirModal(mensagem) {
    if (!feedbackModal || !feedbackModalBody) return;
    feedbackModalBody.textContent = mensagem;
    feedbackModal.show();
  }

  window.sintraClassicos = { abrirModal };

  // Hero form (newsletter/alerta)
  const heroForm = document.getElementById('hero-form');
  if (heroForm) {
    heroForm.addEventListener('submit', function (e) {
      e.preventDefault();
      abrirModal(
        'Recebemos o teu email. Vais ser avisado assim que abrirmos as inscrições para este evento.'
      );
      heroForm.reset();
    });
  }

  // Form comunidade
  const comunidadeForm = document.getElementById('comunidade-form');
  if (comunidadeForm) {
    comunidadeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      abrirModal(
        'Obrigado pela sua sugestão! Vamos analisar o seu feedback para melhorar a experiência de todos os que participam no SintraClássicos.'
      );
      comunidadeForm.reset();
    });
  }

  // Form contacto
  const contactoForm = document.getElementById('contacto-form');
  const contactoFeedback = document.getElementById('contacto-feedback');
  if (contactoForm) {
    contactoForm.addEventListener('submit', function (e) {
      e.preventDefault();
      abrirModal(
        'Os detalhes do teu evento/parceria foram enviados. A equipa Sintra Clássicos entrará em contacto para alinhar os próximos passos.'
      );
      if (contactoFeedback) {
        contactoFeedback.textContent = 'Mensagem enviada com sucesso.';
        contactoFeedback.classList.remove('text-danger');
        contactoFeedback.classList.add('text-success');
      }
      contactoForm.reset();
    });
  }

  // Botões da loja: "Requisitar no evento"
  document.querySelectorAll('.product-card button[enable]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.product-card') || btn.closest('article');
      var tituloEl = card ? card.querySelector('h3') : null;
      var nomeProduto = (tituloEl && tituloEl.textContent) ? tituloEl.textContent.trim() : 'este item';
      abrirModal(
        'Este produto só está disponível para ser requisitado e adquirido presencialmente, dirija-se a um dos nossos colaboradores no decorrer do evento para o requisitar'
      );
    });
  });

  // Botões "Quero participar" / "Pré-inscrição"
  document.querySelectorAll('[data-event]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const nomeEvento = btn.getAttribute('data-event') || 'neste evento';
      abrirModal(
        'Registámos o teu interesse em "' +
          nomeEvento +
          '". Em breve vais receber mais informação (demonstração académica).'
      );
    });
  });

  // Scrollspy para destacar secção ativa no menu
  if (bootstrap.ScrollSpy) {
    new bootstrap.ScrollSpy(document.body, {
      target: '#mainNav',
      offset: 80
    });
  }

  // Fechar o offcanvas móvel ao clicar num link interno do menu (ex.: #proximos-eventos)
  const mobileMenuEl = document.getElementById('mobileMenu');
  if (mobileMenuEl) {
    mobileMenuEl.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () {
        const instance = bootstrap.Offcanvas.getInstance(mobileMenuEl);
        if (instance) {
          instance.hide();
        } else {
          // criar e fechar se ainda não existir (fallback)
          new bootstrap.Offcanvas(mobileMenuEl).hide();
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  inicializarInteracoes();
});