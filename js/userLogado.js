
const primeiraLetra_usuarioLgado = (JSON.parse(localStorage.getItem(`userParaLogar`)) || []).toUpperCase();
const usuarios = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];
const servico_notificao = JSON.parse(localStorage.getItem(`salve_marcacao_notificao`)) || [];

document.querySelector(`#nome_user_cadastrado`).innerHTML =JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`))[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].nome;

document.querySelector(`#editar_user_cadastrado`).addEventListener(`click`,()=>{
  window.location.href = "pageEditar.html"
});

let currentSlider = 0;
let totalSliders = document.querySelectorAll(`main .testemunho .container-testemunho .img-icons`).length;

document.querySelector(`main .testemunho .container-testemunho .slider-testemunho`).style.width = `calc(100vw * ${totalSliders})`;

function goPrev() {
   currentSlider--;
   if(currentSlider < 0){
    currentSlider = totalSliders - 1;
   }
   updateMargin();
}
function goNext() {
   currentSlider++;
   if(currentSlider > (totalSliders-1)){
    currentSlider = 0;
   }
   document.querySelector(`.slider-controlls_1`)
   updateMargin();
}
function updateMargin() {
  let sliderWidthItem = document.querySelector(`main .testemunho .container-testemunho .img-icons`).clientWidth;
  let newMargin = (currentSlider * sliderWidthItem);
   document.querySelector(`main .testemunho .container-testemunho .slider-testemunho`).style.marginLeft= `-${newMargin}px`
}
setInterval(goNext, 5000);

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

document.querySelector(`header .menu .userLogado .dadosUser`).innerHTML= `<h1>${primeiraLetra_usuarioLgado}</h1>`;
document.querySelector(`header .menu .userLogado .descUser .cardNomeUser span`).innerHTML= `<h1>${primeiraLetra_usuarioLgado}</h1>`;

document.querySelector(`.bt-sair-userLogado`).addEventListener(`click`, ()=>{
  localStorage.removeItem(`userParaLogar`);
  localStorage.removeItem(`posPaciente_mundo_hospitalar`);
  window.location.replace("index.html");
});
document.querySelector(`header .menu .userLogado .dadosUser`).onclick = mostar_opcoes_sair_user;
document.querySelector(`header .menu .userLogado .descUser .cardNomeUser section#bt-fechar-card-user-logado h1`).onclick = mostar_opcoes_sair_user_fechar;

window.onscroll = function() {
  document.querySelector(`header`).style.boxShadow = `0px 2px 15px rgba(0, 0, 0, 0.1)`;
};
document.querySelector(`#bt-marcar-consulta`).addEventListener(`click`,()=>{
  window.location.href=  "userService.html"
});








// let verifacar_Emai_Existencia = servico_notificao.findIndex((item) => item.email_marcador_servico == usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].email);

// let verifacar_servico = servico_notificao.filter((item) => item.email_marcador_servico == usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].email);
// console.log("ver"+verifacar_servico)

// for(let i in verifacar_servico) {
//    const {data_marcador_servico,hora_marcador_servico,local_realizacao_servico_escolhido,dotor_escolhido,servico_escolhido,regeitar_solicitacao,aceitar_solicitacao} = verifacar_servico[i]
//        usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].servico_solicitado.push({
//        data:data_marcador_servico,
//        hora:hora_marcador_servico,
//        realizacao_servico:local_realizacao_servico_escolhido,
//        doctor:dotor_escolhido,
//        servico:servico_escolhido,
//        servico_aceite:aceitar_solicitacao,
//        servico_regeitado:regeitar_solicitacao,
//       categoria: "nova" 
//  })
// }

// verifacar_servico.map((element) => {

//   usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].servico_solicitado.push({
//        data:element.data_marcador_servico,
//        hora:element.hora_marcador_servico,
//        realizacao_servico:element.local_realizacao_servico_escolhido,
//        doctor:element.dotor_escolhido,
//        servico:element.servico_escolhido,
//        servico_aceite: element.aceitar_solicitacao,
//        servico_regeitado:element.regeitar_solicitacao,
//        categoria: "nova"
//   })
  
// })

console.log(usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].servico_solicitado)
let notificacao_novas = usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].servico_solicitado;
// console.log(notificacao_novas)

let section_novas_notificao = document.querySelector(`.novas_notificacao section`)
var h2_resposta = document.createElement("h2");
var h2_mais_informacao = document.createElement("h2")
h2_mais_informacao.setAttribute(`class`,`h2_margin`)
var h2_resposta_regeitada = document.createElement("h2");
var h2_mais_informacao_regeitada = document.createElement("h2")
h2_mais_informacao_regeitada.setAttribute(`class`,`h2_margin`);
h2_mais_informacao_regeitada.setAttribute(`class`,`h2_margin`)

// function renderNotificacao_novas() {

//   section_novas_notificao.innerHTML = "";

//     verifacar_servico.map(element => {
      
//       // console.log(element)
//       if(element.servico_aceite == true) {
        
//         h2_resposta.innerHTML = `A sua solicitação de Consulta na data <span>${element.data}</span> e na Hora <span>${element.hora}</span> com o doctor <span>${element.doctor}</span> foi ACEITE`;

//         if(element.realizacao_servico == "Ao Domicilio") {
//           h2_mais_informacao.innerHTML = `Podes aguardar pelo nossos pessoal`;
//         } else {
//           h2_mais_informacao.innerHTML = `Podes se deslocar ao Hospital`;
//         }
//         section_novas_notificao.append(h2_resposta)
//         section_novas_notificao.append(h2_mais_informacao)

//       } else {
      
//         h2_resposta_regeitada.innerHTML = `A sua solicitação de Consulta na data <span>${element.data}</span> e na Hora <span>${element.hora}</span> com o doctor <span>${element.doctor}</span> foi Regeitada`;

//         h2_mais_informacao_regeitada.innerHTML = `Pela tua Localização não fazer parte da nossa areia de interveção`;
        
//         section_novas_notificao.append(h2_resposta_regeitada)
//         section_novas_notificao.append(h2_mais_informacao_regeitada)
//       }

//     });
// }

// renderNotificacao_novas()

// let notificacao_antigas = usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].servico_solicitado.filter((item) => item.categoria == "antigas");
// console.log(notificacao_antigas)

// let section_antigas_notificao = document.querySelector(`.antigas_nutificacao section`)

// function renderNotifiicacao_antigas() {
//   section_antigas_notificao.innerHTML = "";

//     notificacao_antigas.map((element) => {
        
//       if(element.servico_aceite == true) {

//         h2_resposta.innerHTML = `A sua solicitação de Consulta na data <span>${element.data}</span> e na Hora <span>${element.hora}</span> com o doctor <span>${element.doctor}</span> foi ACEITE`;

//         if(element.realizacao_servico == "Ao Domicilio") {
//           h2_mais_informacao.innerHTML = `Podes aguardar pelo nossos pessoal`;
//         } else {
//           h2_mais_informacao.innerHTML = `Podes se deslocar ao Hospital`;
//         }
//         section_antigas_notificao.append(h2_resposta)
//         section_antigas_notificao.append(h2_mais_informacao)

//       } else {
//         h2_resposta_regeitada.innerHTML = `A sua solicitação de Consulta na data <span>${element.data}</span> e na Hora <span>${element.hora}</span> com o doctor <span>${element.doctor}</span> foi Regeitada`;

//         h2_mais_informacao_regeitada.innerHTML = `Pela tua Localização não fazer parte da nossa areia de interveção`;
        
//         section_antigas_notificao.append(h2_resposta_regeitada)
//         section_antigas_notificao.append(h2_mais_informacao_regeitada)
//       }

//     });
// }

// renderNotifiicacao_antigas()

// if(notificacao_novas.length != 0){
//   document.querySelector(`.notificacao`).style.display = "flex";
//   document.querySelector(`.notificacao`).innerHTML = notificacao_novas.length;
// } else {
//   document.querySelector(`.notificacao`).style.display = "none";
// }
// if(verifacar_Emai_Existencia > -1){
//   document.querySelector(`.notificacao`).style.display = "flex";
//   document.querySelector(`.notificacao`).innerHTML = verifacar_servico.length;
// } else {
//   document.querySelector(`.notificacao`).style.display = "none";
// }

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
  usuarios[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].servico_solicitado.categoria = "antiga";
  document.querySelector('.modal_notificacao').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modal_notificacao`).style.display = "none";
    document.querySelector('.modal_notificacao').style.opacity = 0;
  }, 200);
  salvePaciente();
};

document.querySelector(`main .modal_notificacao .card_notificacao button`).onclick = cancelModal_notificao;

function salvePaciente(){
  localStorage.setItem(`pacientes_mundo_hospitalar`,JSON.stringify(usuarios));
}