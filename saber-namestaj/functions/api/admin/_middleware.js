// Zaštita svih /api/admin/* ruta lozinkom (ADMIN_PASSWORD, podešava se kao "secret" u Cloudflare-u).
// Preporuka: dodatno zaštiti /admin* i /api/admin* preko Cloudflare Access (Zero Trust, besplatno do 50 korisnika).

const json = (data, status) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

async function sameSecret(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

export async function onRequest({ request, env, next }) {
  if (!env.ADMIN_PASSWORD) return json({ error: "ADMIN_PASSWORD nije podešen na Cloudflare-u" }, 500);
  if (!env.MEDIA) return json({ error: "R2 bucket (MEDIA) nije povezan" }, 500);
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !(await sameSecret(token, env.ADMIN_PASSWORD))) return json({ error: "Pogrešna lozinka" }, 401);
  const upstream = await next();
  const res = new Response(upstream.body, upstream);
  res.headers.set("cache-control", "no-store");
  return res;
}
