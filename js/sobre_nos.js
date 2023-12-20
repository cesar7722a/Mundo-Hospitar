
const usuarios = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];

let currentSlider = 0;
let totalSliders = document.querySelectorAll(`main .testemunho .container-testemunho .img-icons`).length;

document.querySelector(`main .testemunho .container-testemunho .slider-testemunho`).style.width = `calc(100vw * ${totalSliders})`;

function goPrev() {
   currentSlider--;
   if(currentSlider < 0){
    currentSlider = totalSliders - 1;
   }
   updateMargin();
};

function goNext() {
   currentSlider++;
   if(currentSlider > (totalSliders-1)){
    currentSlider = 0;
   }
   document.querySelector(`.slider-controlls_1`)
   updateMargin();
};

function updateMargin() {
  let sliderWidthItem = document.querySelector(`main .testemunho .container-testemunho .img-icons`).clientWidth;
  let newMargin = (currentSlider * sliderWidthItem);
   document.querySelector(`main .testemunho .container-testemunho .slider-testemunho`).style.marginLeft= `-${newMargin}px`
};
setInterval(goNext, 5000);

document.querySelector(`.login`).addEventListener(`click`,()=>{
  let valorEmali =  document.querySelector(`#inputEmail`).value;
  let valorPassword = document.querySelector(`#inputPassword`).value;

  let verifacar_Emai_Existencia = usuarios.findIndex((item) => item.email == valorEmali);
  let verifacar_password_Existencia = usuarios.findIndex((item)=> item.password == valorPassword);
    if(verifacar_Emai_Existencia >-1  && verifacar_password_Existencia >-1 ){
      savePrimeiraLetraUserLogado(usuarios[verifacar_Emai_Existencia].nome.slice(0,1));
      savePosPaciente(verifacar_Emai_Existencia);
      window.location.replace("userLogado.html");
    }else{
      modalDados_errados ();
    }
});








function mostraMoodal () {
  document.querySelector('.modalLogin').style.opacity = 0;
  document.querySelector(`.modalLogin`).style.display = "flex";
  setTimeout(() => {
    document.querySelector('.modalLogin').style.opacity = 1;
  }, 200);
};

function Cancel() {
  document.querySelector('.modalLogin').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modalLogin`).style.display = "none";
    document.querySelector('.modalLogin').style.opacity = 0;
  }, 200);
  document.querySelector(`#inputEmail`).value = "";
  document.querySelector(`#inputPassword`).value = "";
};

function modalDados_errados () {
  document.querySelector('.modalDados-errados').style.opacity = 0;
  document.querySelector(`.modalDados-errados`).style.display = "flex";
  setTimeout(() => {
    document.querySelector('.modalDados-errados').style.opacity = 1;
  }, 200);
};

function Cancel_modalDados_errados() {
  document.querySelector('.modalDados-errados').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modalDados-errados`).style.display = "none";
    document.querySelector('.modalDados-errados').style.opacity = 0;
  }, 200);
};

function savePosPaciente(posicao){
  localStorage.setItem(`posPaciente_mundo_hospitalar`,JSON.stringify(posicao));
};

function savePrimeiraLetraUserLogado(priLetra) {
  localStorage.setItem(`userParaLogar`, JSON.stringify(priLetra));
};

window.onscroll = function() {
  document.querySelector(`header`).style.boxShadow = `0px 2px 15px rgba(0, 0, 0, 0.1)`;
};

document.querySelector(`.bt-login`).onclick=mostraMoodal;
document.querySelector(`.btnADDCancel .btCancelar`).onclick=Cancel;
document.querySelector(`main .modalDados-errados .cardDados-errados button`).onclick=Cancel_modalDados_errados;