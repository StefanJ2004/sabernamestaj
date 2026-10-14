// POST /api/contact — kontakt forma i upit iz liste želja.
// Šalje e-mail preko Resend-a (besplatno do 3000 mejlova mesečno).
// Potrebne promenljive: RESEND_API_KEY, CONTACT_TO, CONTACT_FROM; opciono TURNSTILE_SECRET (anti-spam).

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } });

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clip = (s, n) => String(s ?? "").trim().slice(0, n);

export async function onRequestPost({ request, env }) {
  let d;
  try { d = await request.json(); } catch { return json({ ok: false, error: "Neispravan zahtev" }, 400); }

  // Honeypot — botovi popune skriveno polje; tiho ih ignorišemo
  if (d.website) return json({ ok: true });

  const name = clip(d.name, 120);
  const email = clip(d.email, 200);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: "Ime i ispravan e-mail su obavezni" }, 400);

  if (env.TURNSTILE_SECRET) {
    const form = new FormData();
    form.append("secret", env.TURNSTILE_SECRET);
    form.append("response", d["cf-turnstile-response"] || "");
    form.append("remoteip", request.headers.get("cf-connecting-ip") || "");
    const v = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form }).then((r) => r.json()).catch(() => ({}));
    if (!v.success) return json({ ok: false, error: "Provera nije uspela, pokušajte ponovo" }, 403);
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO) return json({ ok: false, error: "Slanje e-maila nije podešeno" }, 503);

  const items = Array.isArray(d.items) ? d.items.slice(0, 100) : [];
  const fields = [
    ["Ime", name], ["E-mail", email], ["Telefon", clip(d.phone, 50)], ["Firma / lokal", clip(d.company, 160)],
    ["Tema", clip(d.subject, 200)], ["Jezik", clip(d.lang, 5)], ["Stranica", clip(d.page, 200)],
  ].filter(([, v]) => v);
  const message = clip(d.message, 5000);

  const itemsHtml = items.length
    ? `<h3>Lista želja</h3><table cellpadding="6" style="border-collapse:collapse">
        <tr><th align="left">Model</th><th>Kom.</th><th>Lager</th></tr>
        ${items.map((i) => `<tr><td>${esc(clip(i.name, 120))} <small>(${esc(clip(i.id, 80))})</small></td><td align="center">${Math.max(1, i.qty | 0)}</td><td align="center">${i.inStock ? "da" : "ne"}</td></tr>`).join("")}
       </table>`
    : "";
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px">
    <table cellpadding="4">${fields.map(([k, v]) => `<tr><td style="color:#777">${k}</td><td>${esc(v)}</td></tr>`).join("")}</table>
    ${message ? `<p style="white-space:pre-wrap;border-left:3px solid #c49a6c;padding-left:12px">${esc(message)}</p>` : ""}
    ${itemsHtml}</div>`;
  const text = fields.map(([k, v]) => `${k}: ${v}`).join("\n") + (message ? `\n\n${message}` : "") +
    (items.length ? "\n\nLista želja:\n" + items.map((i) => `- ${clip(i.name, 120)} × ${Math.max(1, i.qty | 0)}`).join("\n") : "");

  const subject = items.length ? `Upit (lista želja, ${items.length} modela) — ${name}` : `Kontakt sa sajta — ${clip(d.subject, 80) || name}`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.CONTACT_FROM || "Šaber sajt <onboarding@resend.dev>",
      to: env.CONTACT_TO.split(",").map((s) => s.trim()),
      reply_to: email,
      subject,
      html,
      text,
    }),
  });
  if (!r.ok) {
    console.error("Resend greška", r.status, await r.text());
    return json({ ok: false, error: "Slanje nije uspelo" }, 502);
  }
  return json({ ok: true });
}
