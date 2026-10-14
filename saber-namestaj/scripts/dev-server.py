"""Jednostavan lokalni server za pregled sajta (bez Cloudflare funkcija).
Pokretanje:  python3 scripts/dev-server.py   → http://localhost:8080
/proizvodi radi kao /proizvodi.html (isto kao na Cloudflare Pages)."""
import http.server, os, socketserver

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def send_head(self):
        path, _, query = self.path.partition("?")
        local = os.path.join(ROOT, path.lstrip("/"))
        if path != "/" and not os.path.splitext(path)[1] and os.path.isfile(local + ".html"):
            self.path = path + ".html" + ("?" + query if query else "")
        return super().send_head()

    def send_error(self, code, message=None, explain=None):
        if code == 404 and not self.path.startswith("/api/"):
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open(os.path.join(ROOT, "404.html"), "rb") as f:
                self.wfile.write(f.read())
            return
        super().send_error(code, message, explain)

socketserver.TCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("", 8080), H) as s:
    print("Sajt: http://localhost:8080   (Ctrl+C za kraj)")
    s.serve_forever()
