// GET /api/products — javna lista proizvoda.
// Čita data/products.json iz R2; ako ga nema (pre prvog unosa u adminu) vraća statički /data/products.json.
// Odgovor se kešira na Cloudflare ivici 5 min, pa R2 dobija vrlo malo čitanja.

const KEY = "data/products.json";

export async function onRequestGet({ request, env, waitUntil }) {
  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/products", request.url).toString());
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let body = null;
  if (env.MEDIA) {
    const obj = await env.MEDIA.get(KEY);
    if (obj) body = await obj.text();
  }
  if (body === null) {
    const r = await env.ASSETS.fetch(new URL("/data/products.json", request.url));
    body = await r.text();
  }

  const res = new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=300",
    },
  });
  waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
