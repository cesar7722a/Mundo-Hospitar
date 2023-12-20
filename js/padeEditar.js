const usuarios = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];

document.querySelector(`.btn-cancelar-editar`).addEventListener(`click`,()=>{
  window.location.href = "userLogado.html"
});

let nome = document.querySelector(`#inputNome`);
let email = document.querySelector(`#inputEmail`);
let bilhete =  document.querySelector(`#inputBI`);
let telefone =  document.querySelector(`#inputTelefone`);
let password = document.querySelector(`#inputPassword`)
let endereco =  document.querySelector(`#inputEndereco`)
let idade = document.querySelector(`#inputData`)
let sexo = document.querySelector(`#selectSexo`)

nome.value  = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`))[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].nome;

email.value = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`))[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].email;

bilhete.value = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`))[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].bilhete;

telefone.value = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`))[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].telefone;

password.value =  JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`))[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].password;

endereco.value = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`))[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].endereco;

// idade.value =  JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`))[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].dataPaciente;

sexo.value = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`))[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].sexo;

function editar() {

  let novonome = document.querySelector(`#inputNome`).value;
  let novoemail = document.querySelector(`#inputEmail`).value;
  let novobilhete =  document.querySelector(`#inputBI`).value;
  let novotelefone =  document.querySelector(`#inputTelefone`).value;
  let novopassword = document.querySelector(`#inputPassword`).value
  let novoendereco =  document.querySelector(`#inputEndereco`).value
  let novodataPaciente = document.querySelector(`#inputData`).value
  let novosexo = document.querySelector(`#selectSexo`).value

  
  var anoPaciente = JSON.parse(novodataPaciente.slice(0,4));
  var a = new Date();
  var anoAtual = a.getFullYear();
  let  idadePaciente = anoAtual - anoPaciente;
  let sexoPaciente;
  
if( novosexo==1 )
  sexoPaciente = "Sexo não definido";
if (novosexo ==2 ) 
sexoPaciente = "Masculino";
if (novosexo == 3)
sexoPaciente = "Femenino";
if(novosexo == 4)
sexoPaciente = "Sexo não definido";

if((validarNome(novonome) != false) && (validarPassword(novopassword) != false) && (validarTelefone(novotelefone) != false) && (validarEmail(novoemail) != false) && (validarBI(novobilhete) != false) && (validarIdade() != false) && ( sexo >1 && sexo <= 4)) {

  usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))] = {
    nome:novonome,
    email:novoemail,
    bilhete:novobilhete,
    telefone:novotelefone,
    password:novopassword,
    endereco:novoendereco,
    idade:idadePaciente,
    sexo:sexoPaciente
  }
  salvePaciente();
  savePrimeiraLetraUserLogado(usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].nome.slice(0,1))
  window.location.href = "userLogado.html";
}
}

document.querySelector(`.btn-editar-paciente`).onclick = editar;

document.querySelector(`.btn-cancelar-editar`).addEventListener(`click`, ()=>{
  window.location.href = "userLogado.html"
});

function salvePaciente(){
  localStorage.setItem(`pacientes_mundo_hospitalar`,JSON.stringify(usuarios));
}
function savePrimeiraLetraUserLogado(priLetra) {
  localStorage.setItem(`userParaLogar`, JSON.stringify(priLetra));
}

function validarNome_paciente(){

  let nomePaciente = document.querySelector(`#inputNome`).value;

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

  let passwordPaciente= document.querySelector(`#inputPassword`).value;
 
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
  let telefonePaciente = document.querySelector(`#inputTelefone`).value;

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
  let emailPaciente = document.querySelector(`#inputEmail`).value;

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
  let bilhetePaciente = document.querySelector(`#inputBI`).value;

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

document.querySelector(`#inputNome`).onkeyup = validarNome_paciente;
document.querySelector(`#inputPassword`).onkeyup = validarPass_paciente;
document.querySelector(`#inputTelefone`).onkeyup = validarTelefone_paciente;
document.querySelector(`#inputEmail`).onkeyup = validarEmail_paciente;
document.querySelector(`#inputBI`).onkeyup = validarBI_paciente;
document.querySelector(`#inputData`).onchange = validarIdade_paciente;
document.querySelector(`#selectSexo`).onchange = validarSexo_paciente;