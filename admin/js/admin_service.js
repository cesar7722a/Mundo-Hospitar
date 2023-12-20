
const usuarios = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];
var service =  JSON.parse(localStorage.getItem(`servico_mundo_hospitalar`)) || [];


var arrayPesquisa = service;
var ul = document.querySelector(`.card_service ul`);
const ce = (el)=>document.createElement(el);
let inputName = document.querySelector(`#inputName`);
let inputPreco = document.querySelector(`#inputPreco`);
let inputDias = document.querySelector(`#inputDias`);
let contService = 0;

function renderServico() {
    ul.innerHTML = "";
    arrayPesquisa.map(element => {

    var posicao = arrayPesquisa.indexOf(element);
      
     let li = ce("li");
     let h4_nome = ce("h4");
     let h4_preco = ce("h4");
     let section = ce("section");
     let icons_edite = ce("i");
     let icons_elimine = ce("i");
     icons_edite.setAttribute(`class`, `fas fa-pen-to-square`);
     icons_elimine.setAttribute(`class`, `far fa-trash-can`);

     icons_elimine.addEventListener(`click` ,()=>{
      savePosServiceAdmin(posicao);
      mostraMoodal_eliminar_servico();

     });

     icons_edite.addEventListener(`click`, ()=>{
       savePosServiceAdmin(posicao);
      mostrarModalEditar();
     });

    section.setAttribute(`class`,`sectinIcons`)
    section.appendChild(icons_edite);
    section.appendChild(icons_elimine);

     h4_nome.innerHTML = element.nome;
     h4_preco.innerHTML = `${JSON.parse(element.preco).toFixed(2)}  Kz`;
     
    li.appendChild(h4_nome);
    li.appendChild(h4_preco);
    li.appendChild(section);
    ul.appendChild(li);
  });
};

function adicionaServico() { 
  let novoNome = inputName.value;
  let novoPreco = inputPreco.value;
  let novoDias = inputDias.value;
  contService++;

  service.push({nome:novoNome,preco:novoPreco,dias:novoDias,id:contService});
  service_mundo_hospitalar();
  Cancel();
}

function editarServico() {
  let inputName = document.querySelector(`.card_Edite #inputName`).value;
  let inputPreco = document.querySelector(`.card_Edite #inputPreco`).value;
  let inputDias = document.querySelector(`.card_Edite #inputDias`).value;

    service[JSON.parse(localStorage.getItem(`posService_admin`))] = {nome:inputName, preco:inputPreco, dias:inputDias};
    service_mundo_hospitalar();
    renderServico();
    cancelModalEditar();
}

function eliminarServico() {
   service.splice(JSON.parse(localStorage.getItem(`posService_admin`)), 1);
   service_mundo_hospitalar();
   renderServico();
   cancelModal_eliminar_service();
};

function mostraMoodal() {
  document.querySelector('.modalAdicionarServico').style.opacity = 0;
  document.querySelector(`.modalAdicionarServico`).style.display = "flex";
  setTimeout(() => {
    document.querySelector('.modalAdicionarServico').style.opacity = 1;
  }, 200);
};

function mostraMoodal_eliminar_servico() {
  document.querySelector('.modal_alerte_elimnacao_service').style.opacity = 0;
  document.querySelector(`.modal_alerte_elimnacao_service`).style.display = "flex";
  setTimeout(() => {
    document.querySelector('.modal_alerte_elimnacao_service').style.opacity = 1;
  }, 200);
};

function mostrarModalEditar() {

  let inputName = document.querySelector(`.card_Edite #inputName`);
  let inputPreco = document.querySelector(`.card_Edite #inputPreco`);
  let inputDias = document.querySelector(`.card_Edite #inputDias`);

  const {nome,preco,dias} = service[JSON.parse(localStorage.getItem(`posService_admin`))];

  inputName.value = nome;
  inputPreco.value = preco;
  inputDias.value = dias;

  document.querySelector('.modalEditeServico').style.opacity = 0;
  setTimeout(() => {
    document.querySelector(`.modalEditeServico`).style.display = "flex";
    document.querySelector('.modalEditeServico').style.opacity = 1;
  }, 200);
  
}

function Cancel() {
  document.querySelector('.modalAdicionarServico').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modalAdicionarServico`).style.display = "none";
    document.querySelector('.modalAdicionarServico').style.opacity = 0;
  }, 200);

  inputName.value = "";
  inputPreco.value = "";
  inputDias.value = "";
};

function cancelModal_eliminar_service() {
  document.querySelector('.modal_alerte_elimnacao_service').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modal_alerte_elimnacao_service`).style.display = "none";
    document.querySelector('.modal_alerte_elimnacao_service').style.opacity = 0;
  }, 200);
};

function cancelModalEditar() {
  document.querySelector('.modalEditeServico').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modalEditeServico`).style.display = "none";
    document.querySelector('.modalEditeServico').style.opacity = 0;
  }, 200);

}

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
          ul.innerHTML = `<div><h1>Serviço NÃO Encontrado!</h1></div>`;
          return
         }
      }
      renderServico();
  });

function service_mundo_hospitalar(){
  localStorage.setItem(`servico_mundo_hospitalar`,JSON.stringify(service));
}

function savePosServiceAdmin(posicao){
  localStorage.setItem(`posService_admin`,JSON.stringify(posicao));
}

document.querySelector(`#bt_adicionar`).onclick = adicionaServico;
document.querySelector("#bt_moodal_adicionar_servico").onclick = mostraMoodal;
document.querySelector("#bt_cancelar").onclick = Cancel;
document.querySelector(".bt_cancelar_editar #bt_cancelar").onclick = cancelModalEditar;
document.querySelector(`#bt_editar`).onclick = editarServico;
document.querySelector(`#bt_eliminar_service`).onclick = eliminarServico;
document.querySelector(`#camcelar_modal_eliminar_paciente`).onclick = cancelModal_eliminar_service;

renderServico();

window.onscroll = function() {
  document.querySelector(`header`).style.boxShadow = `0px 2px 15px rgba(0, 0, 0, 0.1)`;
};
function validarNome(nome){
  return /^[a-zA-Z]{3,}$/.test(nome);
};
function validarPreco(preco){
  return /^[{0,9}]{3,}$/.test(preco);
};
function validarDias(dias){
  return /^[a-zA-Z]{4,}$/.test(dias);
};


function validarNome_servico(){
  
let nomeServico_edite = document.querySelector(`.card_Edite #inputName`).value;
let nomeService_adicionar = document.querySelector(`.card_adicionar #inputName`).value;

if(((validarNome(nomeService_adicionar)) && (nomeService_adicionar != ""))) {
  document.querySelector(`.card_adicionar #texto_validar_nome`).style.display  = "flex";
  document.querySelector(`.card_adicionar #texto_validar_nome`).innerHTML = `nome válido`
  document.querySelector(`.card_adicionar #texto_validar_nome`).setAttribute(`class`,`pacienteDadosCorretos`);
}else {
  document.querySelector(`.card_adicionar #texto_validar_nome`).style.display  = "flex";
  document.querySelector(`.card_adicionar #texto_validar_nome`).innerHTML = `nome inválido`
  document.querySelector(`.card_adicionar #texto_validar_nome`).setAttribute(`class`,`pacienteDadosErrados`);
}

 if((validarNome(nomeServico_edite) && (nomeServico_edite !=""))) {
  document.querySelector(`.card_Edite #texto_validar_nome`).style.display  = "flex";
  document.querySelector(`.card_Edite #texto_validar_nome`).innerHTML = `nome válido`
  document.querySelector(`.card_Edite #texto_validar_nome`).setAttribute(`class`,`pacienteDadosCorretos`); 
 } else {
  document.querySelector(`.card_Edite #texto_validar_nome`).style.display  = "flex";
  document.querySelector(`.card_Edite #texto_validar_nome`).innerHTML = `nome inválido`
  document.querySelector(`.card_Edite #texto_validar_nome`).setAttribute(`class`,`pacienteDadosErrados`);
 }
}

function validarPreco_servico(){
  let precoServico_edite = document.querySelector(`.card_Edite #inputPreco`).value;
  let precoService_adicionar = document.querySelector(`.card_adicionar #inputPreco`).value;

 if(validarPreco(precoService_adicionar) && (precoService_adicionar !="")) {
  document.querySelector(`.card_adicionar #texto_validar_preco`).style.display  = "flex";
  document.querySelector(`.card_adicionar #texto_validar_preco`).innerHTML = `Preço valido`
  document.querySelector(`.card_adicionar #texto_validar_preco`).setAttribute(`class`,`pacienteDadosCorretos`); 
 } else {
  document.querySelector(`.card_adicionar #texto_validar_preco`).style.display  = "flex";
  document.querySelector(`.card_adicionar #texto_validar_preco`).innerHTML = `Preço inválido`
  document.querySelector(`.card_adicionar #texto_validar_preco`).setAttribute(`class`,`pacienteDadosErrados`);
 }

 if(validarPreco(precoServico_edite) && (precoServico_edite !="")) {
  document.querySelector(`.card_Edite #texto_validar_preco`).style.display  = "flex";
  document.querySelector(`.card_Edite #texto_validar_preco`).innerHTML = `Preço válido`
  document.querySelector(`.card_Edite #texto_validar_preco`).setAttribute(`class`,`pacienteDadosCorretos`); 
 } else {
  document.querySelector(`.card_Edite #texto_validar_preco`).style.display  = "flex";
  document.querySelector(`.card_Edite #texto_validar_preco`).innerHTML = `Preço inválido`
  document.querySelector(`.card_Edite #texto_validar_preco`).setAttribute(`class`,`pacienteDadosErrados`);
 }
}

function validarDia_Servico() {
  let precoDias_edite = document.querySelector(`.card_Edite #inputDias`).value;
  let precoDias_adicionar = document.querySelector(`.card_adicionar #inputDias`).value;

  if(validarDias(precoDias_adicionar) && (precoDias_adicionar != "" || precoDias_adicionar.trim() != "")) {
    document.querySelector(`.card_adicionar #texto_validar_dia`).style.display  = "flex";
    document.querySelector(`.card_adicionar #texto_validar_dia`).innerHTML = `Dia válido`
    document.querySelector(`.card_adicionar #texto_validar_dia`).setAttribute(`class`,`pacienteDadosCorretos`); 
   } else {
    document.querySelector(`.card_adicionar #texto_validar_dia`).style.display  = "flex";
    document.querySelector(`.card_adicionar #texto_validar_dia`).innerHTML = `Dia inválido`
    document.querySelector(`.card_adicionar #texto_validar_dia`).setAttribute(`class`,`pacienteDadosErrados`);
   }

  if(validarDias(precoDias_edite) && (precoDias_edite != "" || precoDias_edite.trim() != "")) {
    document.querySelector(`.card_Edite #texto_validar_dia`).style.display  = "flex";
    document.querySelector(`.card_Edite #texto_validar_dia`).innerHTML = `Dia válido`
    document.querySelector(`.card_Edite #texto_validar_dia`).setAttribute(`class`,`pacienteDadosCorretos`); 
   } else {
    document.querySelector(`.card_Edite #texto_validar_dia`).style.display  = "flex";
    document.querySelector(`.card_Edite #texto_validar_dia`).innerHTML = `Dia inválido`
    document.querySelector(`.card_Edite #texto_validar_dia`).setAttribute(`class`,`pacienteDadosErrados`);
   }
};

document.querySelector(`.card_Edite #inputPreco`).onkeyup = validarPreco_servico;
document.querySelector(`.card_Edite #inputDias`).onkeyup = validarDia_Servico;
document.querySelector(`.card_Edite #inputName`).onkeyup = validarNome_servico;

document.querySelector(`.card_adicionar #inputPreco`).onkeyup = validarPreco_servico;
document.querySelector(`.card_adicionar #inputDias`).onkeyup = validarDia_Servico;
document.querySelector(`.card_adicionar #inputName`).onkeyup = validarNome_servico;