/**
 * Cadastro de pacientes.
 *
 * Armazenamento: o array de pacientes é lido do localStorage, alterado em
 * memória e guardado de volta. (Só um array em memória perder-se-ia ao mudar
 * de página; o localStorage é o que permite ao login e ao resto do site
 * encontrarem o paciente.)
 *
 * As chaves e os nomes dos campos são os mesmos de sempre, para o login
 * (js/layout.js) continuarem a funcionar.
 *
 * NOTA: num projeto real isto iria para um servidor, com a password cifrada
 * (hash). No localStorage qualquer pessoa vê os dados no DevTools.
 */
(function () {
  "use strict";

  /* ==================== Configuração ==================== */

  var CHAVE_PACIENTES = "pacientes_mundo_hospitalar";
  var CHAVE_LETRA = "userParaLogar";
  var CHAVE_POSICAO = "posPaciente_mundo_hospitalar";
  // Depois de criar a conta volta ao sítio de onde veio (?voltar=servico.html);
  // só aceita páginas do próprio site.
  var PAGINA_INICIAL = "index.html";
  var PAGINA_DESTINO = (function () {
    var voltar = new URLSearchParams(location.search).get("voltar") || "";
    return /^[A-Za-z0-9_.-]+\.html(\?[A-Za-z0-9=&_.-]*)?$/.test(voltar) &&
      voltar.indexOf("cadastrarUser") !== 0
      ? voltar
      : PAGINA_INICIAL;
  })();
  var ATRASO_REDIRECIONAR_MS = 1500;

  var IDADE_MINIMA = 16;
  var IDADE_MAXIMA = 120;

  var SEXOS = {
    masculino: "Masculino",
    feminino: "Feminino",
    "nao-dizer": "Sexo não definido",
  };

  var PARTICULAS_NOME = ["de", "da", "do", "das", "dos", "e"];

  /* ==================== Armazenamento ==================== */

  function lerPacientes() {
    try {
      var valor = JSON.parse(localStorage.getItem(CHAVE_PACIENTES));
      return Array.isArray(valor) ? valor : [];
    } catch (erro) {
      return [];
    }
  }

  /** Pode lançar erro (armazenamento bloqueado ou cheio). */
  function guardarPacientes(lista) {
    localStorage.setItem(CHAVE_PACIENTES, JSON.stringify(lista));
  }

  function iniciarSessao(posicao, nome) {
    localStorage.setItem(
      CHAVE_LETRA,
      JSON.stringify(String(nome).slice(0, 1).toUpperCase()),
    );
    localStorage.setItem(CHAVE_POSICAO, JSON.stringify(posicao));
  }

  function emailJaExiste(email) {
    return lerPacientes().some(function (p) {
      return String(p.email).trim().toLowerCase() === email;
    });
  }

  function bilheteJaExiste(bilhete) {
    return lerPacientes().some(function (p) {
      return String(p.bilhete).replace(/[\s-]/g, "").toUpperCase() === bilhete;
    });
  }

  /* ==================== Normalização ==================== */

  function limparEspacos(valor) {
    return String(valor).replace(/\s+/g, " ").trim();
  }

  function capitalizarNome(valor) {
    return limparEspacos(valor)
      .split(" ")
      .map(function (palavra, i) {
        var minuscula = palavra.toLowerCase();
        if (i > 0 && PARTICULAS_NOME.indexOf(minuscula) !== -1)
          return minuscula;
        return minuscula
          .split("-")
          .map(function (parte) {
            return parte.charAt(0).toUpperCase() + parte.slice(1);
          })
          .join("-");
      })
      .join(" ");
  }

  function normalizarEmail(valor) {
    return String(valor).trim().toLowerCase();
  }

  function normalizarBilhete(valor) {
    return String(valor).replace(/[\s-]/g, "").toUpperCase();
  }

  /** Remove espaços, hífens e o indicativo de Angola (+244 / 00244 / 244). */
  function normalizarTelefone(valor) {
    var digitos = String(valor).replace(/[\s().-]/g, "");
    if (digitos.indexOf("+244") === 0) return digitos.slice(4);
    if (digitos.indexOf("00244") === 0) return digitos.slice(5);
    if (/^244\d{9}$/.test(digitos)) return digitos.slice(3);
    return digitos;
  }

  function formatarTelefone(digitos) {
    return digitos.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
  }

  /* ==================== Datas ==================== */

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

  /** Lê "AAAA-MM-DD" e devolve uma Date real, ou null se a data não existir. */
  function lerDataIso(iso) {
    var partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!partes) return null;
    var ano = Number(partes[1]);
    var mes = Number(partes[2]);
    var dia = Number(partes[3]);
    var data = new Date(ano, mes - 1, dia);
    var existe =
      data.getFullYear() === ano &&
      data.getMonth() === mes - 1 &&
      data.getDate() === dia;
    return existe ? data : null;
  }

  /** Idade completa, tendo em conta o mês e o dia (não só o ano). */
  function calcularIdade(nascimento, hoje) {
    var idade = hoje.getFullYear() - nascimento.getFullYear();
    var antesDoAniversario =
      hoje.getMonth() < nascimento.getMonth() ||
      (hoje.getMonth() === nascimento.getMonth() &&
        hoje.getDate() < nascimento.getDate());
    return antesDoAniversario ? idade - 1 : idade;
  }

  /* ==================== Validações ====================
     Cada função devolve "" se estiver tudo bem, ou a mensagem de erro. */

  function validarNome(valor) {
    var nome = limparEspacos(valor);
    if (!nome) return "Indique o seu nome completo.";
    if (!/^[\p{L}][\p{L}'’ -]*$/u.test(nome)) {
      return "Use apenas letras, espaços, hífen ou apóstrofo.";
    }
    var palavras = nome.split(" ");
    if (palavras.length < 2) return "Indique pelo menos o nome e o apelido.";
    if (palavras[0].length < 2 || palavras[palavras.length - 1].length < 2) {
      return "O nome e o apelido devem ter pelo menos 2 letras.";
    }
    if (nome.length > 80) return "O nome é demasiado longo (máximo 80).";
    return "";
  }

  function validarData(valor, hoje) {
    if (!valor) return "Indique a data de nascimento.";
    var nascimento = lerDataIso(valor);
    if (!nascimento) return "Data inválida.";
    if (nascimento > hoje)
      return "A data de nascimento não pode ser no futuro.";
    var idade = calcularIdade(nascimento, hoje);
    if (idade < IDADE_MINIMA) {
      return (
        "Tem de ter pelo menos " + IDADE_MINIMA + " anos para criar conta."
      );
    }
    if (idade > IDADE_MAXIMA) return "Verifique a data de nascimento.";
    return "";
  }

  function validarSexo(valor) {
    return SEXOS[valor] ? "" : "Escolha uma opção.";
  }

  function validarBilhete(valor) {
    var bilhete = normalizarBilhete(valor);
    if (!bilhete) return "Indique o número do BI.";
    if (!/^\d{9}[A-Z]{2}\d{3}$/.test(bilhete)) {
      return "BI inválido. Formato: 9 números, 2 letras e 3 números (ex.: 000123456LA043).";
    }
    if (bilheteJaExiste(bilhete)) {
      return "Já existe uma conta com este número de BI.";
    }
    return "";
  }

  function validarEmail(valor) {
    var email = normalizarEmail(valor);
    if (!email) return "Indique o seu email.";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return "Email inválido. Exemplo: nome@gmail.com.";
    }
    if (emailJaExiste(email)) {
      return "Já existe uma conta com este email. Faça login.";
    }
    return "";
  }

  function validarTelefone(valor) {
    var telefone = normalizarTelefone(valor);
    if (!telefone) return "Indique o seu número de telefone.";
    if (!/^[29]\d{8}$/.test(telefone)) {
      return "Número inválido. Use 9 dígitos, por exemplo 926 614 139.";
    }
    return "";
  }

  function validarEndereco(valor) {
    var endereco = limparEspacos(valor);
    if (!endereco) return "Indique o seu endereço.";
    if (endereco.length < 5) return "O endereço é demasiado curto.";
    if (endereco.length > 120)
      return "O endereço é demasiado longo (máximo 120).";
    return "";
  }

  function validarPassword(valor) {
    if (!valor) return "Crie uma password.";
    if (valor.length < 8) return "A password deve ter pelo menos 8 caracteres.";
    if (valor.length > 64) return "A password é demasiado longa (máximo 64).";
    if (!/[A-Za-z]/.test(valor) || !/\d/.test(valor)) {
      return "A password deve ter letras e números.";
    }
    return "";
  }

  function validarConfirmacao(valor, password) {
    if (!valor) return "Repita a password.";
    if (valor !== password) return "As passwords não coincidem.";
    return "";
  }

  /** 0 a 5 pontos -> "", "fraca", "media" ou "forte". */
  function nivelDaPassword(valor) {
    if (!valor) return "";
    var pontos = 0;
    if (valor.length >= 8) pontos++;
    if (valor.length >= 12) pontos++;
    if (/[a-z]/.test(valor) && /[A-Z]/.test(valor)) pontos++;
    if (/\d/.test(valor)) pontos++;
    if (/[^A-Za-z0-9]/.test(valor)) pontos++;
    if (pontos <= 2) return "fraca";
    if (pontos === 3) return "media";
    return "forte";
  }

  /* ==================== Elementos ==================== */

  var form = document.getElementById("form-cadastro");
  if (!form) return;

  var resumo = document.getElementById("resumo-erros");
  var sucesso = document.getElementById("sucesso");
  var botaoEnviar = form.querySelector('[type="submit"]');
  var campoPassword = document.getElementById("inputPassword");
  var blocoForca = document.getElementById("forca-password");
  var textoForca = document.getElementById("forca-texto");

  /** Ordem do ecrã: é a ordem do resumo de erros. */
  var CAMPOS = [
    { chave: "nome", id: "inputNome", rotulo: "Nome", validar: validarNome },
    {
      chave: "data",
      id: "inputData",
      rotulo: "Data de nascimento",
      validar: function (v) {
        return validarData(v, new Date());
      },
    },
    { chave: "sexo", id: "selectSexo", rotulo: "Sexo", validar: validarSexo },
    { chave: "bilhete", id: "inputBI", rotulo: "BI", validar: validarBilhete },
    {
      chave: "email",
      id: "inputEmail",
      rotulo: "Email",
      validar: validarEmail,
    },
    {
      chave: "telefone",
      id: "inputTelefone",
      rotulo: "Telefone",
      validar: validarTelefone,
    },
    {
      chave: "endereco",
      id: "inputEndereco",
      rotulo: "Endereço",
      validar: validarEndereco,
    },
    {
      chave: "password",
      id: "inputPassword",
      rotulo: "Password",
      validar: validarPassword,
    },
    {
      chave: "confirmar",
      id: "inputConfirmar",
      rotulo: "Repetir password",
      validar: function (v) {
        return validarConfirmacao(v, campoPassword.value);
      },
    },
  ];

  CAMPOS.forEach(function (campo) {
    campo.input = document.getElementById(campo.id);
    campo.bloco = form.querySelector('[data-campo="' + campo.chave + '"]');
    campo.erro = document.getElementById("erro-" + campo.chave);
    campo.tocado = false;
  });

  function campoPorChave(chave) {
    return CAMPOS.filter(function (c) {
      return c.chave === chave;
    })[0];
  }

  /* ==================== Mostrar estados ==================== */

  function mostrarEstado(campo, mensagem) {
    campo.erro.textContent = mensagem;
    campo.input.setAttribute("aria-invalid", mensagem ? "true" : "false");
    campo.bloco.classList.toggle("invalido", Boolean(mensagem));
    campo.bloco.classList.toggle(
      "valido",
      !mensagem && campo.input.value !== "",
    );
  }

  /** Valida um campo e, se for pedido, mostra o resultado. Devolve a mensagem. */
  function validarCampo(campo, mostrar) {
    var mensagem = campo.validar(campo.input.value);
    if (mostrar) mostrarEstado(campo, mensagem);
    return mensagem;
  }

  function atualizarForca() {
    var nivel = nivelDaPassword(campoPassword.value);
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

  /* ==================== Eventos dos campos ==================== */

  CAMPOS.forEach(function (campo) {
    // Só mostra erros depois de o utilizador sair do campo...
    campo.input.addEventListener("blur", function () {
      campo.tocado = true;

      if (campo.chave === "telefone") {
        var digitos = normalizarTelefone(campo.input.value);
        if (/^[29]\d{8}$/.test(digitos))
          campo.input.value = formatarTelefone(digitos);
      }
      if (campo.chave === "nome" && !validarNome(campo.input.value)) {
        campo.input.value = capitalizarNome(campo.input.value);
      }
      validarCampo(campo, true);
    });

    // ...e depois disso corrige em tempo real, enquanto escreve
    campo.input.addEventListener("input", function () {
      if (campo.chave === "password") {
        atualizarForca();
        var confirmar = campoPorChave("confirmar");
        if (confirmar.tocado) validarCampo(confirmar, true);
      }
      if (campo.tocado) validarCampo(campo, true);
    });

    // Data e sexo mudam de uma vez (seletor nativo)
    if (campo.input.tagName === "SELECT" || campo.input.type === "date") {
      campo.input.addEventListener("change", function () {
        campo.tocado = true;
        validarCampo(campo, true);
      });
    }
  });

  // Mostrar / ocultar password
  Array.prototype.forEach.call(
    form.querySelectorAll(".btn-mostrar"),
    function (botao) {
      botao.addEventListener("click", function () {
        var input = document.getElementById(
          botao.getAttribute("aria-controls"),
        );
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

  // A data só deixa escolher idades possíveis (a validação em JS continua a mandar)
  (function limitarData() {
    var hoje = new Date();
    var maxima = new Date(
      hoje.getFullYear() - IDADE_MINIMA,
      hoje.getMonth(),
      hoje.getDate(),
    );
    var minima = new Date(
      hoje.getFullYear() - IDADE_MAXIMA,
      hoje.getMonth(),
      hoje.getDate(),
    );
    var data = document.getElementById("inputData");
    data.max = paraIso(maxima);
    data.min = paraIso(minima);
  })();

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

  /* ==================== Envio ==================== */

  function criarRegisto() {
    var hoje = new Date();
    var nascimento = lerDataIso(campoPorChave("data").input.value);

    return {
      nome: capitalizarNome(campoPorChave("nome").input.value),
      email: normalizarEmail(campoPorChave("email").input.value),
      password: campoPassword.value,
      telefone: normalizarTelefone(campoPorChave("telefone").input.value),
      bilhete: normalizarBilhete(campoPorChave("bilhete").input.value),
      endereco: limparEspacos(campoPorChave("endereco").input.value),
      idade: calcularIdade(nascimento, hoje),
      sexo: SEXOS[campoPorChave("sexo").input.value],
      data: campoPorChave("data").input.value,
      servico_solicitado: [],
      criadoEm: hoje.toISOString(),
    };
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (botaoEnviar.disabled) return;

    var erros = [];
    CAMPOS.forEach(function (campo) {
      campo.tocado = true;
      var mensagem = validarCampo(campo, true);
      if (mensagem) erros.push({ campo: campo, mensagem: mensagem });
    });

    if (erros.length) {
      escreverResumo(
        erros.length === 1
          ? "Corrija 1 campo antes de continuar:"
          : "Corrija " + erros.length + " campos antes de continuar:",
        erros,
      );
      return;
    }

    esconderResumo();

    var pacientes = lerPacientes();
    var registo = criarRegisto();
    pacientes.push(registo);

    try {
      guardarPacientes(pacientes);
      iniciarSessao(pacientes.length - 1, registo.nome);
    } catch (erro) {
      escreverResumo(
        "Não foi possível guardar os dados neste navegador. Verifique se o armazenamento não está bloqueado e tente de novo.",
      );
      return;
    }

    botaoEnviar.disabled = true;
    form.querySelectorAll("input, select, button").forEach(function (el) {
      el.disabled = true;
    });
    sucesso.querySelector("a").href = PAGINA_DESTINO;
    sucesso.hidden = false;
    sucesso.scrollIntoView({ block: "center" });

    setTimeout(function () {
      window.location.replace(PAGINA_DESTINO);
    }, ATRASO_REDIRECIONAR_MS);
  });
})();
