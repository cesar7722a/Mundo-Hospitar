
const primeiraLetra_usuarioLgado = (JSON.parse(localStorage.getItem(`userParaLogar`)) || []).toUpperCase();

const usuarios = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];
document.querySelector(`#nome_user_cadastrado`).innerHTML =JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`))[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].nome;

document.querySelector(`#editar_user_cadastrado`).addEventListener(`click`,()=>{
  window.location.href = "pageEditar.html"
});

document.querySelector(`#editar_user_cadastrado`).addEventListener(`click`,()=>{
  window.location.href = "pageEditar.html"
});

const dotores = JSON.parse(localStorage.getItem(`dotore_admin`)) || [];


function renderDotor() {

  document.querySelector(`.card-doctor`).innerHTML ="";

  dotores.map((element) => {

    var posicao_dotor_marcar = dotores.indexOf(element);
    
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
        mostrar_modal_dotor_escolhido();
        savePosDotor(posicao_dotor_marcar);
      });
    
    document.querySelector(`.card-doctor`).append(div_modelo);
  });
}

renderDotor();

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

document.querySelector(`header .menu .userLogado .dadosUser`).innerHTML= primeiraLetra_usuarioLgado;
document.querySelector(`header .menu .userLogado .descUser .cardNomeUser span`).innerHTML= `<h1>${primeiraLetra_usuarioLgado}</h1>`;

document.querySelector(`.bt-sair-userLogado`).addEventListener(`click`, ()=>{
  localStorage.removeItem(`userParaLogar`);
  localStorage.removeItem(`posPaciente_mundo_hospitalar`);
  window.location.replace("index.html");
});

document.querySelector(`header .menu .userLogado .dadosUser`).innerHTML= `<h1>${primeiraLetra_usuarioLgado}</h1>`;
document.querySelector(`header .menu .userLogado .dadosUser`).onclick = mostar_opcoes_sair_user;
document.querySelector(`header .menu .userLogado .descUser .cardNomeUser section#bt-fechar-card-user-logado h1`).onclick = mostar_opcoes_sair_user_fechar;

window.onscroll = function() {
  document.querySelector(`header`).style.boxShadow = `0px 2px 15px rgba(0, 0, 0, 0.1)`;
};

function mostrar_modal_dotor_escolhido() {
  document.querySelector('.modal_modal_dotor_escolhido').style.opacity = 0;
  setTimeout(() => {
    document.querySelector(`.modal_modal_dotor_escolhido`).style.display = "flex";
    document.querySelector('.modal_modal_dotor_escolhido').style.opacity = 1;
  }, 200);
}

function cancelmostrar_modal_dotor_escolhido() {
  document.querySelector('.modal_modal_dotor_escolhido').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modal_modal_dotor_escolhido`).style.display = "none";
    document.querySelector('.modal_modal_dotor_escolhido').style.opacity = 0;
  }, 200);
};

document.querySelector(`#bt_cancelar`).onclick = cancelmostrar_modal_dotor_escolhido;

document.querySelector(`#bt_escolher_servico`).addEventListener(`click` , ()=>{
   window.location.href = "userService.html";
})

function savePosDotor(posicao){
  localStorage.setItem(`posDootor_para_marcar`,JSON.stringify(posicao));
};