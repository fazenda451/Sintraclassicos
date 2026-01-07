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
}

document.addEventListener('DOMContentLoaded', function () {
  inicializarInteracoes();
});


