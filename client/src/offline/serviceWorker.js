const CACHE_NAME = 'campus-life-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/logo.svg'
];

export const registerServiceWorker = () => {
  const isProd = import.meta.env?.PROD || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');
  if ('serviceWorker' in navigator && isProd) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }
};
