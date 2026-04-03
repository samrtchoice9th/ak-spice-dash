

# Fix PWA Configuration

## Problems Found

1. **Service worker registers in Lovable preview iframe** — causes stale cached content in the editor, changes don't appear
2. **No `devOptions: { enabled: false }`** — SW is active during development
3. **Missing `navigateFallbackDenylist` for `/~oauth`** — OAuth redirects can get intercepted by the service worker
4. **No iframe/preview guard in `main.tsx`** — SW registers unconditionally

## Changes

### 1. `vite.config.ts` — Add safety options to VitePWA

- Add `devOptions: { enabled: false }` so SW only works in production builds
- Add `navigateFallbackDenylist: [/^\/~oauth/]` to workbox config

### 2. `src/main.tsx` — Guard SW registration

Before `registerSW()`, add checks to:
- Skip registration if running inside an iframe (Lovable editor)
- Skip registration if on a preview hostname (`id-preview--` or `lovableproject.com`)
- Unregister any existing SWs in those contexts to clean up stale caches

This ensures PWA works correctly on the **published** app while not interfering with development in the Lovable editor.

## Files Changed

| File | Change |
|------|--------|
| `vite.config.ts` | Add `devOptions`, `navigateFallbackDenylist` |
| `src/main.tsx` | Add iframe/preview guard around `registerSW()` |

