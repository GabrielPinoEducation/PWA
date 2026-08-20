const CACHE_NAME = 'notas-voz-v1';
// Archivos que queremos guardar en el teléfono para uso sin conexión
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
];

// Evento INSTALL: Se ejecuta la primera vez que se carga la app
self.addEventListener('install', (evento) => {
    // Abrimos el caché y guardamos los archivos
    evento.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Archivos cacheados para uso offline');
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento FETCH: Se ejecuta cada vez que la app pide un archivo (HTML, CSS, JS)
self.addEventListener('fetch', (evento) => {
    // Estrategia "Cache First" (Primero el caché)
    evento.respondWith(
        caches.match(evento.request)
            .then(respuesta => {
                // Si el archivo está en caché, lo devuelve. Si no, lo pide a internet.
                return respuesta || fetch(evento.request);
            })
    );
});