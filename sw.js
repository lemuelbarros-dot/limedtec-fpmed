// LIMEDTEC FPMED: so permite instalar como app. Nao guarda nada em cache (sempre o site do ar).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
