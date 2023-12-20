
const usuarios = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];
var sexo = 0;
var sexoPaciente;
var idadePaciente

function cadastrar_usuario() {
  var nomePaciente = document.querySelector(`#inputNome`).value;
  var emailPaciente = document.querySelector(`#inputEmail`).value;
  var passwordPaciente = document.querySelector(`#inputPassword`).value;
  var telefonePaciente = document.querySelector(`#inputTelefone`).value;
  var bilhetePaciente = document.querySelector(`#inputBI`).value;
  var enderecoPaciente = document.querySelector(`#inputEndereco`).value;
  var dataPaciente = document.querySelector(`#inputData`).value;

  if((validarNome(nomePaciente) != false) && (validarPassword(passwordPaciente) != false) && (validarTelefone(telefonePaciente) != false) && (validarEmail(emailPaciente) != false) && (validarBI(bilhetePaciente) != false) && (validarIdade() != false) && ( sexo >1 && sexo <= 4)) {
    // (enderecoPaciente != "" || enderecoPaciente.trim() != "")
  
   usuarios.push({ 
    nome: nomePaciente, 
    email:emailPaciente, 
    password:passwordPaciente, 
    telefone:telefonePaciente, 
    bilhete:bilhetePaciente, 
    endereco:enderecoPaciente, 
    idade:idadePaciente, 
    sexo:sexoPaciente,
    data:dataPaciente,
    servico_solicitado:[]
  });
   let verifacar_Emai_Existencia = usuarios.findIndex((item) => item.email == emailPaciente);
   savePrimeiraLetraUserLogado(nomePaciente.slice(0,1));
   
    nomePaciente.value = "";
    emailPaciente.value  = "";
    passwordPaciente.value = "";
    telefonePaciente.value = "";
    bilhetePaciente.value = "";
    enderecoPaciente.value = "";

    salvePaciente();
    savePosPaciente(verifacar_Emai_Existencia);
    window.location.replace("userLogado.html");
  } else {
    modalDados_errados ();
  }
};
function validarNome_paciente(){

  nomePaciente = document.querySelector(`#inputNome`).value;

 if(validarNome(nomePaciente) && (nomePaciente !="")) {
  document.querySelector(`#texto_validando_nome`).style.display  = "flex";
  document.querySelector(`#texto_validando_nome`).innerHTML = `nome válido`
  document.querySelector(`#texto_validando_nome`).setAttribute(`class`,`pacienteDadosCorretos`); 
 } else {
  document.querySelector(`#texto_validando_nome`).style.display  = "flex";
  document.querySelector(`#texto_validando_nome`).innerHTML = `nome inválido`
  document.querySelector(`#texto_validando_nome`).setAttribute(`class`,`pacienteDadosErrados`);
 }
}

function validarPass_paciente(){

  passwordPaciente= document.querySelector(`#inputPassword`).value;
 
  if(validarPassword(passwordPaciente)  && (passwordPaciente != "" || passwordPaciente.trim() != "")) {
   document.querySelector(`#texto_validando_passWord`).style.display = "flex";
   document.querySelector(`#texto_validando_passWord`).innerHTML = `pass Word válida`
   document.querySelector(`#texto_validando_passWord`).setAttribute(`class`,`pacienteDadosCorretos`);                    
  } else{
    document.querySelector(`#texto_validando_passWord`).style.display = "flex";
    document.querySelector(`#texto_validando_passWord`).innerHTML = `pass Word inválida`
   document.querySelector(`#texto_validando_passWord`).setAttribute(`class`,`pacienteDadosErrados`);
  }
}

function validarTelefone_paciente() {
  telefonePaciente = document.querySelector(`#inputTelefone`).value;

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
function validarEmail_paciente() {
  emailPaciente = document.querySelector(`#inputEmail`).value;

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
function validarBI_paciente() {
  bilhetePaciente = document.querySelector(`#inputBI`).value;

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
function validarIdade_paciente() {
  if( validarIdade() == false) {
    document.querySelector(`#texto_validando_idade`).style.display  = "flex";
    document.querySelector(`#texto_validando_idade`).setAttribute(`class`,`pacienteDadosErrados`);
  }else{
    document.querySelector(`#texto_validando_idade`).style.display  = "none";
  }
}

function validarIdade() {
  var dataPaciente = document.querySelector(`#inputData`).value;
  var anoPaciente = JSON.parse(dataPaciente.slice(0,4));
  var a = new Date();
  var anoAtual = a.getFullYear();
      idadePaciente = anoAtual - anoPaciente;
  if (idadePaciente >= 16){
    return true
  }
  return false
}
function validarSexo_paciente() {
  sexo = document.querySelector(`select`).value;
  
  if( sexo==1 )
    sexoPaciente = "Sexo não definido";
  if (sexo ==2 ) 
    sexoPaciente = "Masculino";
  if (sexo == 3)
    sexoPaciente = "Femenino";
  if(sexo == 4)
    sexoPaciente = "Sexo não definido";
}

function validarNome(nome){
  return /^[a-zA-Z{1,3}]{3,}$/.test(nome);
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


function salvePaciente(){
  localStorage.setItem(`pacientes_mundo_hospitalar`,JSON.stringify(usuarios));
}
function savePosPaciente(posicao){
  localStorage.setItem(`posPaciente_mundo_hospitalar`,JSON.stringify(posicao));
}
function savePrimeiraLetraUserLogado(priLetra) {
  localStorage.setItem(`userParaLogar`, JSON.stringify(priLetra));
}

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

document.querySelector(`.btn-cancelar-cadastro`).addEventListener(`click`, () => {
  window.location.href = `index.html`;
});

document.querySelector(`.btn-cadastrar-paciente`).onclick = cadastrar_usuario;
document.querySelector(`#inputNome`).onkeyup = validarNome_paciente;
document.querySelector(`#inputPassword`).onkeyup = validarPass_paciente;
document.querySelector(`#inputTelefone`).onkeyup = validarTelefone_paciente;
document.querySelector(`#inputEmail`).onkeyup = validarEmail_paciente;
document.querySelector(`#inputBI`).onkeyup = validarBI_paciente;
document.querySelector(`#inputData`).onchange = validarIdade_paciente;
document.querySelector(`#selectSexo`).onchange = validarSexo_paciente;
document.querySelector(`.modalDados-errados .cardDados-errados button`).onclick = Cancel_modalDados_errados;
