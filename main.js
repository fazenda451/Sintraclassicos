// Armazenar textos das modais do CMS (tornar global para acesso do cms-loader.js)
window.modalTexts = {
  participarEvento: 'Agradecemos pelo seu interesse em "{{evento}}". Para proceder com a sua inscrição, preencha o formulário abaixo',
  requisitarProduto: 'Este produto só está disponível para ser requisitado e adquirido presencialmente, dirija-se a um dos nossos colaboradores no decorrer do evento para o requisitar',
  feedbackComunidade: 'Obrigado pela sua sugestão! Vamos analisar o seu feedback para melhorar a experiência de todos os que participam no SintraClássicos.',
  formularioContacto: 'Os detalhes do teu evento/parceria foram enviados. A equipa Sintra Clássicos entrará em contacto para alinhar os próximos passos.'
};
const modalTexts = window.modalTexts;

// Função para atualizar textos das modais do CMS
function atualizarTextosModais(config) {
  if (config) {
    if (config.modalParticiparEvento) window.modalTexts.participarEvento = config.modalParticiparEvento;
    if (config.modalRequisitarProduto) window.modalTexts.requisitarProduto = config.modalRequisitarProduto;
    if (config.modalFeedbackComunidade) window.modalTexts.feedbackComunidade = config.modalFeedbackComunidade;
    if (config.modalFormularioContacto) window.modalTexts.formularioContacto = config.modalFormularioContacto;
  }
}

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

  // Form comunidade - usar fetch para enviar e mostrar feedback
  const comunidadeForm = document.getElementById('comunidade-form');
  if (comunidadeForm) {
    comunidadeForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      
      // Desabilitar botão durante o envio
      const submitBtn = comunidadeForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'A enviar...';
      }

      try {
        // Criar FormData do formulário
        const formData = new FormData(comunidadeForm);
        
        // Enviar para FormSubmit
        const response = await fetch('https://formsubmit.co/ajax/sintraclassicos14@gmail.com', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          abrirModal(
            window.modalTexts.feedbackComunidade
          );
          comunidadeForm.reset();
        } else {
          throw new Error('Erro ao enviar');
        }
      } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        abrirModal(
          'Ocorreu um erro ao enviar a sua mensagem. Por favor, tente novamente mais tarde ou contacte-nos diretamente.'
        );
      } finally {
        // Restaurar botão
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  // Form contacto - usar fetch para enviar e mostrar feedback
  const contactoForm = document.getElementById('contacto-form');
  const contactoFeedback = document.getElementById('contacto-feedback');
  if (contactoForm) {
    contactoForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      
      // Desabilitar botão durante o envio
      const submitBtn = contactoForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'A enviar...';
      }

      // Limpar feedback anterior
      if (contactoFeedback) {
        contactoFeedback.textContent = '';
        contactoFeedback.classList.remove('text-danger', 'text-success');
      }

      try {
        // Criar FormData do formulário
        const formData = new FormData(contactoForm);
        
        // Enviar para FormSubmit
        const response = await fetch('https://formsubmit.co/ajax/sintraclassicos14@gmail.com', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          abrirModal(
            window.modalTexts.formularioContacto
          );
          if (contactoFeedback) {
            contactoFeedback.textContent = 'Mensagem enviada com sucesso.';
            contactoFeedback.classList.remove('text-danger');
            contactoFeedback.classList.add('text-success');
          }
          contactoForm.reset();
        } else {
          throw new Error('Erro ao enviar');
        }
      } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        if (contactoFeedback) {
          contactoFeedback.textContent = 'Erro ao enviar. Tente novamente.';
          contactoFeedback.classList.remove('text-success');
          contactoFeedback.classList.add('text-danger');
        }
        abrirModal(
          'Ocorreu um erro ao enviar a sua mensagem. Por favor, tente novamente mais tarde ou contacte-nos diretamente.'
        );
      } finally {
        // Restaurar botão
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  // Botões da loja: "Requisitar no evento" (usando event delegation para funcionar com conteúdo dinâmico)
  const lojaContainer = document.getElementById('loja');
  if (lojaContainer) {
    lojaContainer.addEventListener('click', function (e) {
      // Verificar se o clique foi em um botão com atributo "enable"
      const btn = e.target.closest('button[enable]');
      if (btn) {
        var card = btn.closest('.product-card') || btn.closest('article');
        var tituloEl = card ? card.querySelector('h3') : null;
        var nomeProduto = (tituloEl && tituloEl.textContent) ? tituloEl.textContent.trim() : 'este item';
        abrirModal(
          window.modalTexts.requisitarProduto
        );
      }
    });
  }

  // Botões "Quero participar" / "Pré-inscrição"
  document.querySelectorAll('[data-event]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const nomeEvento = btn.getAttribute('data-event') || 'neste evento';
      // Substituir {{evento}} pelo nome do evento
      const mensagem = window.modalTexts.participarEvento.replace('{{evento}}', nomeEvento);
      abrirModal(
        mensagem,
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
  
  // Aguardar carregamento do CMS e atualizar textos das modais
  if (window.cmsLoader && window.cmsLoader.loadConfig) {
    window.cmsLoader.loadConfig().then(function(config) {
      atualizarTextosModais(config);
    });
  } else {
    // Se o CMS ainda não estiver carregado, tentar novamente após um delay
    setTimeout(function() {
      if (window.cmsLoader && window.cmsLoader.loadConfig) {
        window.cmsLoader.loadConfig().then(function(config) {
          atualizarTextosModais(config);
        });
      }
    }, 500);
  }
});

// Exportar função para uso externo
window.atualizarTextosModais = atualizarTextosModais;