// Inicializa todas as interações do site
function inicializarInteracoes() {
  // Modal de feedback (reutilizável)
  const feedbackModalEl = document.getElementById('feedbackModal');
  const feedbackModalBody = document.getElementById('feedbackModalBody');
  const feedbackModal = feedbackModalEl ? new bootstrap.Modal(feedbackModalEl) : null;

  function abrirModal(mensagem, mostrarBotaoFormulario = false) {
    if (!feedbackModal || !feedbackModalBody) return;
    feedbackModalBody.textContent = mensagem;
    
    // Gerir botões do footer do modal
    const modalFooter = document.querySelector('#feedbackModal .modal-footer');
    if (modalFooter) {
      if (mostrarBotaoFormulario) {
        // Criar botão de formulário
        const btnFormulario = document.createElement('button');
        btnFormulario.type = 'button';
        btnFormulario.className = 'btn btn-gradient btn-sm px-4';
        btnFormulario.textContent = 'Preencher formulário';
        btnFormulario.addEventListener('click', function() {
          window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLScTlzMefwu33HMBlvpZujtD8BFjMlnnM5nzaUhUAzuSrII_6Q/viewform?pli=1&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnkRFRPuCg1XSwP0K3fQpJtSWqSxuiD_q8QtYgWJey2N9_FNyV6RJECfIlWuQ_aem_WycFfdWDNWRL5w0DevxzMw';
        });
        
        // Botão de fechar
        const btnFechar = document.createElement('button');
        btnFechar.type = 'button';
        btnFechar.className = 'btn btn-ghost btn-sm';
        btnFechar.textContent = 'Fechar';
        btnFechar.setAttribute('data-bs-dismiss', 'modal');
        
        // Limpar e adicionar botões
        modalFooter.innerHTML = '';
        modalFooter.appendChild(btnFechar);
        modalFooter.appendChild(btnFormulario);
      } else {
        // Restaurar botão padrão "Fechar"
        modalFooter.innerHTML = '<button type="button" class="btn btn-ghost btn-sm" data-bs-dismiss="modal">Fechar</button>';
      }
    }
    
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
          '". Preenche o formulário para completar a tua inscrição.',
        true // Mostrar botão de formulário
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


