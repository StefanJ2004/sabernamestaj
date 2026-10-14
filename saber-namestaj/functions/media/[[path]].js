// GET /media/<ključ> — služi fajlove iz R2 (slike, 3D modeli, katalozi, video).
// Ako fajl ne postoji u R2, vraća statički fajl iz /public/media (npr. primer kataloga).
//
// NAPOMENA: kada povežeš R2 bucket sa sopstvenim domenom (npr. media.sabernamestaj.rs)
// i postaviš MEDIA_BASE na taj domen, fajlovi idu direktno iz R2 + CDN keša,
// bez pokretanja ove funkcije — to je najjeftinija varijanta.

export async function onRequestGet({ request, env, params, waitUntil }) {
  const key = (params.path || []).join("/");
  if (!env.MEDIA || !key || key.includes("..")) return env.ASSETS.fetch(request);

  const isRange = request.headers.has("range");
  const cache = caches.default;
  if (!isRange) {
    const hit = await cache.match(request);
    if (hit) return hit;
  }

  const obj = await env.MEDIA.get(key, { range: request.headers, onlyIf: request.headers });
  if (obj === null) return env.ASSETS.fetch(request);

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("accept-ranges", "bytes");
  if (!headers.has("cache-control")) headers.set("cache-control", "public, max-age=86400");

  // Uslov nije ispunjen (If-None-Match) → 304
  if (!("body" in obj)) return new Response(null, { status: 304, headers });

  if (isRange && obj.range) {
    const { offset = 0, length, suffix } = obj.range;
    const start = suffix !== undefined ? obj.size - suffix : offset;
    const len = suffix !== undefined ? suffix : length ?? obj.size - start;
    headers.set("content-range", `bytes ${start}-${start + len - 1}/${obj.size}`);
    headers.set("content-length", String(len));
    return new Response(obj.body, { status: 206, headers });
  }

  const res = new Response(obj.body, { headers });
  waitUntil(cache.put(request, res.clone()));
  return res;
}
