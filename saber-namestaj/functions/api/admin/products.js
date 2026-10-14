// /api/admin/products — dodavanje, izmena i brisanje stolica (zaštićeno lozinkom, vidi _middleware.js)
//   GET                → lista proizvoda (bez keša)
//   POST (multipart)   → nova stolica ili izmena postojeće; slike su već smanjene u pregledaču
//   DELETE ?id=...     → briše stolicu i njene fajlove iz R2

const KEY = "data/products.json";
const CATEGORIES = ["stolica", "barska", "fotelja", "tabure", "klupa"];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } });

const base = (env) => (env.MEDIA_BASE || "/media").replace(/\/$/, "");
const str = (v, n = 300) => String(v ?? "").trim().slice(0, n);
const loc = (v, n = 300) => ({ sr: str(v?.sr, n), en: str(v?.en, n) });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function slugify(s) {
  return String(s).toLowerCase().replace(/đ/g, "dj").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "stolica";
}

async function load(env, request) {
  const obj = await env.MEDIA.get(KEY);
  if (obj) return obj.json();
  const r = await env.ASSETS.fetch(new URL("/data/products.json", request.url));
  return r.ok ? r.json() : [];
}

async function save(env, request, list) {
  await env.MEDIA.put(KEY, JSON.stringify(list), {
    httpMetadata: { contentType: "application/json; charset=utf-8", cacheControl: "public, max-age=60" },
  });
  await caches.default.delete(new Request(new URL("/api/products", request.url).toString()));
}

async function putFile(env, key, file, contentType) {
  await env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: contentType || file.type || "application/octet-stream", cacheControl: "public, max-age=31536000, immutable" },
  });
}

/** Briše fajlove iz R2 — samo one koji su na našem MEDIA_BASE (ne dira spoljne/demo URL-ove) */
async function deleteUrls(env, entries) {
  const b = base(env) + "/";
  const keys = entries.flatMap((e) => (typeof e === "string" ? [e] : [e?.full, e?.thumb]))
    .filter((u) => typeof u === "string" && u.startsWith(b))
    .map((u) => u.slice(b.length));
  if (keys.length) await env.MEDIA.delete(keys);
}

export async function onRequestGet({ env, request }) {
  return json(await load(env, request));
}

export async function onRequestPost({ env, request }) {
  let form, data;
  try {
    form = await request.formData();
    data = JSON.parse(form.get("data") || "{}");
  } catch {
    return json({ error: "Neispravan zahtev" }, 400);
  }
  if (!str(data?.name?.sr)) return json({ error: "Naziv (srpski) je obavezan" }, 400);

  const list = await load(env, request);
  const existing = data.id ? list.find((p) => p.id === data.id) : null;
  let id = existing?.id;
  if (!id) {
    const s = slugify(data.name.sr);
    id = s;
    for (let n = 2; list.some((p) => p.id === id); n++) id = `${s}-${n}`;
  }
  const ts = Date.now().toString(36);
  const b = base(env);

  // Slike: zadržane postojeće (redosled iz admina) + nove
  const oldImgs = existing?.images || [];
  const keep = (Array.isArray(data.keepImages) ? data.keepImages : []).filter((k) => oldImgs.some((o) => same(o, k)));
  const added = [];
  for (let i = 0; form.has(`img_full_${i}`); i++) {
    const full = form.get(`img_full_${i}`);
    const thumb = form.get(`img_thumb_${i}`) || full;
    const ext = full.type === "image/webp" ? "webp" : full.type === "image/png" ? "png" : "jpg";
    const kf = `products/${id}/${ts}-${i}.${ext}`;
    const kt = `products/${id}/${ts}-${i}-thumb.${ext}`;
    await Promise.all([putFile(env, kf, full), putFile(env, kt, thumb)]);
    added.push({ full: `${b}/${kf}`, thumb: `${b}/${kt}` });
  }
  await deleteUrls(env, oldImgs.filter((o) => !keep.some((k) => same(o, k))));

  // 3D model (.glb)
  let model = existing?.model || "";
  const mf = form.get("model");
  if (mf && typeof mf === "object" && mf.size) {
    const k = `products/${id}/${ts}.glb`;
    await putFile(env, k, mf, "model/gltf-binary");
    if (model) await deleteUrls(env, [model]);
    model = `${b}/${k}`;
  } else if (data.removeModel && model) {
    await deleteUrls(env, [model]);
    model = "";
  }

  const product = {
    id,
    name: loc(data.name, 120),
    collection: str(data.collection, 60),
    category: CATEGORIES.includes(data.category) ? data.category : "stolica",
    description: loc(data.description, 2000),
    dimensions: str(data.dimensions, 200),
    materials: loc(data.materials, 300),
    inStock: !!data.inStock,
    stockQty: data.inStock ? Math.max(0, parseInt(data.stockQty, 10) || 0) : 0,
    featured: !!data.featured,
    images: [...keep, ...added],
    model,
    createdAt: existing?.createdAt || new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString(),
  };

  const i = list.findIndex((p) => p.id === id);
  if (i >= 0) list[i] = product; else list.unshift(product);
  await save(env, request, list);
  return json({ ok: true, product });
}

export async function onRequestDelete({ env, request }) {
  const id = new URL(request.url).searchParams.get("id");
  const list = await load(env, request);
  const p = list.find((x) => x.id === id);
  if (!p) return json({ error: "Nije pronađeno" }, 404);

  // Obriši sve fajlove ove stolice iz R2
  const listed = await env.MEDIA.list({ prefix: `products/${id}/` });
  const keys = listed.objects.map((o) => o.key);
  if (keys.length) await env.MEDIA.delete(keys);

  await save(env, request, list.filter((x) => x.id !== id));
  return json({ ok: true });
}
