/**
 * Dados dos serviços do Mundo Hospitalar.
 *
 * Para adicionar, editar ou remover um serviço basta mexer neste ficheiro:
 * a tabela e o modal da página são gerados a partir daqui.
 *
 * Campos de cada serviço:
 *  - id          texto único, sem espaços
 *  - nome        nome do serviço
 *  - categoria   "Consulta", "Exame", "Imagiologia", ...
 *  - preco       número, em kwanzas (ex.: 15000)
 *  - dias        dias de atendimento
 *  - horario     horário de atendimento
 *  - duracao     duração aproximada
 *  - local       piso e sala
 *  - descricao   texto mostrado no modal
 *  - preparacao  (opcional) lista de cuidados antes do serviço
 *
 * NOTA: os dados abaixo são fictícios (projeto de portfólio).
 */
window.SERVICOS = [
  {
    id: "clinica-geral",
    nome: "Consulta de Clínica Geral",
    categoria: "Consulta",
    preco: 10000,
    dias: "Segunda a sexta",
    horario: "08h–18h",
    duracao: "30 minutos",
    local: "Piso 1 · Sala 2",
    descricao:
      "Primeira avaliação do seu estado de saúde. O médico trata os problemas mais comuns e encaminha para o especialista certo, se for necessário.",
    preparacao: [
      "Leve um documento de identificação",
      "Leve exames e receitas anteriores, se tiver",
    ],
  },
  {
    id: "cardiologia",
    nome: "Consulta de Cardiologia",
    categoria: "Consulta",
    preco: 25000,
    dias: "Segunda a quinta",
    horario: "09h–17h",
    duracao: "40 minutos",
    local: "Piso 2 · Sala 3",
    descricao:
      "Prevenção, diagnóstico e acompanhamento de doenças do coração e da circulação, com avaliação do risco cardiovascular.",
    preparacao: [
      "Leve a lista dos medicamentos que toma",
      "Leve eletrocardiogramas ou análises anteriores",
    ],
  },
  {
    id: "neurologia",
    nome: "Consulta de Neurologia",
    categoria: "Consulta",
    preco: 30000,
    dias: "Terça a sexta",
    horario: "10h–18h",
    duracao: "45 minutos",
    local: "Piso 2 · Sala 7",
    descricao:
      "Avaliação e tratamento de doenças do sistema nervoso, como enxaquecas, epilepsia e distúrbios do movimento.",
    preparacao: ["Leve relatórios e exames de imagem anteriores"],
  },
  {
    id: "ortopedia",
    nome: "Consulta de Ortopedia",
    categoria: "Consulta",
    preco: 25000,
    dias: "Segunda a sexta",
    horario: "08h–15h",
    duracao: "30 minutos",
    local: "Piso 1 · Sala 5",
    descricao:
      "Cuidados para ossos, articulações e lesões musculares, do diagnóstico à recuperação.",
    preparacao: [
      "Use roupa confortável",
      "Leve radiografias anteriores, se tiver",
    ],
  },
  {
    id: "pediatria",
    nome: "Consulta de Pediatria",
    categoria: "Consulta",
    preco: 18000,
    dias: "Segunda a sexta",
    horario: "08h–16h",
    duracao: "30 minutos",
    local: "Piso 1 · Sala 12",
    descricao:
      "Acompanhamento da saúde de bebés, crianças e adolescentes, incluindo crescimento, vacinação e nutrição.",
    preparacao: ["Leve o boletim de vacinas da criança"],
  },
  {
    id: "raio-x",
    nome: "Raio-X",
    categoria: "Imagiologia",
    preco: 12000,
    dias: "Segunda a sábado",
    horario: "08h–14h",
    duracao: "15 minutos",
    local: "Piso 0 · Imagiologia",
    descricao:
      "Exames de imagem rápidos, com relatório claro e entregue em tempo útil.",
    preparacao: [
      "Retire objetos metálicos da zona a examinar",
      "Informe a equipa se estiver grávida",
    ],
  },
  {
    id: "analises-clinicas",
    nome: "Análises Clínicas",
    categoria: "Laboratório",
    preco: 8000,
    dias: "Segunda a sábado",
    horario: "07h–12h",
    duracao: "15 minutos",
    local: "Piso 0 · Laboratório",
    descricao:
      "Exames laboratoriais de sangue e urina, com resultados disponíveis em tempo útil.",
    preparacao: [
      "Fique em jejum durante 8 a 12 horas, quando indicado",
      "Beba água normalmente",
    ],
  },
  {
    id: "eletrocardiograma",
    nome: "Eletrocardiograma",
    categoria: "Exame",
    preco: 15000,
    dias: "Segunda a sexta",
    horario: "09h–16h",
    duracao: "20 minutos",
    local: "Piso 2 · Sala 4",
    descricao:
      "Exame simples e sem dor que regista a atividade elétrica do coração.",
    preparacao: [
      "Use uma camisola que se tire com facilidade",
      "Evite cremes no peito no dia do exame",
    ],
  },
];
