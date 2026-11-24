/*
  D'Laranja · configuração do site
  ------------------------------------------------------------------
  Este é o ÚNICO arquivo que a equipe precisa editar para mudar
  contato, preços, sabores, kits, regras de encomenda e a faixa de campanha.
  Tudo marcado com null ou "PENDENTE" aparece no site como "a confirmar".
*/
window.SITE = {
  nome: "D'Laranja",
  slogan: "Nada além D'Laranja.",

  /* ── Contato ─────────────────────────────────────────────────────── */
  whatsapp: {
    numero: "5527997857240", // só dígitos com DDI e DDD, ex.: 5573999998888
    mensagem: "Olá, D'Laranja! Quero fazer um pedido.",
  },
  contato: {
    email: "contato@dlaranja.com", // e-mail que recebe os formulários (FormSubmit)
    web3formsChave: "",
    assunto: "Novo contato pelo site D'Laranja",
  },
  instagram: "d.laranja", // sem @

  empresa: {
    razaoSocial: "RR Baioco LTDA ME",
    cnpj: "26.183.249/0001-73",
    endereco: "Av. Celeste Faé, 687 - Nossa Sra. da Conceição, Linhares - ES, 29900-430",
    cidade: "Linhares - ES",
    // Mesmo endereço, separado, para o Google (dados de negócio local):
    enderecoSchema: { rua: "Av. Celeste Faé, 687 - Nossa Sra. da Conceição", cidade: "Linhares", uf: "ES", cep: "29900-430" },
    horario: "Seg a sex, 8h às 18h30 · Sáb, 8h às 13h",
    // Formato do Google para os dados de negócio local:
    horarioSchema: ["Mo-Fr 08:00-18:30", "Sa 08:00-13:00"],
    areaEntrega: null, // ex.: "Centro e bairros até 5 km da loja"
    taxaEntrega: null, // ex.: "R$ 5,00" ou "grátis acima de R$ 50"
  },

  /* ── Cardápio ────────────────────────────────────────────────────── */
  // preço em reais (número) ou null enquanto não estiver definido.
  tamanhos: [
    { id: "300", nome: "300 ml", copos: "1 copo" },
    { id: "500", nome: "500 ml", copos: "2 copos" },
    { id: "1l", nome: "1 litro", copos: "4 copos" },
    { id: "2l", nome: "2 litros", copos: "8 copos" },
    { id: "5l", nome: "Galão 5 litros", copos: "20 copos" },
  ],
  sabores: [
    { id: "laranja", nome: "Laranja", nota: "O clássico da casa.", precos: { "300": null, "500": null, "1l": null, "2l": null, "5l": null } },
    { id: "morango", nome: "Morango com laranja", nota: "Laranja do dia com morango.", precos: { "300": null, "500": null, "1l": null, "2l": null, "5l": null } },
    { id: "maracuja", nome: "Laranja com maracujá", nota: "Mais azedinho, ótimo bem gelado.", precos: { "300": null, "500": null, "1l": null, "2l": null, "5l": null } },
  ],
  praticas: {
    validade: null, // ex.: "3 dias na geladeira, fechado"
    conservar: "Mantenha sempre na geladeira e agite antes de servir.",
  },

  /* ── Festas ──────────────────────────────────────────────────────── */
  festa: {
    prazoMinimoDias: null, // ex.: 2 (encomendas com pelo menos 2 dias de antecedência)
    sinal: null, // ex.: "50% na confirmação, por Pix"
    datasBloqueadas: ["12-24", "12-31"], // mês-dia sem novas encomendas quando a produção está cheia
    // Regra da calculadora: ml por convidado na primeira hora e em cada hora seguinte.
    // PENDENTE: valores de exemplo, a D'Laranja deve confirmar.
    mlPrimeiraHora: 300,
    mlHoraSeguinte: 150,
    kits: [
      { nome: "Kit Ceia", itens: null, preco: null },
      { nome: "Kit Confraternização", itens: null, preco: null },
    ],
  },

  /* ── Assinatura ──────────────────────────────────────────────────── */
  assinatura: {
    planos: [
      { nome: "1 litro por semana", preco: null },
      { nome: "2 litros por semana", preco: null },
    ],
    diaEntrega: null, // ex.: "toda terça de manhã"
  },

  /* ── Faixa de campanha (troque o texto ou desligue com ativa: false) ── */
  campanha: {
    ativa: true,
    texto: "Natal e Réveillon: garanta o suco da sua ceia.",
    botao: "Encomendar",
    link: "#festas",
  },

  frames: {
    total: 160,
    desktop: "assets/frames/desktop/f_{n}.webp",
    mobile: "assets/frames/mobile/f_{n}.webp",
  },
};
