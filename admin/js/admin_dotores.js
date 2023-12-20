
const dotores = JSON.parse(localStorage.getItem(`dotore_admin`)) || [];
var globalurl;
var globalurl_editar;
var arrayPesquisa = dotores;


var ul = document.querySelector(`.card_dotores ul`);
const ce = (el)=>document.createElement(el);
let inputName = document.querySelector(`#inputName`);
let contService = 0;
let img = ce("img");

function renderDotores() {
  ul.innerHTML = "";
    arrayPesquisa.map(element => {
    var posicao = arrayPesquisa.indexOf(element);
      
     let li = ce("li");
     let h4_nome = ce("h4");
     let section = ce("section");
     let icons_edite = ce("i");
     let icons_see = ce("i");
     let icons_elimine = ce("i");
     let section_imagem = ce("section");
     let imag = ce("img");

     icons_edite.setAttribute(`class`, `fas fa-pen-to-square`);
     icons_elimine.setAttribute(`class`, `far fa-trash-can`);
     icons_see.setAttribute(`class`, `fa-solid fa-eye`);

     icons_elimine.addEventListener(`click` ,()=>{
      savePosDotor(posicao);
      mostraMoodal_eliminar_dotor();
     });

     icons_edite.addEventListener(`click`, ()=>{
      savePosDotor(posicao);
      mostrarModalEditar();
     });

    icons_see.addEventListener(`click`, ()=>{
      savePosDotor(posicao);
      mostraMoodal_perfil_dotor();
      document.querySelector(`.card_perfil_dotor .image h5`).style.display = "none";
     });

    section.setAttribute(`class`,`sectinIcons`);
    section.appendChild(icons_see);
    section.appendChild(icons_edite);
    section.appendChild(icons_elimine);

     h4_nome.innerHTML = element.nome;
     imag.setAttribute(`src`,`${element.imagem}`);
     section_imagem.setAttribute(`class` ,`section_imagem_nome`)
     section_imagem.appendChild(imag);
     section_imagem.appendChild(h4_nome);
     
    li.appendChild(section_imagem);
    li.appendChild(section);
    ul.appendChild(li);
  });
};

function editarDotor() {

  var inputNome = document.querySelector(`.card_editar_dotor #inputNome`).value;
  var inputEmail = document.querySelector(`.card_editar_dotor #inputEmail`).value;
  var inputEspecialidade = document.querySelector(`.card_editar_dotor #inputEspecialidade`).value;
  var inputBilhete = document.querySelector(`.card_editar_dotor #inputBI`).value;
  var inputTelefone = document.querySelector(`.card_editar_dotor #inputTelefone`).value;
  var inputData = document.querySelector(`.card_editar_dotor #inputData`).value;
  var inputDesc = document.querySelector(`.card_editar_dotor #textDescricao`).value;

 if(inputData != "") {
  var anoDotor = JSON.parse(inputData.slice(0,4));
  var a = new Date();
  var anoAtual = a.getFullYear();
  var idadeDotor = anoAtual - anoDotor;
 }

  if((validarNome(inputNome) != false) && (validarEspecialidade(inputEspecialidade) != false) && (validarTelefone(inputTelefone) != false) && (validarEmail(inputEmail) != false) && (validarBI(inputBilhete) != false) && (validarIdade_pacienteEditado() != false)){
    dotores[localStorage.getItem(`posDotor_admin`)] = {nome:inputNome, email:inputEmail, especialidade:inputEspecialidade,bilhete:inputBilhete,telefone:inputTelefone,idade:idadeDotor,descricao:inputDesc};
    salveDotore_admin();
    renderDotores();
    cancelModalEditar();
  }else {
    mostraMoodal_modal_alerte_preecnche_todos_dados();
  } 
}

function mostrarModalEditar() {

  let inputNome = document.querySelector(`.card_editar_dotor #inputNome`);
  let inputEmail = document.querySelector(`.card_editar_dotor #inputEmail`);
  let inputEspecialidade = document.querySelector(`.card_editar_dotor #inputEspecialidade`);
  let inputBilhete= document.querySelector(`.card_editar_dotor #inputBI`);
  let inputTelefone = document.querySelector(`.card_editar_dotor #inputTelefone`);
  let inputData = document.querySelector(`.card_editar_dotor #inputData`);
  let inputDesc = document.querySelector(`.card_editar_dotor #textDescricao`);

    const {nome,email,bilhete, telefone,idade,especialidade,imagem,descricao} = dotores[localStorage.getItem(`posDotor_admin`)];

    inputNome.value = nome;
    inputEmail.value = email;
    inputEspecialidade.value = especialidade;
    inputBilhete.value = bilhete;
    inputTelefone.value = telefone;
    inputData.value = idade;
    inputDesc.value = descricao;

    document.querySelector(`.card_editar_dotor .image img`).src = imagem;
    document.querySelector(`.card_editar_dotor .image h5`).style.display ="none"
    document.querySelector('.modal_editar_dotor').style.opacity = 0;
    setTimeout(() => {
      document.querySelector(`.modal_editar_dotor`).style.display = "flex";
      document.querySelector('.modal_editar_dotor').style.opacity = 1;
    }, 200);

  document.querySelector('.modal_editar_dotor').style.opacity = 0;
  setTimeout(() => {
    document.querySelector(`.modal_editar_dotor`).style.display = "flex";
    document.querySelector('.modal_editar_dotor').style.opacity = 1;
  }, 200);
  
}

function adicinarDotor() {
 
  var novoNome = document.querySelector(`#inputNome`).value;
  var novoEmail = document.querySelector(`#inputEmail`).value;
  var novoBI = document.querySelector(`#inputBI`).value;
  var novoTelefone = document.querySelector(`#inputTelefone`).value;
  var dataDotor = document.querySelector(`.card_adicionar_dotor #inputData`).value;
  var decDotor = document.querySelector(`#textDescricao`).value;
  var especialidade = document.querySelector(`#inputEspecialidade`).value;

  if( dataDotor != "") {
    var anoDotor = JSON.parse(dataDotor.slice(0,4));
    var a = new Date();
    var anoAtual = a.getFullYear();
    var idadeDotor = anoAtual - anoDotor;
  }

  if((validarNome(novoNome) != false) && (validarEspecialidade(especialidade) != false) && (validarTelefone(novoTelefone) != false) && (validarEmail(novoEmail) != false) && (validarBI(novoBI) != false) && (validarIdade() != false)){

    dotores.push({
      nome:novoNome,
      email:novoEmail,
      bilhete:novoBI,
      telefone:novoTelefone, 
      idade:idadeDotor,
      imagem:globalurl,
      descricao:decDotor,
      especialidade:
      especialidade
    });
    globalurl= "";
  } else {
    mostraMoodal_modal_alerte_preecnche_todos_dados();
  }

  document.querySelector(`#inputNome`).value ="";
  document.querySelector(`#inputBI`).value ="";
  document.querySelector(`#inputEmail`).value ="";
  document.querySelector(`#inputTelefone`).value ="";
  document.querySelector(`#inputFoto`).value ="";
  document.querySelector(`#inputData`).value ="";
  document.querySelector(`.image img`).src = "";
  document.querySelector(`#textDescricao`).value = "";
  document.querySelector(`#inputEspecialidade`).value = "";
  document.querySelector(`.card_adicionar_dotor .image h5`).style.display = "flex";

  salveDotore_admin();
  renderDotores();
  cancelModal_adicionar_dotor_paciente();

};

function eliminarDotor() {
  dotores.splice(JSON.parse(localStorage.getItem(`posDotor_admin`)), 1);
  salveDotore_admin();
  renderDotores();
  cancelModal_eliminar_dotor();
};

function mostraMoodal_adicionar_dotor() {
  document.querySelector('.modal_adicionar_dotor').style.opacity = 0;
  document.querySelector(`.modal_adicionar_dotor`).style.display = "flex";
  setTimeout(() => {
    document.querySelector('.modal_adicionar_dotor').style.opacity = 1;
  }, 200);
};

function mostraMoodal_eliminar_dotor() {
  document.querySelector('.modal_alerte_elimnacao_dotor').style.opacity = 0;
  document.querySelector(`.modal_alerte_elimnacao_dotor`).style.display = "flex";
  setTimeout(() => {
    document.querySelector('.modal_alerte_elimnacao_dotor').style.opacity = 1;
  }, 200);
};
function mostraMoodal_modal_alerte_preecnche_todos_dados() {
  document.querySelector('.modal_alerte_preecnche_todos_dados').style.opacity = 0;
  document.querySelector(`.modal_alerte_preecnche_todos_dados`).style.display = "flex";
  setTimeout(() => {
    document.querySelector('.modal_alerte_preecnche_todos_dados').style.opacity = 1;
  }, 200);
};

function mostraMoodal_perfil_dotor() {
  document.querySelector('.modal_perfil_dotor').style.opacity = 0;
  document.querySelector(`.modal_perfil_dotor`).style.display = "flex";
  setTimeout(() => {
    document.querySelector('.modal_perfil_dotor').style.opacity = 1;
    
    document.querySelector(`.card_perfil_dotor .image img`).src = dotores[JSON.parse(localStorage.getItem(`posDotor_admin`))].imagem

    document.querySelector(`#inputNome h2`).innerHTML = dotores[JSON.parse(localStorage.getItem(`posDotor_admin`))].nome;

    document.querySelector(`#inputEspecialidade h2`).innerHTML = dotores[JSON.parse(localStorage.getItem(`posDotor_admin`))].especialidade;

    document.querySelector(`#inputEmail h2`).innerHTML = dotores[JSON.parse(localStorage.getItem(`posDotor_admin`))].email;

    document.querySelector(`#inputBI h2`).innerHTML = dotores[JSON.parse(localStorage.getItem(`posDotor_admin`))].bilhete;

    document.querySelector(`#inputTelefone h2`).innerHTML = dotores[JSON.parse(localStorage.getItem(`posDotor_admin`))].telefone;

    document.querySelector(`#inputData h2`).innerHTML = dotores[JSON.parse(localStorage.getItem(`posDotor_admin`))].idade;

  }, 200);

};

function cancelModal_perfil_dotor() {
  document.querySelector('.modal_perfil_dotor').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modal_perfil_dotor`).style.display = "none";
    document.querySelector('.modal_perfil_dotor').style.opacity = 0;
  }, 200);
};

function cancelModal_adicionar_dotor_paciente() {
  document.querySelector('.modal_adicionar_dotor').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modal_adicionar_dotor`).style.display = "none";
    document.querySelector('.modal_adicionar_dotor').style.opacity = 0;
  }, 200);

  document.querySelector(`#inputNome`).value ="";
  document.querySelector(`#inputBI`).value ="";
  document.querySelector(`#inputEmail`).value ="";
  document.querySelector(`#inputTelefone`).value ="";
  document.querySelector(`#inputFoto`).value ="";
  document.querySelector(`#inputData`).value ="";
  document.querySelector(`.image img`).src = "";
  document.querySelector(`.card_adicionar_dotor .image h5`).style.display = "flex";
};

function cancelModalEditar() {
  document.querySelector('.modal_editar_dotor').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modal_editar_dotor`).style.display = "none";
    document.querySelector('.modal_editar_dotor').style.opacity = 0;
  }, 200);

}

function cancelModal_eliminar_dotor() {
  document.querySelector('.modal_alerte_elimnacao_dotor').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modal_alerte_elimnacao_dotor`).style.display = "none";
    document.querySelector('.modal_alerte_elimnacao_dotor').style.opacity = 0;
  }, 200);
};
function cancelModal_modal_alerte_preecnche_todos_dados() {
  document.querySelector('.modal_alerte_preecnche_todos_dados').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modal_alerte_preecnche_todos_dados`).style.display = "none";
    document.querySelector('.modal_alerte_preecnche_todos_dados').style.opacity = 0;
  }, 200);
};

document.querySelector(`#camcelar_modal_alerte_preecnche_todos_dados`).onclick = cancelModal_modal_alerte_preecnche_todos_dados;

document.querySelector(`#inputFoto`).addEventListener(`change`, () => {           
  const fr = new FileReader();
  fr.readAsDataURL(document.querySelector(`#inputFoto`).files[0]);
  fr.addEventListener(`load`, () => {
      const url = fr.result;
      globalurl = url;
      document.querySelector(`.image img`).src = globalurl;
      document.querySelector(`.card_adicionar_dotor .image h5`).style.display = "none";
  });
});

document.querySelector(`#inputPesquisa`).addEventListener(`keyup`, (event) => {
  const search = event.target.value;
    const arrayElemento = arrayPesquisa.filter((element) => element.nome.toLowerCase().includes(search.toLowerCase()));
      if (search == "" || search.trim()=="") {
        arrayPesquisa = dotores;
      } else {
         if ( arrayElemento.length > 0) {
          arrayPesquisa = arrayElemento;
         } else {
          ul.innerHTML = `<div><h1>Doctor NÃO Encontrado!</h1></div>`;
          return
         }
      }
      renderDotores();
  });

function salveDotore_admin(){
  localStorage.setItem(`dotore_admin`,JSON.stringify(dotores));
};

function savePosDotor(posicao){
  localStorage.setItem(`posDotor_admin`,JSON.stringify(posicao));
};

document.querySelector(`#bt_adicionaar_dotor`).onclick = adicinarDotor;
document.querySelector(`#bt_cancelar_adicionar_dotor`).onclick = cancelModal_adicionar_dotor_paciente;
document.querySelector(`#bt_mostrar_modal_adicionar_dotor`).onclick = mostraMoodal_adicionar_dotor;
document.querySelector(`#bt_cancelar_modal_perfil_dotor`).onclick = cancelModal_perfil_dotor;
document.querySelector(`#bt_eliminar_service`).onclick = eliminarDotor;
document.querySelector(`#camcelar_modal_eliminar_paciente`).onclick = cancelModal_eliminar_dotor;
document.querySelector(`.bt_editar_cancelar #bt_editar_dotor`).onclick = editarDotor;
document.querySelector(`.bt_editar_cancelar #bt_cancelar_editar_dotor`).onclick = cancelModalEditar;

renderDotores();

window.onscroll = function() {
  document.querySelector(`header`).style.boxShadow = `0px 2px 15px rgba(0, 0, 0, 0.1)`;
};


function validarNome_paciente(){
  
  nomePaciente = document.querySelector(`#inputNome`).value;
   let inputNome = document.querySelector(`.card_editar_dotor #inputNome`).value;

if(((validarNome(inputNome)) && (inputNome != ""))) {
  document.querySelector(`.card_editar_dotor #texto_validando_nome`).style.display  = "flex";
  document.querySelector(`.card_editar_dotor #texto_validando_nome`).innerHTML = `nome válido`
  document.querySelector(`.card_editar_dotor #texto_validando_nome`).setAttribute(`class`,`pacienteDadosCorretos`);
}else {
  document.querySelector(`.card_editar_dotor #texto_validando_nome`).style.display  = "flex";
  document.querySelector(`.card_editar_dotor #texto_validando_nome`).innerHTML = `nome inválido`
  document.querySelector(`.card_editar_dotor #texto_validando_nome`).setAttribute(`class`,`pacienteDadosErrados`);
}

 if((validarNome(nomePaciente) && (nomePaciente !=""))) {
  document.querySelector(`#texto_validando_nome`).style.display  = "flex";
  document.querySelector(`#texto_validando_nome`).innerHTML = `nome válido`
  document.querySelector(`#texto_validando_nome`).setAttribute(`class`,`pacienteDadosCorretos`); 
 } else {
  document.querySelector(`#texto_validando_nome`).style.display  = "flex";
  document.querySelector(`#texto_validando_nome`).innerHTML = `nome inválido`
  document.querySelector(`#texto_validando_nome`).setAttribute(`class`,`pacienteDadosErrados`);
 }
}

function validarEmail_paciente() {
  emailPaciente = document.querySelector(`#inputEmail`).value;
  var inputEmail = document.querySelector(`.card_editar_dotor #inputEmail`).value;


  if(validarEmail(inputEmail) && (inputEmail != "" || inputEmail.trim() != "")) {
    document.querySelector(`.card_editar_dotor #texto_validando_email`).style.display  = "flex";
    document.querySelector(`.card_editar_dotor #texto_validando_email`).innerHTML = `email válido`
    document.querySelector(`.card_editar_dotor #texto_validando_email`).setAttribute(`class`,`pacienteDadosCorretos`); 
   } else {
    document.querySelector(`.card_editar_dotor #texto_validando_email`).style.display  = "flex";
    document.querySelector(`.card_editar_dotor #texto_validando_email`).innerHTML = `email inválido`
    document.querySelector(`.card_editar_dotor #texto_validando_email`).setAttribute(`class`,`pacienteDadosErrados`);
   }

  if(validarEmail(emailPaciente) && (emailPaciente != "" || emailPaciente.trim() != "")) {
    document.querySelector(`#texto_validando_email`).style.display  = "flex";
    document.querySelector(`#texto_validando_email`).innerHTML = `email válido`
    document.querySelector(`#texto_validando_email`).setAttribute(`class`,`pacienteDadosCorretos`); 
   } else {
    document.querySelector(`#texto_validando_email`).style.display  = "flex";
    document.querySelector(`#texto_validando_email`).innerHTML = `email inválido`
    document.querySelector(`#texto_validando_email`).setAttribute(`class`,`pacienteDadosErrados`);
   }
};

function validarEspecialidade_paciente(){
  especialidade = document.querySelector(`#inputEspecialidade`).value;
  var inputEspecialidade = document.querySelector(`.card_editar_dotor #inputEspecialidade`).value;

 if(validarEspecialidade(inputEspecialidade) && (inputEspecialidade !="")) {
  document.querySelector(`.card_editar_dotor #texto_validando_especialidade`).style.display  = "flex";
  document.querySelector(`.card_editar_dotor #texto_validando_especialidade`).innerHTML = `Especialidade válido`
  document.querySelector(`.card_editar_dotor #texto_validando_especialidade`).setAttribute(`class`,`pacienteDadosCorretos`); 
 } else {
  document.querySelector(`.card_editar_dotor #texto_validando_especialidade`).style.display  = "flex";
  document.querySelector(`.card_editar_dotor #texto_validando_especialidade`).innerHTML = `Especialidade inválido`
  document.querySelector(`.card_editar_dotor #texto_validando_especialidade`).setAttribute(`class`,`pacienteDadosErrados`);
 }

 if(validarEspecialidade(especialidade) && (especialidade !="")) {
  document.querySelector(`#texto_validando_especialidade`).style.display  = "flex";
  document.querySelector(`#texto_validando_especialidade`).innerHTML = `Especialidade válido`
  document.querySelector(`#texto_validando_especialidade`).setAttribute(`class`,`pacienteDadosCorretos`); 
 } else {
  document.querySelector(`#texto_validando_especialidade`).style.display  = "flex";
  document.querySelector(`#texto_validando_especialidade`).innerHTML = `Especialidade inválido`
  document.querySelector(`#texto_validando_especialidade`).setAttribute(`class`,`pacienteDadosErrados`);
 }
}

function validarTelefone_paciente() {
  telefonePaciente = document.querySelector(`#inputTelefone`).value;
  var inputTelefone = document.querySelector(`.card_editar_dotor #inputTelefone`).value;

  if(validarTelefone(inputTelefone) && (inputTelefone != "" || inputTelefone.trim() != "")) {
    document.querySelector(`.card_editar_dotor #texto_validando_telefone`).style.display  = "flex";
    document.querySelector(`.card_editar_dotor #texto_validando_telefone`).innerHTML = `número válido`
    document.querySelector(`.card_editar_dotor #texto_validando_telefone`).setAttribute(`class`,`pacienteDadosCorretos`); 
   } else {
    document.querySelector(`.card_editar_dotor #texto_validando_telefone`).style.display  = "flex";
    document.querySelector(`.card_editar_dotor #texto_validando_telefone`).innerHTML = `no minímo 9 dígitos`
    document.querySelector(`.card_editar_dotor #texto_validando_telefone`).setAttribute(`class`,`pacienteDadosErrados`);
   }

  if(validarTelefone(telefonePaciente) && (telefonePaciente != "" || telefonePaciente.trim() != "")) {
    document.querySelector(`#texto_validando_telefone`).style.display  = "flex";
    document.querySelector(`#texto_validando_telefone`).innerHTML = `número válido`
    document.querySelector(`#texto_validando_telefone`).setAttribute(`class`,`pacienteDadosCorretos`); 
   } else {
    document.querySelector(`#texto_validando_telefone`).style.display  = "flex";
    document.querySelector(`#texto_validando_telefone`).innerHTML = `no minímo 9 dígitos`
    document.querySelector(`#texto_validando_telefone`).setAttribute(`class`,`pacienteDadosErrados`);
   }
};


function validarIdade_paciente() {
  if( validarIdade() == false) {
    document.querySelector(`#texto_validando_idade`).style.display  = "flex";
    document.querySelector(`#texto_validando_idade`).setAttribute(`class`,`pacienteDadosErrados`);
  }else{
    document.querySelector(`#texto_validando_idade`).style.display  = "none";
  }
}

function validarIdade_pacienteEditado() {
  if( validarIdadeEditado() == false) {
    document.querySelector(`.card_editar_dotor #texto_validando_idade`).style.display  = "flex";
    document.querySelector(`.card_editar_dotor #texto_validando_idade`).setAttribute(`class`,`pacienteDadosErrados`);
  }else{
    document.querySelector(`.card_editar_dotor #texto_validando_idade`).style.display  = "none";
  }
}

function validarBI_paciente() {
  bilhetePaciente = document.querySelector(`#inputBI`).value;
  var inputBilhete = document.querySelector(`.card_editar_dotor #inputBI`).value;

  if(validarBI(inputBilhete) && (inputBilhete != "" || inputBilhete.trim() != "")) {
    document.querySelector(`.card_editar_dotor #texto_validando_bi`).style.display  = "flex";
    document.querySelector(`.card_editar_dotor #texto_validando_bi`).innerHTML = `BI válido`
    document.querySelector(`.card_editar_dotor #texto_validando_bi`).setAttribute(`class`,`pacienteDadosCorretos`); 
   } else {
    document.querySelector(`.card_editar_dotor #texto_validando_bi`).style.display  = "flex";
    document.querySelector(`.card_editar_dotor #texto_validando_bi`).innerHTML = `BI inválido`
    document.querySelector(`.card_editar_dotor #texto_validando_bi`).setAttribute(`class`,`pacienteDadosErrados`);
   }

  if(validarBI(bilhetePaciente) && (bilhetePaciente != "" || bilhetePaciente.trim() != "")) {
    document.querySelector(`#texto_validando_bi`).style.display  = "flex";
    document.querySelector(`#texto_validando_bi`).innerHTML = `BI válido`
    document.querySelector(`#texto_validando_bi`).setAttribute(`class`,`pacienteDadosCorretos`); 
   } else {
    document.querySelector(`#texto_validando_bi`).style.display  = "flex";
    document.querySelector(`#texto_validando_bi`).innerHTML = `BI inválido`
    document.querySelector(`#texto_validando_bi`).setAttribute(`class`,`pacienteDadosErrados`);
   }
}

function validarIdade() {
  var dataPaciente = document.querySelector(`#inputData`).value;

  if(dataPaciente != ""){
    var anoPaciente = JSON.parse(dataPaciente.slice(0,4));
  }
  var a = new Date();
  var anoAtual = a.getFullYear();
      idadePaciente = anoAtual - anoPaciente;
  if (idadePaciente >= 23 && idadePaciente <= 90){
    return true
  }
 return false
}
function validarIdadeEditado() {

  var dataPaciente = document.querySelector(`.card_editar_dotor #inputData`).value;

  if(dataPaciente != ""){
    var anoPaciente = JSON.parse(dataPaciente.slice(0,4));
  }
  var anoPaciente = JSON.parse(dataPaciente.slice(0,4));
  var a = new Date();
  var anoAtual = a.getFullYear();
      idadePaciente = anoAtual - anoPaciente;
  if (idadePaciente >= 23 && idadePaciente <= 90){
    return true
  }
  return false
}

function validarNome(nome){
  return /^[a-zA-Z{1,3}]{3,}$/.test(nome);
};
function validarEspecialidade(nome){
  return /^[a-zA-Z{1,4}]{3,}$/.test(nome);
};
function validarPassword(password){
  return /^[a-zA-Z0-9]{6,}$/.test(password);
  // return  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/
};
function validarTelefone(telefone){
 return /^[0-9]{9,}$/.test(telefone);
};
function validarEmail(email) {
  return /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/.test(email);
};
function validarBI(bilhete) {
  return /^[0-9A-Z]{6,}$/.test(bilhete);
};

document.querySelector(`#inputNome`).onkeyup = validarNome_paciente;
document.querySelector(`#inputTelefone`).onkeyup = validarTelefone_paciente;
document.querySelector(`#inputEmail`).onkeyup = validarEmail_paciente;
document.querySelector(`#inputBI`).onkeyup = validarBI_paciente;
document.querySelector(`#inputData`).onchange = validarIdade_paciente;
document.querySelector(`#inputEspecialidade`).onkeyup = validarEspecialidade_paciente

document.querySelector(`.card_editar_dotor #inputData`).onchange = validarIdade_pacienteEditado;
document.querySelector(`.card_editar_dotor #inputNome`).onkeyup = validarNome_paciente;
document.querySelector(`.card_editar_dotor #inputEmail`).onkeyup = validarEmail_paciente;
document.querySelector(`.card_editar_dotor #inputEspecialidade`).onkeyup = validarEspecialidade_paciente
document.querySelector(`.card_editar_dotor #inputBI`).onkeyup = validarBI_paciente;
document.querySelector(`.card_editar_dotor #inputTelefone`).onkeyup = validarTelefone_paciente;;
