
const usuarios = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];
var arrayPesquisa = usuarios;
var ul = document.querySelector(`.card_user ul`);
const ce = (el)=>document.createElement(el);
let inputName = document.querySelector(`#inputName`);
let inputPreco = document.querySelector(`#inputPreco`);
let inputDias = document.querySelector(`#inputDias`);
let contService = 0;

function renderUser() {
    ul.innerHTML = "";
    arrayPesquisa.map(element => {

    var posicao = arrayPesquisa.indexOf(element);
      
     let li = ce("li");
     let h4_nome = ce("h4");
     let h4_email = ce("h4");
     let section = ce("section");
     let icons_see = ce("i");
     let icons_elimine = ce("i");
     icons_elimine.setAttribute(`class`, `far fa-trash-can`);
     icons_see.setAttribute(`class`, `fa-solid fa-eye`);

     icons_elimine.addEventListener(`click`, ()=>{
          savePosPaciente(posicao);
          mostraMoodal_eliminar_paciente();
     });

     icons_see.addEventListener(`click`,()=> {
       mostrarModalPerfil(posicao);
     });

    section.setAttribute(`class`,`sectinIcons`)
    section.appendChild(icons_see);
    section.appendChild(icons_elimine);

     h4_nome.innerHTML = element.nome;
     h4_email.innerHTML = element.email;
     
    li.appendChild(h4_nome);
    li.appendChild(h4_email)
    li.appendChild(section);
    ul.appendChild(li);
  });
};

function eliminarUser() {
    usuarios.splice(JSON.parse(localStorage.getItem(`posPaciente_admin`)), 1);
    savarUserAdmin();;
    renderUser();
    cancelModal_eliminar_paciente();
};

function mostraMoodal_eliminar_paciente() {
  document.querySelector('.modal_alerte_elimnacao_user').style.opacity = 0;
  document.querySelector(`.modal_alerte_elimnacao_user`).style.display = "flex";
  setTimeout(() => {
    document.querySelector('.modal_alerte_elimnacao_user').style.opacity = 1;
  }, 200);
};

function mostrarModalPerfil(posicao) {
  document.querySelector('.modalPerfil_user').style.opacity = 0;
  document.querySelector(`.modalPerfil_user`).style.display = "flex";
  setTimeout(() => {
    document.querySelector('.modalPerfil_user').style.opacity = 1;
  }, 200);
  document.querySelector(`#nome_perfil`).append(usuarios[posicao].nome);
  document.querySelector(`#email_perfil`).append(usuarios[posicao].email);
  document.querySelector(`#telefone_perfil`).append(usuarios[posicao].telefone);
  document.querySelector(`#idade_perfil`).append(usuarios[posicao].idade);
  document.querySelector(`#endereco_perfil`).append(usuarios[posicao].endereco);
  document.querySelector(`#pass_perfil`).append(usuarios[posicao].password);
  document.querySelector(`#sexo_perfil`).append(usuarios[posicao].sexo);
  document.querySelector(`#bilhete_perfil`).append(usuarios[posicao].bilhete);
};

function cancelModal_eliminar_paciente() {
  document.querySelector('.modal_alerte_elimnacao_user').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modal_alerte_elimnacao_user`).style.display = "none";
    document.querySelector('.modal_alerte_elimnacao_user').style.opacity = 0;
  }, 200);
};

function cancelModalPerfil() {
  document.querySelector('.modalPerfil_user').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modalPerfil_user`).style.display = "none";
    document.querySelector('.modalPerfil_user').style.opacity = 0;
    document.querySelector(`#nome_perfil`).innerHTML ="";
    document.querySelector(`#nome_perfil`).innerHTML="";
    document.querySelector(`#email_perfil`).innerHTML="";
    document.querySelector(`#telefone_perfil`).innerHTML="";
    document.querySelector(`#idade_perfil`).innerHTML="";
    document.querySelector(`#endereco_perfil`).innerHTML="";
    document.querySelector(`#pass_perfil`).innerHTML="";
    document.querySelector(`#sexo_perfil`).innerHTML="";
    document.querySelector(`#bilhete_perfil`).innerHTML="";
  }, 200); 
};

document.querySelector(`#inputPesquisa`).addEventListener(`keyup`, (event) => {
  const search = event.target.value;
    const arrayElemento = arrayPesquisa.filter((element) => element.nome.toLowerCase().includes(search.toLowerCase()));
    console.log(arrayElemento)
      if (search == "" || search.trim()=="") {
        arrayPesquisa = usuarios;
      } else {
         if ( arrayElemento.length > 0) {
          arrayPesquisa = arrayElemento;
         } else {
         ul.innerHTML = `<div><h1>Paciente NÃO Encontrado!</h1></div>`;
          return
         }
      }
     renderUser();
  });

function savarUserAdmin(){
  localStorage.setItem(`pacientes_mundo_hospitalar`,JSON.stringify(usuarios));
}

function savePosPaciente(posicao){
  localStorage.setItem(`posPaciente_admin`,JSON.stringify(posicao));
}

document.querySelector(`.bt_cancelar #bt_cancelar`).onclick = cancelModalPerfil;
document.querySelector(`#bt_eliminar_paciente`).onclick = eliminarUser;
document.querySelector(`#camcelar_modal_eliminar_paciente`).onclick = cancelModal_eliminar_paciente;

window.onscroll = function() {
  document.querySelector(`header`).style.boxShadow = `0px 2px 15px rgba(0, 0, 0, 0.1)`;
};

renderUser();
