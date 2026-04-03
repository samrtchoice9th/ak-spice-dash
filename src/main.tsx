
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
  registerSW({
    onNeedRefresh() {
      console.log('New content available, please refresh.');
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
  });
}

createRoot(document.getElementById("root")!).render(<App />);
