const usuarios = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];
const servico_notificao = JSON.parse(localStorage.getItem(`salve_marcacao_notificao`)) || [];




let verifacar_Emai_Existencia = servico_notificao.findIndex((item) => item.email_marcador_servico == usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].email);

let verifacar_servico = servico_notificao.filter((item) => item.email_marcador_servico == usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].email && item.nome_marcador_servico == usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].nome);

verifacar_servico.map((element) => {

  usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].servico_solicitado.push({
       data:element.data_marcador_servico,
       hora:element.hora_marcador_servico,
       realizacao_servico:element.local_realizacao_servico_escolhido,
       doctor:element.dotor_escolhido,
       servico:element.servico_escolhido,
       servico_aceite: element.aceitar_solicitacao,
       servico_regeitado:element.regeitar_solicitacao,
       categoria:nova
  })
  
  console.log(usuarios)
})

console.log(verifacar_servico)

if(verifacar_Emai_Existencia > -1){
  document.querySelector(`.notificacao`).style.display = "flex";
  document.querySelector(`.notificacao`).innerHTML = verifacar_servico.length;
} else {
  document.querySelector(`.notificacao`).style.display = "none";
}

document.querySelector(`.notificacao`).addEventListener(`click`, ()=>{

  mostrar_modal_notificao();

  document.querySelector(`.notificacao`).style.display = "none";
})

function mostrar_modal_notificao() {
  document.querySelector('.modal_notificacao').style.opacity = 0;
  setTimeout(() => {
    document.querySelector(`.modal_notificacao`).style.display = "flex";
    document.querySelector('.modal_notificacao').style.opacity = 1;
  }, 200);
}

function cancelModal_notificao() {
  document.querySelector('.modal_notificacao').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modal_notificacao`).style.display = "none";
    document.querySelector('.modal_notificacao').style.opacity = 0;
  }, 200);
};

document.querySelector(`main .modal_notificacao .card_notificacao button`).onclick = cancelModal_notificao;