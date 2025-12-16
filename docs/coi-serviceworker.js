/*! coi-serviceworker v0.2.0 - Simplified version */
/*! Enables SharedArrayBuffer for GitHub Pages */

if (typeof window === 'undefined') {
  // Service Worker 代码
  self.addEventListener('install', () => {
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });

  self.addEventListener('fetch', (event) => {
    const request = event.request;
    
    // 跳过非导航请求
    if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
      return;
    }

    event.respondWith(
      fetch(request)
        .then(response => {
          // 只为主文档添加COOP/COEP头部
          if (request.mode === 'navigate' || request.destination === 'document') {
            const newHeaders = new Headers(response.headers);
            newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
            newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
            newHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin');

            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: newHeaders
            });
          }
          
          return response;
        })
        .catch(err => {
          console.error('[COI SW] Fetch failed:', err);
          return new Response('Network error', { status: 500 });
        })
    );
  });
} else {
  // 客户端注册代码
  (function() {
    'use strict';
    
    // 检查是否已经跨域隔离
    if (window.crossOriginIsolated) {
      console.log('[COI] Already cross-origin isolated');
      return;
    }

    // 检查浏览器支持
    if (!navigator.serviceWorker) {
      console.warn('[COI] Service Worker not supported');
      return;
    }

    // 检查是否刚刚刷新过
    const justReloaded = sessionStorage.getItem('coi_reloaded');
    if (justReloaded === 'yes') {
      sessionStorage.removeItem('coi_reloaded');
      console.log('[COI] Reloaded, waiting for activation...');
      return;
    }

    // 注册Service Worker
    const scriptUrl = document.currentScript ? document.currentScript.src : window.location.origin + '/coi-serviceworker.js';
    
    navigator.serviceWorker.register(scriptUrl)
      .then(registration => {
        console.log('[COI] Service Worker registered:', registration.scope);
        
        // 如果已经有活动的Service Worker，不需要刷新
        if (registration.active) {
          console.log('[COI] Service Worker already active');
          return;
        }
        
        // 等待Service Worker激活后刷新一次
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;
          
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') {
              console.log('[COI] Service Worker activated, reloading...');
              sessionStorage.setItem('coi_reloaded', 'yes');
              window.location.reload();
            }
          });
        });
      })
      .catch(err => {
        console.error('[COI] Service Worker registration failed:', err);
      });
  })();
}