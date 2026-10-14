/* ==========================================================================
   Šaber nameštaj — logika pojedinačnih stranica
   ========================================================================== */
(async () => {
  await Saber.ready;
  const { t, L, $, $$, esc, norm, imgUrl, imgTag, productImg, productCard, getProducts, ICON, CONFIG, observeReveal, catLabel } = Saber;
  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);

  // Linkovi koji zavise od podešavanja (npr. katalog)
  const cfg = (path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), CONFIG);
  $$("[data-config-href]").forEach((a) => { const v = cfg(a.dataset.configHref); if (v) a.href = v; });
  $$("[data-config-text]").forEach((el) => {
    const v = cfg(el.dataset.configText);
    if (!v) return;
    el.textContent = v;
    if (el.matches('a[href^="tel:"]')) el.href = "tel:" + v.replace(/[^\d+]/g, "");
    if (el.matches('a[href^="mailto:"]')) el.href = "mailto:" + v;
  });
  if (CONFIG.social.instagram) $$("#insta-grid a").forEach((a) => (a.href = CONFIG.social.instagram));

  const inits = { home, products, ready: products, product, projects, showroom, contact, wishlist };
  if (inits[page]) await inits[page]();
  observeReveal();

  /* ------------------------------------------------------------------ */
  /* Početna                                                             */
  /* ------------------------------------------------------------------ */
  async function home() {
    const video = $("#hero-video");
    const toggle = $(".hero-toggle");
    const conn = navigator.connection || {};
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (video && !conn.saveData && !reduce) {
      // Bira se manja verzija videa za telefone (štedi protok i R2 saobraćaj)
      const w = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
      video.src = w <= 900 ? video.dataset.srcSm : w <= 1600 ? video.dataset.srcMd : video.dataset.srcLg || video.dataset.srcMd;
      video.play().catch(() => {});
      video.addEventListener("playing", () => video.classList.add("is-playing"), { once: true });
      // Pauziraj kada video nije na ekranu
      new IntersectionObserver(([en]) => {
        if (video.dataset.userPaused) return;
        en.isIntersecting ? video.play().catch(() => {}) : video.pause();
      }).observe(video);
      toggle?.addEventListener("click", () => {
        if (video.paused) { video.play(); delete video.dataset.userPaused; toggle.innerHTML = ICON.pause; }
        else { video.pause(); video.dataset.userPaused = 1; toggle.innerHTML = ICON.play; }
      });
      if (toggle) toggle.innerHTML = ICON.pause;
    } else if (toggle) toggle.remove();

    // Instagram — učitava se tek kad sekcija dođe blizu ekrana
    const insta = $("#insta-grid");
    if (insta) {
      const io = new IntersectionObserver(async ([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        try {
          const r = await fetch("/api/instagram");
          if (!r.ok) return;
          const { posts } = await r.json();
          if (!posts?.length) return;
          insta.innerHTML = posts.slice(0, 3).map((p) => `
            <a href="${esc(p.permalink)}" target="_blank" rel="noopener">
              <img src="${esc(p.image)}" alt="${esc((p.caption || "Instagram").slice(0, 120))}" loading="lazy" decoding="async" width="600" height="600">
              ${p.caption ? `<span class="cap">${esc(p.caption)}</span>` : ""}
            </a>`).join("");
        } catch (e) { /* ostaju rezervne slike iz HTML-a */ }
      }, { rootMargin: "400px" });
      io.observe(insta);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Lista proizvoda + "Spremno za isporuku"                              */
  /* ------------------------------------------------------------------ */
  async function products() {
    const grid = $("#product-grid");
    const all = await getProducts();
    const state = {
      q: params.get("q") || "",
      lager: params.get("lager") === "1",
      kolekcija: params.get("kolekcija") || "",
      tip: params.get("tip") || "",
      sort: params.get("sort") || "new",
    };
    const collections = [...new Set(all.map((p) => p.collection).filter(Boolean))];
    const cats = [...new Set(all.map((p) => p.category).filter(Boolean))];

    function chips() {
      $("#chips-collection").innerHTML = [["", t("products.all")], ...collections.map((c) => [c, c])]
        .map(([v, l]) => `<button class="chip" data-f="kolekcija" data-v="${esc(v)}" aria-pressed="${state.kolekcija === v}">${esc(l)}</button>`).join("");
      $("#chips-cat").innerHTML = cats
        .map((c) => `<button class="chip" data-f="tip" data-v="${esc(c)}" aria-pressed="${state.tip === c}">${esc(catLabel(c))}</button>`).join("");
      $("#f-stock").checked = state.lager;
      $("#f-sort").value = state.sort;
    }

    function render() {
      const nq = norm(state.q);
      let list = all.filter((p) =>
        (!state.lager || p.inStock) &&
        (!state.kolekcija || p.collection === state.kolekcija) &&
        (!state.tip || p.category === state.tip) &&
        (!nq || norm([L(p.name), p.collection, catLabel(p.category), L(p.materials), L(p.description)].join(" ")).includes(nq)));
      if (state.sort === "name") list.sort((a, b) => L(a.name).localeCompare(L(b.name), "sr"));
      else list.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

      $("#product-count").textContent = t("products.count", { n: list.length });
      grid.innerHTML = list.length ? list.map((p, i) => productCard(p, { eager: i < 4 })).join("") : `<p class="empty">${t("products.empty")}</p>`;

      // Ista stranica služi i kao "Spremno za isporuku" (?lager=1)
      delete document.documentElement.dataset.ready;
      $$("[data-mode-all]").forEach((el) => (el.hidden = state.lager));
      $$("[data-mode-ready]").forEach((el) => (el.hidden = !state.lager));
      $$(".header-nav a, .drawer nav a").forEach((a) => {
        const h = a.getAttribute("href");
        const on = h === "/proizvodi" ? !state.lager : h === "/proizvodi?lager=1" ? state.lager : null;
        if (on === null) return;
        on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
      });

      const u = new URLSearchParams();
      if (state.q) u.set("q", state.q);
      if (state.lager) u.set("lager", "1");
      if (state.kolekcija) u.set("kolekcija", state.kolekcija);
      if (state.tip) u.set("tip", state.tip);
      if (state.sort !== "new") u.set("sort", state.sort);
      history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : ""));
      $("#q-note").innerHTML = state.q ? `„${esc(state.q)}” · <button class="link-arrow" id="clear-q">${t("nav.close")}</button>` : "";
    }

    document.addEventListener("click", (e) => {
      const c = e.target.closest(".chip[data-f]");
      if (c) { const f = c.dataset.f; state[f] = state[f] === c.dataset.v && f === "tip" ? "" : c.dataset.v; chips(); render(); }
      if (e.target.id === "clear-q") { state.q = ""; render(); }
    });
    $("#f-stock").addEventListener("change", (e) => { state.lager = e.target.checked; render(); });
    $("#f-sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
    document.addEventListener("lang:change", () => { chips(); render(); });
    chips();
    render();
  }

  /* ------------------------------------------------------------------ */
  /* Pojedinačni proizvod                                                 */
  /* ------------------------------------------------------------------ */
  async function product() {
    const box = $("#product");
    const all = await getProducts();
    const p = all.find((x) => x.id === params.get("id"));
    if (!p) { box.innerHTML = `<div class="container section"><p class="empty">${t("product.notFound")}</p><p class="center"><a class="btn" href="/proizvodi">${t("nav.products")}</a></p></div>`; return; }

    let mode = "photo"; // photo | 3d
    let active = 0;

    function render() {
      const name = L(p.name);
      document.title = `${name} — Šaber nameštaj`;
      $('meta[name="description"]')?.setAttribute("content", L(p.description).slice(0, 155));
      const imgs = p.images || [];
      box.innerHTML = `
      <div class="container">
        <nav class="breadcrumbs"><a href="/">${t("nav.home")}</a> / <a href="/proizvodi">${t("nav.products")}</a> / ${esc(name)}</nav>
        <div class="product-grid">
          <div>
            <div class="viewer" id="viewer">
              ${p.model ? `<div class="viewer-tabs" role="group">
                <button data-mode="photo" aria-pressed="${mode === "photo"}">${t("product.photos")}</button>
                <button data-mode="3d" aria-pressed="${mode === "3d"}">${t("product.3d")}</button></div>` : ""}
              <div id="viewer-stage">${stage()}</div>
            </div>
            <div class="thumbs">
              ${imgs.map((_, i) => `<button data-img="${i}" aria-current="${mode === "photo" && i === active}" aria-label="${i + 1}">${imgTag(productImg(p, i, "thumb"), { w: 200, ratio: 1, alt: "" })}</button>`).join("")}
              ${p.model ? `<button class="t3d" data-mode="3d" aria-current="${mode === "3d"}">3D</button>` : ""}
            </div>
          </div>
          <div class="product-info">
            <span class="eyebrow">${esc(p.collection || "")}</span>
            <h1>${esc(name)}</h1>
            <p class="product-meta">${esc(catLabel(p.category))}</p>
            <div class="stock-line ${p.inStock ? "in" : ""}">${p.inStock ? (p.stockQty ? t("product.stockQty", { n: p.stockQty }) : t("product.stockIn")) : t("product.stockOut")}</div>
            <p class="lead">${esc(L(p.description))}</p>
            <dl class="specs">
              ${p.collection ? `<div><dt>${t("product.collection")}</dt><dd>${esc(p.collection)}</dd></div>` : ""}
              ${p.category ? `<div><dt>${t("product.category")}</dt><dd>${esc(catLabel(p.category))}</dd></div>` : ""}
              ${p.dimensions ? `<div><dt>${t("product.dimensions")}</dt><dd>${esc(L(p.dimensions))}</dd></div>` : ""}
              ${p.materials ? `<div><dt>${t("product.materials")}</dt><dd>${esc(L(p.materials))}</dd></div>` : ""}
            </dl>
            <div class="actions">
              <a class="btn btn--solid" href="/kontakt?proizvod=${encodeURIComponent(p.id)}">${t("product.inquiry")} ${ICON.arrow}</a>
              <button class="btn" data-wish="${esc(p.id)}" aria-pressed="${Saber.Wish.has(p.id)}">${ICON.heart} ${t("nav.wishlist")}</button>
            </div>
          </div>
        </div>
      </div>`;
      if (mode === "3d") mount3D();
    }

    function stage() {
      if (mode === "3d") return `<div class="viewer-loading">${t("product.loading3d")}</div>`;
      return imgTag(productImg(p, active, "full"), { w: 1100, ratio: 1, alt: L(p.name), lazy: false, sizes: "(max-width: 960px) 100vw, 58vw" });
    }

    let mvLoaded;
    async function mount3D() {
      // model-viewer (~250 KB) se učitava SAMO kad korisnik otvori 3D prikaz
      mvLoaded ||= import("https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js");
      try { await mvLoaded; } catch (e) { $("#viewer-stage").innerHTML = `<div class="viewer-loading">3D nije dostupan.</div>`; return; }
      if (mode !== "3d") return;
      $("#viewer-stage").innerHTML = `
        <model-viewer src="${esc(p.model)}" alt="${esc(L(p.name))}" camera-controls auto-rotate auto-rotate-delay="1500"
          shadow-intensity="1" exposure="1.05" environment-image="neutral" touch-action="pan-y"
          ar ar-modes="webxr scene-viewer quick-look" interaction-prompt="none" loading="eager"></model-viewer>
        <span class="viewer-hint">${t("product.hint3d")}</span>`;
    }

    box.addEventListener("click", (e) => {
      const m = e.target.closest("[data-mode]");
      if (m) { mode = m.dataset.mode; render(); return; }
      const i = e.target.closest("[data-img]");
      if (i) { mode = "photo"; active = +i.dataset.img; render(); }
    });
    document.addEventListener("lang:change", render);
    render();

    // Strukturirani podaci za Google
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "Product", name: L(p.name), description: L(p.description),
      image: (p.images || []).map((_, i) => imgUrl(productImg(p, i, "full"), 1200)), brand: { "@type": "Brand", name: "Šaber nameštaj" },
      category: catLabel(p.category), material: L(p.materials),
    });
    document.head.appendChild(ld);

    const related = all.filter((x) => x.id !== p.id && x.collection === p.collection).slice(0, 4);
    if (related.length) {
      const sec = document.createElement("section");
      sec.className = "section";
      sec.innerHTML = `<div class="container"><h2 class="reveal">${t("product.related")}</h2><div class="grid">${related.map((x) => productCard(x)).join("")}</div></div>`;
      box.after(sec);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Projekti                                                            */
  /* ------------------------------------------------------------------ */
  async function projects() {
    const box = $("#projects");
    let list = [];
    try { list = await (await fetch("/data/projects.json")).json(); } catch (e) {}
    const render = () => {
      box.innerHTML = list.map((p, i) => `
        <article class="project reveal">
          <div class="frame">${imgTag(p.image, { w: i % 4 === 0 ? 1600 : 900, ratio: i % 4 === 0 ? 9 / 21 : 2 / 3, alt: L(p.name), sizes: i % 4 === 0 ? "100vw" : "(max-width: 760px) 100vw, 50vw" })}</div>
          <h3>${esc(L(p.name))}</h3>
          <div class="meta">${esc(p.city)} · ${esc(p.year)} · ${esc(L(p.type))}${p.chairs ? ` · ${p.chairs} ${Saber.lang === "sr" ? "stolica" : "chairs"}` : ""}</div>
          ${p.text ? `<p class="muted" style="margin-top:10px">${esc(L(p.text))}</p>` : ""}
        </article>`).join("");
      observeReveal(box);
    };
    document.addEventListener("lang:change", render);
    render();
  }

  /* ------------------------------------------------------------------ */
  /* Showroom — mapa se učitava tek na klik (brže i bez kolačića)        */
  /* ------------------------------------------------------------------ */
  function showroom() {
    $$("[data-map]").forEach((btn) => btn.addEventListener("click", () => {
      const q = btn.dataset.map || CONFIG.mapQuery;
      btn.closest(".map").innerHTML = `<iframe src="https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa"></iframe>`;
    }));
  }

  /* ------------------------------------------------------------------ */
  /* Forme (kontakt + upit iz liste želja)                               */
  /* ------------------------------------------------------------------ */
  function setupTurnstile(form) {
    if (!CONFIG.turnstileSiteKey) return;
    const slot = $(".turnstile-slot", form);
    if (!slot) return;
    slot.innerHTML = `<div class="cf-turnstile" data-sitekey="${esc(CONFIG.turnstileSiteKey)}" data-theme="dark"></div>`;
    if (!document.querySelector('script[src*="turnstile"]')) {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = s.defer = true;
      document.head.appendChild(s);
    }
  }

  function handleForm(form, extra = () => ({})) {
    setupTurnstile(form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = $(".form-status", form);
      const btn = $("button[type=submit]", form);
      const data = Object.fromEntries(new FormData(form));
      if (!data.name || !data.email || !form.checkValidity()) { status.className = "form-status err"; status.textContent = t("form.required"); return; }
      Object.assign(data, extra());
      data.lang = Saber.lang;
      data.page = location.pathname;
      btn.disabled = true;
      status.className = "form-status";
      status.textContent = t("form.sending");
      try {
        const r = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.ok) throw new Error(j.error || r.status);
        status.className = "form-status ok";
        status.textContent = t("form.sent");
        form.reset();
        form.dispatchEvent(new CustomEvent("sent"));
      } catch (err) {
        status.className = "form-status err";
        status.innerHTML = `${t("form.error")}<a href="mailto:${CONFIG.email}">${CONFIG.email}</a>`;
      } finally {
        btn.disabled = false;
        window.turnstile?.reset();
      }
    });
  }

  async function contact() {
    const form = $("#contact-form");
    const pid = params.get("proizvod");
    if (pid) {
      const p = (await getProducts()).find((x) => x.id === pid);
      if (p) {
        form.subject.value = `${Saber.lang === "sr" ? "Upit za" : "Inquiry about"}: ${L(p.name)}`;
        form.message.value = Saber.lang === "sr" ? `Zdravo, zanima me model ${L(p.name)}. ` : `Hello, I'm interested in ${L(p.name)}. `;
      }
    }
    handleForm(form);
  }

  async function wishlist() {
    const box = $("#wish-list");
    const formWrap = $("#wish-form-wrap");
    const all = await getProducts();
    const items = () => Saber.Wish.list().map((w) => ({ ...w, p: all.find((p) => p.id === w.id) })).filter((x) => x.p);

    function render() {
      const list = items();
      formWrap.hidden = !list.length;
      if (!list.length) {
        box.innerHTML = `<div class="empty"><p>${t("wishlist.empty")}</p><a class="btn" href="/proizvodi">${t("wishlist.browse")} ${ICON.arrow}</a></div>`;
        return;
      }
      box.innerHTML = `<div class="wish-list">${list.map(({ p, qty }) => `
        <div class="wish-item" data-id="${esc(p.id)}">
          <a href="/proizvod?id=${encodeURIComponent(p.id)}">${imgTag(productImg(p, 0), { w: 220, ratio: 1, alt: L(p.name) })}</a>
          <div>
            <h3><a href="/proizvod?id=${encodeURIComponent(p.id)}">${esc(L(p.name))}</a></h3>
            <div class="card-sub">${esc(p.collection || "")} · ${p.inStock ? t("card.stock") : t("product.stockOut")}</div>
          </div>
          <div class="qty" aria-label="${t("wishlist.qty")}">
            <button data-q="-1" aria-label="-">−</button>
            <input type="number" min="1" max="999" value="${qty}" aria-label="${t("wishlist.qty")}">
            <button data-q="1" aria-label="+">+</button>
          </div>
          <button class="remove">${t("wishlist.remove")}</button>
        </div>`).join("")}</div>`;
    }

    box.addEventListener("click", (e) => {
      const row = e.target.closest(".wish-item");
      if (!row) return;
      const id = row.dataset.id;
      if (e.target.closest(".remove")) { Saber.Wish.remove(id); render(); }
      const q = e.target.closest("[data-q]");
      if (q) { const inp = $("input", row); inp.value = Math.max(1, (+inp.value || 1) + +q.dataset.q); Saber.Wish.setQty(id, +inp.value); }
    });
    box.addEventListener("change", (e) => {
      const row = e.target.closest(".wish-item");
      if (row && e.target.matches("input")) Saber.Wish.setQty(row.dataset.id, +e.target.value);
    });
    document.addEventListener("lang:change", render);
    render();

    const form = $("#wish-form");
    handleForm(form, () => ({
      subject: "Upit — lista želja",
      items: items().map(({ p, qty }) => ({ id: p.id, name: L(p.name), qty, inStock: !!p.inStock })),
    }));
    form.addEventListener("sent", () => { Saber.Wish.clear(); render(); });
  }
})();
