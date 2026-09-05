import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const html = readFileSync(resolve(dist, 'index.html'), 'utf8');
const linkedAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+|\/notebook-hero\.webp)"/g)].map(match => match[1]);
const shell = [...new Set([
  '/',
  '/index.html',
  ...linkedAssets,
  '/sample-night-transit-01.svg',
  '/sample-night-transit-02.svg',
  '/privacy/index.html',
  '/terms/index.html',
  '/404.html',
  '/legal.css',
  '/favicon.svg',
  '/apple-touch-icon.svg',
  '/apple-touch-icon.png'
])];
const contentHash = createHash('sha256');
shell.filter(path => path !== '/').forEach(path => {
  try {
    contentHash.update(readFileSync(resolve(dist, `.${path}`)));
  } catch {
    // Optional public files do not prevent a new worker from being generated.
  }
});
const cacheName = `palette-a11y-${contentHash.digest('hex').slice(0, 12)}`;
const worker = `const CACHE = ${JSON.stringify(cacheName)};
const SHELL = ${JSON.stringify(shell)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('palette-a11y-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(url.pathname).then(response => response || caches.match('/index.html'))));
    return;
  }
  event.respondWith(caches.match(url.pathname).then(response => response || fetch(event.request)));
});`;
writeFileSync(resolve(dist, 'sw.js'), worker);
