---
name: Bug report
about: Something isn't working as expected
labels: bug
---

**Describe the bug**
A clear description of what is wrong.

**Steps to reproduce**
1. …
2. …

**Expected vs actual behaviour**

**Card YAML config**
```yaml
type: custom:lightener-curve-card
entity: light.your_entity
```

**Environment**
- Home Assistant version:
- Integration version (Settings → Devices & Services → Lightener):
- Browser + version:
- Install method: HACS / manual

**Console output**
Open browser DevTools → Console. Paste any red errors here.

**Stale-card diagnostic** *(if UI looks like an older version)*
Run this in DevTools console on your HA page and paste the result:
```js
(async () => {
  const ctor = customElements.get('lightener-curve-card');
  const r = await fetch('/lightener/lightener-curve-card.js', { cache: 'no-store' });
  const t = await r.text();
  return JSON.stringify({
    cardVersion: window.__LIGHTENER_CURVE_CARD_VERSION__,
    bytes: t.length,
    lastModified: r.headers.get('last-modified'),
  });
})();
```

See [TROUBLESHOOTING.md](../../docs/TROUBLESHOOTING.md) for the full stale-card recovery sequence.
