
const primeiraLetra_usuarioLgado = (JSON.parse(localStorage.getItem(`userParaLogar`)) || []).toUpperCase();

const usuarios = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];
document.querySelector(`#nome_user_cadastrado`).innerHTML =JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`))[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].nome;

document.querySelector(`#editar_user_cadastrado`).addEventListener(`click`,()=>{
  window.location.href = "pageEditar.html"
});

let currentSlider = 0;
let totalSliders = document.querySelectorAll(`main .testemunho .container-testemunho .img-icons`).length;

document.querySelector(`main .testemunho .container-testemunho .slider-testemunho`).style.width = `calc(100vw * ${totalSliders})`;

function goPrev() {
   currentSlider--;
   if(currentSlider < 0){
    currentSlider = totalSliders - 1;
   }
   updateMargin();
}
function goNext() {
   currentSlider++;
   if(currentSlider > (totalSliders-1)){
    currentSlider = 0;
   }
   document.querySelector(`.slider-controlls_1`)
   updateMargin();
}
function updateMargin() {
  let sliderWidthItem = document.querySelector(`main .testemunho .container-testemunho .img-icons`).clientWidth;
  let newMargin = (currentSlider * sliderWidthItem);
   document.querySelector(`main .testemunho .container-testemunho .slider-testemunho`).style.marginLeft= `-${newMargin}px`
}
setInterval(goNext, 5000);


function mostar_opcoes_sair_user() {
  document.querySelector('header .menu .userLogado .descUser').style.opacity = 0;
  setTimeout(() => {
    document.querySelector(`header .menu .userLogado .descUser`).style.display = "flex";
    document.querySelector('header .menu .userLogado .descUser').style.opacity = 1;
  }, 200);
}
function mostar_opcoes_sair_user_fechar() {
  document.querySelector('header .menu .userLogado .descUser').style.opacity = 1;
  setTimeout(() => {
    document.querySelector('header .menu .userLogado .descUser').style.display = "none";
    document.querySelector('header .menu .userLogado .descUser').style.opacity = 0;
  }, 200);
}

document.querySelector(`header .menu .userLogado .dadosUser`).innerHTML= `<h1>${primeiraLetra_usuarioLgado}</h1>`;
document.querySelector(`header .menu .userLogado .descUser .cardNomeUser span`).innerHTML= `<h1>${primeiraLetra_usuarioLgado}</h1>`;

document.querySelector(`.bt-sair-userLogado`).addEventListener(`click`, ()=>{
  localStorage.removeItem(`userParaLogar`);
  localStorage.removeItem(`posPaciente_mundo_hospitalar`);
  window.location.replace("index.html");
});

document.querySelector(`header .menu .userLogado .dadosUser`).onclick = mostar_opcoes_sair_user;
document.querySelector(`header .menu .userLogado .descUser .cardNomeUser section#bt-fechar-card-user-logado h1`).onclick = mostar_opcoes_sair_user_fechar;

window.onscroll = function() {
  document.querySelector(`header`).style.boxShadow = `0px 2px 15px rgba(0, 0, 0, 0.1)`;
};