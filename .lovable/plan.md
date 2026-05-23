# Fix App Not Updating After Republish (PWA Cache)

## Root Cause
The app uses `vite-plugin-pwa` with `registerType: 'autoUpdate'`. The current `src/main.tsx` calls `registerSW()` without the `immediate: true` flag and without auto-reloading when a new service worker takes over. The service worker caches `index.html` and JS/CSS, so returning users keep seeing the old build until they manually hard-refresh.

Additionally:
- `index.html` has no cache-control meta hints.
- There's no one-time cleanup for users who already have the old SW + caches stuck in their browser.

## Fix Plan

### 1. `src/main.tsx` — auto-reload on new version
- Call `registerSW({ immediate: true, onNeedRefresh() { updateSW(true) } })` so a new build activates and reloads the page automatically (no user action needed).
- Keep the existing iframe/preview guard that unregisters SW in Lovable preview.
- Add a one-time cleanup block (guarded by a `localStorage` flag like `sw-cache-cleared-v1`) that, on production hosts, unregisters any old service workers and calls `caches.keys()` + `caches.delete()` to flush stale caches from the previous build. Runs once per browser, then sets the flag.

### 2. `vite.config.ts` — safer PWA config
- Keep `registerType: 'autoUpdate'`.
- Add `workbox.cleanupOutdatedCaches: true` and `workbox.skipWaiting: true`, `workbox.clientsClaim: true` so new SW takes control immediately.
- Add `index.html` to `globPatterns` is already covered by `**/*.{js,css,html,...}` — keep as is, but ensure HTML is served `NetworkFirst` via a `runtimeCaching` rule for navigation requests so the shell never goes stale:
  ```
  { urlPattern: ({ request }) => request.mode === 'navigate',
    handler: 'NetworkFirst',
    options: { cacheName: 'html-cache', networkTimeoutSeconds: 3 } }
  ```

### 3. `index.html` — prevent HTML caching by browser
- Add meta tags in `<head>`:
  ```
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  ```
  This ensures the browser always revalidates `index.html`, which references the hashed JS/CSS bundles, so new bundles are picked up on next load.

## Files Changed
| File | Change |
|------|--------|
| `src/main.tsx` | Auto-reload on new SW + one-time stale cache cleanup |
| `vite.config.ts` | `cleanupOutdatedCaches`, `skipWaiting`, `clientsClaim`, NetworkFirst for navigation |
| `index.html` | No-cache meta tags on the HTML shell |

## Result
- Existing users with the stale cache get a one-time cleanup on next visit and load the new build.
- Future republishes activate automatically: the new service worker installs, skips waiting, takes control, and reloads the page — no manual cache clear required.
