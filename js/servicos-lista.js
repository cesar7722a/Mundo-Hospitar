/**
 * Tabela de serviços + pesquisa + modal de detalhes.
 * Depende de js/servicos-data.js (window.SERVICOS, ou uma variável global
 * SERVICOS) e, para o botão
 * "Marcar consulta", de js/layout.js (window.abrirLogin).
 *
 * O modal usa o elemento nativo <dialog> (foco, Esc e fundo tratados pelo
 * navegador).
 */
(function () {
  "use strict";

  var corpo = document.getElementById("corpo-servicos");
  var modal = document.getElementById("modal-servico");
  var campo = document.getElementById("inputPesquisa");
  var aviso = document.getElementById("resultado-pesquisa");

  var todos = [];
  var gatilhoAtual = null; // elemento que abriu o modal (para devolver o foco)
  var servicoAberto = null; // serviço que está no modal

  var formatoPreco = new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  /* ---------- Utilitários ---------- */

  /** Cria um elemento sem usar innerHTML. */
  function el(tag, opcoes, filhos) {
    var opts = opcoes || {};
    var no = document.createElement(tag);
    if (opts.classe) no.className = opts.classe;
    if (opts.texto !== undefined) no.textContent = opts.texto;
    if (opts.attrs) {
      Object.keys(opts.attrs).forEach(function (k) {
        no.setAttribute(k, opts.attrs[k]);
      });
    }
    (filhos || []).forEach(function (f) {
      no.append(f);
    });
    return no;
  }

  function precoEmKz(valor) {
    return formatoPreco.format(valor) + " Kz";
  }

  /** Minúsculas e sem acentos, para pesquisar "analises" e achar "Análises". */
  function simplificar(texto) {
    return String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function normalizar(s, indice) {
    return {
      id: String(indice),
      nome: s.nome || "Serviço sem nome",
      categoria: s.categoria || "",
      preco: Number(s.preco) || 0,
      dias: s.dias || "",
      horario: s.horario || "",
      duracao: s.duracao || "",
      local: s.local || "",
      descricao: s.descricao || "",
      preparacao: Array.isArray(s.preparacao) ? s.preparacao : [],
    };
  }

  /* ---------- Tabela ---------- */

  function celula(rotulo, conteudo, classe) {
    return el("td", {
      classe: classe,
      texto: conteudo,
      attrs: { role: "cell", "data-label": rotulo },
    });
  }

  function criarLinha(s) {
    var botao = el("button", {
      classe: "btn-detalhes",
      texto: "Ver detalhes",
      attrs: {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-label": "Ver detalhes de " + s.nome,
      },
    });

    return el("tr", { attrs: { role: "row", "data-id": s.id } }, [
      el("th", {
        texto: s.nome,
        attrs: { scope: "row", role: "rowheader" },
      }),
      celula("Preço", precoEmKz(s.preco), "preco"),
      celula("Dias", s.dias),
      el("td", { classe: "acao", attrs: { role: "cell" } }, [botao]),
    ]);
  }

  function linhaVazia() {
    return el("tr", { classe: "sem-resultados", attrs: { role: "row" } }, [
      el("td", {
        texto: "Serviço não encontrado!",
        attrs: { colspan: "4", role: "cell" },
      }),
    ]);
  }

  function renderTabela(servicos) {
    if (!servicos.length) {
      corpo.replaceChildren(linhaVazia());
      aviso.textContent = "Nenhum serviço encontrado.";
      return;
    }
    var linhas = [];
    servicos.forEach(function (s) {
      try {
        linhas.push(criarLinha(s));
      } catch (erro) {
        console.error("[servicos] Erro ao desenhar este serviço:", s, erro);
      }
    });
    corpo.replaceChildren.apply(corpo, linhas);
    aviso.textContent =
      servicos.length === 1
        ? "1 serviço encontrado."
        : servicos.length + " serviços encontrados.";
  }

  function filtrar() {
    var termo = simplificar(campo.value);
    var resultado = termo
      ? todos.filter(function (s) {
          return simplificar(s.nome).indexOf(termo) !== -1;
        })
      : todos;
    renderTabela(resultado);
  }

  /* ---------- Modal ---------- */

  function porId(id) {
    return document.getElementById(id);
  }

  function linhaDetalhe(dl, titulo, conteudo) {
    dl.append(el("dt", { texto: titulo }), el("dd", {}, [conteudo]));
  }

  function preencherModal(s) {
    porId("servico-categoria").textContent = s.categoria;
    porId("servico-categoria").hidden = !s.categoria;
    porId("servico-nome").textContent = s.nome;
    porId("servico-descricao").textContent = s.descricao;

    var dl = porId("servico-detalhes");
    dl.replaceChildren();

    linhaDetalhe(dl, "Preço", document.createTextNode(precoEmKz(s.preco)));
    if (s.dias) linhaDetalhe(dl, "Dias", document.createTextNode(s.dias));
    if (s.horario)
      linhaDetalhe(dl, "Horário", document.createTextNode(s.horario));
    if (s.duracao)
      linhaDetalhe(dl, "Duração", document.createTextNode(s.duracao));
    if (s.local) linhaDetalhe(dl, "Local", document.createTextNode(s.local));
    if (s.preparacao.length) {
      var ul = el("ul");
      s.preparacao.forEach(function (p) {
        ul.append(el("li", { texto: p }));
      });
      linhaDetalhe(dl, "Preparação", ul);
    }
  }

  function abrirModal(s, gatilho) {
    gatilhoAtual = gatilho || null;
    servicoAberto = s;
    preencherModal(s);
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", ""); // navegadores muito antigos
    }
  }

  function aoFechar() {
    if (gatilhoAtual) {
      gatilhoAtual.focus();
      gatilhoAtual = null;
    }
  }

  /* ---------- Arranque ---------- */

  function iniciar() {
    if (!corpo || !modal || !campo || !aviso) {
      console.error(
        "[servicos] Faltam elementos no HTML (#corpo-servicos, #modal-servico, " +
          "#inputPesquisa ou #resultado-pesquisa). Estás a usar o servico.html novo?",
      );
      return;
    }
    var origem = typeof SERVICOS !== "undefined" ? SERVICOS : window.SERVICOS;
    if (!Array.isArray(origem)) {
      console.error(
        "[servicos] Não encontrei a lista SERVICOS. Possíveis causas: " +
          "(1) js/servicos-data.js não carregou (404 no separador Network); " +
          "(2) esse ficheiro tem um erro de sintaxe (vírgula, aspas ou parêntese a faltar); " +
          "(3) a variável não se chama SERVICOS ou não é uma lista [ ... ].",
      );
      corpo.replaceChildren(
        el("tr", { classe: "sem-resultados", attrs: { role: "row" } }, [
          el("td", {
            texto:
              "Não foi possível carregar os serviços. Abra a consola do navegador (F12) para ver o erro.",
            attrs: { colspan: "4", role: "cell" },
          }),
        ]),
      );
      return;
    }

    todos = origem
      .filter(function (s) {
        return s && typeof s === "object";
      })
      .map(normalizar);
    renderTabela(todos);

    // Pesquisa em tempo real (também funciona com colar e limpar o campo)
    campo.addEventListener("input", filtrar);
    campo.form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

    // Clique em qualquer parte da linha (o botão serve o teclado)
    corpo.addEventListener("click", function (e) {
      var linha = e.target.closest("tr[data-id]");
      if (!linha) return;
      var id = linha.getAttribute("data-id");
      var servico = todos.find(function (s) {
        return s.id === id;
      });
      if (servico) abrirModal(servico, linha.querySelector(".btn-detalhes"));
    });

    // Fechar: botão ×, clique no fundo escurecido, ou Esc (nativo)
    modal
      .querySelector(".servico-fechar")
      .addEventListener("click", function () {
        modal.close();
      });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.close();
    });
    modal.addEventListener("close", aoFechar);

    // "Marcar consulta": fecha os detalhes e inicia a marcação com este serviço
    // (js/layout.js pede login se for preciso)
    porId("servico-marcar").addEventListener("click", function () {
      var servico = servicoAberto;
      gatilhoAtual = null; // o foco passa para o modal seguinte
      modal.close();
      if (typeof window.marcarConsulta === "function") {
        window.marcarConsulta({ servico: servico ? servico.nome : "" });
      } else if (typeof window.abrirLogin === "function") {
        window.abrirLogin();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
