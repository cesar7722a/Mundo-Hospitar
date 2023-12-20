var service =  JSON.parse(localStorage.getItem(`servico_mundo_hospitalar`)) || [];

const usuarios = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`)) || [];
document.querySelector(`#nome_user_cadastrado`).innerHTML = JSON.parse(localStorage.getItem(`pacientes_mundo_hospitalar`))[JSON.parse(localStorage.getItem(`posPaciente_mundo_hospitalar`))].nome;
document.querySelector(`#editar_user_cadastrado`).addEventListener(`click`,()=>{
  window.location.href = "pageEditar.html"
});

const service_marcar = [];
var contQuant_service = 0;
const primeiraLetra_usuarioLgado = (JSON.parse(localStorage.getItem(`userParaLogar`)) || []).toUpperCase();
var arrayPesquisa = service;
let ul = document.querySelector(`.card-service ul`);
let section_renderService = document.querySelector(`main .card-service ul section`);
const ce = (el)=>document.createElement(el);

// .toFixed(2)
function renderServico() {
  section_renderService.innerHTML = "";
  arrayPesquisa.map(element => {

    var posicao_service = arrayPesquisa.indexOf(element);
    let li = ce("li");
    let h4_nome = ce("h4");
    let h4_preco = ce("h4");
    let h4_dias = ce("h4");
    let h4_button = ce("h4");
    let button_marcar = ce("button");

    button_marcar.innerHTML=`Marcar`

     h4_nome.innerHTML = element.nome;
     h4_preco.innerHTML = `${JSON.parse(element.preco).toFixed(2)}  Kz`;
     h4_dias.innerHTML = element.dias;
    
      h4_button.appendChild(button_marcar);
      button_marcar.addEventListener(`click`, ()=>{
        mostrar_btn_concluir_marcacao();
        savePosService(posicao_service);
        adicionarService_marcar();
    })

    li.appendChild(h4_nome);
    li.appendChild(h4_preco);
    li.appendChild(h4_dias);
    li.appendChild(h4_button);
    section_renderService.append(li);
    ul.appendChild(section_renderService);
  });
};

function  adicionarService_marcar() {
  let nomeServico = service[JSON.parse(localStorage.getItem(`posService_mundo_hospitalar`))].nome;
  let service_existe = service_marcar.findIndex((item) => item.nome == nomeServico);

  if(service_existe > -1 ){
    mostar_moddal_servico_existente();
  } else {
    contQuant_service +=1;
     service_marcar.push({
      nome: service[JSON.parse(localStorage.getItem(`posService_mundo_hospitalar`))].nome,
      preco:service[JSON.parse(localStorage.getItem(`posService_mundo_hospitalar`))].preco,
     });
     document.querySelector(`main .concluir_marcacao span`).innerHTML= contQuant_service;
     salveService_para_marcar();
  }
};

function mostar_moddal_servico_existente() {
  document.querySelector('.modal_modal_service_existente').style.opacity = 0;
  setTimeout(() => {
    document.querySelector(`.modal_modal_service_existente`).style.display = "flex";
    document.querySelector('.modal_modal_service_existente').style.opacity = 1;
  }, 200);
}

function cancelModal_service_existente() {
  document.querySelector('.modal_modal_service_existente').style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`.modal_modal_service_existente`).style.display = "none";
    document.querySelector('.modal_modal_service_existente').style.opacity = 0;
  }, 200);
};

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
function mostrar_btn_concluir_marcacao() {
  document.querySelector('main .concluir_marcacao').style.opacity = 0;
  setTimeout(() => {
    document.querySelector(`main .concluir_marcacao`).style.display = "flex";
    document.querySelector('main .concluir_marcacao').style.opacity = 1;
  }, 200);
}
function mostraMoodal_eliminar_servico() {
  document.querySelector('.modal_alerte_elimnacao_service').style.opacity = 0;
  document.querySelector(`.modal_alerte_elimnacao_service`).style.display = "flex";
  setTimeout(() => {
    document.querySelector('.modal_alerte_elimnacao_service').style.opacity = 1;
  }, 200);
};
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
          section_renderService.innerHTML = `<div><h1>Serviço NÃO Encontrado!</h1></div>`;
          return
         }
      }
      renderServico();
  });

   
document.querySelector(`header .menu .userLogado .dadosUser`).innerHTML= `<h1>${primeiraLetra_usuarioLgado}</h1>`;
document.querySelector(`header .menu .userLogado .descUser .cardNomeUser span`).innerHTML= `<h1>${primeiraLetra_usuarioLgado}</h1>`;

document.querySelector(`.bt-sair-userLogado`).addEventListener(`click`, ()=>{
    localStorage.removeItem(`userParaLogar`);
    localStorage.removeItem(`posPaciente_mundo_hospitalar`);
    window.location.replace("index.html");
  });
  
document.querySelector(`main .concluir_marcacao button`).addEventListener(`click`,() =>{
   window.location.href = "marcação de consultas/marcacao.html";
  });
document.querySelector(`header .menu .userLogado .dadosUser`).onclick = mostar_opcoes_sair_user;
document.querySelector(`header .menu .userLogado .descUser .cardNomeUser section#bt-fechar-card-user-logado h1`).onclick = mostar_opcoes_sair_user_fechar;

document.querySelector(`#bt_ok_service`).onclick = cancelModal_service_existente;

window.onscroll = function() {
    document.querySelector(`header`).style.boxShadow = `0px 2px 15px rgba(0, 0, 0, 0.1)`;
  };

function savePosService(posicao){
    localStorage.setItem(`posService_mundo_hospitalar`,JSON.stringify(posicao));
};

function salveService_para_marcar(){
    localStorage.setItem(`service_para_marcar`,JSON.stringify(service_marcar));
};

renderServico();