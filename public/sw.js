const CACHE_NAME = 'bigbottle-cache-v2';
const IS_DEVELOPMENT = self.location.hostname === 'localhost' || 
                       self.location.hostname === '127.0.0.1' || 
                       self.location.hostname.includes('192.168.');

// 在开发环境中，当安装时，跳过缓存
self.addEventListener('install', (event) => {
  if (IS_DEVELOPMENT) {
    console.log('Service Worker 在开发环境中跳过缓存');
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
      ]);
    })
  );
});

// 在开发环境中，不拦截请求
self.addEventListener('fetch', (event) => {
  if (IS_DEVELOPMENT) {
    // 开发环境中不使用缓存，直接从网络获取
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
}); 