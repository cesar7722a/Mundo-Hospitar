/**
 * Dados dos doutores do Mundo Hospitalar.
 *
 * Para adicionar, editar ou remover um doutor basta mexer neste ficheiro:
 * a lista e o modal da página são gerados a partir daqui.
 *
 * Campos de cada doutor:
 *  - id               texto único, sem espaços (usado para ligar o cartão ao modal)
 *  - titulo           "Dr." ou "Dra."
 *  - nome             nome a mostrar
 *  - especialidade    área médica
 *  - foto             caminho da imagem
 *  - resumo           frase curta mostrada no cartão
 *  - sobre            texto mais longo mostrado no modal
 *  - experienciaAnos  número de anos de experiência
 *  - formacao         lista de formações
 *  - idiomas          lista de idiomas
 *  - horario          horário de atendimento
 *  - local            piso e sala
 *
 * NOTA: os dados abaixo são fictícios (projeto de portfólio).
 */
window.DOUTORES = [
  {
    id: "joana",
    titulo: "Dra.",
    nome: "Joana",
    especialidade: "Pediatria",
    foto: "assets/img/doctors/doc/doctor_1.jpg",
    resumo:
      "Acompanha bebés, crianças e adolescentes, com foco na prevenção e no desenvolvimento saudável.",
    sobre:
      "A Dra. Joana acompanha a saúde de bebés, crianças e adolescentes desde o nascimento. Dá especial atenção à vacinação, à nutrição e ao desenvolvimento, e trabalha de perto com as famílias.",
    experienciaAnos: 12,
    formacao: ["Licenciatura em Medicina", "Especialidade em Pediatria"],
    idiomas: ["Português", "Inglês"],
    horario: "Segunda a sexta, 08h–16h",
    local: "Piso 1 · Sala 12",
  },
  {
    id: "pedro",
    titulo: "Dr.",
    nome: "Pedro",
    especialidade: "Cardiologia",
    foto: "assets/img/doctors/doc/doctor_2.jpg",
    resumo:
      "Prevenção, diagnóstico e acompanhamento de doenças do coração e da circulação.",
    sobre:
      "O Dr. Pedro dedica-se à prevenção e ao tratamento de doenças cardiovasculares. Realiza consultas de rotina, avaliações de risco e o acompanhamento de doentes crónicos.",
    experienciaAnos: 15,
    formacao: ["Licenciatura em Medicina", "Especialidade em Cardiologia"],
    idiomas: ["Português", "Inglês", "Francês"],
    horario: "Segunda a quinta, 09h–17h",
    local: "Piso 2 · Sala 3",
  },
  {
    id: "rosa",
    titulo: "Dra.",
    nome: "Rosa",
    especialidade: "Neurologia",
    foto: "assets/img/doctors/doc/doctor_3.jpg",
    resumo:
      "Avaliação e tratamento de doenças do sistema nervoso, como enxaquecas e epilepsia.",
    sobre:
      "A Dra. Rosa avalia e trata doenças do cérebro e do sistema nervoso. Acompanha casos de enxaqueca, epilepsia e distúrbios do movimento, com um plano de cuidados para cada doente.",
    experienciaAnos: 10,
    formacao: ["Licenciatura em Medicina", "Especialidade em Neurologia"],
    idiomas: ["Português", "Inglês"],
    horario: "Terça a sexta, 10h–18h",
    local: "Piso 2 · Sala 7",
  },
  {
    id: "carlos",
    titulo: "Dr.",
    nome: "Carlos",
    especialidade: "Ortopedia",
    foto: "assets/img/doctors/doc/team-1.jpg",
    resumo:
      "Cuidados para ossos, articulações e lesões musculares, do diagnóstico à recuperação.",
    sobre:
      "O Dr. Carlos trata lesões e doenças dos ossos, articulações e músculos. Acompanha os doentes desde o diagnóstico até à reabilitação, incluindo lesões desportivas e de trabalho.",
    experienciaAnos: 14,
    formacao: ["Licenciatura em Medicina", "Especialidade em Ortopedia"],
    idiomas: ["Português", "Espanhol"],
    horario: "Segunda a sexta, 08h–15h",
    local: "Piso 1 · Sala 5",
  },
  {
    id: "marta",
    titulo: "Dra.",
    nome: "Marta",
    especialidade: "Radiologia",
    foto: "assets/img/doctors/doc/team-2.jpg",
    resumo:
      "Exames de imagem, como raio-X, com relatórios claros e entregues em tempo útil.",
    sobre:
      "A Dra. Marta coordena os exames de imagem do hospital, incluindo raio-X. Interpreta os resultados e explica-os de forma clara, em articulação com os restantes especialistas.",
    experienciaAnos: 9,
    formacao: ["Licenciatura em Medicina", "Especialidade em Radiologia"],
    idiomas: ["Português", "Inglês"],
    horario: "Segunda a sábado, 08h–14h",
    local: "Piso 0 · Sala de Imagiologia",
  },
  {
    id: "ines",
    titulo: "Dra.",
    nome: "Inês",
    especialidade: "Clínica Geral",
    foto: "assets/img/doctors/doc/team-3.jpg",
    resumo:
      "Primeira consulta, check-ups e acompanhamento da saúde de toda a família.",
    sobre:
      "A Dra. Inês é o primeiro contacto de muitos doentes. Faz consultas de rotina e check-ups, trata problemas comuns e encaminha para o especialista certo sempre que necessário.",
    experienciaAnos: 8,
    formacao: [
      "Licenciatura em Medicina",
      "Pós-graduação em Medicina Geral e Familiar",
    ],
    idiomas: ["Português", "Inglês"],
    horario: "Segunda a sexta, 08h–18h",
    local: "Piso 1 · Sala 2",
  },
];
