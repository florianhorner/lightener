# Troubleshooting: card ships new code but UI looks like an old version

If a user reports **any** of these after an integration upgrade, treat them as
one compound symptom — not three independent bugs:

- Card editor renders the "Entity" label but the `<ha-entity-picker>` is blank.
- In-card light-management UI (Add light / per-row Remove) is missing even
  though the shipped version advertises it.
- Preview-at-brightness scrubber shows a "+N more" or "Show less" button
  whose label doesn't match the current source (e.g., source renders
  `"Collapse"` but the user sees `"Show less"`), or the button click is dead.

These share one root cause: **the class currently registered under
`<lightener-curve-card>` in the user's browser is not the class from the
current bundle.**

## Why it happens (in order of what to check)

1. **HACS "installed version" label vs bytes on disk.** HACS sometimes
   reports `vX.Y.Z` installed while the files under
   `/config/custom_components/lightener/` are from an older release. This
   has been reproduced. Fix: HACS → three-dot menu on the Lightener repo →
   **Redownload** → pick the target version → restart Home Assistant.
2. **Browser Workbox / HTTP cache held the previous bundle.** HA's service
   worker (`home-assistant-frontend`, scope `/`) and the browser's HTTP
   disk cache can both keep the pre-upgrade card JS. The first page load
   after upgrade wins the race and registers the **old** class via
   `customElements.define('lightener-curve-card', …)`. Because `define` is
   one-shot, every subsequent fetch of the fresh bundle has its
   `customElements.define` call silently fail (`NotSupportedError`). Every
   instance on the page continues to use the stale class — missing methods
   and missing render branches from the new version.
3. **Stray shadow copy on disk.** A manual file in `/config/www/…` or
   `/config/www/community/…` referenced by a Lovelace resource can shadow
   the integration's registered static path
   (`/lightener/lightener-curve-card.js` → `custom_components/lightener/frontend/lightener-curve-card.js`).

## Diagnostic: prove the active class is stale

Run in DevTools on the HA page:

```js
(async () => {
  const ctor = customElements.get('lightener-curve-card');
  const proto = ctor?.prototype;
  const hasCanManageLights = proto && !!Object.getOwnPropertyDescriptor(proto, '_canManageLights');
  const r = await fetch('/lightener/lightener-curve-card.js', { cache: 'no-store' });
  const t = await r.text();
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))]
    .map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 12);
  return JSON.stringify({
    className: ctor?.name,            // minified, e.g. "He" vs "Be" — just needs to be stable per-version
    hasCanManageLights,               // must be true on any build that ships PR #52
    bytes: t.length,
    hasCollapse: t.includes('Collapse'),
    hasShowLess: t.includes('Show less'),
    sha256Prefix: hash,
    lastModified: r.headers.get('last-modified')
  });
})();
```

**Healthy state on current `master`:**
`hasCanManageLights === true`, `hasCollapse === true`, `hasShowLess === false`.

Compare `bytes` to the server file:
```bash
# locally:
wc -c < custom_components/lightener/frontend/lightener-curve-card.js
# over SSH:
ssh "$HA_SSH_TARGET" "wc -c < /config/custom_components/lightener/frontend/lightener-curve-card.js"
```
If the two sizes agree but the browser still has a stale class, you're in
case 2 (browser cache). If they disagree, you're in case 1 or 3.

## Recovery sequence

Run these in order. Stop as soon as the diagnostic above is healthy.

1. **Fix the file on disk first.** HACS Redownload + restart HA (case 1),
   or `scripts/ha-sync --frontend-only` for a dev loop, or delete the
   shadow file in `/config/www/…` (case 3).
2. **Clear the browser.** In DevTools Console on the HA origin:
   ```js
   (async () => {
     for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
     for (const k of await caches.keys()) await caches.delete(k);
     await fetch('/lightener/lightener-curve-card.js', { cache: 'reload' });
     location.reload();
   })();
   ```
   The explicit `fetch({ cache: 'reload' })` is required: `location.reload()`
   alone will often serve the stale copy from the browser's HTTP disk
   cache if the response lacked a strong `Cache-Control` header.
3. **If the registered class is still the old one,** close every HA tab
   on this browser profile (bfcache / shared module graph across tabs can
   resurrect the old class) and reopen one tab. Re-run the diagnostic.

## Permanent fix (tracked)

This will recur for every user upgrading across a bundle change until the
served path is version-stamped. See GitHub issue referenced in
[CLAUDE.md](../CLAUDE.md#triaging-bundle--caching-issues).
