/**
 * Validações, normalizações e armazenamento de pacientes, partilhados por:
 *   - cadastrarUser.html (js/cadastro.js)
 *   - pageEditar.html    (js/editarPerfil.js)
 *
 * Cada validador devolve "" se estiver tudo bem, ou a mensagem de erro.
 * Os que comparam com contas existentes (email, BI) aceitam a posição de uma
 * conta a ignorar: na edição, o próprio utilizador não conta como repetido.
 *
 * Disponível em window.Validacoes.
 */
(function () {
  "use strict";

  var CHAVE_PACIENTES = "pacientes_mundo_hospitalar";

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

  /* ==================== Normalização ==================== */

  function limparEspacos(valor) {
    return String(valor == null ? "" : valor)
      .replace(/\s+/g, " ")
      .trim();
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
    return String(valor == null ? "" : valor)
      .trim()
      .toLowerCase();
  }

  function normalizarBilhete(valor) {
    return String(valor == null ? "" : valor)
      .replace(/[\s-]/g, "")
      .toUpperCase();
  }

  /** Remove espaços, hífens e o indicativo de Angola (+244 / 00244 / 244). */
  function normalizarTelefone(valor) {
    var digitos = String(valor == null ? "" : valor).replace(/[\s().-]/g, "");
    if (digitos.indexOf("+244") === 0) return digitos.slice(4);
    if (digitos.indexOf("00244") === 0) return digitos.slice(5);
    if (/^244\d{9}$/.test(digitos)) return digitos.slice(3);
    return digitos;
  }

  function formatarTelefone(digitos) {
    return digitos.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
  }

  /** "Masculino" / "Feminino" (ou o antigo "Femenino") -> chave do select. */
  function chaveDoSexo(texto) {
    var t = String(texto == null ? "" : texto).toLowerCase();
    if (t === "masculino") return "masculino";
    if (t === "feminino" || t === "femenino") return "feminino";
    return "nao-dizer";
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
    var partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
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

  /* ==================== Validadores ==================== */

  function nome(valor) {
    var texto = limparEspacos(valor);
    if (!texto) return "Indique o seu nome completo.";
    if (!/^[\p{L}][\p{L}'’ -]*$/u.test(texto)) {
      return "Use apenas letras, espaços, hífen ou apóstrofo.";
    }
    var palavras = texto.split(" ");
    if (palavras.length < 2) return "Indique pelo menos o nome e o apelido.";
    if (palavras[0].length < 2 || palavras[palavras.length - 1].length < 2) {
      return "O nome e o apelido devem ter pelo menos 2 letras.";
    }
    if (texto.length > 80) return "O nome é demasiado longo (máximo 80).";
    return "";
  }

  function data(valor, hoje) {
    if (!valor) return "Indique a data de nascimento.";
    var nascimento = lerDataIso(valor);
    if (!nascimento) return "Data inválida.";
    if (nascimento > hoje)
      return "A data de nascimento não pode ser no futuro.";
    var idade = calcularIdade(nascimento, hoje);
    if (idade < IDADE_MINIMA) {
      return "Tem de ter pelo menos " + IDADE_MINIMA + " anos para ter conta.";
    }
    if (idade > IDADE_MAXIMA) return "Verifique a data de nascimento.";
    return "";
  }

  function sexo(valor) {
    return SEXOS[valor] ? "" : "Escolha uma opção.";
  }

  function bilhete(valor, ignorarPosicao) {
    var b = normalizarBilhete(valor);
    if (!b) return "Indique o número do BI.";
    if (!/^\d{9}[A-Z]{2}\d{3}$/.test(b)) {
      return "BI inválido. Formato: 9 números, 2 letras e 3 números (ex.: 000123456LA043).";
    }
    var repetido = lerPacientes().some(function (p, i) {
      return i !== ignorarPosicao && normalizarBilhete(p.bilhete) === b;
    });
    return repetido ? "Já existe uma conta com este número de BI." : "";
  }

  function email(valor, ignorarPosicao) {
    var e = normalizarEmail(valor);
    if (!e) return "Indique o seu email.";
    if (e.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) {
      return "Email inválido. Exemplo: nome@gmail.com.";
    }
    var repetido = lerPacientes().some(function (p, i) {
      return i !== ignorarPosicao && normalizarEmail(p.email) === e;
    });
    return repetido ? "Já existe uma conta com este email." : "";
  }

  function telefone(valor) {
    var t = normalizarTelefone(valor);
    if (!t) return "Indique o seu número de telefone.";
    if (!/^[29]\d{8}$/.test(t)) {
      return "Número inválido. Use 9 dígitos, por exemplo 926 614 139.";
    }
    return "";
  }

  function endereco(valor) {
    var e = limparEspacos(valor);
    if (!e) return "Indique o seu endereço.";
    if (e.length < 5) return "O endereço é demasiado curto.";
    if (e.length > 120) return "O endereço é demasiado longo (máximo 120).";
    return "";
  }

  function password(valor) {
    if (!valor) return "Crie uma password.";
    if (valor.length < 8) return "A password deve ter pelo menos 8 caracteres.";
    if (valor.length > 64) return "A password é demasiado longa (máximo 64).";
    if (!/[A-Za-z]/.test(valor) || !/\d/.test(valor)) {
      return "A password deve ter letras e números.";
    }
    return "";
  }

  function confirmacao(valor, pass) {
    if (!valor) return "Repita a password.";
    if (valor !== pass) return "As passwords não coincidem.";
    return "";
  }

  /** "", "fraca", "media" ou "forte". */
  function nivelPassword(valor) {
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

  window.Validacoes = {
    IDADE_MINIMA: IDADE_MINIMA,
    IDADE_MAXIMA: IDADE_MAXIMA,
    SEXOS: SEXOS,
    lerPacientes: lerPacientes,
    guardarPacientes: guardarPacientes,
    limparEspacos: limparEspacos,
    capitalizarNome: capitalizarNome,
    normalizarEmail: normalizarEmail,
    normalizarBilhete: normalizarBilhete,
    normalizarTelefone: normalizarTelefone,
    formatarTelefone: formatarTelefone,
    chaveDoSexo: chaveDoSexo,
    paraIso: paraIso,
    lerDataIso: lerDataIso,
    calcularIdade: calcularIdade,
    nome: nome,
    data: data,
    sexo: sexo,
    bilhete: bilhete,
    email: email,
    telefone: telefone,
    endereco: endereco,
    password: password,
    confirmacao: confirmacao,
    nivelPassword: nivelPassword,
  };
})();
