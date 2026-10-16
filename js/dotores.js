/**
 * Login e modais de login / erro.
 * (A lista de doutores e o modal de perfil estão em js/doutores-lista.js)
 */

const usuarios =
  JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];

let gatilhoLogin = null; // elemento que abriu o modal (para devolver o foco)

/* ---------- Login ---------- */

document.querySelector(`.login`).addEventListener(`click`, () => {
  const valorEmail = document.querySelector(`#inputEmail`).value;
  const valorPassword = document.querySelector(`#inputPassword`).value;

  // Email e password têm de ser do MESMO utilizador
  const posicao = usuarios.findIndex(
    (item) => item.email == valorEmail && item.password == valorPassword,
  );

  if (posicao > -1) {
    savePrimeiraLetraUserLogado(usuarios[posicao].nome.slice(0, 1));
    savePosPaciente(posicao);
    window.location.replace("userLogado.html");
  } else {
    modalDados_errados();
  }
});

// Enter nos campos faz login (o formulário não tem botão submit)
document.querySelectorAll(`#form-login input`).forEach((campo) => {
  campo.addEventListener(`keydown`, (e) => {
    if (e.key === `Enter`) {
      e.preventDefault();
      document.querySelector(`.login`).click();
    }
  });
});

/* ---------- Modal de login ---------- */

function mostraMoodal() {
  gatilhoLogin = document.activeElement;
  document.querySelector(`.modalLogin`).style.opacity = 0;
  document.querySelector(`.modalLogin`).style.display = "flex";
  setTimeout(() => {
    document.querySelector(`.modalLogin`).style.opacity = 1;
    document.querySelector(`#inputEmail`).focus();
  }, 200);
}

function Cancel() {
  document.querySelector(`.modalLogin`).style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modalLogin`).style.display = "none";
    document.querySelector(`.modalLogin`).style.opacity = 0;
  }, 200);
  document.querySelector(`#inputEmail`).value = "";
  document.querySelector(`#inputPassword`).value = "";
  if (gatilhoLogin && gatilhoLogin.focus) gatilhoLogin.focus();
}

/* ---------- Modal de erro ---------- */

function modalDados_errados() {
  document.querySelector(`.modalDados-errados`).style.opacity = 0;
  document.querySelector(`.modalDados-errados`).style.display = "flex";
  setTimeout(() => {
    document.querySelector(`.modalDados-errados`).style.opacity = 1;
    document.querySelector(`.modalDados-errados button`).focus();
  }, 200);
}

function Cancel_modalDados_errados() {
  document.querySelector(`.modalDados-errados`).style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modalDados-errados`).style.display = "none";
    document.querySelector(`.modalDados-errados`).style.opacity = 0;
  }, 200);
  document.querySelector(`#inputEmail`).focus();
}

// Esc fecha o modal que estiver aberto (primeiro o de erro, que fica por cima)
document.addEventListener(`keydown`, (e) => {
  if (e.key !== `Escape`) return;
  const erro = document.querySelector(`.modalDados-errados`);
  const login = document.querySelector(`.modalLogin`);
  if (getComputedStyle(erro).display !== `none`) {
    Cancel_modalDados_errados();
  } else if (getComputedStyle(login).display !== `none`) {
    Cancel();
  }
});

/* ---------- Sessão ---------- */

function savePosPaciente(posicao) {
  localStorage.setItem(`posPaciente_mundo_hospitalar`, JSON.stringify(posicao));
}
function savePrimeiraLetraUserLogado(priLetra) {
  localStorage.setItem(`userParaLogar`, JSON.stringify(priLetra));
}

/* ---------- Header (comportamento original) ---------- */

window.onscroll = function () {
  document.querySelector(`header`).style.boxShadow =
    `0px 2px 15px rgba(0, 0, 0, 0.1)`;
};

document.querySelector(`.bt-login`).onclick = mostraMoodal;
document.querySelector(`.btnADDCancel .btCancelar`).onclick = Cancel;
document.querySelector(
  `main .modalDados-errados .cardDados-errados button`,
).onclick = Cancel_modalDados_errados;
