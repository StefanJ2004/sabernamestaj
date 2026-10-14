/* Šaber nameštaj — admin panel (dodavanje / izmena / brisanje stolica) */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const thumbOf = (im) => (typeof im === "string" ? (im.includes("images.unsplash.com") ? im + "?w=200&h=200&fit=crop&auto=format&q=60" : im) : im.thumb || im.full);

let PASS = sessionStorage.getItem("saber_admin") || "";
let products = [];
let editing = null;     // proizvod koji se menja (ili null)
let keepImages = [];    // postojeće slike koje ostaju
let newImages = [];     // [{file, url}] nove slike

async function api(path, opts = {}) {
  opts.headers = { ...(opts.headers || {}), authorization: "Bearer " + PASS };
  const r = await fetch("/api/admin" + path, opts);
  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("json")) throw new Error("API nije dostupan (sajt mora da radi na Cloudflare Pages ili preko `wrangler pages dev`).");
  const j = await r.json();
  if (r.status === 401) { logout(); throw new Error(j.error || "Pogrešna lozinka"); }
  if (!r.ok) throw new Error(j.error || "Greška " + r.status);
  return j;
}

function logout() {
  PASS = "";
  sessionStorage.removeItem("saber_admin");
  $("#app").hidden = true;
  $("#logout").hidden = true;
  $("#login").hidden = false;
}

async function enter() {
  products = await api("/products");
  sessionStorage.setItem("saber_admin", PASS);
  $("#login").hidden = true;
  $("#app").hidden = false;
  $("#logout").hidden = false;
  renderRows();
}

$("#login").addEventListener("submit", async (e) => {
  e.preventDefault();
  PASS = $("#pass").value;
  $("#login-status").textContent = "";
  try { await enter(); } catch (err) { $("#login-status").textContent = err.message; }
});
$("#logout").addEventListener("click", logout);
if (PASS) enter().catch(() => logout());

/* ---------- Tabela ---------- */
function renderRows() {
  $("#collections").innerHTML = [...new Set(products.map((p) => p.collection).filter(Boolean))].map((c) => `<option value="${esc(c)}">`).join("");
  $("#rows").innerHTML = products.length ? products.map((p) => `
    <tr>
      <td>${p.images?.[0] ? `<img src="${esc(thumbOf(p.images[0]))}" alt="" loading="lazy">` : ""}</td>
      <td><a href="/proizvod?id=${encodeURIComponent(p.id)}" target="_blank">${esc(p.name?.sr)}</a></td>
      <td class="hide-sm">${esc(p.collection)}</td>
      <td>${p.inStock ? `✓ ${p.stockQty || ""}` : "—"}</td>
      <td class="hide-sm">${p.model ? "✓" : "—"}</td>
      <td><div class="row-actions">
        <button class="btn btn-sm" data-edit="${esc(p.id)}">Izmeni</button>
        <button class="btn btn-sm btn-danger" data-del="${esc(p.id)}">Obriši</button>
      </div></td>
    </tr>`).join("") : `<tr><td colspan="6" class="muted">Još nema stolica.</td></tr>`;
}

$("#rows").addEventListener("click", async (e) => {
  const ed = e.target.closest("[data-edit]");
  if (ed) return openForm(products.find((p) => p.id === ed.dataset.edit));
  const del = e.target.closest("[data-del]");
  if (del) {
    const p = products.find((x) => x.id === del.dataset.del);
    if (!confirm(`Obrisati „${p.name?.sr}” i sve njene fajlove?`)) return;
    try { await api("/products?id=" + encodeURIComponent(p.id), { method: "DELETE" }); products = products.filter((x) => x.id !== p.id); renderRows(); }
    catch (err) { alert(err.message); }
  }
});

/* ---------- Forma ---------- */
const F = $("#pform");
$("#new-btn").addEventListener("click", () => openForm(null));
$("#cancel-btn").addEventListener("click", () => { F.hidden = true; });

function openForm(p) {
  editing = p;
  F.reset();
  newImages.forEach((n) => URL.revokeObjectURL(n.url));
  newImages = [];
  keepImages = p ? [...(p.images || [])] : [];
  $("#pform-title").textContent = p ? `Izmena: ${p.name?.sr}` : "Nova stolica";
  F.id.value = p?.id || "";
  F.name_sr.value = p?.name?.sr || "";
  F.name_en.value = p?.name?.en || "";
  F.collection.value = p?.collection || "";
  F.category.value = p?.category || "stolica";
  F.desc_sr.value = p?.description?.sr || "";
  F.desc_en.value = p?.description?.en || "";
  F.dimensions.value = typeof p?.dimensions === "string" ? p.dimensions : p?.dimensions?.sr || "";
  F.mat_sr.value = p?.materials?.sr || "";
  F.mat_en.value = p?.materials?.en || "";
  F.inStock.checked = !!p?.inStock;
  F.stockQty.value = p?.stockQty || 0;
  F.featured.checked = !!p?.featured;
  $("#model-current").innerHTML = p?.model
    ? `Trenutni model: <a href="${esc(p.model)}" target="_blank" style="text-decoration:underline">otvori</a> · <label><input type="checkbox" id="remove-model"> ukloni</label>`
    : "Nema 3D modela.";
  $("#pform-status").textContent = "";
  renderImages();
  F.hidden = false;
  F.scrollIntoView({ behavior: "smooth" });
}

function renderImages() {
  const all = [...keepImages.map((im, i) => ({ src: thumbOf(im), kind: "keep", i })), ...newImages.map((n, i) => ({ src: n.url, kind: "new", i }))];
  $("#img-existing").innerHTML = all.map((x, idx) => `
    <figure>
      <img src="${esc(x.src)}" alt="">
      ${idx > 0 && x.kind === "keep" ? `<button type="button" class="mv" data-mv="${x.i}" title="Pomeri ulevo">⇠</button>` : ""}
      <button type="button" class="rm" data-rm="${x.kind}:${x.i}" title="Ukloni">×</button>
      <figcaption>${idx === 0 ? "naslovna" : x.kind === "new" ? "nova" : ""}</figcaption>
    </figure>`).join("");
}

$("#img-existing").addEventListener("click", (e) => {
  const rm = e.target.closest("[data-rm]");
  if (rm) {
    const [kind, i] = rm.dataset.rm.split(":");
    if (kind === "keep") keepImages.splice(+i, 1);
    else { URL.revokeObjectURL(newImages[+i].url); newImages.splice(+i, 1); }
    renderImages();
  }
  const mv = e.target.closest("[data-mv]");
  if (mv) { const i = +mv.dataset.mv; [keepImages[i - 1], keepImages[i]] = [keepImages[i], keepImages[i - 1]]; renderImages(); }
});

$("#img-input").addEventListener("change", (e) => {
  for (const file of e.target.files) newImages.push({ file, url: URL.createObjectURL(file) });
  e.target.value = "";
  renderImages();
});

/** Smanjuje sliku u pregledaču i pretvara je u WebP (ili JPEG ako pregledač ne podržava WebP) */
async function resize(file, max, quality) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d").drawImage(bmp, 0, 0, w, h);
  bmp.close?.();
  let blob = await new Promise((r) => c.toBlob(r, "image/webp", quality));
  if (!blob || blob.type !== "image/webp") blob = await new Promise((r) => c.toBlob(r, "image/jpeg", quality));
  return blob;
}

F.addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = $("#pform-status");
  const btn = F.querySelector("button[type=submit]");
  if (!F.name_sr.value.trim()) { status.className = "form-status err"; status.textContent = "Naziv je obavezan."; return; }
  const modelFile = $("#model-input").files[0];
  if (modelFile && modelFile.size > 15 * 1024 * 1024 && !confirm(`Model ima ${(modelFile.size / 1048576).toFixed(1)} MB — preporuka je da ga prvo smanjiš. Nastaviti?`)) return;

  btn.disabled = true;
  status.className = "form-status";
  try {
    const fd = new FormData();
    fd.append("data", JSON.stringify({
      id: F.id.value || undefined,
      name: { sr: F.name_sr.value, en: F.name_en.value || F.name_sr.value },
      collection: F.collection.value,
      category: F.category.value,
      description: { sr: F.desc_sr.value, en: F.desc_en.value },
      dimensions: F.dimensions.value,
      materials: { sr: F.mat_sr.value, en: F.mat_en.value },
      inStock: F.inStock.checked,
      stockQty: F.stockQty.value,
      featured: F.featured.checked,
      keepImages,
      removeModel: !!$("#remove-model")?.checked,
    }));
    for (let i = 0; i < newImages.length; i++) {
      status.textContent = `Obrada slike ${i + 1}/${newImages.length}…`;
      const [full, thumb] = await Promise.all([resize(newImages[i].file, 1600, 0.82), resize(newImages[i].file, 640, 0.78)]);
      const ext = full.type === "image/webp" ? "webp" : "jpg";
      fd.append(`img_full_${i}`, full, `${i}.${ext}`);
      fd.append(`img_thumb_${i}`, thumb, `${i}-t.${ext}`);
    }
    if (modelFile) fd.append("model", modelFile, modelFile.name);
    status.textContent = "Slanje…";
    const { product } = await api("/products", { method: "POST", body: fd });
    const i = products.findIndex((p) => p.id === product.id);
    if (i >= 0) products[i] = product; else products.unshift(product);
    renderRows();
    sessionStorage.removeItem("saber_products");
    status.className = "form-status ok";
    status.textContent = "Sačuvano ✓ (na sajtu vidljivo za par minuta)";
    $("#model-input").value = "";
    setTimeout(() => { F.hidden = true; }, 1200);
  } catch (err) {
    status.className = "form-status err";
    status.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

/* ---------- Katalog ---------- */
$("#catalog-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const st = $("#catalog-status");
  st.className = "form-status";
  st.textContent = "Slanje…";
  try {
    const { url } = await api("/catalog", { method: "POST", body: new FormData(e.target) });
    st.className = "form-status ok";
    st.innerHTML = `Otpremljeno ✓ <a href="${esc(url)}" target="_blank" style="text-decoration:underline">${esc(url)}</a>`;
  } catch (err) {
    st.className = "form-status err";
    st.textContent = err.message;
  }
});
