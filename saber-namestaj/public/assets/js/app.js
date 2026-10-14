/* ==========================================================================
   Šaber nameštaj — zajednički kod za sve stranice
   (header, footer, jezik, pretraga, wishlist, učitavanje proizvoda)
   ========================================================================== */

/* ---------- PODEŠAVANJA (ovde menjaš kontakt podatke, mreže itd.) ---------- */
const CONFIG = {
  company: "Šaber nameštaj",
  address: "Primer ulica 1, 11000 Beograd, Srbija",   // TODO: prava adresa
  phone: "+381 60 000 0000",                          // TODO: pravi telefon
  email: "info@sabernamestaj.rs",                     // TODO: pravi mejl
  mapQuery: "Beograd, Srbija",                        // TODO: tačna adresa za mapu
  social: {
    instagram: "https://www.instagram.com/",          // TODO: link profila
    facebook: "https://www.facebook.com/",
    youtube: "",
    pinterest: "",
    tiktok: "",
  },
  bistroCatalog: "/media/katalozi/bistro-katalog.pdf", // posle: https://media.<domen>/katalozi/bistro-katalog.pdf
  turnstileSiteKey: "",                                // Cloudflare Turnstile (anti-spam) site key
  languages: [
    { code: "sr", label: "Srpski" },
    { code: "en", label: "English" },
  ],
};

/* ---------- Ikonice ---------- */
const ICON = {
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 12h15M14 6l6 6-6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 4v15M6 13l6 6 6-6"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z"/></svg>',
  pinterest: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.1-.8 3.3-.2 1 .5 1.8 1.5 1.8 1.8 0 3.1-1.9 3.1-4.6 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.5 2.1-4.5 4.4 0 .9.3 1.8.8 2.3l.1.4-.3 1.1c0 .2-.2.3-.4.2-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.5-5.4 6.5-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2.9-.9 2.1-1.3 2.8A10 10 0 1 0 12 2z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.4 2.2 1.8 3.6 4 3.8v3.1c-1.5.1-2.8-.4-4-1.2v6.1c0 3.9-3.3 6.5-6.9 5.6-4.4-1.1-5.4-7.4-1-9.5 1-.5 2.1-.6 3.1-.5v3.2c-.5-.1-1-.1-1.4 0-1.6.4-2 2.6-.7 3.6 1.4 1 3.5.2 3.5-1.9V3z"/></svg>',
  logo: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 30V13.5a7 7 0 0 1 14 0V30"/><path d="M9 21h14"/><path d="M12.5 13.5a3.5 3.5 0 0 1 7 0"/></svg>',
};

/* ---------- Jezik (i18n) ---------- */
// Srpski tekst je upisan direktno u HTML (dobro za SEO i brzinu).
// Prevodi za druge jezike se učitavaju iz /i18n/<jezik>.json SAMO kad je izabran taj jezik.
const UI_SR = {
  "nav.products": "Proizvodi", "nav.materials": "Materijali i završnice", "nav.ready": "Spremno za isporuku",
  "nav.home": "Početna", "nav.projects": "Projekti", "nav.showroom": "Showroom i lokacije", "nav.about": "O nama",
  "nav.contact": "Kontakt", "nav.wishlist": "Lista želja", "nav.search": "Pretraga", "nav.menu": "Meni", "nav.close": "Zatvori",
  "search.placeholder": "Pretraži stolice, kolekcije, materijale…", "search.hint": "Upišite bar 2 slova.", "search.none": "Nema rezultata za ovu pretragu.", "search.all": "Prikaži sve rezultate",
  "footer.about": "Ručno izrađen nameštaj od masiva i savijene bukve — za ugostiteljske objekte i domove.",
  "footer.explore": "Istražite", "footer.company": "Kompanija", "footer.contact": "Kontakt", "footer.contactBtn": "Kontaktirajte nas", "footer.rights": "Sva prava zadržana.", "footer.follow": "Pratite nas",
  "card.stock": "Na lageru", "card.3d": "3D", "wish.add": "Dodaj u listu želja", "wish.remove": "Ukloni iz liste želja", "wish.added": "Dodato u listu želja", "wish.removed": "Uklonjeno iz liste želja",
  "cat.stolica": "Stolica", "cat.barska": "Barska stolica", "cat.fotelja": "Fotelja", "cat.klupa": "Klupa", "cat.tabure": "Tabure",
  "products.count": "{n} proizvoda", "products.all": "Sve", "products.empty": "Nema proizvoda koji odgovaraju filterima.",
  "product.stockIn": "Spremno za isporuku — na lageru", "product.stockQty": "{n} kom. na lageru", "product.stockOut": "Izrada po porudžbini", "product.collection": "Kolekcija", "product.category": "Tip",
  "product.dimensions": "Dimenzije", "product.materials": "Materijali", "product.inquiry": "Pošalji upit", "product.related": "Iz iste kolekcije", "product.notFound": "Proizvod nije pronađen.",
  "product.photos": "Fotografije", "product.3d": "3D model", "product.loading3d": "Učitavanje 3D modela…", "product.hint3d": "Prevucite za rotaciju · točkić za zum",
  "form.sending": "Slanje…", "form.sent": "Hvala! Poruka je poslata, javićemo vam se uskoro.", "form.error": "Slanje nije uspelo. Pišite nam direktno na ", "form.required": "Popunite obavezna polja.",
  "wishlist.empty": "Vaša lista želja je prazna.", "wishlist.browse": "Pogledajte proizvode", "wishlist.qty": "Količina", "wishlist.remove": "Ukloni",
  "insta.fallback": "Pratite nas na Instagramu", "loading": "Učitavanje…",
};

const LANG_KEY = "saber_lang";
let LANG = "sr";
let DICT = UI_SR;

function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved) return saved;
  } catch (e) {}
  return /^(sr|hr|bs|sh|cnr|me)/i.test(navigator.language || "sr") ? "sr" : "en";
}

async function loadLang(code) {
  if (code === "sr") { LANG = "sr"; DICT = UI_SR; return; }
  try {
    const r = await fetch(`/i18n/${code}.json`);
    if (!r.ok) throw new Error(r.status);
    DICT = Object.assign({}, UI_SR, await r.json());
    LANG = code;
  } catch (e) {
    console.warn("Prevod nije učitan:", e);
    LANG = "sr"; DICT = UI_SR;
  }
}

function t(key, vars) {
  let s = DICT[key] ?? UI_SR[key] ?? key;
  if (vars) for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
  return s;
}

/** Vrednost na trenutnom jeziku iz objekta {sr: "...", en: "..."} */
function L(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return v[LANG] || v.sr || Object.values(v)[0] || "";
}

function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    if (!el.dataset.i18nSr) el.dataset.i18nSr = el.innerHTML;
    const k = el.dataset.i18n;
    el.innerHTML = LANG === "sr" ? el.dataset.i18nSr : (DICT[k] ?? el.dataset.i18nSr);
  });
  root.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    if (!el.dataset.i18nPhSr) el.dataset.i18nPhSr = el.placeholder;
    el.placeholder = LANG === "sr" ? el.dataset.i18nPhSr : (DICT[el.dataset.i18nPh] ?? el.dataset.i18nPhSr);
  });
  if (root === document) {
    document.documentElement.lang = LANG;
    const tk = document.body.dataset.titleKey;
    if (tk) {
      if (!document.body.dataset.titleSr) document.body.dataset.titleSr = document.title;
      document.title = LANG === "sr" ? document.body.dataset.titleSr : (DICT[tk] ?? document.body.dataset.titleSr);
    }
  }
}

async function setLang(code) {
  try { localStorage.setItem(LANG_KEY, code); } catch (e) {}
  await loadLang(code);
  renderChrome();
  applyI18n();
  document.dispatchEvent(new CustomEvent("lang:change"));
}

/* ---------- Pomoćne funkcije ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = (s) => String(s || "").toLowerCase().replace(/đ/g, "dj").normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Vraća optimizovan URL slike. Unsplash slike se smanjuju preko njihovog CDN-a,
 *  a slike sa R2 su već smanjene u admin panelu pri otpremanju. */
function imgUrl(src, w = 800, h) {
  if (!src) return "";
  if (src.includes("images.unsplash.com")) {
    const u = new URL(src);
    u.searchParams.set("w", w);
    if (h) { u.searchParams.set("h", h); u.searchParams.set("fit", "crop"); }
    u.searchParams.set("q", "70");
    u.searchParams.set("auto", "format");
    return u.toString();
  }
  return src;
}

/** <img> sa srcset-om (za Unsplash) i lazy-load-om. ratio = visina/širina */
function imgTag(src, { w = 800, ratio, alt = "", cls = "", lazy = true, sizes = "100vw", attrs = "" } = {}) {
  if (!src) return "";
  const h = ratio ? Math.round(w * ratio) : undefined;
  let srcset = "";
  if (src.includes("images.unsplash.com")) {
    srcset = [0.5, 0.75, 1, 1.5].map((m) => {
      const ww = Math.round(w * m);
      return `${imgUrl(src, ww, ratio ? Math.round(ww * ratio) : undefined)} ${ww}w`;
    }).join(", ");
  }
  return `<img src="${esc(imgUrl(src, w, h))}"${srcset ? ` srcset="${esc(srcset)}" sizes="${sizes}"` : ""} alt="${esc(alt)}"${cls ? ` class="${cls}"` : ""}${h ? ` width="${w}" height="${h}"` : ""} ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async" ${attrs}>`;
}

/** Slika proizvoda: string (URL) ili {full, thumb} sa R2 */
function productImg(p, i = 0, size = "thumb") {
  const im = (p.images || [])[i];
  if (!im) return "";
  if (typeof im === "string") return im;
  return size === "thumb" ? (im.thumb || im.full) : (im.full || im.thumb);
}

function toast(msg) {
  let el = $(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2400);
}

/* ---------- Proizvodi (učitavanje sa keširanjem) ---------- */
// Prvo /api/products (R2 preko Pages Function), a ako ne radi — statički /data/products.json.
// Rezultat se čuva u sessionStorage 10 min da svaka stranica ne bi ponovo slala zahtev.
let _products;
async function getProducts() {
  if (_products) return _products;
  try {
    const c = JSON.parse(sessionStorage.getItem("saber_products") || "null");
    if (c && Date.now() - c.t < 10 * 60 * 1000) return (_products = c.data);
  } catch (e) {}
  let data = null;
  for (const url of ["/api/products", "/data/products.json"]) {
    try {
      const r = await fetch(url);
      if (r.ok && (r.headers.get("content-type") || "").includes("json")) { data = await r.json(); break; }
    } catch (e) {}
  }
  _products = Array.isArray(data) ? data : [];
  try { sessionStorage.setItem("saber_products", JSON.stringify({ t: Date.now(), data: _products })); } catch (e) {}
  return _products;
}

function catLabel(c) { return t("cat." + c) !== "cat." + c ? t("cat." + c) : c; }

function productCard(p, { eager = false } = {}) {
  const name = L(p.name);
  const url = `/proizvod?id=${encodeURIComponent(p.id)}`;
  const alt = productImg(p, 1);
  const inWish = Wish.has(p.id);
  return `<article class="card">
    <a href="${url}" class="card-media" aria-label="${esc(name)}">
      ${imgTag(productImg(p, 0), { w: 600, ratio: 1.25, alt: name, lazy: !eager, sizes: "(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 25vw" })}
      ${alt ? `<img class="alt" data-src="${esc(imgUrl(alt, 600, 750))}" alt="" width="600" height="750" decoding="async">` : ""}
      <div class="card-badges">
        ${p.inStock ? `<span class="badge badge--stock">${t("card.stock")}</span>` : ""}
        ${p.model ? `<span class="badge">${t("card.3d")}</span>` : ""}
      </div>
    </a>
    <div class="card-body">
      <div>
        <h3 class="card-title"><a href="${url}">${esc(name)}</a></h3>
        <div class="card-sub">${esc(p.collection || "")}${p.category ? " · " + esc(catLabel(p.category)) : ""}</div>
      </div>
      <button class="wish-btn" data-wish="${esc(p.id)}" aria-pressed="${inWish}" aria-label="${inWish ? t("wish.remove") : t("wish.add")}">${ICON.heart}</button>
    </div>
  </article>`;
}

// Druga slika kartice se učitava tek kad korisnik pređe mišem (štedi protok na mobilnom)
document.addEventListener("pointerover", (e) => {
  const media = e.target.closest?.(".card-media");
  const img = media && media.querySelector("img.alt[data-src]");
  if (img) { img.src = img.dataset.src; img.removeAttribute("data-src"); }
});

/* ---------- Lista želja (localStorage) ---------- */
const Wish = {
  KEY: "saber_wishlist",
  list() { try { return JSON.parse(localStorage.getItem(this.KEY) || "[]"); } catch (e) { return []; } },
  save(l) { try { localStorage.setItem(this.KEY, JSON.stringify(l)); } catch (e) {} document.dispatchEvent(new CustomEvent("wish:change")); },
  has(id) { return this.list().some((x) => x.id === id); },
  toggle(id) {
    const l = this.list();
    const i = l.findIndex((x) => x.id === id);
    if (i >= 0) l.splice(i, 1); else l.push({ id, qty: 1 });
    this.save(l);
    return i < 0;
  },
  setQty(id, qty) { const l = this.list(); const it = l.find((x) => x.id === id); if (it) { it.qty = Math.max(1, Math.min(999, qty | 0)); this.save(l); } },
  remove(id) { this.save(this.list().filter((x) => x.id !== id)); },
  clear() { this.save([]); },
};

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-wish]");
  if (!b) return;
  e.preventDefault();
  const added = Wish.toggle(b.dataset.wish);
  $$(`[data-wish="${CSS.escape(b.dataset.wish)}"]`).forEach((x) => {
    x.setAttribute("aria-pressed", added);
    x.setAttribute("aria-label", added ? t("wish.remove") : t("wish.add"));
  });
  toast(added ? t("wish.added") : t("wish.removed"));
});

function updateWishCount() {
  const n = Wish.list().length;
  $$(".wish-count").forEach((el) => { el.textContent = n; el.classList.toggle("has-items", n > 0); });
}
document.addEventListener("wish:change", updateWishCount);

/* ---------- Header, meni, footer ---------- */
const PAGE = document.body.dataset.page || "";
const NAV = [
  { href: "/", key: "nav.home", page: "home" },
  { href: "/proizvodi", key: "nav.products", page: "products" },
  { href: "/proizvodi?lager=1", key: "nav.ready", page: "ready" },
  { href: "/materijali", key: "nav.materials", page: "materials" },
  { href: "/projekti", key: "nav.projects", page: "projects" },
  { href: "/showroom", key: "nav.showroom", page: "showroom" },
  { href: "/o-nama", key: "nav.about", page: "about" },
  { href: "/kontakt", key: "nav.contact", page: "contact" },
  { href: "/lista-zelja", key: "nav.wishlist", page: "wishlist" },
];
const cur = (p) => (PAGE === p ? ' aria-current="page"' : "");

function renderChrome() {
  const header = $("#site-header");
  const langCur = CONFIG.languages.find((l) => l.code === LANG) || CONFIG.languages[0];
  header.className = "site-header";
  header.innerHTML = `
    <div class="header-inner">
      <button class="header-menu-btn" data-open-menu aria-label="${t("nav.menu")}" aria-expanded="false" aria-controls="drawer">${ICON.menu}</button>
      <a class="header-logo" href="/" aria-label="${CONFIG.company}">
        <span class="logo">${ICON.logo}<span class="logo-text">ŠABER<small>NAMEŠTAJ</small></span></span>
      </a>
      <nav class="header-nav" aria-label="Glavna navigacija">
        <a class="nav-link" href="/proizvodi"${cur("products")}>${t("nav.products")}</a>
        <a class="nav-link" href="/materijali"${cur("materials")}>${t("nav.materials")}</a>
        <a class="nav-link" href="/proizvodi?lager=1"${cur("ready")}>${t("nav.ready")}</a>
        <button class="divider" data-open-search aria-label="${t("nav.search")}">${ICON.search}<span class="nav-link">${t("nav.search")}</span></button>
        <a href="/lista-zelja" aria-label="${t("nav.wishlist")}"${cur("wishlist")}>${ICON.heart}<span class="wish-count"></span></a>
        <div class="lang divider">
          <button class="lang-btn" aria-haspopup="listbox" aria-expanded="false">${langCur.code.toUpperCase()} ${ICON.chevron}</button>
          <ul class="lang-list" role="listbox">
            ${CONFIG.languages.map((l) => `<li><button role="option" data-lang="${l.code}" aria-selected="${l.code === LANG}">${l.label}<span class="muted">${l.code.toUpperCase()}</span></button></li>`).join("")}
          </ul>
        </div>
      </nav>
    </div>`;

  let drawer = $("#drawer");
  if (!drawer) {
    drawer = document.createElement("aside");
    drawer.id = "drawer";
    drawer.className = "drawer";
    drawer.setAttribute("aria-hidden", "true");
    document.body.append(drawer, Object.assign(document.createElement("div"), { className: "drawer-backdrop" }));
  }
  drawer.innerHTML = `
    <div class="drawer-top">
      <button class="header-menu-btn" data-close-menu aria-label="${t("nav.close")}">${ICON.close}</button>
      <span class="header-logo"><span class="logo">${ICON.logo}<span class="logo-text">ŠABER<small>NAMEŠTAJ</small></span></span></span>
    </div>
    <nav>${NAV.map((n, i) => `<a href="${n.href}"${cur(n.page)}><span>${String(i + 1).padStart(2, "0")}</span>${t(n.key)}</a>`).join("")}</nav>
    <div class="drawer-foot">
      <div><a href="tel:${CONFIG.phone.replace(/\s/g, "")}">${CONFIG.phone}</a></div>
      <div><a href="mailto:${CONFIG.email}">${CONFIG.email}</a></div>
      <div>${CONFIG.address}</div>
    </div>`;

  let search = $(".search-overlay");
  if (!search) {
    search = document.createElement("div");
    search.className = "search-overlay";
    search.setAttribute("role", "dialog");
    search.setAttribute("aria-modal", "true");
    document.body.appendChild(search);
  }
  search.innerHTML = `
    <form class="search-bar" action="/proizvodi" role="search">
      ${ICON.search}
      <input type="search" name="q" autocomplete="off" placeholder="${t("search.placeholder")}" aria-label="${t("nav.search")}">
      <button type="button" class="close" data-close-search>${t("nav.close")}</button>
    </form>
    <div class="search-results"><p class="search-hint">${t("search.hint")}</p><div class="grid"></div></div>`;

  const footer = $("#site-footer");
  if (footer) {
    const s = CONFIG.social;
    const socials = ["instagram", "facebook", "youtube", "pinterest", "tiktok"].filter((k) => s[k])
      .map((k) => `<a href="${s[k]}" target="_blank" rel="noopener" aria-label="${k}">${ICON[k]}</a>`).join("");
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            <span class="logo">${ICON.logo}<span class="logo-text">ŠABER<small>NAMEŠTAJ</small></span></span>
            <p>${t("footer.about")}</p>
            <a class="btn" href="/kontakt">${t("footer.contactBtn")} ${ICON.arrow}</a>
          </div>
          <div>
            <h4>${t("footer.explore")}</h4>
            <ul>${NAV.slice(1, 5).map((n) => `<li><a href="${n.href}">${t(n.key)}</a></li>`).join("")}</ul>
          </div>
          <div>
            <h4>${t("footer.company")}</h4>
            <ul>${NAV.slice(5).map((n) => `<li><a href="${n.href}">${t(n.key)}</a></li>`).join("")}</ul>
          </div>
          <div>
            <h4>${t("footer.contact")}</h4>
            <ul>
              <li>${CONFIG.address}</li>
              <li><a href="tel:${CONFIG.phone.replace(/\s/g, "")}">${CONFIG.phone}</a></li>
              <li><a href="mailto:${CONFIG.email}">${CONFIG.email}</a></li>
            </ul>
            <h4 style="margin-top:24px">${t("footer.follow")}</h4>
            <div class="socials">${socials}</div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} ${CONFIG.company}. ${t("footer.rights")}</span>
          <span>Masiv · Savijena bukva · Ručna izrada</span>
        </div>
      </div>`;
  }
  updateWishCount();
  onScroll();
}

function openMenu(open) {
  document.body.classList.toggle("menu-open", open);
  document.body.classList.toggle("no-scroll", open);
  $("#drawer")?.setAttribute("aria-hidden", String(!open));
  $$("[data-open-menu]").forEach((b) => b.setAttribute("aria-expanded", String(open)));
  if (open) $("#drawer [data-close-menu]")?.focus();
}

function openSearch(open) {
  document.body.classList.toggle("search-open", open);
  document.body.classList.toggle("no-scroll", open);
  if (open) { $(".search-overlay input").focus(); getProducts(); }
}

async function runSearch(q) {
  const box = $(".search-results");
  const grid = $(".grid", box);
  const hint = $(".search-hint", box);
  const nq = norm(q.trim());
  if (nq.length < 2) { grid.innerHTML = ""; hint.textContent = t("search.hint"); return; }
  const all = await getProducts();
  const res = all.filter((p) => norm([L(p.name), p.collection, catLabel(p.category), L(p.materials), L(p.description)].join(" ")).includes(nq));
  hint.innerHTML = res.length ? `<a class="link-arrow" href="/proizvodi?q=${encodeURIComponent(q)}">${t("search.all")} (${res.length}) ${ICON.arrow}</a>` : t("search.none");
  grid.innerHTML = res.slice(0, 8).map((p) => productCard(p)).join("");
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-open-menu]")) return openMenu(true);
  if (e.target.closest("[data-close-menu]") || e.target.classList.contains("drawer-backdrop")) return openMenu(false);
  if (e.target.closest("[data-open-search]")) return openSearch(true);
  if (e.target.closest("[data-close-search]")) return openSearch(false);
  const lb = e.target.closest(".lang-btn");
  const lang = $(".lang");
  if (lb) { const o = !lang.classList.contains("open"); lang.classList.toggle("open", o); lb.setAttribute("aria-expanded", o); return; }
  const lo = e.target.closest("[data-lang]");
  if (lo) { setLang(lo.dataset.lang); return; }
  if (lang && !e.target.closest(".lang")) lang.classList.remove("open");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { openMenu(false); openSearch(false); $(".lang")?.classList.remove("open"); }
});
let _sT;
document.addEventListener("input", (e) => {
  if (e.target.matches(".search-overlay input")) { clearTimeout(_sT); _sT = setTimeout(() => runSearch(e.target.value), 180); }
});

function onScroll() {
  $("#site-header")?.classList.toggle("is-scrolled", window.scrollY > 40);
}
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Animacije pri skrolovanju ---------- */
const revealObs = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); revealObs.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" })
  : null;
function observeReveal(root = document) {
  $$(".reveal:not(.in)", root).forEach((el) => (revealObs ? revealObs.observe(el) : el.classList.add("in")));
}

/* ---------- Start ---------- */
const Saber = { CONFIG, ICON, t, L, $, $$, esc, norm, imgUrl, imgTag, productImg, productCard, getProducts, Wish, toast, observeReveal, catLabel, get lang() { return LANG; } };
window.Saber = Saber;

Saber.ready = (async () => {
  await loadLang(detectLang());
  renderChrome();
  applyI18n();
  document.documentElement.classList.remove("i18n-wait");
  observeReveal();
})();
