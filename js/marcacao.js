/**
 * Marcação de consultas.
 *
 * Em vez de uma cadeia de páginas (doutor -> serviço -> ...), a marcação é um
 * único modal com todos os campos. Abre-se a partir de qualquer botão através
 * de window.marcarConsulta({ servico, doutor }) (definido em js/layout.js),
 * que pede login se for preciso.
 *
 * Precisa de: js/layout.js, js/servicos-data.js e js/doutores-data.js.
 *
 * Armazenamento: os pedidos ficam em localStorage "salve_marcacao_notificao",
 * com os mesmos nomes de campo do código anterior, para a parte de
 * administração continuar a poder aceitar ou recusar:
 *   email_marcador_servico, data_marcador_servico, hora_marcador_servico,
 *   local_realizacao_servico_escolhido, dotor_escolhido, servico_escolhido,
 *   aceitar_solicitacao, regeitar_solicitacao
 */
(function () {
  "use strict";

  /* ==================== Configuração ==================== */

  var CHAVE_MARCACOES = "salve_marcacao_notificao";
  var CHAVE_INTENCAO = window.CHAVE_INTENCAO_MARCACAO || "mh_marcacao_pendente";

  var PASSO_MINUTOS = 30; // intervalo entre horas disponíveis
  var ANTECEDENCIA_MINUTOS = 60; // hoje só se marca com 1 hora de antecedência
  var DIAS_MAXIMOS = 180; // até 6 meses à frente

  var LOCAIS = { hospital: "No Hospital", domicilio: "Ao Domicilio" };
  var NOMES_DIAS = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado",
  ];

  var formatoPreco = new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  /* ==================== Dados ==================== */

  function listaGlobal(nome) {
    var valor;
    try {
      valor =
        nome === "SERVICOS"
          ? typeof SERVICOS !== "undefined"
            ? SERVICOS
            : window.SERVICOS
          : typeof DOUTORES !== "undefined"
            ? DOUTORES
            : window.DOUTORES;
    } catch (erro) {
      valor = null;
    }
    return Array.isArray(valor)
      ? valor.filter(function (x) {
          return x && typeof x === "object";
        })
      : [];
  }

  var servicos = listaGlobal("SERVICOS");
  var doutores = listaGlobal("DOUTORES");

  function nomeDoutor(d) {
    return (d.titulo ? d.titulo + " " : "") + d.nome;
  }

  function simplificar(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function indiceServicoPorNome(nome) {
    var alvo = simplificar(nome);
    for (var i = 0; i < servicos.length; i++) {
      if (simplificar(servicos[i].nome) === alvo) return i;
    }
    return -1;
  }

  function indiceDoutorPorNome(nome) {
    var alvo = simplificar(nome);
    for (var i = 0; i < doutores.length; i++) {
      if (
        simplificar(doutores[i].nome) === alvo ||
        simplificar(nomeDoutor(doutores[i])) === alvo
      )
        return i;
    }
    return -1;
  }

  /* ==================== Armazenamento ==================== */

  function lerMarcacoes() {
    try {
      var valor = JSON.parse(localStorage.getItem(CHAVE_MARCACOES));
      return Array.isArray(valor) ? valor : [];
    } catch (erro) {
      return [];
    }
  }

  /** Pode lançar erro (armazenamento bloqueado ou cheio). */
  function guardarMarcacoes(lista) {
    localStorage.setItem(CHAVE_MARCACOES, JSON.stringify(lista));
  }

  function lerIntencao() {
    try {
      return JSON.parse(sessionStorage.getItem(CHAVE_INTENCAO)) || {};
    } catch (erro) {
      return {};
    }
  }

  function limparIntencao() {
    try {
      sessionStorage.removeItem(CHAVE_INTENCAO);
    } catch (erro) {}
  }

  /* ==================== Datas e horas ==================== */

  function doisDigitos(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function paraIso(data) {
    return (
      data.getFullYear() +
      "-" +
      doisDigitos(data.getMonth() + 1) +
      "-" +
      doisDigitos(data.getDate())
    );
  }

  function lerDataIso(iso) {
    var partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!partes) return null;
    var ano = Number(partes[1]),
      mes = Number(partes[2]),
      dia = Number(partes[3]);
    var data = new Date(ano, mes - 1, dia);
    var existe =
      data.getFullYear() === ano &&
      data.getMonth() === mes - 1 &&
      data.getDate() === dia;
    return existe ? data : null;
  }

  function dataLegivel(iso) {
    var data = lerDataIso(iso);
    if (!data) return iso;
    return (
      doisDigitos(data.getDate()) +
      "/" +
      doisDigitos(data.getMonth() + 1) +
      "/" +
      data.getFullYear()
    );
  }

  function minutosDe(hhmm) {
    var p = String(hhmm).split(":");
    return Number(p[0]) * 60 + Number(p[1]);
  }

  function hhmmDe(minutos) {
    return (
      doisDigitos(Math.floor(minutos / 60)) + ":" + doisDigitos(minutos % 60)
    );
  }

  /** Horas livres de um serviço num dia (hoje só com antecedência suficiente). */
  function horasDisponiveis(servico, dataIso, agora) {
    var duracao = servico.duracaoMin || PASSO_MINUTOS;
    var inicio = minutosDe(servico.abre || "08:00");
    var fim = minutosDe(servico.fecha || "17:00");
    var ehHoje = dataIso === paraIso(agora);
    var limite =
      agora.getHours() * 60 + agora.getMinutes() + ANTECEDENCIA_MINUTOS;

    var horas = [];
    for (var t = inicio; t + duracao <= fim; t += PASSO_MINUTOS) {
      if (ehHoje && t < limite) continue;
      horas.push(hhmmDe(t));
    }
    return horas;
  }

  function diasDoServico(servico) {
    return Array.isArray(servico.diasSemana)
      ? servico.diasSemana
      : [1, 2, 3, 4, 5];
  }

  /* ==================== Pequenos construtores ==================== */

  function criarDeHtml(html) {
    var modelo = document.createElement("template");
    modelo.innerHTML = html.trim();
    return modelo.content.firstElementChild;
  }

  function el(tag, classe, texto) {
    var no = document.createElement(tag);
    if (classe) no.className = classe;
    if (texto !== undefined) no.textContent = texto;
    return no;
  }

  function abrirDialogo(dialogo) {
    if (dialogo.open) return;
    if (typeof dialogo.showModal === "function") dialogo.showModal();
    else dialogo.setAttribute("open", "");
  }

  /* ==================== Modal: nova marcação ==================== */

  var HTML_MARCACAO =
    '<dialog class="dialog-marcacao" id="dialog-marcacao" aria-labelledby="titulo-marcacao">' +
    '<div class="cartao-marcacao">' +
    '<button type="button" class="dialog-fechar" aria-label="Fechar marcação"><i class="fas fa-xmark" aria-hidden="true"></i></button>' +
    '<h2 id="titulo-marcacao">Marcar consulta</h2>' +
    '<p class="marcacao-intro" id="marcacao-intro"></p>' +
    '<form id="form-marcacao" novalidate>' +
    '<div class="campo" data-campo="servico"><label for="marc-servico">Serviço</label>' +
    '<select id="marc-servico" required aria-describedby="ajuda-marc-servico erro-marc-servico"></select>' +
    '<p class="ajuda" id="ajuda-marc-servico"></p><p class="erro" id="erro-marc-servico" aria-live="polite"></p></div>' +
    '<div class="campo" data-campo="doutor"><label for="marc-doutor">Doutor</label>' +
    '<select id="marc-doutor" aria-describedby="erro-marc-doutor"></select>' +
    '<p class="erro" id="erro-marc-doutor" aria-live="polite"></p></div>' +
    '<div class="grade">' +
    '<div class="campo" data-campo="data"><label for="marc-data">Data</label>' +
    '<input type="date" id="marc-data" required aria-describedby="erro-marc-data" />' +
    '<p class="erro" id="erro-marc-data" aria-live="polite"></p></div>' +
    '<div class="campo" data-campo="hora"><label for="marc-hora">Hora</label>' +
    '<select id="marc-hora" required aria-describedby="ajuda-marc-hora erro-marc-hora"></select>' +
    '<p class="ajuda" id="ajuda-marc-hora"></p><p class="erro" id="erro-marc-hora" aria-live="polite"></p></div>' +
    "</div>" +
    '<fieldset class="campo" data-campo="local"><legend>Onde quer ser atendido?</legend>' +
    '<div class="opcoes">' +
    '<label class="opcao"><input type="radio" name="marc-local" value="hospital" /><span>No hospital</span></label>' +
    '<label class="opcao"><input type="radio" name="marc-local" value="domicilio" /><span>Ao domicílio</span></label>' +
    '</div><p class="erro" id="erro-marc-local" aria-live="polite"></p></fieldset>' +
    '<div class="campo" data-campo="observacoes"><label for="marc-observacoes">Observações <span class="opcional">(opcional)</span></label>' +
    '<textarea id="marc-observacoes" rows="3" maxlength="300" placeholder="Algo que o hospital deva saber?"></textarea></div>' +
    '<div class="resumo-erros" id="erro-marcacao" role="alert" hidden></div>' +
    '<div class="acoes"><button type="submit" class="btn-primario">Enviar pedido</button>' +
    '<button type="button" class="btn-secundario btn-fechar-marcacao">Cancelar</button></div>' +
    "</form>" +
    '<div class="marcacao-sucesso" id="marcacao-sucesso" tabindex="-1" hidden></div>' +
    "</div></dialog>";

  var dialogoMarcacao = null;
  var gatilhoMarcacao = null;
  var refs = {};

  function montarMarcacao() {
    if (dialogoMarcacao) return dialogoMarcacao;

    dialogoMarcacao = criarDeHtml(HTML_MARCACAO);
    document.body.append(dialogoMarcacao);

    var $ = function (id) {
      return document.getElementById(id);
    };
    refs = {
      form: $("form-marcacao"),
      intro: $("marcacao-intro"),
      servico: $("marc-servico"),
      doutor: $("marc-doutor"),
      data: $("marc-data"),
      hora: $("marc-hora"),
      observacoes: $("marc-observacoes"),
      ajudaServico: $("ajuda-marc-servico"),
      ajudaHora: $("ajuda-marc-hora"),
      erroGeral: $("erro-marcacao"),
      sucesso: $("marcacao-sucesso"),
    };

    /* opções dos selects (nomes vêm dos dados do site: entram como texto) */
    refs.servico.append(new Option("Escolher serviço…", ""));
    servicos.forEach(function (s, i) {
      refs.servico.append(
        new Option(
          s.nome + " — " + formatoPreco.format(Number(s.preco) || 0) + " Kz",
          String(i),
        ),
      );
    });
    refs.doutor.append(new Option("Sem preferência (o hospital escolhe)", ""));
    doutores.forEach(function (d, i) {
      refs.doutor.append(
        new Option(nomeDoutor(d) + " — " + d.especialidade, String(i)),
      );
    });

    /* limites da data: de hoje até daqui a 6 meses */
    var hoje = new Date();
    var maxima = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate() + DIAS_MAXIMOS,
    );
    refs.data.min = paraIso(hoje);
    refs.data.max = paraIso(maxima);

    /* eventos */
    refs.servico.addEventListener("change", function () {
      atualizarAjudaServico();
      atualizarHoras();
      validarServico(true);
      if (refs.data.value) validarData(true);
    });
    refs.doutor.addEventListener("change", function () {
      limparErro("doutor");
    });
    refs.data.addEventListener("change", function () {
      atualizarHoras();
      validarData(true);
    });
    refs.hora.addEventListener("change", function () {
      validarHora(true);
    });
    Array.prototype.forEach.call(
      refs.form.querySelectorAll('input[name="marc-local"]'),
      function (radio) {
        radio.addEventListener("change", function () {
          validarLocal(true);
        });
      },
    );

    refs.form.addEventListener("submit", enviarMarcacao);
    dialogoMarcacao
      .querySelector(".dialog-fechar")
      .addEventListener("click", function () {
        dialogoMarcacao.close();
      });
    dialogoMarcacao
      .querySelector(".btn-fechar-marcacao")
      .addEventListener("click", function () {
        dialogoMarcacao.close();
      });
    dialogoMarcacao.addEventListener("click", function (e) {
      if (e.target === dialogoMarcacao) dialogoMarcacao.close();
    });
    dialogoMarcacao.addEventListener("close", function () {
      if (
        gatilhoMarcacao &&
        gatilhoMarcacao.isConnected &&
        gatilhoMarcacao.focus
      )
        gatilhoMarcacao.focus();
      gatilhoMarcacao = null;
    });

    return dialogoMarcacao;
  }

  /* ----- estado visual dos campos ----- */

  function bloco(chave) {
    return dialogoMarcacao.querySelector('[data-campo="' + chave + '"]');
  }
  function caixaErro(chave) {
    return document.getElementById("erro-marc-" + chave);
  }

  function mostrarErro(chave, mensagem) {
    var b = bloco(chave);
    caixaErro(chave).textContent = mensagem;
    b.classList.toggle("invalido", Boolean(mensagem));
    var controlo = b.querySelector("select, input, textarea");
    if (controlo)
      controlo.setAttribute("aria-invalid", mensagem ? "true" : "false");
  }

  function limparErro(chave) {
    mostrarErro(chave, "");
  }

  function servicoEscolhido() {
    var i = refs.servico.value;
    return i === "" ? null : servicos[Number(i)] || null;
  }

  function atualizarAjudaServico() {
    var s = servicoEscolhido();
    refs.ajudaServico.textContent = s
      ? [s.dias, s.horario, s.duracao ? "Duração: " + s.duracao : ""]
          .filter(Boolean)
          .join(" · ")
      : "";
  }

  function atualizarHoras() {
    var s = servicoEscolhido();
    var dataIso = refs.data.value;
    var anterior = refs.hora.value;

    refs.hora.replaceChildren(new Option("Escolher hora…", ""));
    refs.ajudaHora.textContent = "";

    var data = lerDataIso(dataIso);
    if (!s || !data || diasDoServico(s).indexOf(data.getDay()) === -1) {
      refs.hora.disabled = true;
      return;
    }

    var horas = horasDisponiveis(s, dataIso, new Date());
    if (!horas.length) {
      refs.hora.disabled = true;
      refs.ajudaHora.textContent =
        "Já não há horas livres neste dia. Escolha outro dia.";
      return;
    }
    horas.forEach(function (h) {
      refs.hora.append(new Option(h, h));
    });
    refs.hora.disabled = false;
    if (horas.indexOf(anterior) !== -1) refs.hora.value = anterior;
  }

  /* ----- validações (devolvem "" se estiver tudo bem) ----- */

  function mensagemServico() {
    return servicoEscolhido() ? "" : "Escolha o serviço que pretende.";
  }

  function mensagemData() {
    var s = servicoEscolhido();
    if (!refs.data.value) return "Escolha a data.";
    var data = lerDataIso(refs.data.value);
    if (!data) return "Data inválida.";

    var agora = new Date();
    var hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    if (data < hoje) return "Essa data já passou.";
    if (
      data >
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() + DIAS_MAXIMOS,
      )
    ) {
      return "Só é possível marcar até daqui a 6 meses.";
    }
    if (s && diasDoServico(s).indexOf(data.getDay()) === -1) {
      return (
        "Esse dia (" +
        NOMES_DIAS[data.getDay()] +
        ") não está disponível. Este serviço funciona: " +
        String(s.dias).toLowerCase() +
        "."
      );
    }
    return "";
  }

  function mensagemHora() {
    if (!refs.hora.value) {
      return refs.hora.disabled && refs.data.value && !mensagemData()
        ? "Já não há horas livres neste dia. Escolha outro dia."
        : "Escolha a hora.";
    }
    return "";
  }

  function mensagemLocal() {
    return refs.form.querySelector('input[name="marc-local"]:checked')
      ? ""
      : "Escolha onde quer ser atendido.";
  }

  function validarServico(mostrar) {
    var m = mensagemServico();
    if (mostrar) mostrarErro("servico", m);
    return m;
  }
  function validarData(mostrar) {
    var m = mensagemData();
    if (mostrar) mostrarErro("data", m);
    return m;
  }
  function validarHora(mostrar) {
    var m = mensagemHora();
    if (mostrar) mostrarErro("hora", m);
    return m;
  }
  function validarLocal(mostrar) {
    var m = mensagemLocal();
    if (mostrar) mostrarErro("local", m);
    return m;
  }

  /* ----- envio ----- */

  function enviarMarcacao(e) {
    e.preventDefault();
    var utilizador = window.Sessao && window.Sessao.atual();
    if (!utilizador) {
      dialogoMarcacao.close();
      if (typeof window.abrirLogin === "function") window.abrirLogin();
      return;
    }

    var erros = [
      ["servico", validarServico(true), "marc-servico"],
      ["data", validarData(true), "marc-data"],
      ["hora", validarHora(true), "marc-hora"],
      ["local", validarLocal(true), null],
    ].filter(function (x) {
      return x[1];
    });

    refs.erroGeral.hidden = true;
    if (erros.length) {
      var primeiro = erros[0][2]
        ? document.getElementById(erros[0][2])
        : refs.form.querySelector('input[name="marc-local"]');
      if (primeiro && !primeiro.disabled) primeiro.focus();
      return;
    }

    var servico = servicoEscolhido();
    var doutor =
      refs.doutor.value === "" ? null : doutores[Number(refs.doutor.value)];
    var local = refs.form.querySelector(
      'input[name="marc-local"]:checked',
    ).value;
    var dataIso = refs.data.value;
    var hora = refs.hora.value;

    var marcacoes = lerMarcacoes();
    var repetida = marcacoes.some(function (m) {
      return (
        m.email_marcador_servico === utilizador.email &&
        m.data_marcador_servico === dataIso &&
        m.hora_marcador_servico === hora
      );
    });
    if (repetida) {
      mostrarErro(
        "hora",
        "Já tem um pedido para esta data e hora. Escolha outra hora.",
      );
      refs.hora.focus();
      return;
    }

    var registo = {
      email_marcador_servico: utilizador.email,
      data_marcador_servico: dataIso,
      hora_marcador_servico: hora,
      local_realizacao_servico_escolhido: LOCAIS[local],
      dotor_escolhido: doutor ? nomeDoutor(doutor) : "Sem preferência",
      servico_escolhido: servico.nome,
      aceitar_solicitacao: false,
      regeitar_solicitacao: false,
      // extras
      nome_marcador_servico: utilizador.nome,
      preco: Number(servico.preco) || 0,
      observacoes: refs.observacoes.value.replace(/\s+/g, " ").trim(),
      criadoEm: new Date().toISOString(),
    };

    marcacoes.push(registo);
    try {
      guardarMarcacoes(marcacoes);
    } catch (erro) {
      refs.erroGeral.textContent =
        "Não foi possível guardar o pedido neste navegador. Verifique se o armazenamento não está bloqueado e tente de novo.";
      refs.erroGeral.hidden = false;
      return;
    }

    mostrarSucesso(registo);
  }

  function mostrarSucesso(registo) {
    refs.form.hidden = true;
    refs.intro.hidden = true;
    refs.sucesso.replaceChildren();

    refs.sucesso.append(
      criarDeHtml(
        '<div class="sucesso-icone" aria-hidden="true"><i class="fas fa-check"></i></div>',
      ),
      el("h3", "", "Pedido enviado!"),
      el(
        "p",
        "",
        "O hospital vai analisar o seu pedido. Pode acompanhar o estado em «As minhas marcações».",
      ),
    );

    var lista = el("dl", "resumo");
    [
      ["Serviço", registo.servico_escolhido],
      ["Doutor", registo.dotor_escolhido],
      ["Data", dataLegivel(registo.data_marcador_servico)],
      ["Hora", registo.hora_marcador_servico],
      ["Local", registo.local_realizacao_servico_escolhido],
    ].forEach(function (par) {
      lista.append(el("dt", "", par[0]), el("dd", "", par[1]));
    });
    refs.sucesso.append(lista);

    var acoes = el("div", "acoes");
    var ver = el("button", "btn-primario", "Ver as minhas marcações");
    ver.type = "button";
    ver.addEventListener("click", function () {
      dialogoMarcacao.close();
      abrirMinhasMarcacoes();
    });
    var fechar = el("button", "btn-secundario", "Fechar");
    fechar.type = "button";
    fechar.addEventListener("click", function () {
      dialogoMarcacao.close();
    });
    acoes.append(ver, fechar);
    refs.sucesso.append(acoes);

    refs.sucesso.hidden = false;
    refs.sucesso.focus();
  }

  /** Abre o modal (com o serviço e/ou doutor pré-escolhidos, se vierem). */
  function abrirMarcacao(opcoes) {
    var utilizador = window.Sessao && window.Sessao.atual();
    if (!utilizador) {
      if (typeof window.abrirLogin === "function") window.abrirLogin();
      return;
    }
    if (!servicos.length) {
      console.error(
        "[marcacao] Sem serviços: carregue js/servicos-data.js antes de js/marcacao.js.",
      );
      return;
    }

    var dialogo = montarMarcacao();
    gatilhoMarcacao = document.activeElement;
    var pedido =
      opcoes && typeof opcoes === "object" && !(opcoes instanceof Event)
        ? opcoes
        : {};

    // estado limpo
    refs.form.reset();
    refs.form.hidden = false;
    refs.intro.hidden = false;
    refs.sucesso.hidden = true;
    refs.erroGeral.hidden = true;
    ["servico", "doutor", "data", "hora", "local"].forEach(limparErro);

    refs.intro.textContent = "Marcação para " + utilizador.nome + ".";

    var iServico = indiceServicoPorNome(pedido.servico);
    if (iServico !== -1) refs.servico.value = String(iServico);
    var iDoutor = indiceDoutorPorNome(pedido.doutor);
    if (iDoutor !== -1) refs.doutor.value = String(iDoutor);

    atualizarAjudaServico();
    atualizarHoras();
    abrirDialogo(dialogo);
    limparIntencao();
  }

  /* ==================== Modal: as minhas marcações ==================== */

  var dialogoMinhas = null;

  function estadoDe(m) {
    if (m.aceitar_solicitacao === true)
      return { chave: "aceite", texto: "Aceite", icone: "fa-circle-check" };
    if (m.regeitar_solicitacao === true)
      return { chave: "recusada", texto: "Recusada", icone: "fa-circle-xmark" };
    return { chave: "pendente", texto: "Pendente", icone: "fa-clock" };
  }

  function abrirMinhasMarcacoes() {
    var utilizador = window.Sessao && window.Sessao.atual();
    if (!utilizador) {
      if (typeof window.abrirLogin === "function") window.abrirLogin();
      return;
    }

    if (!dialogoMinhas) {
      dialogoMinhas = criarDeHtml(
        '<dialog class="dialog-marcacao dialog-minhas" id="dialog-minhas" aria-labelledby="titulo-minhas">' +
          '<div class="cartao-marcacao">' +
          '<button type="button" class="dialog-fechar" aria-label="Fechar"><i class="fas fa-xmark" aria-hidden="true"></i></button>' +
          '<h2 id="titulo-minhas">As minhas marcações</h2>' +
          '<div id="lista-minhas"></div></div></dialog>',
      );
      document.body.append(dialogoMinhas);
      dialogoMinhas
        .querySelector(".dialog-fechar")
        .addEventListener("click", function () {
          dialogoMinhas.close();
        });
      dialogoMinhas.addEventListener("click", function (e) {
        if (e.target === dialogoMinhas) dialogoMinhas.close();
      });
    }

    var caixa = dialogoMinhas.querySelector("#lista-minhas");
    caixa.replaceChildren();

    var minhas = lerMarcacoes()
      .filter(function (m) {
        return m.email_marcador_servico === utilizador.email;
      })
      .sort(function (a, b) {
        return String(b.criadoEm || "").localeCompare(String(a.criadoEm || ""));
      });

    if (!minhas.length) {
      caixa.append(el("p", "vazio", "Ainda não fez nenhuma marcação."));
      var nova = el("button", "btn-primario", "Marcar consulta");
      nova.type = "button";
      nova.addEventListener("click", function () {
        dialogoMinhas.close();
        abrirMarcacao({});
      });
      caixa.append(nova);
    } else {
      var ul = el("ul", "lista-marcacoes");
      minhas.forEach(function (m) {
        var estado = estadoDe(m);
        var li = el("li", "item-marcacao");
        var topo = el("div", "item-topo");
        topo.append(el("strong", "", m.servico_escolhido));
        var selo = el("span", "estado estado--" + estado.chave);
        selo.append(
          criarDeHtml(
            '<i class="fas ' + estado.icone + '" aria-hidden="true"></i>',
          ),
          document.createTextNode(" " + estado.texto),
        );
        topo.append(selo);
        li.append(
          topo,
          el(
            "p",
            "",
            dataLegivel(m.data_marcador_servico) +
              " às " +
              m.hora_marcador_servico,
          ),
          el(
            "p",
            "suave",
            m.dotor_escolhido + " · " + m.local_realizacao_servico_escolhido,
          ),
        );
        ul.append(li);
      });
      caixa.append(ul);
    }

    abrirDialogo(dialogoMinhas);
  }

  /* ==================== Arranque ==================== */

  window.abrirMarcacao = abrirMarcacao;
  window.abrirMinhasMarcacoes = abrirMinhasMarcacoes;

  function aoCarregar() {
    var parametros = new URLSearchParams(location.search);
    var temIntencao = false;
    try {
      temIntencao = sessionStorage.getItem(CHAVE_INTENCAO) !== null;
    } catch (erro) {}
    var querMarcar = parametros.get("marcar") === "1" || temIntencao;
    var querMinhas = parametros.get("minhas") === "1";
    if (!window.Sessao || !window.Sessao.atual()) return;

    if (querMinhas || parametros.get("marcar") === "1") {
      // tira o parâmetro do endereço para um refresh não reabrir o modal
      if (window.history && history.replaceState) {
        history.replaceState(null, "", location.pathname);
      }
    }
    if (querMinhas) abrirMinhasMarcacoes();
    else if (querMarcar) abrirMarcacao(lerIntencao());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", aoCarregar);
  } else {
    aoCarregar();
  }
})();
