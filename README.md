# Safety Theatre

An exposé website about the "road safety" statistics used to justify revenue-raising
and mass number-plate surveillance — and what the government's own audits, crash data
and budget papers actually show.

**Live (once deployed):** `safetytheatre.theradicalparty.com`

## What it argues

1. **"Speed kills"** slides from *excessive speed in the wrong conditions* to *any speed over an arbitrary line* — because only the second version can be automated and billed.
2. **The limit isn't the safe speed.** The 85th-percentile engineering rule is routinely ignored so the safest, most typical driver becomes a permanent revenue stream.
3. **Cameras chase detections, not blackspots** — and warning signs get removed to maximise fines.
4. **The fine is the excuse; the surveillance is the product.** Every plate is read, logged and retained, guilty or not.

Everything is framed as public-record analysis with a **Sources** section pointing at
auditor-general reports, budget papers, BITRE crash data and traffic-engineering literature.
Figures that are illustrative (e.g. the live "fines raised" counter) are labelled as such.

## Stack

- Static site, no build step
- Cloudflare Workers **static assets** hosting (`wrangler.jsonc` → `assets`)
- Radical Party brand tokens (red `#FF2D55` on warm black `#0B0B09`, Syne + IBM Plex Mono)

## Local preview

```bash
npx wrangler dev        # serves ./public with the assets host
# or, no wrangler:
npx serve public
```

## Deploy

```bash
npx wrangler deploy
```

Then attach the custom domain by uncommenting the `routes` block in `wrangler.jsonc`
(or via the Cloudflare dashboard) and redeploying.

## Editing

All content lives in `public/index.html`. Styling in `public/style.css`.
The running fines counter is in `public/app.js` (rate is clearly labelled as illustrative).

## Note

Public-record analysis and opinion. Not legal advice. Verify every figure against the
primary source before relying on it — that's the whole point of the site.
