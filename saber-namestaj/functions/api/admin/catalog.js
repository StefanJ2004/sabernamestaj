// POST /api/admin/catalog — otpremanje PDF kataloga (npr. Bistro katalog) u R2.
// Fajl je dostupan na <MEDIA_BASE>/katalozi/<naziv>.pdf i preuzima se kao prilog.

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } });

export async function onRequestPost({ env, request }) {
  const form = await request.formData();
  const file = form.get("file");
  const name = String(form.get("name") || "bistro-katalog").toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 60) || "katalog";
  if (!file || typeof file !== "object" || !file.size) return json({ error: "Fajl nije izabran" }, 400);
  if (file.type !== "application/pdf") return json({ error: "Dozvoljen je samo PDF" }, 400);
  if (file.size > 60 * 1024 * 1024) return json({ error: "PDF je veći od 60 MB — smanji ga pre otpremanja" }, 400);

  const key = `katalozi/${name}.pdf`;
  await env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: "application/pdf",
      contentDisposition: `attachment; filename="${name}.pdf"`,
      cacheControl: "public, max-age=3600",
    },
  });
  const base = (env.MEDIA_BASE || "/media").replace(/\/$/, "");
  await caches.default.delete(new Request(new URL(`/media/${key}`, request.url).toString()));
  return json({ ok: true, url: `${base}/${key}` });
}
