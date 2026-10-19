/**
 * Lista de doutores + modal de perfil.
 *
 * Os dados vêm de js/doutores-data.js (window.DOUTORES, ou uma variável
 * global chamada DOUTORES: "const DOUTORES = [...]" também funciona).
 * Para adicionar, editar ou remover um doutor, altera apenas esse ficheiro.
 *
 * O modal usa o elemento nativo <dialog> (foco, Esc e fundo tratados pelo
 * navegador).
 */
(function () {
  "use strict";

  var lista = document.getElementById("lista-doutores");
  var modal = document.getElementById("modal-doutor");
  var dados = [];
  var gatilhoAtual = null; // elemento que abriu o modal (para devolver o foco)

  /* ---------- Dados ---------- */

  /** Garante um id e valores por omissão para cada doutor. */
  function normalizar(d, indice) {
    return {
      id: String(indice),
      titulo: d.titulo || "",
      nome: d.nome || "Sem nome",
      especialidade: d.especialidade || "",
      foto: d.foto || d.imagem || "",
      resumo: d.resumo || d.descricao || "",
      sobre: d.sobre || d.descricao || d.resumo || "",
      experienciaAnos: d.experienciaAnos,
      formacao: Array.isArray(d.formacao) ? d.formacao : [],
      idiomas: Array.isArray(d.idiomas) ? d.idiomas : [],
      horario: d.horario || "",
      local: d.local || "",
    };
  }

  /** Devolve a lista de doutores, ou null se não existir / não for uma lista. */
  function carregarDados() {
    var origem = typeof DOUTORES !== "undefined" ? DOUTORES : window.DOUTORES;
    if (!Array.isArray(origem)) return null;
    return origem
      .filter(function (d) {
        return d && typeof d === "object";
      })
      .map(normalizar);
  }

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

  function nomeCompleto(d) {
    return (d.titulo ? d.titulo + " " : "") + d.nome;
  }

  /* ---------- Lista ---------- */

  function criarCartao(d) {
    var filhos = [];

    if (d.foto) {
      filhos.push(
        el("div", { classe: "foto" }, [
          el("img", {
            attrs: {
              src: d.foto,
              alt: "Retrato de " + d.nome,
              loading: "lazy",
              decoding: "async",
            },
          }),
        ]),
      );
    }

    var botao = el("button", {
      classe: "btn-perfil",
      texto: "Ver perfil",
      attrs: {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-label": "Ver perfil de " + nomeCompleto(d),
      },
    });

    filhos.push(
      el("div", { classe: "descricao-doctor" }, [
        el("h3", { classe: "nome", texto: nomeCompleto(d) }),
        el("p", { classe: "especialidade", texto: d.especialidade }),
        el("p", { classe: "resumo", texto: d.resumo }),
        botao,
      ]),
    );

    var cartao = el(
      "article",
      { classe: "cartao-doutor", attrs: { "data-id": d.id } },
      filhos,
    );
    return el("li", { classe: "doctor" }, [cartao]);
  }

  function renderLista() {
    if (!dados.length) {
      lista.replaceChildren(
        el("li", {
          classe: "lista-vazia",
          texto: "Não há doutores disponíveis de momento.",
        }),
      );
      return;
    }
    var cartoes = [];
    dados.forEach(function (d) {
      try {
        cartoes.push(criarCartao(d));
      } catch (erro) {
        console.error("[doutores] Erro ao desenhar este doutor:", d, erro);
      }
    });
    lista.replaceChildren.apply(lista, cartoes);
  }

  /* ---------- Modal ---------- */

  function porId(id) {
    return document.getElementById(id);
  }

  function linhaDetalhe(dl, titulo, conteudo) {
    dl.append(el("dt", { texto: titulo }), el("dd", {}, [conteudo]));
  }

  function preencherModal(d) {
    var foto = porId("doutor-foto");
    if (d.foto) {
      foto.src = d.foto;
      foto.alt = "Retrato de " + d.nome;
      foto.hidden = false;
    } else {
      foto.removeAttribute("src");
      foto.alt = "";
      foto.hidden = true;
    }

    porId("doutor-nome").textContent = nomeCompleto(d);
    porId("doutor-especialidade").textContent = d.especialidade;
    porId("doutor-sobre").textContent = d.sobre;

    var dl = porId("doutor-detalhes");
    dl.replaceChildren();

    if (typeof d.experienciaAnos === "number") {
      linhaDetalhe(
        dl,
        "Experiência",
        document.createTextNode(d.experienciaAnos + " anos"),
      );
    }
    if (d.formacao.length) {
      var ul = el("ul");
      d.formacao.forEach(function (f) {
        ul.append(el("li", { texto: f }));
      });
      linhaDetalhe(dl, "Formação", ul);
    }
    if (d.idiomas.length) {
      linhaDetalhe(
        dl,
        "Idiomas",
        document.createTextNode(d.idiomas.join(", ")),
      );
    }
    if (d.horario) {
      linhaDetalhe(dl, "Horário", document.createTextNode(d.horario));
    }
    if (d.local) {
      linhaDetalhe(dl, "Local", document.createTextNode(d.local));
    }
    dl.hidden = dl.childElementCount === 0;
  }

  function abrirModal(d, gatilho) {
    gatilhoAtual = gatilho || null;
    preencherModal(d);
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
    if (!lista || !modal) {
      console.error(
        "[doutores] Não encontrei #lista-doutores ou #modal-doutor no HTML. " +
          "Estás a usar o dotores.html novo?",
      );
      return;
    }

    dados = carregarDados();
    if (dados === null) {
      console.error(
        "[doutores] Não encontrei a lista DOUTORES. Possíveis causas: " +
          "(1) js/doutores-data.js não carregou (404 no separador Network); " +
          "(2) esse ficheiro tem um erro de sintaxe (vírgula, aspas ou parêntese a faltar); " +
          "(3) a variável não se chama DOUTORES ou não é uma lista [ ... ].",
      );
      lista.replaceChildren(
        el("li", {
          classe: "lista-vazia",
          texto:
            "Não foi possível carregar os dados dos doutores. Abra a consola do navegador (F12) para ver o erro.",
        }),
      );
      return;
    }
    renderLista();

    // Clique em qualquer parte do cartão (o botão serve o teclado)
    lista.addEventListener("click", function (e) {
      var cartao = e.target.closest(".cartao-doutor");
      if (!cartao) return;
      var id = cartao.getAttribute("data-id");
      var doutor = dados.find(function (d) {
        return d.id === id;
      });
      if (doutor) abrirModal(doutor, cartao.querySelector(".btn-perfil"));
    });

    // Fechar: botão ×, clique no fundo escurecido, ou Esc (nativo)
    modal
      .querySelector(".doutor-fechar")
      .addEventListener("click", function () {
        modal.close();
      });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.close();
    });
    modal.addEventListener("close", aoFechar);

    // "Marcar consulta": fecha o perfil e abre o login (fluxo original do site)
    var marcar = porId("doutor-marcar");
    if (marcar) {
      marcar.addEventListener("click", function () {
        gatilhoAtual = null; // o foco passa para o modal de login
        modal.close();
        if (typeof window.abrirLogin === "function") window.abrirLogin();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
