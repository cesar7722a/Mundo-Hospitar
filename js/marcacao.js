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
 * Podem escolher-se VÁRIOS serviços na mesma marcação (como o antigo
 * "carrinho"). A data e a hora têm de servir para todos: dias em comum,
 * horário comum e duração somada.
 *
 * Armazenamento: os pedidos ficam em localStorage "salve_marcacao_notificao",
 * com os mesmos nomes de campo do código anterior, para a parte de
 * administração continuar a poder aceitar ou recusar:
 *   email_marcador_servico, data_marcador_servico, hora_marcador_servico,
 *   local_realizacao_servico_escolhido, dotor_escolhido, servico_escolhido,
 *   aceitar_solicitacao, regeitar_solicitacao
 * servico_escolhido é uma LISTA de { nome, preco } (como no processo antigo) e,
 * sem doutor escolhido, dotor_escolhido fica "Escolha Do Hospital".
 * Campos novos: taxa_domicilio, preco_total, duracao_total_min,
 * endereco_atendimento (só no domicílio), observacoes, referencia.
 *
 * Regra de preço: o atendimento ao domicílio tem um acréscimo (TAXA_DOMICILIO).
 * No fim gera-se um recibo em PDF (html2pdf, carregado só quando é pedido).
 */
(function () {
  "use strict";

  /* ==================== Configuração ==================== */

  var CHAVE_MARCACOES = "salve_marcacao_notificao";
  var CHAVE_PACIENTES = "pacientes_mundo_hospitalar";

  var TAXA_DOMICILIO = 100000; // acréscimo (Kz) do atendimento ao domicílio
  var SEM_DOUTOR = "Escolha Do Hospital"; // valor que a administração já conhece

  // Geração do recibo em PDF (carregado só quando se carrega no botão)
  var URL_HTML2PDF =
    "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
  var SRI_HTML2PDF =
    "sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==";
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
  var NOMES_CURTOS = [
    "domingo",
    "segunda",
    "terça",
    "quarta",
    "quinta",
    "sexta",
    "sábado",
  ];

  var formatoPreco = new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: "always", // 8 000,00 e não 8000,00 (o pt-PT só agrupa a partir de 5 dígitos)
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

  /**
   * Horas livres num dia, dadas as restrições (abre, fecha e duração em minutos).
   * Hoje só com antecedência suficiente.
   */
  function horasDisponiveis(restr, dataIso, agora) {
    var duracao = restr.duracao || PASSO_MINUTOS;
    var inicio = restr.abre;
    var fim = restr.fecha;
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

  /** O que serve para TODOS os serviços escolhidos: dias comuns, horário comum e duração somada. */
  function restricoes(lista) {
    var dias = null;
    var abre = 0;
    var fecha = 24 * 60;
    var duracao = 0;
    var preco = 0;

    lista.forEach(function (s) {
      var d = diasDoServico(s);
      dias =
        dias === null
          ? d.slice()
          : dias.filter(function (x) {
              return d.indexOf(x) !== -1;
            });
      abre = Math.max(abre, minutosDe(s.abre || "08:00"));
      fecha = Math.min(fecha, minutosDe(s.fecha || "17:00"));
      duracao += s.duracaoMin || PASSO_MINUTOS;
      preco += Number(s.preco) || 0;
    });

    return {
      dias: dias || [],
      abre: abre,
      fecha: fecha,
      duracao: duracao,
      preco: preco,
    };
  }

  /** [1,2,3,4,5] -> "segunda a sexta"; [1,3] -> "segunda e quarta". */
  function descreverDias(dias) {
    var ordem = dias.slice().sort(function (a, b) {
      return (a || 7) - (b || 7);
    });
    if (!ordem.length) return "";
    var seguidos = ordem.every(function (d, i) {
      return i === 0 || (d || 7) === (ordem[i - 1] || 7) + 1;
    });
    if (ordem.length >= 3 && seguidos) {
      return (
        NOMES_CURTOS[ordem[0]] + " a " + NOMES_CURTOS[ordem[ordem.length - 1]]
      );
    }
    var nomes = ordem.map(function (d) {
      return NOMES_CURTOS[d];
    });
    return nomes.length === 1
      ? nomes[0]
      : nomes.slice(0, -1).join(", ") + " e " + nomes[nomes.length - 1];
  }

  function lerPaciente(utilizador) {
    try {
      var lista = JSON.parse(localStorage.getItem(CHAVE_PACIENTES));
      return (Array.isArray(lista) && lista[utilizador.posicao]) || null;
    } catch (erro) {
      return null;
    }
  }

  function enderecoDoPerfil(utilizador) {
    var p = lerPaciente(utilizador);
    return p && p.endereco
      ? String(p.endereco).replace(/\s+/g, " ").trim()
      : "";
  }

  /** Nomes dos serviços de uma marcação (lista de { nome, preco } ou, em registos antigos, texto). */
  function nomesDoServico(m) {
    var s = m.servico_escolhido;
    if (Array.isArray(s)) {
      return s
        .map(function (x) {
          return x && x.nome ? x.nome : String(x);
        })
        .join(" + ");
    }
    return String(s || "");
  }

  function idadeDoPaciente(p) {
    var nascimento = lerDataIso(p && p.data);
    if (!nascimento) return p && p.idade != null ? String(p.idade) : "";
    var hoje = new Date();
    var idade = hoje.getFullYear() - nascimento.getFullYear();
    var antes =
      hoje.getMonth() < nascimento.getMonth() ||
      (hoje.getMonth() === nascimento.getMonth() &&
        hoje.getDate() < nascimento.getDate());
    return String(antes ? idade - 1 : idade);
  }

  function dinheiro(valor) {
    return formatoPreco.format(valor) + " Kz";
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
    '<fieldset class="campo" data-campo="servico"><legend>Serviços <span class="opcional">(pode escolher mais do que um)</span></legend>' +
    '<div class="lista-servicos" id="marc-servicos"></div>' +
    '<p class="ajuda" id="ajuda-marc-servico" aria-live="polite"></p><p class="erro" id="erro-marc-servico" aria-live="polite"></p></fieldset>' +
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
    '</div><p class="aviso-taxa" id="aviso-taxa" hidden></p><p class="erro" id="erro-marc-local" aria-live="polite"></p></fieldset>' +
    '<div class="campo" data-campo="endereco" hidden><label for="marc-endereco">Endereço para o atendimento</label>' +
    '<input type="text" id="marc-endereco" maxlength="120" autocomplete="street-address" aria-describedby="ajuda-marc-endereco erro-marc-endereco" />' +
    '<p class="ajuda" id="ajuda-marc-endereco">Vem do seu perfil. Pode mudá-lo só para esta marcação.</p>' +
    '<p class="erro" id="erro-marc-endereco" aria-live="polite"></p></div>' +
    '<div class="campo" data-campo="observacoes"><label for="marc-observacoes">Observações <span class="opcional">(opcional)</span></label>' +
    '<textarea id="marc-observacoes" rows="3" maxlength="300" placeholder="Algo que o hospital deva saber?"></textarea></div>' +
    '<div class="marcacao-preco" aria-live="polite"><dl>' +
    '<div class="linha"><dt>Subtotal</dt><dd id="preco-subtotal"></dd></div>' +
    '<div class="linha" id="linha-taxa" hidden><dt>Atendimento ao domicílio</dt><dd id="preco-taxa"></dd></div>' +
    '<div class="linha total"><dt>Total</dt><dd id="preco-total"></dd></div></dl></div>' +
    '<div class="resumo-erros" id="erro-marcacao" role="alert" hidden></div>' +
    '<div class="acoes"><button type="submit" class="btn-primario">Enviar pedido</button>' +
    '<button type="button" class="btn-secundario btn-fechar-marcacao">Cancelar</button></div>' +
    "</form>" +
    '<div class="marcacao-sucesso" id="marcacao-sucesso" tabindex="-1" hidden></div>' +
    "</div></dialog>";

  var dialogoMarcacao = null;
  var gatilhoMarcacao = null;
  var enderecoPerfil = "";
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
      servicos: $("marc-servicos"),
      doutor: $("marc-doutor"),
      endereco: $("marc-endereco"),
      avisoTaxa: $("aviso-taxa"),
      linhaTaxa: $("linha-taxa"),
      precoSubtotal: $("preco-subtotal"),
      precoTaxa: $("preco-taxa"),
      precoTotal: $("preco-total"),
      data: $("marc-data"),
      hora: $("marc-hora"),
      observacoes: $("marc-observacoes"),
      ajudaServico: $("ajuda-marc-servico"),
      ajudaHora: $("ajuda-marc-hora"),
      erroGeral: $("erro-marcacao"),
      sucesso: $("marcacao-sucesso"),
    };

    /* opções dos selects (nomes vêm dos dados do site: entram como texto) */
    servicos.forEach(function (s, i) {
      var opcao = el("label", "opcao opcao-servico");
      var caixa = document.createElement("input");
      caixa.type = "checkbox";
      caixa.name = "marc-servico";
      caixa.value = String(i);
      var nome = el("span", "nome", s.nome);
      var preco = el(
        "span",
        "preco",
        formatoPreco.format(Number(s.preco) || 0) + " Kz",
      );
      opcao.append(caixa, nome, preco);
      refs.servicos.append(opcao);
    });
    refs.avisoTaxa.textContent =
      "Os serviços ao domicílio têm um acréscimo de " +
      dinheiro(TAXA_DOMICILIO) +
      ".";
    refs.doutor.append(new Option("Escolha do hospital (sem preferência)", ""));
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
    Array.prototype.forEach.call(
      refs.form.querySelectorAll('input[name="marc-servico"]'),
      function (caixa) {
        caixa.addEventListener("change", function () {
          atualizarAjudaServico();
          atualizarPreco();
          atualizarHoras();
          validarServico(true);
          if (refs.data.value) validarData(true);
        });
      },
    );
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
          atualizarEndereco();
          validarLocal(true);
        });
      },
    );
    refs.endereco.addEventListener("input", function () {
      if (caixaErro("endereco").textContent) validarEndereco(true);
    });
    refs.endereco.addEventListener("blur", function () {
      validarEndereco(true);
    });

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

  function servicosEscolhidos() {
    return Array.prototype.filter
      .call(
        refs.form.querySelectorAll('input[name="marc-servico"]'),
        function (c) {
          return c.checked;
        },
      )
      .map(function (c) {
        return servicos[Number(c.value)];
      });
  }

  function localEscolhido() {
    var marcado = refs.form.querySelector('input[name="marc-local"]:checked');
    return marcado ? marcado.value : "";
  }

  function atualizarAjudaServico() {
    var lista = servicosEscolhidos();
    if (!lista.length) {
      refs.ajudaServico.textContent = "";
      return;
    }
    var r = restricoes(lista);
    var partes = [];
    if (r.dias.length)
      partes.push(
        "Funciona: " +
          descreverDias(r.dias) +
          ", " +
          hhmmDe(r.abre) +
          "–" +
          hhmmDe(r.fecha),
      );
    partes.push("Duração: " + r.duracao + " min");
    refs.ajudaServico.textContent = partes.join(" · ");
  }

  /** Subtotal dos serviços, acréscimo ao domicílio (se for o caso) e total. */
  function atualizarPreco() {
    var subtotal = restricoes(servicosEscolhidos()).preco;
    var taxa = localEscolhido() === "domicilio" ? TAXA_DOMICILIO : 0;
    refs.precoSubtotal.textContent = dinheiro(subtotal);
    refs.linhaTaxa.hidden = !taxa;
    refs.precoTaxa.textContent = taxa ? "+ " + dinheiro(taxa) : "";
    refs.precoTotal.textContent = dinheiro(subtotal + taxa);
  }

  /** Mostra o endereço só no atendimento ao domicílio (preenchido com o do perfil). */
  function atualizarEndereco() {
    var domicilio = localEscolhido() === "domicilio";
    var b = bloco("endereco");
    b.hidden = !domicilio;
    refs.avisoTaxa.hidden = !domicilio;
    atualizarPreco();
    refs.endereco.required = domicilio;
    if (domicilio && !refs.endereco.value) refs.endereco.value = enderecoPerfil;
    if (!domicilio) limparErro("endereco");
  }

  function atualizarHoras() {
    var lista = servicosEscolhidos();
    var restr = restricoes(lista);
    var dataIso = refs.data.value;
    var anterior = refs.hora.value;

    refs.hora.replaceChildren(new Option("Escolher hora…", ""));
    refs.ajudaHora.textContent = "";

    var data = lerDataIso(dataIso);
    if (!lista.length || !data || restr.dias.indexOf(data.getDay()) === -1) {
      refs.hora.disabled = true;
      return;
    }

    var horas = horasDisponiveis(restr, dataIso, new Date());
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
    var lista = servicosEscolhidos();
    if (!lista.length) return "Escolha pelo menos um serviço.";
    if (lista.length > 1) {
      var r = restricoes(lista);
      if (!r.dias.length) {
        return "Estes serviços não funcionam nos mesmos dias. Marque-os em pedidos separados.";
      }
      if (r.abre + r.duracao > r.fecha) {
        return "A duração total é maior do que o horário em comum. Marque-os em pedidos separados.";
      }
    }
    return "";
  }

  function mensagemData() {
    var lista = servicosEscolhidos();
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
    if (lista.length) {
      var dias = restricoes(lista).dias;
      if (dias.length && dias.indexOf(data.getDay()) === -1) {
        return (
          "Esse dia (" +
          NOMES_DIAS[data.getDay()] +
          ") não está disponível. Funciona: " +
          descreverDias(dias) +
          "."
        );
      }
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
    return localEscolhido() ? "" : "Escolha onde quer ser atendido.";
  }

  function mensagemEndereco() {
    if (localEscolhido() !== "domicilio") return "";
    var texto = refs.endereco.value.replace(/\s+/g, " ").trim();
    if (!texto) return "Indique o endereço onde quer ser atendido.";
    if (texto.length < 5) return "O endereço é demasiado curto.";
    return "";
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
  function validarEndereco(mostrar) {
    var m = mensagemEndereco();
    if (mostrar) mostrarErro("endereco", m);
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
      ["servico", validarServico(true), 'input[name="marc-servico"]'],
      ["data", validarData(true), "#marc-data"],
      ["hora", validarHora(true), "#marc-hora"],
      ["local", validarLocal(true), 'input[name="marc-local"]'],
      ["endereco", validarEndereco(true), "#marc-endereco"],
    ].filter(function (x) {
      return x[1];
    });

    refs.erroGeral.hidden = true;
    if (erros.length) {
      var primeiro = refs.form.querySelector(erros[0][2]);
      if (primeiro && !primeiro.disabled) primeiro.focus();
      return;
    }

    var escolhidos = servicosEscolhidos();
    var restr = restricoes(escolhidos);
    var doutor =
      refs.doutor.value === "" ? null : doutores[Number(refs.doutor.value)];
    var local = localEscolhido();
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
      dotor_escolhido: doutor ? doutor.nome : SEM_DOUTOR,
      servico_escolhido: escolhidos.map(function (s) {
        return { nome: s.nome, preco: Number(s.preco) || 0 };
      }),
      aceitar_solicitacao: false,
      regeitar_solicitacao: false,
      // extras
      nome_marcador_servico: utilizador.nome,
      taxa_domicilio: local === "domicilio" ? TAXA_DOMICILIO : 0,
      preco_total: restr.preco + (local === "domicilio" ? TAXA_DOMICILIO : 0),
      duracao_total_min: restr.duracao,
      referencia: "MH-" + Date.now().toString(36).toUpperCase(),
      endereco_atendimento:
        local === "domicilio"
          ? refs.endereco.value.replace(/\s+/g, " ").trim()
          : "",
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

    mostrarSucesso(registo, lerPaciente(utilizador));
  }

  /* ----- recibo (comprovativo) e PDF ----- */

  function listaDl(pares) {
    var dl = el("dl", "recibo-dl");
    pares.filter(Boolean).forEach(function (par) {
      dl.append(el("dt", "", par[0]), el("dd", "", par[1]));
    });
    return dl;
  }

  function criarRecibo(registo, paciente) {
    var recibo = el("article", "recibo");
    recibo.id = "recibo-marcacao";

    var cabecalho = el("header", "recibo-cabecalho");
    var marca = el("p", "recibo-marca");
    marca.append(
      el("span", "", "Mundo"),
      document.createTextNode("-Hospitalar"),
    );
    cabecalho.append(
      marca,
      el("p", "recibo-titulo", "Comprovativo de marcação"),
      el(
        "p",
        "recibo-ref",
        "Ref. " +
          registo.referencia +
          " · emitido em " +
          dataLegivel(paraIso(new Date(registo.criadoEm))),
      ),
    );
    recibo.append(cabecalho);

    var p = paciente || {};
    var pessoais = el("section", "recibo-seccao");
    pessoais.append(
      el("h4", "", "Dados pessoais"),
      listaDl([
        ["Nome", registo.nome_marcador_servico],
        p.bilhete ? ["BI", String(p.bilhete)] : null,
        p.telefone ? ["Telefone", String(p.telefone)] : null,
        ["Email", registo.email_marcador_servico],
        idadeDoPaciente(p) ? ["Idade", idadeDoPaciente(p) + " anos"] : null,
      ]),
    );
    recibo.append(pessoais);

    var servicosSecao = el("section", "recibo-seccao");
    var ul = el("ul", "recibo-servicos");
    registo.servico_escolhido.forEach(function (sv) {
      var li = el("li");
      li.append(el("span", "", sv.nome), el("span", "", dinheiro(sv.preco)));
      ul.append(li);
    });
    servicosSecao.append(
      el(
        "h4",
        "",
        registo.servico_escolhido.length > 1 ? "Serviços" : "Serviço",
      ),
      ul,
    );
    recibo.append(servicosSecao);

    var marcacao = el("section", "recibo-seccao");
    marcacao.append(
      el("h4", "", "Marcação"),
      listaDl([
        ["Data", dataLegivel(registo.data_marcador_servico)],
        ["Hora", registo.hora_marcador_servico],
        ["Doutor", registo.dotor_escolhido],
        ["Local", registo.local_realizacao_servico_escolhido],
        registo.endereco_atendimento
          ? ["Endereço", registo.endereco_atendimento]
          : null,
      ]),
    );
    recibo.append(marcacao);

    var subtotal = registo.preco_total - registo.taxa_domicilio;
    var totais = el("section", "recibo-seccao recibo-totais");
    totais.append(
      listaDl([
        ["Subtotal", dinheiro(subtotal)],
        registo.taxa_domicilio
          ? [
              "Atendimento ao domicílio",
              "+ " + dinheiro(registo.taxa_domicilio),
            ]
          : null,
        ["Total", dinheiro(registo.preco_total)],
      ]),
    );
    recibo.append(totais);

    recibo.append(
      el(
        "p",
        "recibo-nota",
        "Estado: pendente. O hospital vai analisar o pedido e confirmar.",
      ),
    );
    return recibo;
  }

  function carregarHtml2pdf() {
    return new Promise(function (resolve, reject) {
      if (typeof window.html2pdf === "function")
        return resolve(window.html2pdf);
      var script = document.createElement("script");
      script.src = URL_HTML2PDF;
      script.integrity = SRI_HTML2PDF;
      script.crossOrigin = "anonymous";
      script.referrerPolicy = "no-referrer";
      script.onload = function () {
        if (typeof window.html2pdf === "function") resolve(window.html2pdf);
        else reject(new Error("html2pdf não ficou disponível"));
      };
      script.onerror = function () {
        reject(new Error("Não foi possível carregar o html2pdf"));
      };
      document.head.append(script);
    });
  }

  function descarregarRecibo(registo, botao, aviso) {
    botao.disabled = true;
    aviso.textContent = "A gerar o PDF…";
    carregarHtml2pdf()
      .then(function (html2pdf) {
        return html2pdf()
          .set({
            margin: 10,
            filename: "Recibo-" + registo.referencia + ".pdf",
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .from(document.getElementById("recibo-marcacao"))
          .save();
      })
      .then(function () {
        aviso.textContent = "Recibo descarregado.";
      })
      .catch(function (erro) {
        console.error("[marcacao]", erro);
        aviso.textContent =
          "Não foi possível gerar o PDF. Verifique a ligação à internet e tente de novo.";
      })
      .then(function () {
        botao.disabled = false;
      });
  }

  function mostrarSucesso(registo, paciente) {
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
    refs.sucesso.append(criarRecibo(registo, paciente));

    var estado = el("p", "recibo-estado");
    estado.setAttribute("role", "status");

    var acoes = el("div", "acoes");
    var pdf = el(
      "button",
      "btn-primario btn-recibo",
      "Descarregar recibo (PDF)",
    );
    pdf.type = "button";
    pdf.addEventListener("click", function () {
      descarregarRecibo(registo, pdf, estado);
    });
    var ver = el("button", "btn-secundario", "As minhas marcações");
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
    acoes.append(pdf, ver, fechar);
    refs.sucesso.append(acoes, estado);

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
    enderecoPerfil = enderecoDoPerfil(utilizador);
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
    ["servico", "doutor", "data", "hora", "local", "endereco"].forEach(
      limparErro,
    );
    refs.endereco.value = "";
    atualizarEndereco();

    refs.intro.textContent = "Marcação para " + utilizador.nome + ".";

    // pode vir um serviço ("Raio-X") ou vários (["Raio-X", "Análises Clínicas"])
    var pedidos = [].concat(pedido.servicos || [], pedido.servico || []);
    pedidos.forEach(function (nome) {
      var i = indiceServicoPorNome(nome);
      if (i !== -1)
        refs.form.querySelector(
          'input[name="marc-servico"][value="' + i + '"]',
        ).checked = true;
    });
    var iDoutor = indiceDoutorPorNome(pedido.doutor);
    if (iDoutor !== -1) refs.doutor.value = String(iDoutor);

    atualizarAjudaServico();
    atualizarPreco();
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
        topo.append(el("strong", "", nomesDoServico(m)));
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
