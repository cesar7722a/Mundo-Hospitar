
const usuarios = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];
var service =  JSON.parse(localStorage.getItem(`servico_mundo_hospitalar`)) || [];

var arrayPesquisa = service;
let ul = document.querySelector(`.card-service ul`);
let section_renderService = document.querySelector(`main .card-service ul section`);
const ce = (el)=>document.createElement(el);

// .toFixed(2)
function renderServico() {
  section_renderService.innerHTML = "";
  arrayPesquisa.map(element => {
      
     let li = ce("li");
     let h4_nome = ce("h4");
     let h4_preco = ce("h4");
     let h4_dias = ce("h4");
     let h4_button = ce("h4");
     let button_marcar = ce("button");

    button_marcar.innerHTML=`Marcar`

     h4_nome.innerHTML = element.nome;
     h4_preco.innerHTML = `${JSON.parse(element.preco).toFixed(2)}  Kz`;
     h4_dias.innerHTML = element.dias;
    
      h4_button.appendChild(button_marcar);
      button_marcar.onclick = mostraMoodal;

    li.appendChild(h4_nome);
    li.appendChild(h4_preco);
    li.appendChild(h4_dias);
    li.appendChild(h4_button);
    section_renderService.append(li);
    ul.appendChild(section_renderService);
  });
};

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

/*area pesquisa*/
document.querySelector(`#inputPesquisa`).addEventListener(`keyup`, (event) => {
  const search = event.target.value;
    const arrayElemento = arrayPesquisa.filter((element) => element.nome.toLowerCase().includes(search.toLowerCase()));
      if (search == "" || search.trim()=="") {
        arrayPesquisa = service;
      } else {
         if ( arrayElemento.length > 0) {
          arrayPesquisa = arrayElemento;
         } else {
          section_renderService.innerHTML = `<div><h1>Serviço NÃO Encontrado!</h1></div>`;
          return
         }
      }
      renderServico();
  });

  function savePosPaciente(posicao){
    localStorage.setItem(`posPaciente_mundo_hospitalar`,JSON.stringify(posicao));
  }
  function savePrimeiraLetraUserLogado(priLetra) {
    localStorage.setItem(`userParaLogar`, JSON.stringify(priLetra));
  }
window.onscroll = function() {
  document.querySelector(`header`).style.boxShadow = `0px 2px 15px rgba(0, 0, 0, 0.1)`;
};

renderServico();
document.querySelector(`.bt-login`).onclick=mostraMoodal;
document.querySelector(`.btnADDCancel .btCancelar`).onclick=Cancel;
document.querySelector(`main .modalDados-errados .cardDados-errados button`).onclick=Cancel_modalDados_errados;