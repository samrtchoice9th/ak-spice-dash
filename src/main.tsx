import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Guard: skip SW registration in iframe or Lovable preview hosts
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
} else {
  // One-time cleanup of stale caches from previous builds (runs once per browser)
  const CLEANUP_FLAG = 'sw-cache-cleared-v1';
  if (!localStorage.getItem(CLEANUP_FLAG)) {
    (async () => {
      try {
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        const regs = await navigator.serviceWorker?.getRegistrations();
        if (regs) await Promise.all(regs.map((r) => r.unregister()));
      } catch (e) {
        console.warn('Cache cleanup failed', e);
      } finally {
        localStorage.setItem(CLEANUP_FLAG, '1');
      }
    })();
  }

  // Auto-update: when a new SW is ready, reload the page automatically
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateSW(true);
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
  });
}

createRoot(document.getElementById("root")!).render(<App />);
