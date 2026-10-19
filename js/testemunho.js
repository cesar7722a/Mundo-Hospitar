/**
 * Carrossel de testemunhos (Home e Sobre nós).
 *
 * HTML esperado dentro de <section class="testemunho">:
 *   .container-testemunho > .slider-testemunho > .img-icons  (um por slide)
 *   .bt-slide-testemunho com .slider-prev, .slider-dots, .slider-next, .slider-pausa
 *
 * Melhorias face ao código antigo:
 *  - desloca com transform em % (continua certo ao redimensionar a janela)
 *  - a rotação automática pára com o rato por cima, com foco dentro, com o
 *    separador escondido e quando o utilizador carrega em "pausar"
 *  - não roda sozinho se o sistema pede movimento reduzido
 *  - slides fora de vista ficam inertes (não são lidos nem focáveis)
 *  - pontos clicáveis para escolher um testemunho
 */
(function () {
  "use strict";

  var INTERVALO_MS = 5000;

  function iniciar() {
    var secao = document.querySelector("main .testemunho");
    if (!secao) return;

    var regiao = secao.querySelector(".container-testemunho");
    var pista = secao.querySelector(".slider-testemunho");
    var slides = Array.prototype.slice.call(
      secao.querySelectorAll(".img-icons"),
    );
    var controlos = secao.querySelector(".bt-slide-testemunho");
    if (!regiao || !pista || !controlos || slides.length < 2) return;

    var anterior = controlos.querySelector(".slider-prev");
    var seguinte = controlos.querySelector(".slider-next");
    var pausa = controlos.querySelector(".slider-pausa");
    var caixaPontos = controlos.querySelector(".slider-dots");

    var reduzMovimento =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var atual = 0;
    var temporizador = null;
    var pausadoPeloUtilizador = false;
    var pausadoTemporariamente = false;

    /* ----- pontos ----- */
    var pontos = slides.map(function (_, i) {
      var ponto = document.createElement("button");
      ponto.type = "button";
      ponto.setAttribute(
        "aria-label",
        "Ir para o testemunho " + (i + 1) + " de " + slides.length,
      );
      ponto.addEventListener("click", function () {
        ir(i);
        reiniciarAuto();
      });
      caixaPontos.append(ponto);
      return ponto;
    });

    /* ----- navegação ----- */
    function ir(indice) {
      atual = (indice + slides.length) % slides.length;
      pista.style.transform = "translateX(-" + atual * 100 + "%)";

      slides.forEach(function (slide, i) {
        var ativo = i === atual;
        slide.inert = !ativo;
        slide.setAttribute("aria-hidden", ativo ? "false" : "true");
      });
      pontos.forEach(function (ponto, i) {
        if (i === atual) ponto.setAttribute("aria-current", "true");
        else ponto.removeAttribute("aria-current");
      });
    }

    /* ----- rotação automática ----- */
    function autoPermitido() {
      return (
        !reduzMovimento && !pausadoPeloUtilizador && !pausadoTemporariamente
      );
    }

    function pararAuto() {
      clearInterval(temporizador);
      temporizador = null;
      // com rotação automática o leitor de ecrã não deve ser interrompido;
      // quando parada, anuncia a mudança de testemunho
      regiao.setAttribute("aria-live", "polite");
    }

    function iniciarAuto() {
      pararAuto();
      if (!autoPermitido()) return;
      regiao.setAttribute("aria-live", "off");
      temporizador = setInterval(function () {
        ir(atual + 1);
      }, INTERVALO_MS);
    }

    function reiniciarAuto() {
      iniciarAuto();
    }

    /* ----- eventos ----- */
    anterior.addEventListener("click", function () {
      ir(atual - 1);
      reiniciarAuto();
    });
    seguinte.addEventListener("click", function () {
      ir(atual + 1);
      reiniciarAuto();
    });

    // Setas do teclado quando o foco está nos controlos
    controlos.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        ir(atual - 1);
        reiniciarAuto();
      } else if (e.key === "ArrowRight") {
        ir(atual + 1);
        reiniciarAuto();
      }
    });

    secao.addEventListener("mouseenter", function () {
      pausadoTemporariamente = true;
      iniciarAuto();
    });
    secao.addEventListener("mouseleave", function () {
      pausadoTemporariamente = secao.contains(document.activeElement);
      iniciarAuto();
    });
    secao.addEventListener("focusin", function () {
      pausadoTemporariamente = true;
      iniciarAuto();
    });
    secao.addEventListener("focusout", function (e) {
      pausadoTemporariamente = secao.contains(e.relatedTarget);
      iniciarAuto();
    });
    document.addEventListener("visibilitychange", function () {
      pausadoTemporariamente = document.hidden;
      iniciarAuto();
    });

    if (pausa) {
      if (reduzMovimento) {
        pausa.hidden = true; // não há rotação automática para pausar
      } else {
        pausa.addEventListener("click", function () {
          pausadoPeloUtilizador = !pausadoPeloUtilizador;
          pausa.setAttribute(
            "aria-label",
            pausadoPeloUtilizador
              ? "Retomar rotação automática"
              : "Pausar rotação automática",
          );
          pausa.querySelector("i").className = pausadoPeloUtilizador
            ? "fas fa-play"
            : "fas fa-pause";
          iniciarAuto();
        });
      }
    }

    /* ----- arranque ----- */
    controlos.hidden = false; // só aparece se o JavaScript funcionar
    ir(0);
    iniciarAuto();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
