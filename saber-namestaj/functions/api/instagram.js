// GET /api/instagram — poslednje 3 objave sa Instagram profila.
// Koristi Instagram API (Instagram Login) i dugotrajni token (INSTAGRAM_TOKEN).
// Rezultat se kešira 3 sata, pa Instagram API pozivamo najviše ~8 puta dnevno po data centru.
// Ako postoji KV binding IG_KV, token se automatski obnavlja svakih ~30 dana (inače ističe posle 60).

const json = (data, maxAge = 3600) =>
  new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${maxAge}, s-maxage=10800` },
  });

export async function onRequestGet({ request, env, waitUntil }) {
  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/instagram", request.url).toString());
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let token = env.INSTAGRAM_TOKEN;
  if (env.IG_KV) token = (await env.IG_KV.get("token")) || token;
  if (!token) return json({ posts: [] }, 600);

  let posts = null;
  try {
    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=6&access_token=${encodeURIComponent(token)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`IG ${r.status}`);
    const { data = [] } = await r.json();
    posts = data
      .map((p) => ({
        permalink: p.permalink,
        image: p.media_type === "VIDEO" ? p.thumbnail_url : p.media_url,
        caption: (p.caption || "").slice(0, 300),
        timestamp: p.timestamp,
      }))
      .filter((p) => p.image)
      .slice(0, 3);
    if (env.IG_KV) waitUntil(env.IG_KV.put("last_posts", JSON.stringify(posts)));
  } catch (e) {
    console.error("Instagram greška:", e.message);
    if (env.IG_KV) posts = JSON.parse((await env.IG_KV.get("last_posts")) || "[]");
  }

  if (env.IG_KV) waitUntil(refreshToken(env, token));

  const res = json({ posts: posts || [] });
  waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

async function refreshToken(env, token) {
  const last = +(await env.IG_KV.get("refreshed_at")) || 0;
  if (Date.now() - last < 30 * 24 * 3600 * 1000) return;
  const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`);
  if (!r.ok) return console.error("Obnova tokena nije uspela", r.status);
  const { access_token } = await r.json();
  if (access_token) {
    await env.IG_KV.put("token", access_token);
    await env.IG_KV.put("refreshed_at", String(Date.now()));
  }
}
