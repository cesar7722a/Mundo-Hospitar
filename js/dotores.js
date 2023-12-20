

const usuarios = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];
const dotores = JSON.parse(localStorage.getItem(`dotore_admin`)) || [];


function renderDotor() {

  document.querySelector(`.card-doctor`).innerHTML ="";

  dotores.map((element) => {
    
    // let card_dotor = document.querySelector(`.modelo`).cloneNode(true);
    let div_modelo = document.createElement("div");
    let div_descricao_doctor = document.createElement("div");
    let section_img = document.createElement("section");
    let section_desc_doctor= document.createElement("section");
    let section_desc_info = document.createElement("section");
    let h2_nome = document.createElement("h2");
    let h3_especialidade = document.createElement("h3");
    let p_descricao = document.createElement("p");
    let button_marcar_dotor = document.createElement("button");
    let img_dotor = document.createElement("img");
   
      div_modelo.setAttribute(`class`,`doctor modelo`);
      div_descricao_doctor.setAttribute(`class`,`descricao-doctor`);
      section_desc_doctor.setAttribute(`class`,`desc-doctor`);
      section_desc_info.setAttribute(`class`,`desc-info`);
      img_dotor.setAttribute(`src`,`${element.imagem}`);

      h2_nome.innerHTML = element.nome;
      h3_especialidade.innerHTML = element.especialidade;
      p_descricao.innerHTML = element.descricao;
      button_marcar_dotor.innerHTML = "marcar com doctor";
    
      section_img.appendChild(img_dotor);
      section_desc_doctor.appendChild(h2_nome);
      section_desc_doctor.appendChild(h3_especialidade);
      section_desc_info.appendChild(p_descricao);
      section_desc_info.appendChild(button_marcar_dotor);

      div_descricao_doctor.appendChild(section_desc_doctor);
      div_descricao_doctor.appendChild(section_desc_info);
      div_modelo.appendChild(section_img);
      div_modelo.appendChild(div_descricao_doctor);

      button_marcar_dotor.addEventListener(`click`,()=>{
        mostraMoodal();
      });
    
    document.querySelector(`.card-doctor`).append(div_modelo);
  });
}

renderDotor();









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

function mostraMoodal() {
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
}
function savePrimeiraLetraUserLogado(priLetra) {
  localStorage.setItem(`userParaLogar`, JSON.stringify(priLetra));
}
window.onscroll = function() {
  document.querySelector(`header`).style.boxShadow = `0px 2px 15px rgba(0, 0, 0, 0.1)`;
};

document.querySelector(`.bt-login`).onclick=mostraMoodal;
document.querySelector(`.btnADDCancel .btCancelar`).onclick=Cancel;
document.querySelector(`main .modalDados-errados .cardDados-errados button`).onclick=Cancel_modalDados_errados;