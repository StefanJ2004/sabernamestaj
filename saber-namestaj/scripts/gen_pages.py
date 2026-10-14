"""Jednokratni generator HTML stranica (zajednički <head> i šablon)."""
import sys, os, html

OUT = sys.argv[1]
V = "1"  # verzija asseta (?v=) — povećaj kad menjaš CSS/JS

def U(pid):
    return f"https://images.unsplash.com/{pid}"

def src(pid, w, ratio=None):
    s = f"{U(pid)}?w={w}&q=70&auto=format"
    if ratio:
        s += f"&h={round(w*ratio)}&fit=crop"
    return s

def img(pid, w=800, ratio=None, alt="", sizes="100vw", lazy=True, cls=""):
    srcset = ", ".join(f"{src(pid, round(w*m), ratio)} {round(w*m)}w" for m in (0.5, 0.75, 1, 1.5))
    dims = f' width="{w}" height="{round(w*ratio)}"' if ratio else ""
    load = 'loading="lazy"' if lazy else 'fetchpriority="high"'
    c = f' class="{cls}"' if cls else ""
    return (f'<img src="{html.escape(src(pid, w, ratio))}" srcset="{html.escape(srcset)}" sizes="{sizes}" '
            f'alt="{html.escape(alt)}"{dims}{c} {load} decoding="async">')

HEAD_INLINE = ("<script>try{var l=localStorage.getItem('saber_lang')||(/^(sr|hr|bs|sh|cnr|me)/i.test(navigator.language)?'sr':'en');"
               "if(l!=='sr'){document.documentElement.classList.add('i18n-wait');document.documentElement.lang=l}}catch(e){}</script>")

def page(fname, *, title, desc, page_id, title_key, body, extra_head="", has_hero=False, og_image=None):
    og = og_image or src("photo-1768203634842-ece3bb915cc1", 1200, 0.525)
    doc = f"""<!doctype html>
<html lang="sr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{html.escape(desc)}">
<meta name="theme-color" content="#0f0e0d">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Šaber nameštaj">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:image" content="{html.escape(og)}">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap">
<link rel="stylesheet" href="/assets/css/main.css?v={V}">
{HEAD_INLINE}
<script src="/assets/js/app.js?v={V}" defer></script>
<script src="/assets/js/pages.js?v={V}" defer></script>
{extra_head}</head>
<body data-page="{page_id}" data-title-key="{title_key}"{' class="has-hero"' if has_hero else ''}>
<a class="skip-link" href="#main">Preskoči na sadržaj</a>
<header id="site-header" class="site-header"></header>
<main id="main">
{body}
</main>
<footer id="site-footer"></footer>
</body>
</html>
"""
    path = os.path.join(OUT, fname)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(doc)

ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 12h15M14 6l6 6-6 6"/></svg>'
DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 4v15M6 13l6 6 6-6"/></svg>'
DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>'

def page_head(eyebrow_key, eyebrow, h1_key, h1, lead_key, lead):
    return f"""<section class="page-head">
  <div class="container">
    <span class="eyebrow" data-i18n="{eyebrow_key}">{eyebrow}</span>
    <h1 data-i18n="{h1_key}">{h1}</h1>
    <p class="lead" data-i18n="{lead_key}">{lead}</p>
  </div>
</section>"""

def page_hero(pid, eyebrow_key, eyebrow, h1_key, h1, lead_key=None, lead=None):
    lead_html = f'<p class="lead" data-i18n="{lead_key}">{lead}</p>' if lead else ""
    return f"""<section class="page-hero">
  {img(pid, 1600, 0.45, "", lazy=False)}
  <div class="container">
    <span class="eyebrow" data-i18n="{eyebrow_key}">{eyebrow}</span>
    <h1 data-i18n="{h1_key}">{h1}</h1>
    {lead_html}
  </div>
</section>"""

# ---------------------------------------------------------------- POČETNA
VID = "https://videos.pexels.com/video-files/5972626/5972626-{}_25fps.mp4"
HERO_POSTER = "photo-1497219055242-93359eeed651"
home = f"""<section class="hero" aria-label="Uvodni video">
  {img(HERO_POSTER, 1600, None, "Ručna obrada drveta u radionici", lazy=False, cls="hero-poster")}
  <video id="hero-video" muted playsinline loop preload="none" aria-hidden="true"
    data-src-sm="{VID.format('sd_960_540')}"
    data-src-md="{VID.format('hd_1280_720')}"
    data-src-lg="{VID.format('hd_1920_1080')}"></video>
  <div class="hero-caption">
    <h1 data-i18n="home.heroTitle">Savijena bukva. Ručna izrada.</h1>
  </div>
  <a href="#dobrodosli" class="hero-scroll" aria-label="Dalje">{DOWN}</a>
  <button class="hero-toggle" aria-label="Pauza / pusti video"></button>
</section>

<section class="section welcome" id="dobrodosli">
  <div class="container">
    <h2 class="reveal" data-i18n="home.welcomeTitle">Dobro došli u Šaber nameštaj</h2>
    <p class="lead reveal" data-i18n="home.welcomeText">U Šaber nameštaju ljubav prema drvetu oblikujemo kroz izradu nameštaja od masiva i savijanje bukve. Spajamo prirodnu lepotu drveta sa pažljivom obradom, stvarajući komade koji donose toplinu, udobnost i trajnost u vaš prostor. Svaka krivina i svaki detalj odraz su naše posvećenosti zanatu.</p>
  </div>
</section>

<section class="section section--alt">
  <div class="container split">
    <div class="frame ratio-4x5 reveal">{img("photo-1631396326646-c06a935ff3a6", 900, 1.25, "Majstor u radionici sklapa stolicu", sizes="(max-width: 860px) 100vw, 50vw")}</div>
    <div class="reveal">
      <span class="eyebrow" data-i18n="home.aboutEyebrow">O nama</span>
      <h2 data-i18n="home.aboutTitle">Zanat koji se prenosi generacijama</h2>
      <p class="muted" data-i18n="home.aboutText">Šaber nameštaj je porodična radionica specijalizovana za stolice od masiva i savijene bukve. Svaki komad nastaje u našoj radionici — od izbora i sušenja drveta, preko savijanja parom, do ručnog brušenja i završne obrade. Opremamo restorane, kafiće i hotele, ali i domove kojima je stalo do kvaliteta koji traje.</p>
      <a class="link-arrow" href="/o-nama"><span data-i18n="home.aboutLink">Više o nama</span> {ARROW}</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="collection-head reveal">
      <div>
        <span class="eyebrow" data-i18n="home.bistroEyebrow">Kolekcija</span>
        <h2>Bistro</h2>
        <p class="muted" style="max-width:52ch;margin:12px 0 0" data-i18n="home.bistroText">Klasična bistro stolica od savijene bukve, osmišljena za svakodnevni rad ugostiteljskih objekata — lagana, stabilna i bezvremenska.</p>
      </div>
      <div class="actions">
        <a class="btn btn--solid" data-config-href="bistroCatalog" href="/media/katalozi/bistro-katalog.pdf" download>{DL} <span data-i18n="home.bistroCatalog">Bistro katalog</span></a>
        <a class="btn" href="/proizvodi?kolekcija=Bistro"><span data-i18n="home.bistroAll">Cela kolekcija</span> {ARROW}</a>
      </div>
    </div>
    <div class="mosaic reveal">
      <a href="/proizvodi?kolekcija=Bistro" class="frame">{img("photo-1766802981183-a301fa783e95", 900, None, "Bistro kolekcija", sizes="(max-width: 760px) 100vw, 45vw")}<figcaption>Bistro 01</figcaption></a>
      <a href="/proizvodi?kolekcija=Bistro" class="frame">{img("photo-1768203634842-ece3bb915cc1", 600, 1.25, "Bistro stolica", sizes="(max-width: 760px) 50vw, 28vw")}<figcaption>Bistro 02</figcaption></a>
      <a href="/proizvodi?kolekcija=Bistro" class="frame">{img("photo-1650476524564-f94dc9669067", 600, 1.25, "Bistro stolica", sizes="(max-width: 760px) 50vw, 28vw")}<figcaption>Bistro 03</figcaption></a>
      <a href="/proizvodi?kolekcija=Bistro" class="frame">{img("photo-1780312239639-738b1da1dfa2", 600, 1.25, "Bistro stolice u kafiću", sizes="(max-width: 760px) 50vw, 28vw")}<figcaption>Bistro 04</figcaption></a>
      <a href="/proizvodi?kolekcija=Bistro" class="frame">{img("photo-1503602642458-232111445657", 600, 1.25, "Bistro barska stolica", sizes="(max-width: 760px) 50vw, 28vw")}<figcaption>Bistro Bar</figcaption></a>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <div class="collection-head reveal">
      <div>
        <span class="eyebrow">Instagram</span>
        <h2 data-i18n="home.instaTitle">Iz naše radionice</h2>
      </div>
      <a class="link-arrow" data-config-href="social.instagram" href="https://www.instagram.com/" target="_blank" rel="noopener"><span data-i18n="home.instaFollow">Pratite nas na Instagramu</span> {ARROW}</a>
    </div>
    <div class="insta-grid reveal" id="insta-grid">
      <a href="https://www.instagram.com/" target="_blank" rel="noopener">{img("photo-1760325902589-fe244f204b08", 600, 1, "Instagram objava")}</a>
      <a href="https://www.instagram.com/" target="_blank" rel="noopener">{img("photo-1659930087003-2d64e33181f7", 600, 1, "Instagram objava")}</a>
      <a href="https://www.instagram.com/" target="_blank" rel="noopener">{img("photo-1670819917685-f1040e76b9b7", 600, 1, "Instagram objava")}</a>
    </div>
  </div>
</section>"""
page("index.html", title="Šaber nameštaj — stolice od masiva i savijene bukve",
     desc="Šaber nameštaj — ručna izrada stolica od masiva i savijene bukve za restorane, kafiće, hotele i domove.",
     page_id="home", title_key="title.home", body=home, has_hero=True,
     extra_head=f'<link rel="preload" as="image" href="{html.escape(src(HERO_POSTER, 1600))}" fetchpriority="high">\n')

# ---------------------------------------------------------------- PROIZVODI
skel = "".join('<div><div class="card-media skeleton"></div></div>' for _ in range(8))
products = f"""<section class="page-head">
  <div class="container">
    <span class="eyebrow" data-mode-all data-i18n="products.eyebrow">Kolekcije</span>
    <span class="eyebrow" data-mode-ready hidden data-i18n="products.readyEyebrow">Na lageru</span>
    <h1><span data-mode-all data-i18n="products.title">Proizvodi</span><span data-mode-ready hidden data-i18n="products.readyTitle">Spremno za isporuku</span></h1>
    <p class="lead" data-mode-all data-i18n="products.lead">Svaka stolica se izrađuje po porudžbini — od masiva i savijene bukve, u materijalu i završnici po vašem izboru.</p>
    <p class="lead" data-mode-ready hidden data-i18n="products.readyLead">Stolice koje su trenutno na lageru i mogu se isporučiti odmah, bez čekanja na izradu.</p>
  </div>
</section>
<section class="container">
  <div class="toolbar">
    <div class="chips" id="chips-collection"></div>
    <div class="chips" id="chips-cat"></div>
    <label class="toggle"><input type="checkbox" id="f-stock"> <span data-i18n="products.onlyStock">Samo na lageru</span></label>
    <select id="f-sort" aria-label="Sortiranje">
      <option value="new" data-i18n="products.sortNew">Najnovije</option>
      <option value="name" data-i18n="products.sortName">Po nazivu</option>
    </select>
    <span class="count" id="product-count"></span>
  </div>
  <p id="q-note" class="muted"></p>
  <div class="grid" id="product-grid">{skel}</div>
</section>
<div class="section"></div>"""
page("proizvodi.html", title="Proizvodi — Šaber nameštaj", desc="Stolice, barske stolice i fotelje od masiva i savijene bukve. Pogledajte kolekcije i proizvode spremne za isporuku.",
     page_id="products", title_key="title.products", body=products,
     extra_head="<script>if(/[?&]lager=1/.test(location.search))document.documentElement.dataset.ready=1</script>\n")

# ---------------------------------------------------------------- PROIZVOD
product = """<div id="product" class="product">
  <div class="container"><div class="product-grid"><div class="viewer skeleton"></div><div></div></div></div>
</div>"""
page("proizvod.html", title="Proizvod — Šaber nameštaj", desc="Stolica od masiva i savijene bukve — Šaber nameštaj.",
     page_id="product", title_key="", body=product)

# ---------------------------------------------------------------- MATERIJALI
def sw_img(pid, name_key, name, desc_key, desc):
    return f"""<div class="swatch reveal"><div class="chip-img">{img(pid, 400, 1, name, sizes="(max-width: 600px) 50vw, 220px")}</div>
      <h3 data-i18n="{name_key}">{name}</h3><p data-i18n="{desc_key}">{desc}</p></div>"""

def sw_col(color, name_key, name, desc=""):
    return f"""<div class="swatch reveal"><div class="chip-color" style="background:{color}"></div>
      <h3 data-i18n="{name_key}">{name}</h3><p>{desc}</p></div>"""

materials = page_hero("photo-1611072337226-1140ab367200", "mat.eyebrow", "Materijali", "mat.title", "Materijali i završnice",
                      "mat.lead", "Svaku stolicu prilagođavamo prostoru — birate vrstu drveta, boju, tapaciranje i završni premaz.") + f"""
<section class="section--tight" style="padding-bottom:0"><div class="container">
  <nav class="mat-nav" aria-label="Sekcije">
    <a class="chip" href="#drvo" data-i18n="mat.navWood">Drvo</a>
    <a class="chip" href="#boje" data-i18n="mat.navColors">Bajcevi i boje</a>
    <a class="chip" href="#tapaciranje" data-i18n="mat.navUph">Tapaciranje</a>
    <a class="chip" href="#premazi" data-i18n="mat.navFinish">Završni premazi</a>
    <a class="chip" href="#detalji" data-i18n="mat.navDetails">Detalji izrade</a>
  </nav>
</div></section>

<section class="mat-section" id="drvo"><div class="container">
  <span class="eyebrow">01</span>
  <h2 data-i18n="mat.woodTitle">Drvo</h2>
  <p class="lead muted" data-i18n="mat.woodLead">Radimo isključivo sa masivom. Bukva je osnova naših savijenih modela jer je elastična, čvrsta i lepo prima boju.</p>
  <div class="swatches">
    {sw_img("photo-1544840280-80e54213dfdc", "mat.beech", "Bukva", "mat.beechD", "Savijena i masivna — osnova svih modela")}
    {sw_img("photo-1611072337226-1140ab367200", "mat.oak", "Hrast", "mat.oakD", "Izražena šara, izuzetna tvrdoća")}
    {sw_img("photo-1546484396-fb3fc6f95f98", "mat.ash", "Jasen", "mat.ashD", "Svetao ton i elegantna šara")}
    {sw_img("photo-1576092762791-dd9e2220abd1", "mat.walnut", "Orah", "mat.walnutD", "Topao, taman i plemenit")}
  </div>
</div></section>

<section class="mat-section" id="boje"><div class="container">
  <span class="eyebrow">02</span>
  <h2 data-i18n="mat.colorsTitle">Bajcevi i boje</h2>
  <p class="lead muted" data-i18n="mat.colorsLead">Bajcevi ističu prirodnu šaru drveta, a pokrivne boje daju savremen, ujednačen izgled. Po želji radimo i nijanse po RAL karti.</p>
  <div class="swatches">
    {sw_col("#d9b98f", "mat.cNatural", "Prirodna")}
    {sw_col("#b9824a", "mat.cHoney", "Med")}
    {sw_col("#8a5a34", "mat.cTeak", "Tik")}
    {sw_col("#5b3a24", "mat.cWalnut", "Orah")}
    {sw_col("#33231a", "mat.cWenge", "Venge")}
    {sw_col("#141210", "mat.cBlack", "Crna")}
    {sw_col("#ebe5da", "mat.cWhite", "Bela")}
    {sw_col("#5d6148", "mat.cOlive", "Maslinasta")}
  </div>
</div></section>

<section class="mat-section" id="tapaciranje"><div class="container">
  <span class="eyebrow">03</span>
  <h2 data-i18n="mat.uphTitle">Tapaciranje</h2>
  <p class="lead muted" data-i18n="mat.uphLead">Štofovi otporni na habanje za ugostiteljstvo, prirodna i eko koža, kao i klasični bečki pleter za savijene modele.</p>
  <div class="swatches">
    {sw_img("photo-1760325902589-fe244f204b08", "mat.cane", "Bečki pleter", "mat.caneD", "Ručno pleteno sedište")}
    {sw_img("photo-1528458909336-e7a0adfed0a5", "mat.linen", "Lan", "mat.linenD", "Prirodan, prozračan")}
    {sw_img("photo-1695131023163-1e04e1345a91", "mat.fabricGrey", "Štof — siva", "mat.fabricD", "Visoka otpornost na habanje")}
    {sw_img("photo-1599568723850-14196ee0f991", "mat.fabricBrown", "Štof — braon", "mat.fabricD", "Visoka otpornost na habanje")}
    {sw_img("photo-1541763029361-21b1788343db", "mat.fabricBlue", "Štof — plava", "mat.fabricD", "Visoka otpornost na habanje")}
    {sw_img("photo-1571829604981-ea159f94e5ad", "mat.leather", "Koža — braon", "mat.leatherD", "Prirodna goveđa koža")}
    {sw_img("photo-1716295177956-420a647c83ac", "mat.leather2", "Koža — konjak", "mat.leatherD", "Prirodna goveđa koža")}
    {sw_img("photo-1755541608566-0340d4efca0d", "mat.eco", "Eko koža — plava", "mat.ecoD", "Laka za održavanje")}
  </div>
</div></section>

<section class="mat-section" id="premazi"><div class="container">
  <span class="eyebrow">04</span>
  <h2 data-i18n="mat.finTitle">Završni premazi</h2>
  <p class="lead muted" data-i18n="mat.finLead">Završni sloj štiti drvo i određuje kako stolica izgleda i kako se oseća pod rukom.</p>
  <div class="steps" style="margin-top:36px">
    <div class="step reveal"><h3 data-i18n="mat.f1">Mat lak</h3><p data-i18n="mat.f1d">Diskretan, prirodan izgled. Najčešći izbor za ugostiteljske objekte.</p></div>
    <div class="step reveal"><h3 data-i18n="mat.f2">Polumat (satin)</h3><p data-i18n="mat.f2d">Blagi sjaj koji ističe šaru drveta i lako se održava.</p></div>
    <div class="step reveal"><h3 data-i18n="mat.f3">Prirodno ulje</h3><p data-i18n="mat.f3d">Drvo ostaje toplo i „živo” na dodir; jednostavno se obnavlja.</p></div>
    <div class="step reveal"><h3 data-i18n="mat.f4">Vodeni lak</h3><p data-i18n="mat.f4d">Ekološki premaz bez mirisa, otporan na vlagu i alkohol.</p></div>
  </div>
</div></section>

<section class="mat-section" id="detalji" style="border-bottom:0"><div class="container split">
  <div class="frame ratio-4x5 reveal">{img("photo-1497219055242-93359eeed651", 900, 1.25, "Ručna obrada drveta", sizes="(max-width: 860px) 100vw, 50vw")}</div>
  <div class="reveal">
    <span class="eyebrow">05</span>
    <h2 data-i18n="mat.detTitle">Detalji izrade</h2>
    <p class="muted" data-i18n="mat.detText">Bukove letve se pare na visokoj temperaturi i savijaju u kalupima, pa suše dok ne zadrže oblik. Spojeve radimo klasično — čepovima i lepkom, pojačane gde je potrebno. Svaka stolica se ručno brusi između slojeva premaza i prolazi kontrolu pre isporuke.</p>
    <a class="btn" href="/kontakt"><span data-i18n="mat.detCta">Zatražite uzorke</span> {ARROW}</a>
  </div>
</div></section>"""
page("materijali.html", title="Materijali i završnice — Šaber nameštaj", desc="Vrste drveta, bajcevi, tapaciranje i završni premazi za stolice Šaber nameštaj.",
     page_id="materials", title_key="title.materials", body=materials)

# ---------------------------------------------------------------- PROJEKTI
projects = page_head("proj.eyebrow", "Reference", "proj.title", "Projekti", "proj.lead",
                     "Restorani, kafići i hoteli koje smo opremili našim stolicama.") + f"""
<section class="section"><div class="container"><div class="projects" id="projects"></div></div></section>
<section class="section section--alt center"><div class="container narrow">
  <h2 class="reveal" data-i18n="proj.ctaTitle">Opremate novi lokal?</h2>
  <p class="lead reveal" data-i18n="proj.ctaText">Pošaljite nam osnovu prostora i broj mesta — predložićemo modele, materijale i rok izrade.</p>
  <a class="btn btn--solid reveal" href="/kontakt"><span data-i18n="proj.ctaBtn">Pošaljite upit</span> {ARROW}</a>
</div></section>"""
page("projekti.html", title="Projekti — Šaber nameštaj", desc="Reference: restorani, kafići i hoteli opremljeni stolicama Šaber nameštaj.",
     page_id="projects", title_key="title.projects", body=projects)

# ---------------------------------------------------------------- SHOWROOM
showroom = page_hero("photo-1791388490382-28d3f51950f0", "show.eyebrow", "Showroom", "show.title", "Showroom i lokacije",
                     "show.lead", "Dođite da isprobate stolice uživo, vidite uzorke materijala i dogovorite se sa nama.") + f"""
<section class="section"><div class="container">
  <div class="locations">
    <div class="location reveal">
      <h3 data-i18n="show.loc1">Showroom</h3>
      <dl>
        <dt data-i18n="show.address">Adresa</dt><dd data-config-text="address">Primer ulica 1, 11000 Beograd</dd>
        <dt data-i18n="show.hours">Radno vreme</dt><dd data-i18n="show.hours1">Pon–Pet 09–17h · Sub 09–14h</dd>
        <dt data-i18n="show.phone">Telefon</dt><dd data-config-text="phone">+381 60 000 0000</dd>
      </dl>
      <div class="map"><div class="map-load"><div><p data-i18n="show.mapNote">Mapa se učitava sa Google Maps.</p><button class="btn" data-map=""><span data-i18n="show.mapBtn">Prikaži mapu</span></button></div></div></div>
    </div>
    <div class="location reveal">
      <h3 data-i18n="show.loc2">Radionica i proizvodnja</h3>
      <dl>
        <dt data-i18n="show.address">Adresa</dt><dd>Primer industrijska zona bb, Srbija</dd>
        <dt data-i18n="show.hours">Radno vreme</dt><dd data-i18n="show.hours2">Pon–Pet 07–15h (uz najavu)</dd>
        <dt data-i18n="show.phone">Telefon</dt><dd data-config-text="phone">+381 60 000 0000</dd>
      </dl>
      <div class="map"><div class="map-load"><div><p data-i18n="show.mapNote">Mapa se učitava sa Google Maps.</p><button class="btn" data-map="Srbija"><span data-i18n="show.mapBtn">Prikaži mapu</span></button></div></div></div>
    </div>
  </div>
</div></section>
<section class="section section--alt"><div class="container">
  <h2 class="reveal" data-i18n="show.galleryTitle">Naš showroom</h2>
  <div class="gallery reveal" style="margin-top:32px">
    <div class="frame wide">{img("photo-1788716183840-bb3f0edc2f75", 1000, 0.62, "Stolice u showroom-u", sizes="(max-width: 760px) 100vw, 66vw")}</div>
    <div class="frame">{img("photo-1760611656148-063d3b9a8dbc", 500, 1.25, "Stolice u showroom-u", sizes="(max-width: 760px) 50vw, 33vw")}</div>
    <div class="frame">{img("photo-1622880355742-af182a61b362", 500, 1.25, "Detalj stolice", sizes="(max-width: 760px) 50vw, 33vw")}</div>
    <div class="frame">{img("photo-1730373451883-45a448eb9bfc", 500, 1.25, "Stolica od masiva", sizes="(max-width: 760px) 50vw, 33vw")}</div>
    <div class="frame">{img("photo-1603376728541-6e1906a300e6", 500, 1.25, "Stolica od bukve", sizes="(max-width: 760px) 50vw, 33vw")}</div>
  </div>
</div></section>"""
page("showroom.html", title="Showroom i lokacije — Šaber nameštaj", desc="Posetite showroom Šaber nameštaja — adrese, radno vreme i mapa.",
     page_id="showroom", title_key="title.showroom", body=showroom)

# ---------------------------------------------------------------- O NAMA
about = page_hero("photo-1659930087003-2d64e33181f7", "about.eyebrow", "O nama", "about.title", "Ljubav prema drvetu, oblikovana rukom") + f"""
<section class="section"><div class="container split">
  <div class="reveal">
    <span class="eyebrow" data-i18n="about.storyEyebrow">Naša priča</span>
    <h2 data-i18n="about.storyTitle">Od male radionice do opremanja stotina lokala</h2>
    <p class="muted" data-i18n="about.story1">Šaber nameštaj je nastao iz porodične stolarske radionice. Ono što je počelo kao izrada nameštaja za komšije i prijatelje, preraslo je u proizvodnju stolica od masiva i savijene bukve za ugostiteljske objekte širom regiona.</p>
    <p class="muted" data-i18n="about.story2">I danas radimo na isti način: pažljivo biramo drvo, savijamo ga parom, ručno brusimo i završavamo svaki komad. Verujemo da dobra stolica treba da traje decenijama — i da vremenom postaje samo lepša.</p>
  </div>
  <div class="frame ratio-4x5 reveal">{img("photo-1687422810663-c316494f725a", 900, 1.25, "Majstor u radionici", sizes="(max-width: 860px) 100vw, 50vw")}</div>
</div></section>
<section class="container">
  <div class="stats reveal">
    <div><strong>25+</strong><span data-i18n="about.s1">godina iskustva</span></div>
    <div><strong>300+</strong><span data-i18n="about.s2">opremljenih lokala</span></div>
    <div><strong>40 000+</strong><span data-i18n="about.s3">izrađenih stolica</span></div>
    <div><strong>100%</strong><span data-i18n="about.s4">masivno drvo</span></div>
  </div>
</section>
<section class="section"><div class="container">
  <span class="eyebrow" data-i18n="about.procEyebrow">Proces</span>
  <h2 class="reveal" data-i18n="about.procTitle">Kako nastaje jedna stolica</h2>
  <div class="steps" style="margin-top:40px">
    <div class="step reveal"><h3 data-i18n="about.p1">Izbor i sušenje</h3><p data-i18n="about.p1d">Biramo bukovu građu i sušimo je do idealne vlažnosti.</p></div>
    <div class="step reveal"><h3 data-i18n="about.p2">Savijanje parom</h3><p data-i18n="about.p2d">Letve se pare i savijaju u kalupima u karakteristične krivine.</p></div>
    <div class="step reveal"><h3 data-i18n="about.p3">Obrada i spajanje</h3><p data-i18n="about.p3d">Delovi se obrađuju, spajaju i ručno bruse.</p></div>
    <div class="step reveal"><h3 data-i18n="about.p4">Završna obrada</h3><p data-i18n="about.p4d">Bajcovanje, lakiranje i tapaciranje po vašem izboru.</p></div>
  </div>
</div></section>
<section class="section section--alt"><div class="container split split--rev">
  <div class="reveal">
    <span class="eyebrow" data-i18n="about.valEyebrow">Za ugostitelje</span>
    <h2 data-i18n="about.valTitle">Napravljeno za svakodnevni rad</h2>
    <p class="muted" data-i18n="about.valText">Naše stolice su konstruisane da izdrže intenzivnu upotrebu u restoranima i kafićima. Radimo serije od nekoliko komada do više stotina, sa mogućnošću prilagođavanja dimenzija, boje i tapaciranja enterijeru.</p>
    <a class="btn" href="/projekti"><span data-i18n="about.valCta">Pogledajte projekte</span> {ARROW}</a>
  </div>
  <div class="frame ratio-4x5 reveal">{img("photo-1677233074109-59aa674614ca", 900, 1.25, "Restoran opremljen stolicama", sizes="(max-width: 860px) 100vw, 50vw")}</div>
</div></section>"""
page("o-nama.html", title="O nama — Šaber nameštaj", desc="Porodična radionica specijalizovana za stolice od masiva i savijene bukve.",
     page_id="about", title_key="title.about", body=about)

# ---------------------------------------------------------------- KONTAKT
def form_fields(prefix, msg_label_key="form.message", msg_label="Poruka", with_subject=True):
    subj = f"""<div class="field full"><label for="{prefix}-subject" data-i18n="form.subject">Tema</label><input id="{prefix}-subject" name="subject" maxlength="200"></div>""" if with_subject else ""
    return f"""
      <div class="field"><label for="{prefix}-name" data-i18n="form.name">Ime i prezime *</label><input id="{prefix}-name" name="name" required maxlength="120" autocomplete="name"></div>
      <div class="field"><label for="{prefix}-email" data-i18n="form.email">E-mail *</label><input id="{prefix}-email" name="email" type="email" required maxlength="200" autocomplete="email"></div>
      <div class="field"><label for="{prefix}-phone" data-i18n="form.phone">Telefon</label><input id="{prefix}-phone" name="phone" type="tel" maxlength="50" autocomplete="tel"></div>
      <div class="field"><label for="{prefix}-company" data-i18n="form.company">Firma / lokal</label><input id="{prefix}-company" name="company" maxlength="160" autocomplete="organization"></div>
      {subj}
      <div class="field full"><label for="{prefix}-message" data-i18n="{msg_label_key}">{msg_label}</label><textarea id="{prefix}-message" name="message" maxlength="5000"></textarea></div>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="full turnstile-slot"></div>
      <div class="full actions" style="align-items:center"><button class="btn btn--solid" type="submit"><span data-i18n="form.send">Pošalji</span> {ARROW}</button><p class="form-status" role="status" aria-live="polite"></p></div>"""

contact = page_head("contact.eyebrow", "Kontakt", "contact.title", "Razgovarajmo", "contact.lead",
                    "Pošaljite upit za ponudu, uzorke materijala ili zakažite posetu showroom-u. Odgovaramo u roku od jednog radnog dana.") + f"""
<section class="section"><div class="container contact-grid">
  <div class="reveal">
    <ul class="contact-list">
      <li><span data-i18n="show.address">Adresa</span><span data-config-text="address">Primer ulica 1, 11000 Beograd</span></li>
      <li><span data-i18n="show.phone">Telefon</span><a href="tel:+381600000000" data-config-text="phone">+381 60 000 0000</a></li>
      <li><span>E-mail</span><a href="mailto:info@sabernamestaj.rs" data-config-text="email">info@sabernamestaj.rs</a></li>
      <li><span data-i18n="show.hours">Radno vreme</span><span data-i18n="show.hours1">Pon–Pet 09–17h · Sub 09–14h</span></li>
    </ul>
    <a class="link-arrow" href="/showroom"><span data-i18n="contact.showroom">Lokacije i showroom</span> {ARROW}</a>
  </div>
  <form id="contact-form" class="form reveal" novalidate>{form_fields("c")}</form>
</div></section>"""
page("kontakt.html", title="Kontakt — Šaber nameštaj", desc="Kontaktirajte Šaber nameštaj — upiti za ponudu, uzorci materijala, posete showroom-u.",
     page_id="contact", title_key="title.contact", body=contact)

# ---------------------------------------------------------------- LISTA ŽELJA
wishlist = page_head("wish.eyebrow", "Lista želja", "wish.title", "Vaša lista želja", "wish.lead",
                     "Sačuvajte modele koji vam se dopadaju, podesite količine i pošaljite nam jedan upit za sve.") + f"""
<section class="section" style="padding-top:48px"><div class="container">
  <div id="wish-list"><p class="muted" data-i18n="loading">Učitavanje…</p></div>
  <div id="wish-form-wrap" hidden>
    <h2 data-i18n="wish.formTitle">Pošaljite upit za listu</h2>
    <p class="muted" data-i18n="wish.formLead">Javićemo vam se sa ponudom, rokovima izrade i dostupnošću sa lagera.</p>
    <form id="wish-form" class="form" novalidate style="margin-top:28px">{form_fields("w", "wish.note", "Napomena", with_subject=False)}</form>
  </div>
</div></section>"""
page("lista-zelja.html", title="Lista želja — Šaber nameštaj", desc="Vaša lista želja — pošaljite upit za odabrane stolice.",
     page_id="wishlist", title_key="title.wishlist", body=wishlist)

# ---------------------------------------------------------------- 404
nf = f"""<section class="page-head" style="border:0;min-height:70vh"><div class="container">
  <span class="eyebrow">404</span>
  <h1 data-i18n="nf.title">Stranica nije pronađena</h1>
  <p class="lead muted" data-i18n="nf.lead">Stranica koju tražite ne postoji ili je premeštena.</p>
  <a class="btn" href="/"><span data-i18n="nav.home">Početna</span> {ARROW}</a>
</div></section>"""
page("404.html", title="Stranica nije pronađena — Šaber nameštaj", desc="Stranica nije pronađena.", page_id="404", title_key="", body=nf)
print("ok")
