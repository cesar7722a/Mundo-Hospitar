const ce = (el)=>document.createElement(el);
let ul = document.querySelector(`.card-service ul`);
const service_a_marcar = JSON.parse(localStorage.getItem(`service_para_marcar`)) || [];
let section_renderService = document.querySelector(`.card-service ul section`);

function renderServico() {
  section_renderService.innerHTML = "";
  service_a_marcar.map(element => {

    var posicao_service = service_a_marcar.indexOf(element);
    let li = ce("li");
    let h4_nome = ce("h4");
    let h4_preco = ce("h4");
    let h4_button = ce("h4");
    let button_eliminar = ce("button");

    button_eliminar.innerHTML=`Eliminar`

     h4_nome.innerHTML = element.nome;
     h4_preco.innerHTML = `${JSON.parse(element.preco).toFixed(2)}  Kz`;
    
      h4_button.appendChild(button_eliminar);
      button_eliminar.addEventListener(`click`, ()=>{
        removerService_para_marcar(posicao_service);
    })

    li.appendChild(h4_nome);
    li.appendChild(h4_preco);
    li.appendChild(h4_button);
    section_renderService.append(li);
    ul.appendChild(section_renderService);
  });
};

function removerService_para_marcar(posicao) {
  service_a_marcar.splice(posicao, 1);
  renderServico();
  salveService_para_marcar();
};

function salveService_para_marcar(){
  localStorage.setItem(`service_para_marcar`,JSON.stringify(service_a_marcar));
}

document.querySelector(`.bt_continuar_marcacao`).addEventListener(`click`, ()=> window.location.href="preRecibo.html");
document.querySelector(`.bt_cancelar_marcacao`).addEventListener(`click`, ()=> {
  window.location.href = "../userService.html"
  localStorage.removeItem(`service_para_marcar`);
});

renderServico();