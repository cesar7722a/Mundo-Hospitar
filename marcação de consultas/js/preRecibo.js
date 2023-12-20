
const service_a_marcar = JSON.parse(localStorage.getItem(`service_para_marcar`)) || [];
const usuarios = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];
const dotores = JSON.parse(localStorage.getItem(`dotore_admin`)) || [];
const servico_notificao = JSON.parse(localStorage.getItem(`salve_marcacao_notificao`)) || [];


let servicoRecibo = document.querySelector(`.servico_para_consulta`);
let selecionar_local_servico = document.querySelector(`#realiizacao_select`);
const ce = (el)=>document.createElement(el);
var precoTotal = 0;
var contPreco = 1;
var local_realizacao_servico = "No hospital";

if(JSON.parse(localStorage.getItem(`posDootor_para_marcar`)) != null) {
  document.querySelector(`#nomeDotor`).innerHTML =`- ${dotores[JSON.parse(localStorage.getItem(`posDootor_para_marcar`))].nome}`;
}
function renderServico() {
    service_a_marcar.map(element =>{
      let h2 = ce(`h2`);
      h2.innerHTML =`- ${element.nome}`;
      servicoRecibo.append(h2);
    });
}

  for(let i in service_a_marcar) {
    precoTotal += JSON.parse(service_a_marcar[i].preco);
  }

document.querySelector(`#realiizacao_select`).onchange = opcaoLocalService; 
  function opcaoLocalService () {
   let opcao = selecionar_local_servico.value;
   if(opcao == 3 && contPreco ==1){
    contPreco++;
    document.querySelector(`.preco .precoToatal h3`).innerHTML = `${(precoTotal + 100000).toFixed(2)} Kz`;
    document.querySelector(`.escolhe_local_service h2`).style.display = "flex";
    local_realizacao_servico = "Ao Domicilio"
   } else if (opcao == 2) {
    contPreco = 1;
    document.querySelector(`.escolhe_local_service h2`).style.display = "none";
    document.querySelector(`.preco .precoToatal h3`).innerHTML = `${precoTotal.toFixed(2)} Kz`;
    local_realizacao_servico = "No Hospital"
   } else {
    contPreco = 1;
    document.querySelector(`.preco .precoToatal h3`).innerHTML = `${precoTotal.toFixed(2)} Kz`;
    document.querySelector(`.escolhe_local_service h2`).style.display = "none";
    local_realizacao_servico = "No Hospital"
   }
};

const bt_imprimir = document.querySelector(`.finalizar_marcao`);

bt_imprimir.addEventListener(`click`, ()=>{
  // if(validarData() != false) {
    const preRecibo = document.querySelector(`.preRecibo`);
    
    const options = {
      margin: [10, 40, 0, 10],
      filename: "Recibo.pdf",
      html2canvas: {scale:3},
      jsPDF: {unit: "mm", format: "a4", orientation: "portrait"}
    }
  html2pdf().set(options).from(preRecibo).save();
  
  if(JSON.parse(localStorage.getItem(`posDootor_para_marcar`)) != null){
    servico_notificao.push({
      nome_marcador_servico: usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].nome,
      email_marcador_servico: usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].email,
      servico_escolhido: service_a_marcar,
      data_marcador_servico: document.querySelector(`#input_data_hora`).value,
      hora_marcador_servico: document.querySelector(`#inputTempo`).value,
      dotor_escolhido: dotores[JSON.parse(localStorage.getItem(`posDootor_para_marcar`))].nome,
      local_realizacao_servico_escolhido: local_realizacao_servico,
      aceitar_solicitacao: false,
      regeitar_solicitacao:false
    })

  } else {
    servico_notificao.push({
      nome_marcador_servico: usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].nome,
      email_marcador_servico: usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].email,
      servico_escolhido: service_a_marcar,
      data_marcador_servico: document.querySelector(`#input_data_hora`).value,
      hora_marcador_servico: document.querySelector(`#inputTempo`).value,
      dotor_escolhido: "Escolha Do Hospital",
      local_realizacao_servico_escolhido: local_realizacao_servico,
      aceitar_solicitacao: false,
      regeitar_solicitacao:false
    })
  }
  salve_marcacao_notificao();
  localStorage.removeItem(`posDootor_para_marcar`)
  // } else {
  //   alert("e")
  // }
});

document.querySelector(`.cancelar_marcao`).addEventListener(`click`, ()=>{
  localStorage.removeItem(`posDootor_para_marcar`);
  window.location.href ="../userLogado.html";
});

 document.querySelector(`.preco .subPreco h3`).innerHTML = `${precoTotal.toFixed(2)} <h4>Kz</h4> `;
 document.querySelector(`.preco .precoToatal h3`).innerHTML = `${precoTotal.toFixed(2)} <h4>Kz</h4> `;

renderServico();

document.querySelector(`.section_nome h2`).innerHTML = usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].nome;

document.querySelector(`.section_bi h2`).innerHTML = usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].bilhete;

document.querySelector(`.section_telefone h2`).innerHTML = usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].telefone;

document.querySelector(`.section_email h2`).innerHTML = usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].email;

document.querySelector(`.section_idade h2`).innerHTML = usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].idade;

document.querySelector(`.section_nome h2`).innerHTML = usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].nome;

function salve_marcacao_notificao(){
  localStorage.setItem(`salve_marcacao_notificao`,JSON.stringify(servico_notificao));
};

// function validarData() {
//   var dataPaciente = document.querySelector(`.data_da_realizacao #input_data_hora`).value;
//   if(dataPaciente != "") {
//     var anoPaciente = JSON.parse(dataPaciente.slice(0,4));
//     var mesPaciente = JSON.parse(dataPaciente.slice(5,7));
//     var diaPaciente = JSON.parse(dataPaciente.slice(8,10));
//     console.log(mesPaciente)
//     console.log(diaPaciente)
//   }
 
//   var a = new Date();
//   var anoAtual = a.getFullYear();
//   var mesActual = a.getMonth();
//   var diaActual = a.getDay();

//   if (anoPaciente >= anoAtual && mesPaciente >= mesActual && diaPaciente >= diaActual){
//     return true
//   }
//   return false
// }

// document.querySelector(`#input_data_hora`).onchange = validarData;