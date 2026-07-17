importScripts("https://unpkg.com/@babel/standalone@7.25.6/babel.min.js");

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && url.pathname.endsWith(".jsx")) {
    event.respondWith(
      fetch(event.request).then(async (res) => {
        const source = await res.text();
        const { code } = Babel.transform(source, {
          presets: ["react"],
          filename: url.pathname,
          sourceType: "module",
        });
        return new Response(code, {
          status: 200,
          headers: { "Content-Type": "application/javascript" },
        });
      })
    );
  }
});
