// Service Worker for HiTouch PWA
// 最小限の実装（何もしない）

// インストール時の処理（即座にアクティベート）
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// アクティベート時の処理（即座にコントロールを取得）
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
