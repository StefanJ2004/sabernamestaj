# Šaber nameštaj — sajt

Statički sajt (HTML/CSS/JS, bez build koraka) + Cloudflare Pages Functions + R2.

## Struktura

```
public/                 ← sve što ide na Cloudflare Pages
  index.html            Početna (video, dobrodošlica, o nama, Bistro, Instagram)
  proizvodi.html        Svi proizvodi + filteri; ?lager=1 = "Spremno za isporuku"
  proizvod.html         Jedna stolica: slike + 3D model (?id=...)
  materijali.html       Drvo, bajcevi, tapaciranje, premazi, detalji
  projekti.html         Opremljeni lokali (podaci: data/projects.json)
  showroom.html         Lokacije, radno vreme, mapa, galerija
  o-nama.html, kontakt.html, lista-zelja.html, 404.html
  admin/                Admin panel (dodavanje/izmena/brisanje stolica, PDF katalog)
  assets/js/app.js      Header, footer, meni, pretraga, jezik, lista želja — PODEŠAVANJA (CONFIG) na vrhu
  assets/js/pages.js    Logika pojedinačnih stranica
  i18n/en.json          Engleski prevod (srpski je direktno u HTML-u)
  data/products.json    Demo proizvodi (koriste se dok admin ne sačuva prvi proizvod u R2)
  _headers              Keširanje i sigurnosna zaglavlja
functions/              Cloudflare Pages Functions (serverski deo)
  api/products.js       Lista proizvoda iz R2 (keširano)
  api/contact.js        Kontakt forma / upit iz liste želja → e-mail (Resend)
  api/instagram.js      Poslednje 3 Instagram objave (keširano 3h)
  api/admin/*           Admin API (zaštićen lozinkom)
  media/[[path]].js     Služi fajlove iz R2 na /media/...
wrangler.toml           Cloudflare podešavanja (R2 binding, promenljive)
scripts/dev-server.py   Lokalni pregled: python3 scripts/dev-server.py → http://localhost:8080
scripts/gen_pages.py    Generator HTML stranica (ako HTML menjaš ručno, NE pokreći ga ponovo)
```

## Lokalni pregled

```bash
python3 scripts/dev-server.py
```

Funkcije (admin, kontakt forma, Instagram) lokalno rade samo preko `npx wrangler pages dev` (traži Node.js).

## Postavljanje na Cloudflare (ukratko)

1. Napravi R2 bucket `saber-media` (Cloudflare → R2).
2. Postavi projekat na GitHub, pa Cloudflare → Workers & Pages → Create → Pages → poveži repo.
   Build command: *(prazno)*, Build output directory: `public`.
3. Pages projekat → Settings → Bindings: R2 bucket `MEDIA` → `saber-media`.
4. Settings → Variables and Secrets: `ADMIN_PASSWORD` (secret), `RESEND_API_KEY` (secret), `CONTACT_TO`, `CONTACT_FROM`,
   opciono `TURNSTILE_SECRET`, `INSTAGRAM_TOKEN`, `MEDIA_BASE`.
5. Poveži domen (Custom domains). Preporuka: R2 bucket poveži sa `media.<domen>` i postavi `MEDIA_BASE=https://media.<domen>`.
6. Zaštiti `/admin*` i `/api/admin*` preko Cloudflare Zero Trust → Access (besplatno do 50 korisnika).

## Zašto je jeftino / besplatno

- Statički fajlovi na Pages su besplatni i neograničeni.
- Funkcije se pozivaju retko: proizvodi i Instagram su keširani na ivici, a pregledač čuva proizvode 10 min.
- Slike se u adminu smanjuju na 1600 px i pretvaraju u WebP pre otpremanja (manje R2 prostora i saobraćaja).
- R2 nema naplatu izlaznog saobraćaja; besplatno 10 GB + 1M upisa + 10M čitanja mesečno.
- 3D biblioteka (~250 KB) i 3D modeli se učitavaju tek kad posetilac klikne "3D model".
- Druga slika na karticama se učitava tek na prelaz mišem; mapa tek na klik; Instagram tek kad se dođe do sekcije.
- Video: na telefonu se učitava manja verzija; ne pušta se uz "uštedu podataka" ili "smanjeno kretanje".

## Priprema videa za početnu (ffmpeg)

```bash
ffmpeg -i original.mp4 -t 15 -an -vf "scale=1920:-2,fps=25" -c:v libx264 -crf 26 -preset slow -movflags +faststart hero-1080.mp4
ffmpeg -i original.mp4 -t 15 -an -vf "scale=1280:-2,fps=25" -c:v libx264 -crf 27 -preset slow -movflags +faststart hero-720.mp4
ffmpeg -i original.mp4 -t 15 -an -vf "scale=960:-2,fps=25"  -c:v libx264 -crf 28 -preset slow -movflags +faststart hero-540.mp4
ffmpeg -i original.mp4 -ss 1 -frames:v 1 -vf "scale=1920:-2" -q:v 4 hero-poster.jpg
```

Otpremi ih u R2 (`video/…`) i zameni `data-src-*` atribute u `index.html`.

## Kada menjaš CSS/JS

Povećaj `?v=1` → `?v=2` u HTML fajlovima da bi posetioci odmah dobili novu verziju.
