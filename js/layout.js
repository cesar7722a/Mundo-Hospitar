/**
 * Componentes partilhados por todas as páginas: HEADER, FOOTER, MODAL DE LOGIN
 * e SESSÃO do utilizador.
 *
 * O mesmo header serve quem não tem conta (botão "Login") e quem já entrou
 * (avatar com menu: marcar consulta, as minhas marcações, editar perfil, sair).
 * Já não são precisas páginas "user*.html" duplicadas.
 *
 * Como usar numa página:
 *   1. <link rel="stylesheet" href="assets/css/layout.css" />   (no <head>)
 *   2. logo a seguir ao <body>:
 *        <div id="site-header"></div>
 *        <script src="js/layout.js"></script>
 *   3. no sítio do rodapé:
 *        <div id="site-footer"></div>
 *
 * O menu e a ligação ativa (aria-current) são gerados a partir da lista LINKS.
 * Atributos que podem ser usados em qualquer botão:
 *   data-abrir-login        abre o modal de login
 *   data-marcar-consulta    inicia a marcação (pede login se for preciso)
 *   data-minhas-marcacoes   abre a lista das marcações do utilizador
 * No <body> de uma página que exige sessão (ex.: editar perfil):
 *   <body data-requer-login>
 *
 * API em window:
 *   abrirLogin({ destino }), marcarConsulta({ servico, doutor }),
 *   Sessao.atual(), Sessao.terminar()
 *   (window.mostraMoodal continua a existir, por compatibilidade)
 */
(function () {
  "use strict";

  /* ---------- Configuração ---------- */

  var LINKS = [
    { href: "index.html", texto: "Home" },
    { href: "sobre_nos.html", texto: "Sobre nós" },
    { href: "dotores.html", texto: "Doutores" },
    { href: "servico.html", texto: "Serviços" },
  ];

  var PAGINA_INICIAL = "index.html";
  var PAGINA_EDITAR = "pageEditar.html";
  var PAGINA_MARCACAO = "servico.html";
  var CHAVE_PACIENTES = "pacientes_mundo_hospitalar";
  var CHAVE_LETRA = "userParaLogar";
  var CHAVE_POSICAO = "posPaciente_mundo_hospitalar";
  var CHAVE_INTENCAO = "mh_marcacao_pendente"; // sessionStorage: o que o utilizador queria marcar

  // Rodapé
  var DESCRICAO_RODAPE =
    "Lorem ipsum dolor sit am consectetur adipisicing elit do eiusmod tempor incididunt ut labore dolore magna.";
  var SERVICOS_RODAPE = ["Cardiologia", "Neurologia", "Ortopedia", "Raio-X"];
  var CONTACTOS = {
    local: "Luanda, Angola",
    email: "info@gmail.com",
    telefone: "+244 926-614-139",
    tel: "+244926614139",
  };
  var REDES = [
    { nome: "Facebook", icone: "fab fa-facebook" },
    { nome: "Twitter", icone: "fab fa-twitter" },
    { nome: "LinkedIn", icone: "fab fa-linkedin" },
    { nome: "Instagram", icone: "fab fa-instagram" },
  ];

  /* ---------- Utilitários ---------- */

  /** Cria um elemento a partir de HTML fixo (nunca com dados de utilizadores). */
  function criarDeHtml(html) {
    var modelo = document.createElement("template");
    modelo.innerHTML = html.trim();
    return modelo.content.firstElementChild;
  }

  function paginaAtual(alvo) {
    if (alvo && alvo.getAttribute("data-pagina")) {
      return alvo.getAttribute("data-pagina");
    }
    return location.pathname.split("/").pop() || "index.html";
  }

  /* ---------- Sessão ---------- */

  function lerPacientes() {
    try {
      var valor = JSON.parse(localStorage.getItem(CHAVE_PACIENTES));
      return Array.isArray(valor) ? valor : [];
    } catch (erro) {
      return [];
    }
  }

  /** O utilizador com sessão iniciada, ou null. */
  function utilizadorAtual() {
    var posicao;
    try {
      posicao = JSON.parse(localStorage.getItem(CHAVE_POSICAO));
    } catch (erro) {
      return null;
    }
    if (typeof posicao === "string" && /^\d+$/.test(posicao))
      posicao = Number(posicao);
    if (!Number.isInteger(posicao) || posicao < 0) return null;

    var paciente = lerPacientes()[posicao];
    if (!paciente || !paciente.nome) return null;

    return {
      posicao: posicao,
      nome: String(paciente.nome),
      email: String(paciente.email),
      inicial: String(paciente.nome).trim().charAt(0).toUpperCase(),
    };
  }

  function terminarSessao() {
    localStorage.removeItem(CHAVE_LETRA);
    localStorage.removeItem(CHAVE_POSICAO);
    try {
      sessionStorage.removeItem(CHAVE_INTENCAO);
    } catch (erro) {}
  }

  /** Só aceita páginas do próprio site (evita redirecionamentos para fora). */
  function destinoSeguro(valor) {
    var texto = String(valor || "");
    return /^[A-Za-z0-9_.-]+\.html(\?[A-Za-z0-9=&_.-]*)?$/.test(texto)
      ? texto
      : "";
  }

  function paginaComPesquisa() {
    return (
      (location.pathname.split("/").pop() || PAGINA_INICIAL) + location.search
    );
  }

  /* ---------- Header ---------- */

  function htmlHeader(pagina) {
    var itens = LINKS.map(function (l) {
      var atual = l.href === pagina ? ' aria-current="page"' : "";
      return (
        '<li><a href="' + l.href + '"' + atual + ">" + l.texto + "</a></li>"
      );
    }).join("");

    return (
      '<header class="site-header">' +
      '<a class="skip-link" href="#conteudo">Saltar para o conteúdo</a>' +
      '<a class="logo" href="index.html" aria-label="Mundo-Hospitalar, página inicial">' +
      "<span>Mundo</span>-Hospitalar</a>" +
      '<button class="menu-toggle" type="button" aria-expanded="false" ' +
      'aria-controls="menu-principal" aria-label="Abrir menu">' +
      '<i class="fas fa-bars" aria-hidden="true"></i></button>' +
      '<div class="menu" id="menu-principal">' +
      '<nav aria-label="Principal"><ul>' +
      itens +
      "</ul></nav>" +
      '<div class="menu-conta"></div>' +
      "</div></header>"
    );
  }

  /** Botão "Login" (visitante) ou avatar com menu (utilizador com sessão). */
  function montarConta(alvo, utilizador) {
    if (!utilizador) {
      alvo.append(
        criarDeHtml(
          '<button class="bt-login" type="button" aria-haspopup="dialog" data-abrir-login>Login</button>',
        ),
      );
      return;
    }

    var menu = criarDeHtml(
      '<div class="user-menu">' +
        '<button type="button" class="user-avatar" aria-expanded="false" aria-controls="user-painel">' +
        '<span class="user-inicial" aria-hidden="true"></span></button>' +
        '<div class="user-painel" id="user-painel" hidden>' +
        '<p class="user-nome"></p><p class="user-email"></p>' +
        '<button type="button" class="user-link" data-marcar-consulta>' +
        '<i class="fas fa-calendar-check" aria-hidden="true"></i>Marcar consulta</button>' +
        '<button type="button" class="user-link" data-minhas-marcacoes>' +
        '<i class="fas fa-list-check" aria-hidden="true"></i>As minhas marcações</button>' +
        '<a class="user-link" href="' +
        PAGINA_EDITAR +
        '">' +
        '<i class="fas fa-user-pen" aria-hidden="true"></i>Editar perfil</a>' +
        '<button type="button" class="user-link user-sair">' +
        '<i class="fas fa-right-from-bracket" aria-hidden="true"></i>Sair</button>' +
        "</div></div>",
    );

    // o nome vem do utilizador: entra sempre como texto, nunca como HTML
    menu.querySelector(".user-inicial").textContent = utilizador.inicial;
    menu.querySelector(".user-nome").textContent = utilizador.nome;
    menu.querySelector(".user-email").textContent = utilizador.email;

    var avatar = menu.querySelector(".user-avatar");
    var painel = menu.querySelector(".user-painel");
    avatar.setAttribute("aria-label", "Conta de " + utilizador.nome);

    function definir(aberto) {
      painel.hidden = !aberto;
      avatar.setAttribute("aria-expanded", String(aberto));
    }

    avatar.addEventListener("click", function () {
      definir(painel.hidden);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !painel.hidden) {
        definir(false);
        avatar.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target)) definir(false);
    });
    menu.addEventListener("focusout", function (e) {
      if (e.relatedTarget && !menu.contains(e.relatedTarget)) definir(false);
    });
    painel.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) definir(false);
    });

    menu.querySelector(".user-sair").addEventListener("click", function () {
      terminarSessao();
      if (document.body.hasAttribute("data-requer-login")) {
        location.href = PAGINA_INICIAL;
      } else {
        location.reload();
      }
    });

    alvo.append(menu);
  }

  /** Páginas com <body data-requer-login>: sem sessão voltam ao início com o login aberto. */
  function exigirSessao(utilizador) {
    if (utilizador || !document.body.hasAttribute("data-requer-login"))
      return false;
    location.replace(
      PAGINA_INICIAL +
        "?login=1&voltar=" +
        encodeURIComponent(paginaComPesquisa()),
    );
    return true;
  }

  function montarHeader() {
    var utilizador = utilizadorAtual();
    if (exigirSessao(utilizador)) return;

    var alvo = document.getElementById("site-header");
    if (!alvo) return;

    var header = criarDeHtml(htmlHeader(paginaAtual(alvo)));
    alvo.replaceWith(header);
    montarConta(header.querySelector(".menu-conta"), utilizador);

    var botao = header.querySelector(".menu-toggle");
    var icone = botao.querySelector("i");

    function definirMenu(aberto) {
      header.classList.toggle("menu-aberto", aberto);
      botao.setAttribute("aria-expanded", String(aberto));
      botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
      icone.className = aberto ? "fas fa-xmark" : "fas fa-bars";
    }

    botao.addEventListener("click", function () {
      definirMenu(!header.classList.contains("menu-aberto"));
    });

    // Esc fecha o menu e devolve o foco ao botão
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("menu-aberto")) {
        definirMenu(false);
        botao.focus();
      }
    });

    // Escolher uma ligação ou abrir o login fecha o menu (em mobile)
    header.querySelector(".menu").addEventListener("click", function (e) {
      if (e.target.closest("a, .bt-login, .user-link")) definirMenu(false);
    });

    // Ao crescer o ecrã, o menu volta ao normal
    if (window.matchMedia) {
      window
        .matchMedia("(max-width: 52rem)")
        .addEventListener("change", function (e) {
          if (!e.matches) definirMenu(false);
        });
    }

    // Sombra só quando a página já deslizou
    function atualizarSombra() {
      header.classList.toggle("com-sombra", window.scrollY > 0);
    }
    window.addEventListener("scroll", atualizarSombra, { passive: true });
    atualizarSombra();
  }

  /* ---------- Footer ---------- */

  function htmlFooter() {
    var seta = '<i class="fas fa-caret-right" aria-hidden="true"></i>';

    var servicos = SERVICOS_RODAPE.map(function (nome) {
      return '<li><a href="servico.html">' + seta + nome + "</a></li>";
    }).join("");

    var links = LINKS.map(function (l) {
      return '<li><a href="' + l.href + '">' + seta + l.texto + "</a></li>";
    }).join("");

    var redes = REDES.map(function (r) {
      return (
        '<li><a href="#" aria-label="' +
        r.nome +
        '">' +
        '<i class="' +
        r.icone +
        '" aria-hidden="true"></i></a></li>'
      );
    }).join("");

    return (
      '<footer class="site-footer"><div class="info-footer">' +
      '<div class="footer-col mundo-hospital">' +
      '<p class="footer-brand"><span>Mundo</span>-Hospitalar</p>' +
      "<p>" +
      DESCRICAO_RODAPE +
      "</p></div>" +
      '<section class="footer-col" aria-labelledby="footer-servicos">' +
      '<h2 class="footer-title" id="footer-servicos">Serviços</h2>' +
      '<ul class="footer-list">' +
      servicos +
      "</ul></section>" +
      '<nav class="footer-col" aria-labelledby="footer-links">' +
      '<h2 class="footer-title" id="footer-links">Links Rápidos</h2>' +
      '<ul class="footer-list">' +
      links +
      "</ul></nav>" +
      '<section class="footer-col" aria-labelledby="footer-contactos">' +
      '<h2 class="footer-title" id="footer-contactos">Contactos</h2>' +
      '<address><ul class="footer-list footer-contactos">' +
      '<li><i class="contact-footer fas fa-map-marker" aria-hidden="true"></i>' +
      CONTACTOS.local +
      "</li>" +
      '<li><i class="contact-footer fas fa-envelope" aria-hidden="true"></i>' +
      '<a href="mailto:' +
      CONTACTOS.email +
      '">' +
      CONTACTOS.email +
      "</a></li>" +
      '<li><i class="contact-footer fas fa-phone" aria-hidden="true"></i>' +
      '<a href="tel:' +
      CONTACTOS.tel +
      '">' +
      CONTACTOS.telefone +
      "</a></li>" +
      "</ul></address>" +
      '<ul class="footer-social">' +
      redes +
      "</ul></section>" +
      "</div>" +
      '<div class="copyright"><p>&copy; ' +
      new Date().getFullYear() +
      " <span>Mundo</span>-Hospitalar. Todos os direitos reservados.</p></div>" +
      "</footer>"
    );
  }

  function montarFooter() {
    var alvo = document.getElementById("site-footer");
    if (alvo) alvo.replaceWith(criarDeHtml(htmlFooter()));
  }

  /* ---------- Modal de login ---------- */

  var HTML_LOGIN =
    '<dialog class="dialog-login" id="dialog-login" ' +
    'aria-labelledby="titulo-login" aria-describedby="desc-login">' +
    '<div class="cartao-login">' +
    '<button type="button" class="dialog-fechar" aria-label="Fechar login">' +
    '<i class="fas fa-xmark" aria-hidden="true"></i></button>' +
    '<h2 id="titulo-login">Login</h2>' +
    '<p id="desc-login">Faça login para marcar a sua consulta e ter mais informações.</p>' +
    '<form id="form-login">' +
    '<div><label for="login-email">Email</label>' +
    '<input type="email" id="login-email" name="email" autocomplete="email" required autofocus /></div>' +
    '<div><label for="login-password">Password</label>' +
    '<input type="password" id="login-password" name="password" autocomplete="current-password" required /></div>' +
    '<div class="login-erro" id="login-erro" role="alert"></div>' +
    '<div class="login-botoes">' +
    '<button type="submit" class="btn-login">Login</button>' +
    '<button type="button" class="btn-cancelar">Cancelar</button>' +
    "</div></form>" +
    '<a class="link-registo" href="cadastrarUser.html">Clique aqui para criar uma conta!</a>' +
    "</div></dialog>";

  var dialogoLogin = null;
  var gatilhoLogin = null; // elemento que abriu o login (para devolver o foco)

  var destinoLogin = ""; // para onde ir depois de entrar ("" = recarregar a página atual)

  function tentarLogin(email, password) {
    var emailNormalizado = String(email).trim().toLowerCase();
    var pacientes = lerPacientes();

    // email e password têm de ser do MESMO utilizador
    var posicao = pacientes.findIndex(function (p) {
      return (
        String(p.email).trim().toLowerCase() === emailNormalizado &&
        String(p.password) === password
      );
    });
    if (posicao === -1) return false;

    localStorage.setItem(
      CHAVE_LETRA,
      JSON.stringify(String(pacientes[posicao].nome).slice(0, 1)),
    );
    localStorage.setItem(CHAVE_POSICAO, JSON.stringify(posicao));
    // fica na mesma página (já com o header de utilizador) ou segue para o destino
    window.location.replace(destinoLogin || location.href);
    return true;
  }

  function montarLogin() {
    if (dialogoLogin) return dialogoLogin;

    dialogoLogin = criarDeHtml(HTML_LOGIN);
    document.body.append(dialogoLogin);

    var form = dialogoLogin.querySelector("form");
    var campoEmail = dialogoLogin.querySelector("#login-email");
    var campoPassword = dialogoLogin.querySelector("#login-password");
    var erro = dialogoLogin.querySelector("#login-erro");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (tentarLogin(campoEmail.value, campoPassword.value)) return;
      erro.textContent =
        "Utilizador não encontrado. Verifique o email e a password.";
      campoPassword.value = "";
      campoEmail.focus();
    });

    // Limpar o erro assim que o utilizador volta a escrever
    form.addEventListener("input", function () {
      erro.textContent = "";
    });

    dialogoLogin
      .querySelector(".btn-cancelar")
      .addEventListener("click", function () {
        dialogoLogin.close();
      });
    dialogoLogin
      .querySelector(".dialog-fechar")
      .addEventListener("click", function () {
        dialogoLogin.close();
      });

    // Clique no fundo escurecido fecha (o Esc já é tratado pelo <dialog>)
    dialogoLogin.addEventListener("click", function (e) {
      if (e.target === dialogoLogin) dialogoLogin.close();
    });

    dialogoLogin.addEventListener("close", function () {
      form.reset();
      erro.textContent = "";
      try {
        sessionStorage.removeItem(CHAVE_INTENCAO); // desistiu: não reabrir a marcação mais tarde
      } catch (e) {}
      if (gatilhoLogin && gatilhoLogin.isConnected && gatilhoLogin.focus) {
        gatilhoLogin.focus();
      }
      gatilhoLogin = null;
    });

    return dialogoLogin;
  }

  function abrirLogin(opcoes) {
    var dialogo = montarLogin();
    gatilhoLogin = document.activeElement;

    var pedido =
      opcoes && typeof opcoes === "object" && !(opcoes instanceof Event)
        ? opcoes
        : {};
    destinoLogin = destinoSeguro(pedido.destino);
    // na página de registo, depois de entrar vai-se para o início
    if (!destinoLogin && paginaAtual() === "cadastrarUser.html") {
      destinoLogin =
        destinoSeguro(new URLSearchParams(location.search).get("voltar")) ||
        PAGINA_INICIAL;
    }
    // quem criar conta a partir daqui volta ao mesmo sítio
    dialogo.querySelector(".link-registo").href =
      "cadastrarUser.html?voltar=" +
      encodeURIComponent(destinoLogin || paginaComPesquisa());

    if (dialogo.open) return;
    if (typeof dialogo.showModal === "function") {
      dialogo.showModal();
    } else {
      dialogo.setAttribute("open", ""); // navegadores muito antigos
    }
  }

  /* ---------- Marcar consulta ---------- */

  /**
   * Ponto único de entrada da marcação, a partir de qualquer página:
   *  - sem sessão -> pede login e, depois de entrar, continua a marcação;
   *  - com sessão -> abre a marcação (js/marcacao.js) ou, nas páginas que
   *    não a têm, segue para a página de serviços.
   * "opcoes" pode trazer { servico, doutor } para pré-preencher.
   */
  function marcarConsulta(opcoes) {
    var intencao =
      opcoes && typeof opcoes === "object" && !(opcoes instanceof Event)
        ? opcoes
        : {};
    var temMarcacao = typeof window.abrirMarcacao === "function";

    try {
      sessionStorage.setItem(CHAVE_INTENCAO, JSON.stringify(intencao));
    } catch (erro) {}

    if (!utilizadorAtual()) {
      abrirLogin({
        destino: temMarcacao
          ? paginaComPesquisa()
          : PAGINA_MARCACAO + "?marcar=1",
      });
      return;
    }
    if (temMarcacao) {
      window.abrirMarcacao(intencao);
      return;
    }
    location.href = PAGINA_MARCACAO + "?marcar=1";
  }

  function abrirMinhasMarcacoes() {
    if (typeof window.abrirMinhasMarcacoes === "function") {
      window.abrirMinhasMarcacoes();
    } else {
      location.href = PAGINA_MARCACAO + "?minhas=1";
    }
  }

  /* ---------- Arranque ---------- */

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-abrir-login]")) abrirLogin();
    else if (e.target.closest("[data-marcar-consulta]")) marcarConsulta();
    else if (e.target.closest("[data-minhas-marcacoes]"))
      abrirMinhasMarcacoes();
  });

  window.abrirLogin = abrirLogin;
  window.mostraMoodal = abrirLogin; // nome antigo, mantido por compatibilidade
  window.marcarConsulta = marcarConsulta;
  window.CHAVE_INTENCAO_MARCACAO = CHAVE_INTENCAO;
  window.Sessao = { atual: utilizadorAtual, terminar: terminarSessao };

  function aoCarregar() {
    montarFooter();
    montarLogin();

    // ?login=1 (vindo de uma página privada): abre o login e segue para "voltar"
    var parametros = new URLSearchParams(location.search);
    if (parametros.get("login") === "1" && !utilizadorAtual()) {
      abrirLogin({ destino: parametros.get("voltar") });
    }
  }

  montarHeader(); // corre já, para o header aparecer sem "piscar"
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", aoCarregar);
  } else {
    aoCarregar();
  }
})();
