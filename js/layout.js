/**
 * Componentes partilhados por todas as páginas: HEADER e MODAL DE LOGIN.
 *
 * Como usar numa página:
 *   1. <link rel="stylesheet" href="assets/css/layout.css" />   (no <head>)
 *   2. logo a seguir ao <body>:
 *        <div id="site-header"></div>
 *        <script src="js/layout.js"></script>
 *
 * O menu e a ligação ativa (aria-current) são gerados a partir da lista LINKS.
 * Para abrir o login a partir de qualquer botão:
 *   - HTML:  <button data-abrir-login>Marcar consulta</button>
 *   - JS:    window.abrirLogin()   (também existe window.mostraMoodal, por
 *                                   compatibilidade com o código antigo)
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

  var PAGINA_DO_UTILIZADOR = "userLogado.html";
  var CHAVE_PACIENTES = "pacientes_mundo_hospitalar";
  var CHAVE_LETRA = "userParaLogar";
  var CHAVE_POSICAO = "posPaciente_mundo_hospitalar";

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
      '<button class="bt-login" type="button" aria-haspopup="dialog" data-abrir-login>Login</button>' +
      "</div></header>"
    );
  }

  function montarHeader() {
    var alvo = document.getElementById("site-header");
    if (!alvo) return;

    var header = criarDeHtml(htmlHeader(paginaAtual(alvo)));
    alvo.replaceWith(header);

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
      if (e.target.closest("a, .bt-login")) definirMenu(false);
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

  function lerPacientes() {
    try {
      var valor = JSON.parse(localStorage.getItem(CHAVE_PACIENTES));
      return Array.isArray(valor) ? valor : [];
    } catch (erro) {
      return [];
    }
  }

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
    window.location.replace(PAGINA_DO_UTILIZADOR);
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
      if (gatilhoLogin && gatilhoLogin.isConnected && gatilhoLogin.focus) {
        gatilhoLogin.focus();
      }
      gatilhoLogin = null;
    });

    return dialogoLogin;
  }

  function abrirLogin() {
    var dialogo = montarLogin();
    gatilhoLogin = document.activeElement;
    if (dialogo.open) return;
    if (typeof dialogo.showModal === "function") {
      dialogo.showModal();
    } else {
      dialogo.setAttribute("open", ""); // navegadores muito antigos
    }
  }

  /* ---------- Arranque ---------- */

  // Qualquer elemento com data-abrir-login abre o modal
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-abrir-login]")) abrirLogin();
  });

  window.abrirLogin = abrirLogin;
  window.mostraMoodal = abrirLogin; // nome antigo, mantido por compatibilidade

  montarHeader(); // corre já, para o header aparecer sem "piscar"
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montarLogin);
  } else {
    montarLogin();
  }
})();
