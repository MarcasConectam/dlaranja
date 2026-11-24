(() => {
  const S = window.SITE || {};
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const celular = matchMedia("(max-width: 760px)").matches;


  /* ── Rolagem que toca o vídeo ─────────────────────────────────────────── */
  const cine = document.querySelector(".cine");
  const canvas = cine && cine.querySelector(".cine-canvas");
  if (cine && canvas && S.frames && S.frames.total) {
    const ctx = canvas.getContext("2d");
    const total = S.frames.total;
    const padrao = celular ? S.frames.mobile : S.frames.desktop;
    const src = (i) => padrao.replace("{n}", String(i + 1).padStart(4, "0"));
    const quadros = new Array(total);
    const momentos = [...cine.querySelectorAll(".momento")];
    let alvo = 0, atual = 0, desenhado = -1;

    const carregar = (i) => {
      if (quadros[i]) return quadros[i];
      const img = new Image();
      img.decoding = "async";
      img.src = src(i);
      img.onload = () => { if (Math.round(atual) === i || desenhado === -1) desenhar(i, true); };
      return (quadros[i] = img);
    };

    // Carrega em passadas (1 a cada 8, depois 1 a cada 4…) para cobrir o filme inteiro cedo
    carregar(0);
    if (!reduzir) {
      const fila = [];
      for (const passo of [8, 4, 2, 1]) for (let i = 0; i < total; i += passo) if (!fila.includes(i)) fila.push(i);
      let k = 0;
      const lote = () => { for (let n = 0; n < 6 && k < fila.length; n++) carregar(fila[k++]); if (k < fila.length) setTimeout(lote, 40); };
      lote();
    }

    const pronto = (i) => quadros[i] && quadros[i].complete && quadros[i].naturalWidth;
    const maisProximo = (i) => {
      for (let d = 0; d < total; d++) {
        if (pronto(i - d)) return i - d;
        if (pronto(i + d)) return i + d;
      }
      return -1;
    };

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      desenhado = -1;
      desenhar(Math.round(atual), true);
    };

    function desenhar(i, forcar) {
      const j = maisProximo(i);
      if (j < 0 || (j === desenhado && !forcar)) return;
      const img = quadros[j];
      const cw = canvas.width, ch = canvas.height;
      const escala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight); // "cover"
      const w = img.naturalWidth * escala, h = img.naturalHeight * escala;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      desenhado = j;
    }

    const progresso = () => {
      const r = cine.getBoundingClientRect();
      const curso = cine.offsetHeight - innerHeight;
      return Math.min(1, Math.max(0, -r.top / (curso || 1)));
    };

    const atualizarMomentos = (p) => {
      for (const m of momentos) {
        const de = parseFloat(m.dataset.de || 0), ate = parseFloat(m.dataset.ate || 1);
        m.classList.toggle("ativo", p >= de && (p < ate || (ate >= 1 && p >= 1)));
      }
      cine.classList.toggle("andou", p > 0.02);
    };

    const quadro = () => {
      alvo = progresso() * (total - 1);
      atual += (alvo - atual) * 0.18; // suaviza: sensação de filme, não de slide
      if (Math.abs(alvo - atual) < 0.05) atual = alvo;
      desenhar(Math.round(atual));
      atualizarMomentos(atual / (total - 1));
      requestAnimationFrame(quadro);
    };

    addEventListener("resize", ajustar);
    ajustar();
    if (reduzir) atualizarMomentos(0);
    else requestAnimationFrame(quadro);
  }

  /* ── Parallax leve nas artes ──────────────────────────────────────────── */
  const artes = reduzir ? [] : [...document.querySelectorAll(".arte")];
  if (artes.length) {
    const mover = () => {
      for (const a of artes) {
        const r = a.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        a.style.transform = `translate3d(0, ${(c * -60).toFixed(1)}px, 0) scale(1.08)`;
      }
    };
    addEventListener("scroll", () => requestAnimationFrame(mover), { passive: true });
    mover();
  }

  /* ── Topo, revelar e ano ──────────────────────────────────────────────── */
  const topo = document.querySelector(".topo");
  const whats = document.querySelector(".whats");
  let formNaTela = false; // o botão flutuante se recolhe para não cobrir o "Enviar"
  const aoRolar = () => {
    topo && topo.classList.toggle("rolou", scrollY > 40);
    whats && whats.classList.toggle("visivel", scrollY > innerHeight * 0.6 && !formNaTela);
  };
  const naTela = new Set();
  const obsForm = new IntersectionObserver((es) => { es.forEach((e) => e.isIntersecting ? naTela.add(e.target) : naTela.delete(e.target)); formNaTela = naTela.size > 0; aoRolar(); });
  document.querySelectorAll(".form").forEach((f) => obsForm.observe(f));
  addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); }
  }), { threshold: 0.18 });
  document.querySelectorAll(".revelar").forEach((el) => io.observe(el));
  document.querySelectorAll("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ══ D'Laranja ═══════════════════════════════════════════════════════ */
  const E = S.empresa || {};
  const pend = (txt) => `<span class="pendente">${txt || "a confirmar"}</span>`;
  const ok = (v) => v !== null && v !== undefined && v !== "" && v !== "PENDENTE";
  const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const set = (sel, html) => document.querySelectorAll(sel).forEach((el) => (el.innerHTML = html));
  const medir = (evento, dados) => { (window.dataLayer = window.dataLayer || []).push({ event: evento, ...dados }); };

  const numWhats = String((S.whatsapp && S.whatsapp.numero) || "").replace(/\D/g, "");
  const temWhats = numWhats.length >= 12;
  const linkWhats = (msg) => temWhats ? `https://wa.me/${numWhats}?text=${encodeURIComponent(msg)}` : "#contato";
  const abrirWhats = (msg, origem) => {
    medir("clique_whatsapp", { origem });
    if (!temWhats) { alert("O número de WhatsApp da D'Laranja ainda não foi configurado."); return false; }
    window.open(linkWhats(msg), "_blank", "noopener");
    return true;
  };

  // Botão flutuante: mensagem muda conforme a seção visível
  const msgPorSecao = {
    inicio: S.whatsapp && S.whatsapp.mensagem,
    sucos: "Olá, D'Laranja! Quero fazer um pedido.",
    festas: "Olá, D'Laranja! Quero encomendar suco para uma festa.",
    eventos: "Olá, D'Laranja! Quero um orçamento para um evento.",
    revenda: "Olá, D'Laranja! Quero revender os sucos no meu comércio.",
    assinatura: "Olá, D'Laranja! Quero assinar o suco semanal.",
  };
  const setWhats = (msg) => { if (whats) { whats.href = linkWhats(msg || msgPorSecao.inicio); } };
  setWhats();
  whats && whats.addEventListener("click", () => medir("clique_whatsapp", { origem: "flutuante" }));
  const obsSecao = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && msgPorSecao[e.target.id]) setWhats(msgPorSecao[e.target.id]); }), { rootMargin: "-45% 0px -45% 0px" });
  Object.keys(msgPorSecao).forEach((id) => { const el = document.getElementById(id); el && obsSecao.observe(el); });
  document.querySelectorAll("a[data-whats]").forEach((a) => {
    if (a.classList.contains("caminho")) return; // cartão leva à seção
    a.href = linkWhats(a.dataset.whats); a.target = "_blank"; a.rel = "noopener";
    a.addEventListener("click", () => medir("clique_whatsapp", { origem: "botao" }));
  });

  // Dados da empresa
  set("[data-endereco]", ok(E.endereco) ? E.endereco : (ok(E.cidade) ? `${E.cidade} · ${pend("rua e número")}` : pend()));
  set("[data-horario]", ok(E.horario) ? E.horario : pend());
  set("[data-area]", ok(E.areaEntrega) ? E.areaEntrega + (ok(E.taxaEntrega) ? `. Taxa: ${E.taxaEntrega}` : "") : pend());
  set("[data-entrega]", ok(E.areaEntrega) ? E.areaEntrega + (ok(E.taxaEntrega) ? `. Taxa: ${E.taxaEntrega}` : "") : pend("área e taxa a confirmar"));
  set("[data-razao]", `${ok(E.razaoSocial) ? E.razaoSocial : pend("razão social")} · CNPJ ${ok(E.cnpj) ? E.cnpj : pend()}`);
  set("[data-rodape-endereco]", ok(E.endereco) ? E.endereco : (ok(E.cidade) ? E.cidade : pend("endereço")));
  const P = S.praticas || {};
  set("[data-validade]", ok(P.validade) ? P.validade : pend());
  set("[data-conservar]", ok(P.conservar) ? P.conservar : pend());
  const mapa = document.querySelector("[data-mapa]");
  if (mapa && ok(E.endereco)) mapa.innerHTML = `<iframe title="Mapa da loja D'Laranja" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(E.endereco)}&output=embed"></iframe>`;
  const insta = document.querySelector("[data-instagram]");
  if (insta && ok(S.instagram)) { insta.hidden = false; insta.href = `https://instagram.com/${S.instagram.replace("@", "")}`; insta.target = "_blank"; insta.rel = "noopener"; }

  // Campanha
  const C = S.campanha || {};
  const camp = document.querySelector("[data-campanha]");
  if (camp && C.ativa && C.texto) {
    camp.hidden = false;
    camp.querySelector("[data-campanha-texto]").textContent = C.texto;
    const l = camp.querySelector("[data-campanha-link]"); l.textContent = C.botao || "Saiba mais"; l.href = C.link || "#sucos";
  }

  /* ── Cardápio e carrinho ─────────────────────────────────────────── */
  const tamanhos = S.tamanhos || [], sabores = S.sabores || [];
  const carrinho = new Map(); // chave "sabor|tamanho" → qtd
  const cardapio = document.querySelector("[data-cardapio]");
  if (cardapio) {
    cardapio.innerHTML = sabores.map((sb) => `
      <article class="painel sabor revelar">
        <span class="selo">Sem conservantes</span>
        <h3>${sb.nome}</h3>
        <p>${sb.nota || ""}</p>
        <ul class="itens">
          ${tamanhos.map((t) => {
            const preco = sb.precos ? sb.precos[t.id] : null;
            const chave = `${sb.id}|${t.id}`;
            return `<li class="item">
              <span class="item-nome">${t.nome}<small>${t.copos || ""}</small></span>
              <span class="item-preco">${ok(preco) ? brl(preco) : pend("preço")}</span>
              <div class="qtd" data-chave="${chave}">
                <button type="button" class="menos" aria-label="Tirar ${sb.nome} ${t.nome}">−</button>
                <output aria-label="Quantidade de ${sb.nome} ${t.nome}">0</output>
                <button type="button" class="mais" aria-label="Adicionar ${sb.nome} ${t.nome}">+</button>
              </div>
            </li>`;
          }).join("")}
        </ul>
      </article>`).join("");
    cardapio.querySelectorAll(".revelar").forEach((el) => io.observe(el));
    cardapio.addEventListener("click", (ev) => {
      const b = ev.target.closest("button"); if (!b) return;
      const box = b.closest(".qtd"), chave = box.dataset.chave;
      const n = Math.max(0, (carrinho.get(chave) || 0) + (b.classList.contains("mais") ? 1 : -1));
      n ? carrinho.set(chave, n) : carrinho.delete(chave);
      box.querySelector("output").textContent = n;
      if (b.classList.contains("mais")) medir("adicionar_carrinho", { item: chave });
      atualizarCarrinho();
    });
  }
  const barra = document.querySelector("[data-carrinho]");
  const linhaItem = (chave, q) => {
    const [sid, tid] = chave.split("|");
    const sb = sabores.find((x) => x.id === sid), t = tamanhos.find((x) => x.id === tid);
    const preco = sb && sb.precos ? sb.precos[tid] : null;
    return { texto: `${q}x ${sb ? sb.nome : sid} ${t ? t.nome : tid}`, preco: ok(preco) ? preco * q : null };
  };
  function atualizarCarrinho() {
    if (!barra) return;
    const linhas = [...carrinho].map(([c, q]) => linhaItem(c, q));
    const qtd = [...carrinho.values()].reduce((a, b) => a + b, 0);
    barra.hidden = qtd === 0;
    document.body.classList.toggle("tem-carrinho", qtd > 0);
    barra.querySelector("[data-carrinho-qtd]").textContent = `${qtd} ${qtd === 1 ? "item" : "itens"}`;
    const semPreco = linhas.some((l) => l.preco === null);
    const total = linhas.reduce((a, l) => a + (l.preco || 0), 0);
    barra.querySelector("[data-carrinho-total]").textContent = semPreco ? "total confirmado no WhatsApp" : brl(total);
  }
  barra && barra.querySelector("[data-carrinho-limpar]").addEventListener("click", () => {
    carrinho.clear(); cardapio && cardapio.querySelectorAll("output").forEach((o) => (o.textContent = 0)); atualizarCarrinho();
  });
  barra && barra.querySelector("[data-carrinho-enviar]").addEventListener("click", () => {
    const linhas = [...carrinho].map(([c, q]) => linhaItem(c, q));
    const semPreco = linhas.some((l) => l.preco === null);
    const total = linhas.reduce((a, l) => a + (l.preco || 0), 0);
    const msg = ["Olá, D'Laranja! Quero fazer este pedido:", "", ...linhas.map((l) => `• ${l.texto}${l.preco !== null ? ` (${brl(l.preco)})` : ""}`), "",
      semPreco ? "Pode me passar o total e a taxa de entrega?" : `Total dos sucos: ${brl(total)} (sem a taxa de entrega)`, "", "Nome:", "Endereço ou retirada na loja:"].join("\n");
    medir("pedido_carrinho", { itens: linhas.length, total });
    abrirWhats(msg, "carrinho");
  });

  /* ── Festas: calculadora, kits e regras ──────────────────────────── */
  const F = S.festa || {};
  const calc = document.querySelector("[data-calculadora]");
  let ultimoCalculo = "";
  const embalar = (litros) => {
    // combinação simples: galões de 5 L e garrafas de 2 L
    let ml = Math.ceil(litros * 1000), g5 = Math.floor(ml / 5000); ml -= g5 * 5000;
    let g2 = Math.ceil(ml / 2000);
    if (g2 >= 3) { g5 += 1; g2 = 0; }
    return [g5 && `${g5} ${g5 > 1 ? "galões" : "galão"} de 5 L`, g2 && `${g2} ${g2 > 1 ? "garrafas" : "garrafa"} de 2 L`].filter(Boolean).join(" + ");
  };
  if (calc) {
    const conv = calc.querySelector("#c-convidados"), hrs = calc.querySelector("#c-horas");
    const rodar = () => {
      const n = Math.max(0, +conv.value || 0), h = Math.max(1, +hrs.value || 1);
      const litros = (n * ((F.mlPrimeiraHora || 300) + (h - 1) * (F.mlHoraSeguinte || 150))) / 1000;
      const arred = Math.ceil(litros * 2) / 2;
      calc.querySelector("[data-litros]").textContent = arred.toLocaleString("pt-BR");
      const emb = n ? embalar(arred) : "";
      calc.querySelector("[data-embalagens]").textContent = emb ? `Sugestão: ${emb}.` : "";
      ultimoCalculo = n ? `${n} convidados, ${h} h de festa: cerca de ${arred.toLocaleString("pt-BR")} L (${emb})` : "";
    };
    conv.addEventListener("input", rodar); hrs.addEventListener("input", rodar); rodar();
    calc.querySelector("[data-usar-calculo]").addEventListener("click", () => {
      const t = document.querySelector("#fe-itens");
      if (t && ultimoCalculo) { t.value = ultimoCalculo + (t.value ? "\n" + t.value : ""); t.focus(); }
      medir("usar_calculadora", {});
    });
  }
  const kits = document.querySelector("[data-kits]");
  if (kits) kits.innerHTML = (F.kits || []).map((k) => `<li><strong>${k.nome}</strong>${ok(k.itens) ? k.itens : pend("itens a confirmar")} ${ok(k.preco) ? "· " + brl(k.preco) : ""}</li>`).join("");
  set("[data-prazo]", ok(F.prazoMinimoDias) ? `Peça com pelo menos ${F.prazoMinimoDias} ${F.prazoMinimoDias > 1 ? "dias" : "dia"} de antecedência.` : pend());
  set("[data-sinal]", ok(F.sinal) ? F.sinal : pend());
  const bloq = (F.datasBloqueadas || []).map((d) => d.split("-").reverse().join("/"));
  set("[data-bloqueadas]", bloq.length ? `Sem novas encomendas em ${bloq.join(" e ")}.` : "Nenhuma no momento.");
  const dataFesta = document.querySelector("#fe-data");
  if (dataFesta) {
    const min = new Date(); min.setDate(min.getDate() + (+F.prazoMinimoDias || 0));
    dataFesta.min = min.toISOString().slice(0, 10);
  }

  /* ── Assinatura ──────────────────────────────────────────────────── */
  const A = S.assinatura || {};
  const planos = document.querySelector("[data-planos]");
  if (planos) {
    planos.innerHTML = (A.planos || []).map((p) => `
      <div class="painel plano revelar">
        <strong>${p.nome}</strong>
        <span class="preco">${ok(p.preco) ? brl(p.preco) + " por semana" : pend("preço")}</span>
        <a class="botao" href="${linkWhats(`Olá, D'Laranja! Quero assinar o plano de ${p.nome}.`)}" target="_blank" rel="noopener" data-plano>Assinar</a>
      </div>`).join("");
    planos.querySelectorAll(".revelar").forEach((el) => io.observe(el));
    planos.addEventListener("click", (e) => { if (e.target.closest("[data-plano]")) medir("formulario_enviado", { tipo: "assinatura" }); });
  }
  set("[data-dia-entrega]", ok(A.diaEntrega) ? `Entrega ${A.diaEntrega}.` : `Dia de entrega: ${pend()}`);

  /* ── Formulários → WhatsApp (+ cópia por e-mail quando configurado) ── */
  const titulos = { festa: "Encomenda de festa", evento: "Orçamento de evento", revenda: "Cadastro de revendedor" };
  const rotulos = { nome: "Nome", telefone: "WhatsApp", data: "Data", horario: "Horário", recebimento: "Recebimento", endereco: "Endereço",
    itens: "Pedido", ofertas: "Aceita ofertas", pessoas: "Pessoas", local: "Local", formato: "Formato", estabelecimento: "Estabelecimento",
    tipo: "Tipo de negócio", bairro: "Bairro", volume: "Litros por semana" };
  const temEmail = ok(S.contato && S.contato.email) && /@/.test(S.contato.email);

  document.querySelectorAll("form[data-form]").forEach((form) => {
    const tipo = form.dataset.form;
    const status = form.querySelector(".form-status");
    const botao = form.querySelector("button[type=submit]");
    const avisar = (txt, cls) => { status.textContent = txt; status.className = `form-status campo--inteiro ${cls || ""}`; };

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (form.elements._honey.value) return;
      let valido = true;
      form.querySelectorAll("[required]").forEach((c) => {
        const bom = c.type === "date" ? !!c.value && (!c.min || c.value >= c.min) : c.value.trim().length > 0;
        c.closest(".campo").classList.toggle("erro", !bom);
        if (!bom) valido = false;
      });
      if (tipo === "festa" && form.elements.data.value) {
        const md = form.elements.data.value.slice(5);
        if ((F.datasBloqueadas || []).includes(md)) { valido = false; form.elements.data.closest(".campo").classList.add("erro"); return avisar("Essa data já está com a produção cheia. Escolha outra ou fale com a gente.", "falha"); }
      }
      if (!valido) return avisar("Confira os campos destacados.", "falha");

      const dados = Object.fromEntries(new FormData(form)); delete dados._honey;
      if (dados.data) dados.data = dados.data.split("-").reverse().join("/");
      const linhas = Object.entries(dados).filter(([, v]) => String(v).trim()).map(([k, v]) => `${rotulos[k] || k}: ${v}`);
      const msg = [`Olá, D'Laranja! ${titulos[tipo]}:`, "", ...linhas].join("\n");
      medir("formulario_enviado", { tipo });

      if (temEmail) {
        botao.disabled = true; avisar("Enviando…");
        const url = S.contato.web3formsChave ? "https://api.web3forms.com/submit" : `https://formsubmit.co/ajax/${encodeURIComponent(S.contato.email)}`;
        const corpo = S.contato.web3formsChave
          ? { access_key: S.contato.web3formsChave, subject: `${titulos[tipo]} · site D'Laranja`, from_name: "Site D'Laranja", ...dados }
          : { _subject: `${titulos[tipo]} · site D'Laranja`, _template: "table", _captcha: "false", ...dados };
        try { await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(corpo) }); }
        catch (e) { console.warn("Cópia por e-mail falhou:", e); }
        botao.disabled = false;
      }
      if (abrirWhats(msg, tipo)) { avisar("Pronto! Abrimos o WhatsApp com tudo preenchido. É só enviar a mensagem.", "ok"); form.reset(); }
      else if (temEmail) avisar("Recebemos seu pedido por e-mail. Em breve a gente responde.", "ok");
    });
  });

  /* ── Dados estruturados de negócio local (SEO) ───────────────────── */
  const ld = { "@context": "https://schema.org", "@type": "JuiceBar", name: "D'Laranja", slogan: S.slogan, image: new URL("assets/logo.png", location.href).href, url: new URL("./", location.href).href };
  const ES = E.enderecoSchema;
  if (ES) ld.address = { "@type": "PostalAddress", streetAddress: ES.rua, addressLocality: ES.cidade, addressRegion: ES.uf, postalCode: ES.cep, addressCountry: "BR" };
  else if (ok(E.endereco)) ld.address = E.endereco;
  else if (ok(E.cidade)) ld.address = { "@type": "PostalAddress", addressLocality: E.cidade.split(" - ")[0], addressRegion: (E.cidade.split(" - ")[1] || ""), addressCountry: "BR" };
  ld.areaServed = E.cidade || undefined;
  if (temWhats) ld.telephone = "+" + numWhats;
  if (E.horarioSchema) ld.openingHours = E.horarioSchema;
  if (ok(E.razaoSocial)) ld.legalName = E.razaoSocial;
  if (ok(E.cnpj)) ld.taxID = E.cnpj;
  const sc = document.createElement("script"); sc.type = "application/ld+json"; sc.textContent = JSON.stringify(ld); document.head.appendChild(sc);
})();
