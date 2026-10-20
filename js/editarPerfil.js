/**
 * Editar perfil (pageEditar.html).
 *
 * - Preenche o formulário com os dados da conta que tem sessão iniciada.
 * - Usa as mesmas validações do cadastro (js/validacoes.js); o próprio
 *   utilizador não conta como "email/BI repetido".
 * - Só guarda o que mudou. Para mudar o email ou a password pede a
 *   password atual.
 * - Se o email ou o nome mudarem, atualiza também as marcações dessa pessoa
 *   (elas são ligadas à conta pelo email), para não ficarem "órfãs".
 *
 * Precisa de: js/layout.js (window.Sessao) e js/validacoes.js.
 */
(function () {
  "use strict";

  var V = window.Validacoes;
  var form = document.getElementById("form-editar");
  if (!form) return;
  if (!V || !window.Sessao) {
    console.error(
      "[editar] Faltam js/layout.js ou js/validacoes.js antes de js/editarPerfil.js.",
    );
    return;
  }

  var sessao = window.Sessao.atual();
  if (!sessao) return; // sem sessão: o layout.js já está a redirecionar para o login

  var posicao = sessao.posicao;
  var CHAVE_LETRA = "userParaLogar";
  var CHAVE_PACIENTES = "pacientes_mundo_hospitalar";
  var CHAVE_MARCACOES = "salve_marcacao_notificao";

  /* ==================== Elementos ==================== */

  var resumo = document.getElementById("resumo-erros");
  var sucesso = document.getElementById("sucesso");
  var semAlteracoes = document.getElementById("sem-alteracoes");
  var botaoGuardar = form.querySelector('[type="submit"]');
  var blocoForca = document.getElementById("forca-password");
  var textoForca = document.getElementById("forca-texto");

  function porId(id) {
    return document.getElementById(id);
  }

  function paciente() {
    return V.lerPacientes()[posicao] || null;
  }

  /* ==================== Campos e validações ==================== */

  function emailMudou() {
    var guardado = paciente();
    return (
      Boolean(guardado) &&
      V.normalizarEmail(porId("inputEmail").value) !==
        V.normalizarEmail(guardado.email)
    );
  }

  function precisaPasswordAtual() {
    return emailMudou() || porId("inputPassword").value !== "";
  }

  var CAMPOS = [
    {
      chave: "nome",
      id: "inputNome",
      rotulo: "Nome",
      validar: function (v) {
        return V.nome(v);
      },
    },
    {
      chave: "data",
      id: "inputData",
      rotulo: "Data de nascimento",
      validar: function (v) {
        return V.data(v, new Date());
      },
    },
    {
      chave: "sexo",
      id: "selectSexo",
      rotulo: "Sexo",
      validar: function (v) {
        return V.sexo(v);
      },
    },
    {
      chave: "bilhete",
      id: "inputBI",
      rotulo: "BI",
      validar: function (v) {
        return V.bilhete(v, posicao);
      },
    },
    {
      chave: "email",
      id: "inputEmail",
      rotulo: "Email",
      validar: function (v) {
        return V.email(v, posicao);
      },
    },
    {
      chave: "telefone",
      id: "inputTelefone",
      rotulo: "Telefone",
      validar: function (v) {
        return V.telefone(v);
      },
    },
    {
      chave: "endereco",
      id: "inputEndereco",
      rotulo: "Endereço",
      validar: function (v) {
        return V.endereco(v);
      },
    },
    {
      chave: "atual",
      id: "inputAtual",
      rotulo: "Password atual",
      validar: function (v) {
        if (!precisaPasswordAtual()) return "";
        if (!v)
          return "Indique a sua password atual para confirmar a alteração.";
        var guardado = paciente();
        return guardado && String(guardado.password) === v
          ? ""
          : "A password atual está incorreta.";
      },
    },
    {
      chave: "password",
      id: "inputPassword",
      rotulo: "Nova password",
      validar: function (v) {
        return v === "" ? "" : V.password(v);
      },
    },
    {
      chave: "confirmar",
      id: "inputConfirmar",
      rotulo: "Repetir nova password",
      validar: function (v) {
        var nova = porId("inputPassword").value;
        if (nova === "")
          return v === "" ? "" : "Preencha primeiro a nova password.";
        return V.confirmacao(v, nova);
      },
    },
  ];

  CAMPOS.forEach(function (campo) {
    campo.input = porId(campo.id);
    campo.bloco = form.querySelector('[data-campo="' + campo.chave + '"]');
    campo.erro = porId("erro-" + campo.chave);
    campo.tocado = false;
  });

  function campoPorChave(chave) {
    return CAMPOS.filter(function (c) {
      return c.chave === chave;
    })[0];
  }

  function mostrarEstado(campo, mensagem) {
    campo.erro.textContent = mensagem;
    campo.input.setAttribute("aria-invalid", mensagem ? "true" : "false");
    campo.bloco.classList.toggle("invalido", Boolean(mensagem));
    campo.bloco.classList.toggle(
      "valido",
      !mensagem && campo.input.value !== "",
    );
  }

  function validarCampo(campo, mostrar) {
    var mensagem = campo.validar(campo.input.value);
    if (mostrar) mostrarEstado(campo, mensagem);
    return mensagem;
  }

  function atualizarForca() {
    var nivel = V.nivelPassword(porId("inputPassword").value);
    blocoForca.setAttribute("data-nivel", nivel);
    textoForca.textContent =
      nivel === "fraca"
        ? "Fraca"
        : nivel === "media"
          ? "Média"
          : nivel === "forte"
            ? "Forte"
            : "";
  }

  /** A password atual só é obrigatória quando se mexe no email ou na password. */
  function atualizarObrigatoriedadeDaAtual() {
    var atual = campoPorChave("atual");
    var precisa = precisaPasswordAtual();
    atual.input.setAttribute("aria-required", precisa ? "true" : "false");
    if (atual.tocado) validarCampo(atual, true);
  }

  /* ==================== Preencher ==================== */

  function nascimentoValido(iso) {
    return V.lerDataIso(iso) ? iso : "";
  }

  function preencher(dados) {
    campoPorChave("nome").input.value = V.limparEspacos(dados.nome);
    campoPorChave("data").input.value = nascimentoValido(dados.data);
    campoPorChave("sexo").input.value = dados.sexo
      ? V.chaveDoSexo(dados.sexo)
      : "";
    campoPorChave("bilhete").input.value = V.normalizarBilhete(dados.bilhete);
    campoPorChave("email").input.value = String(dados.email || "");

    var telefone = V.normalizarTelefone(dados.telefone);
    campoPorChave("telefone").input.value = /^[29]\d{8}$/.test(telefone)
      ? V.formatarTelefone(telefone)
      : telefone;
    campoPorChave("endereco").input.value = V.limparEspacos(dados.endereco);

    ["atual", "password", "confirmar"].forEach(function (chave) {
      campoPorChave(chave).input.value = "";
    });
    atualizarForca();

    // painel lateral
    porId("perfil-inicial").textContent = String(dados.nome || "?")
      .trim()
      .charAt(0)
      .toUpperCase();
    porId("perfil-nome").textContent = V.limparEspacos(dados.nome);
    porId("perfil-email").textContent = String(dados.email || "");

    var criado = dados.criadoEm ? new Date(dados.criadoEm) : null;
    porId("perfil-desde").textContent =
      criado && !isNaN(criado)
        ? "Conta criada em " + criado.toLocaleDateString("pt-PT")
        : "";
  }

  (function limitarData() {
    var hoje = new Date();
    var data = porId("inputData");
    data.max = V.paraIso(
      new Date(
        hoje.getFullYear() - V.IDADE_MINIMA,
        hoje.getMonth(),
        hoje.getDate(),
      ),
    );
    data.min = V.paraIso(
      new Date(
        hoje.getFullYear() - V.IDADE_MAXIMA,
        hoje.getMonth(),
        hoje.getDate(),
      ),
    );
  })();

  var guardadoAgora = paciente();
  if (!guardadoAgora) {
    // a sessão aponta para uma conta que já não existe
    window.Sessao.terminar();
    window.location.replace("index.html?login=1&voltar=pageEditar.html");
    return;
  }
  preencher(guardadoAgora);

  /* ==================== Eventos dos campos ==================== */

  function esconderMensagens() {
    sucesso.hidden = true;
    semAlteracoes.hidden = true;
  }

  CAMPOS.forEach(function (campo) {
    campo.input.addEventListener("blur", function () {
      campo.tocado = true;

      if (campo.chave === "telefone") {
        var digitos = V.normalizarTelefone(campo.input.value);
        if (/^[29]\d{8}$/.test(digitos))
          campo.input.value = V.formatarTelefone(digitos);
      }
      if (campo.chave === "nome" && !V.nome(campo.input.value)) {
        campo.input.value = V.capitalizarNome(campo.input.value);
      }
      validarCampo(campo, true);
    });

    campo.input.addEventListener("input", function () {
      esconderMensagens();
      if (campo.chave === "password") {
        atualizarForca();
        var confirmar = campoPorChave("confirmar");
        if (confirmar.tocado) validarCampo(confirmar, true);
      }
      if (campo.chave === "password" || campo.chave === "email")
        atualizarObrigatoriedadeDaAtual();
      if (campo.tocado) validarCampo(campo, true);
    });

    if (campo.input.tagName === "SELECT" || campo.input.type === "date") {
      campo.input.addEventListener("change", function () {
        esconderMensagens();
        campo.tocado = true;
        validarCampo(campo, true);
      });
    }
  });

  Array.prototype.forEach.call(
    form.querySelectorAll(".btn-mostrar"),
    function (botao) {
      botao.addEventListener("click", function () {
        var input = porId(botao.getAttribute("aria-controls"));
        var visivel = input.type === "password";
        input.type = visivel ? "text" : "password";
        botao.setAttribute("aria-pressed", String(visivel));
        botao.setAttribute(
          "aria-label",
          visivel ? "Ocultar password" : "Mostrar password",
        );
        botao.querySelector("i").className = visivel
          ? "fas fa-eye-slash"
          : "fas fa-eye";
      });
    },
  );

  /* ==================== Resumo de erros ==================== */

  function escreverResumo(titulo, itens) {
    resumo.replaceChildren();
    var paragrafo = document.createElement("p");
    paragrafo.textContent = titulo;
    resumo.append(paragrafo);

    if (itens && itens.length) {
      var lista = document.createElement("ul");
      itens.forEach(function (item) {
        var li = document.createElement("li");
        var ligacao = document.createElement("a");
        ligacao.href = "#" + item.campo.id;
        ligacao.textContent = item.campo.rotulo + ": " + item.mensagem;
        ligacao.addEventListener("click", function (e) {
          e.preventDefault();
          item.campo.input.focus();
        });
        li.append(ligacao);
        lista.append(li);
      });
      resumo.append(lista);
    }
    resumo.hidden = false;
    resumo.focus();
  }

  function esconderResumo() {
    resumo.hidden = true;
    resumo.replaceChildren();
  }

  /* ==================== Guardar ==================== */

  function lerLista(chave) {
    try {
      var valor = JSON.parse(localStorage.getItem(chave));
      return Array.isArray(valor) ? valor : [];
    } catch (erro) {
      return [];
    }
  }

  /** Valores do formulário, já normalizados. */
  function valoresDoFormulario() {
    var chaveSexo = campoPorChave("sexo").input.value;
    return {
      nome: V.capitalizarNome(campoPorChave("nome").input.value),
      email: V.normalizarEmail(campoPorChave("email").input.value),
      telefone: V.normalizarTelefone(campoPorChave("telefone").input.value),
      bilhete: V.normalizarBilhete(campoPorChave("bilhete").input.value),
      endereco: V.limparEspacos(campoPorChave("endereco").input.value),
      data: campoPorChave("data").input.value,
      sexoChave: chaveSexo,
      sexo: V.SEXOS[chaveSexo],
      password: campoPorChave("password").input.value,
    };
  }

  /** Que campos são diferentes do que está guardado. */
  function camposAlterados(guardado, novos) {
    var alterados = [];
    if (V.capitalizarNome(guardado.nome) !== novos.nome) alterados.push("nome");
    if (V.normalizarEmail(guardado.email) !== novos.email)
      alterados.push("email");
    if (V.normalizarTelefone(guardado.telefone) !== novos.telefone)
      alterados.push("telefone");
    if (V.normalizarBilhete(guardado.bilhete) !== novos.bilhete)
      alterados.push("BI");
    if (V.limparEspacos(guardado.endereco) !== novos.endereco)
      alterados.push("endereço");
    if (nascimentoValido(guardado.data) !== novos.data)
      alterados.push("data de nascimento");
    var sexoGuardado = guardado.sexo ? V.chaveDoSexo(guardado.sexo) : "";
    if (sexoGuardado !== novos.sexoChave) alterados.push("sexo");
    if (novos.password !== "" && novos.password !== String(guardado.password))
      alterados.push("password");
    return alterados;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    esconderMensagens();

    var erros = [];
    CAMPOS.forEach(function (campo) {
      campo.tocado = true;
      var mensagem = validarCampo(campo, true);
      if (mensagem) erros.push({ campo: campo, mensagem: mensagem });
    });
    if (erros.length) {
      escreverResumo(
        erros.length === 1
          ? "Corrija 1 campo antes de guardar:"
          : "Corrija " + erros.length + " campos antes de guardar:",
        erros,
      );
      return;
    }
    esconderResumo();

    var pacientes = V.lerPacientes();
    var registo = pacientes[posicao];
    if (!registo) {
      escreverResumo(
        "Esta conta já não existe neste navegador. Inicie sessão de novo.",
      );
      return;
    }

    var novos = valoresDoFormulario();
    var alterados = camposAlterados(registo, novos);
    if (!alterados.length) {
      semAlteracoes.hidden = false;
      return;
    }

    var emailAntigo = String(registo.email);

    // só se escreve o que mudou (assim não se mexe, por exemplo, no email guardado sem necessidade)
    if (alterados.indexOf("nome") !== -1) registo.nome = novos.nome;
    if (alterados.indexOf("email") !== -1) registo.email = novos.email;
    if (alterados.indexOf("telefone") !== -1) registo.telefone = novos.telefone;
    if (alterados.indexOf("BI") !== -1) registo.bilhete = novos.bilhete;
    if (alterados.indexOf("endereço") !== -1) registo.endereco = novos.endereco;
    if (alterados.indexOf("sexo") !== -1) registo.sexo = novos.sexo;
    if (alterados.indexOf("password") !== -1) registo.password = novos.password;
    if (alterados.indexOf("data de nascimento") !== -1) {
      registo.data = novos.data;
      registo.idade = V.calcularIdade(V.lerDataIso(novos.data), new Date());
    }
    registo.atualizadoEm = new Date().toISOString();

    // as marcações ligam-se à conta pelo email: acompanham a mudança
    var marcacoes = lerLista(CHAVE_MARCACOES);
    var marcacoesMudaram = false;
    if (alterados.indexOf("email") !== -1 || alterados.indexOf("nome") !== -1) {
      marcacoes.forEach(function (m) {
        if (m.email_marcador_servico === emailAntigo) {
          if (alterados.indexOf("email") !== -1)
            m.email_marcador_servico = registo.email;
          if (alterados.indexOf("nome") !== -1)
            m.nome_marcador_servico = registo.nome;
          marcacoesMudaram = true;
        }
      });
    }

    var pacientesAntes = localStorage.getItem(CHAVE_PACIENTES);
    var marcacoesAntes = localStorage.getItem(CHAVE_MARCACOES);
    try {
      V.guardarPacientes(pacientes);
      if (marcacoesMudaram)
        localStorage.setItem(CHAVE_MARCACOES, JSON.stringify(marcacoes));
      if (alterados.indexOf("nome") !== -1) {
        localStorage.setItem(
          CHAVE_LETRA,
          JSON.stringify(registo.nome.trim().charAt(0).toUpperCase()),
        );
      }
    } catch (erro) {
      // desfaz o que já tinha sido escrito, para não ficar a meio
      try {
        if (pacientesAntes !== null)
          localStorage.setItem(CHAVE_PACIENTES, pacientesAntes);
        if (marcacoesAntes !== null)
          localStorage.setItem(CHAVE_MARCACOES, marcacoesAntes);
      } catch (erro2) {}
      escreverResumo(
        "Não foi possível guardar as alterações neste navegador. Verifique se o armazenamento não está bloqueado e tente de novo.",
      );
      return;
    }

    // atualizar o ecrã: formulário, painel e avatar do header
    preencher(registo);
    CAMPOS.forEach(function (campo) {
      campo.tocado = false;
      mostrarEstado(campo, "");
      campo.bloco.classList.remove("valido");
    });
    atualizarObrigatoriedadeDaAtual();
    window.Sessao.atualizarConta();

    sucesso.replaceChildren();
    var titulo = document.createElement("p");
    var forte = document.createElement("strong");
    forte.textContent = "Dados atualizados com sucesso!";
    titulo.append(forte);
    var detalhe = document.createElement("p");
    detalhe.textContent = "Alterado: " + alterados.join(", ") + ".";
    sucesso.append(titulo, detalhe);
    sucesso.hidden = false;
    sucesso.focus();
    sucesso.scrollIntoView({ block: "center" });
  });
})();
