
const servico_notificao = JSON.parse(localStorage.getItem(`salve_marcacao_notificao`)) || [];

var notificao_antigas = JSON.parse(localStorage.getItem(`notificao_antigas`)) || [];
var service =  JSON.parse(localStorage.getItem(`servico_mundo_hospitalar`)) || [];
document.querySelector(`.notificacao span`).style.display = "none"


const notificacao_novas = servico_notificao.filter((element) => element.aceitar_solicitacao == false);
document.querySelector(`.notificacao span`).style.display = "none";

if (notificacao_novas != []) {
  document.querySelector(`.notificacao span`).style.display = "flex";
  document.querySelector(`.notificacao span`).innerHTML = notificacao_novas.length;
} else {
  document.querySelector(`.notificacao span`).style.display = "none";
}

function render_notificacao() {

  notificacao_novas.map((element)=>{
  if(element.aceitar_solicitacao != true) {
    var posicao_service = servico_notificao.indexOf(element);

    let h3_nome_marcador = document.createElement("h3");
    h3_nome_marcador.setAttribute(`id`,`nome_marcador_servico`)
    h3_nome_marcador.innerHTML= `<span>${element.nome_marcador_servico}</span><span> solicitou os serviço</span>`
    let section_service = document.createElement("section");
    let section_dotor = document.createElement("section");
    let div_data_dotor = document.createElement("div");
    let preco = 0;

    let div_bt_aceitar_regeitar = document.createElement("div")
        div_bt_aceitar_regeitar.setAttribute(`class`,`div_bt_aceitar_regeitar`);
    let bt_aceitar = document.createElement("button");
    let bt_regeitar = document.createElement("button");
        bt_aceitar.innerText = "Aceitar Solicitação";
        bt_regeitar.innerText = "Regeitar Solicitação";
        div_bt_aceitar_regeitar.appendChild(bt_aceitar);
        div_bt_aceitar_regeitar.appendChild(bt_regeitar);

    div_data_dotor.setAttribute(`class`,`data_dotor`);

    bt_aceitar.addEventListener(`click`, () =>{
      bt_aceitar.setAttribute(`class`,`btn_visitado`)
      bt_regeitar.setAttribute(`class`,`btn_visitado`)
      element.aceitar_solicitacao = true;
      salve_marcacao_notificao();
    });

    bt_regeitar.addEventListener(`click`, () =>{
      bt_regeitar.setAttribute(`class`,`btn_visitado`)
      bt_aceitar.setAttribute(`class`,`btn_visitado`)
      element.regeitar_solicitacao = true;
      salve_marcacao_notificao();
    });


    element.servico_escolhido.map((item)=>{
         let h4_service = document.createElement("h4");
         h4_service.innerHTML = `- ${item.nome}`;
         section_service.appendChild(h4_service);
         preco += JSON.parse(item.preco);
    });

   let h3_data = document.createElement("h3");
   h3_data.setAttribute(`id`,`h3_data_hora`)
   h3_data.innerHTML = "<span>Data e Hora</span><span>Doctor Escolhido</span><span>Realização do Serviço</span>";

   let section_data_hora = document.createElement("section");
   let h4_data = document.createElement("h4");
   let h4_hora = document.createElement("h4");
   let h4_dotor = document.createElement("h4");
   
   h4_data.innerHTML = `- Data: <span>${element.data_marcador_servico}</span>`;
   h4_hora.innerHTML = `- Hora: <span>${element.hora_marcador_servico}</span>`;
   h4_dotor.innerHTML = `- ${element.dotor_escolhido}`

   section_data_hora.appendChild(h4_data);
   section_data_hora.appendChild(h4_hora);

   section_dotor.appendChild(h4_dotor);
   div_data_dotor.appendChild(section_data_hora)
   div_data_dotor.appendChild(section_dotor)
    
   let h4_local = document.createElement("h4");
   let h4_preco = document.createElement("h4");

   h4_preco.innerHTML = `- <span>Preço:</span><span>${preco}</span>`
   h4_local.innerHTML = `- ${element.local_realizacao_servico_escolhido}`;

   if(element.local_realizacao_servico_escolhido == "Ao Domicilio") {
    h4_preco.innerHTML = `- <span>Preço:</span><span>${preco +100000}</span>`
   } 
   let section_local_realizacao_preco = document.createElement("section");
   section_local_realizacao_preco.appendChild(h4_local)
   section_local_realizacao_preco.appendChild(h4_preco)
   div_data_dotor.appendChild(section_local_realizacao_preco)

    document.querySelector(`.card_servico_soltados`).appendChild(h3_nome_marcador);
    document.querySelector(`.card_servico_soltados`).appendChild(section_service);
    document.querySelector(`.card_servico_soltados`).appendChild(h3_data);
    document.querySelector(`.card_servico_soltados`).appendChild(div_data_dotor);
    document.querySelector(`.card_servico_soltados`).appendChild(div_bt_aceitar_regeitar);
  }
  });
}

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

render_notificacao();

function notificaoAntigas() {
   servico_notificao.map(element => {
    element.aceitar_solicitacao = true
   });
   salve_marcacao_notificao()
    notificao_antigas = servico_notificao.filter((element) => element.aceitar_solicitacao == true);
    notificao_antigas_salve()  
} 

function renderNotificacaoAntigas() {

  notificao_antigas.map((element)=>{
    var posicao_service = servico_notificao.indexOf(element);

    let h3_nome_marcador_antigas = document.createElement("h3");
    h3_nome_marcador_antigas.setAttribute(`class`,`nome_marcador_servico`)
    h3_nome_marcador_antigas.innerHTML= `<span>${element.nome_marcador_servico}</span><span> solicitou os serviço</span>`
    let section_service = document.createElement("section");
    let section_dotor = document.createElement("section");
    let div_data_dotor = document.createElement("div");
    let preco = 0;

    let div_bt_aceitar_regeitar = document.createElement("div")
        div_bt_aceitar_regeitar.setAttribute(`class`,`div_bt_aceitar_regeitar`);
    let bt_aceitar = document.createElement("button");
    let bt_regeitar = document.createElement("button");
        bt_aceitar.innerText = "Aceitar Solicitação";
        bt_regeitar.innerText = "Regeitar Solicitação";
        div_bt_aceitar_regeitar.appendChild(bt_aceitar);
        div_bt_aceitar_regeitar.appendChild(bt_regeitar);

    div_data_dotor.setAttribute(`class`,`data_dotor`);

    bt_aceitar.addEventListener(`click`, () =>{
      bt_aceitar.setAttribute(`class`,`btn_visitado`)
      bt_regeitar.setAttribute(`class`,`btn_visitado`)
      element.aceitar_solicitacao = true;
      salve_marcacao_notificao();
    });

    bt_regeitar.addEventListener(`click`, () =>{
      bt_regeitar.setAttribute(`class`,`btn_visitado`)
      bt_aceitar.setAttribute(`class`,`btn_visitado`)
      element.regeitar_solicitacao = true;
      salve_marcacao_notificao();
    });

    element.servico_escolhido.map((item)=>{
         let h4_service = document.createElement("h4");
         h4_service.innerHTML = `- ${item.nome}`;
         section_service.appendChild(h4_service);
         preco += JSON.parse(item.preco);
    });

   let h3_data = document.createElement("h3");
   h3_data.setAttribute(`class`,`h3_data_hora`)
   h3_data.innerHTML = "<span>Data e Hora</span><span>Doctor Escolhido</span><span>Realização do Serviço</span>"

   let section_data_hora = document.createElement("section")
   let h4_data = document.createElement("h4");
   let h4_hora = document.createElement("h4");
   let h4_dotor = document.createElement("h4");
   
   h4_data.innerHTML = `- Data: <span>${element.data_marcador_servico}</span>`
   h4_hora.innerHTML = `- Hora: <span>${element.hora_marcador_servico}</span>`
   h4_dotor.innerHTML = `- ${element.dotor_escolhido}`

   section_data_hora.appendChild(h4_data);
   section_data_hora.appendChild(h4_hora);

   section_dotor.appendChild(h4_dotor);
   div_data_dotor.appendChild(section_data_hora)
   div_data_dotor.appendChild(section_dotor)
    
   let h4_local = document.createElement("h4");
   let h4_preco = document.createElement("h4");

   h4_preco.innerHTML = `- <span>Preço:</span><span>${preco}</span>`
   h4_local.innerHTML = `- ${element.local_realizacao_servico_escolhido}`;

   if(element.local_realizacao_servico_escolhido == "Ao Domicilio") {
    h4_preco.innerHTML = `- <span>Preço:</span><span>${preco +100000}</span>`
   } 
   let section_local_realizacao_preco = document.createElement("section");
   section_local_realizacao_preco.appendChild(h4_local)
   section_local_realizacao_preco.appendChild(h4_preco)
   div_data_dotor.appendChild(section_local_realizacao_preco)

    document.querySelector(`.notificacao_antigas div`).append(h3_nome_marcador_antigas);
    document.querySelector(`.notificacao_antigas div`).append(section_service);
    document.querySelector(`.notificacao_antigas div`).append(h3_data);
    document.querySelector(`.notificacao_antigas div`).append(div_data_dotor);
    document.querySelector(`.notificacao_antigas div`).append(div_bt_aceitar_regeitar);
  });
}

renderNotificacaoAntigas()

document.querySelector(`.fa-bell`).addEventListener(`click`,()=>{
  mostrar_modal_notificao()
})

document.querySelector(`#notificacao_quantidade`).addEventListener(`click`,()=>{
  mostrar_modal_notificao()
})

document.querySelector(`.bt_cancelar_modal #cancelar_modal_eliminar_paciente`).addEventListener(`click`, ()=>{
  notificaoAntigas()
  cancelModal_notificao()
});


function salve_marcacao_notificao(){
  localStorage.setItem(`salve_marcacao_notificao`,JSON.stringify(servico_notificao));
};
function notificao_antigas_salve(){
  localStorage.setItem(`notificao_antigas`,JSON.stringify(notificao_antigas));
};

var ul = document.querySelector(`.melhor_servico .servico`);

function renderServico() {

  service.map(element => {

    let li = document.createElement("li");
    let h3_nome = document.createElement("h3");
    let h3_preco = document.createElement("h3");
    let h3_dias = document.createElement("h3");

    h3_nome.innerHTML = element.nome;
    h3_preco.innerHTML = `${(JSON.parse(element.preco)).toFixed(2)} Kz`;
    h3_dias.innerHTML = element.dias;
    li.appendChild(h3_nome);
    li.appendChild(h3_preco);
    li.appendChild(h3_dias);
    ul.appendChild(li)
  })
}
renderServico();

window.onscroll = function() {
  document.querySelector(`header`).style.boxShadow = `0px 2px 15px rgba(0, 0, 0, 0.1)`;
};
