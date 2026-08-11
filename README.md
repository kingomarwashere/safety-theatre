# Safety Theatre

A fact-checkable exposé of the Australian "road safety" statistics used to justify revenue-raising
and mass number-plate/in-cabin surveillance — and what the government's own audits, budget papers,
crash data and legislation actually show.

**Live (once deployed):** `safetytheatre.theradicalparty.com`
**Source / corrections:** https://github.com/kingomarwashere/safety-theatre

## The argument

The site has grown into a ~20-part exposé. The canonical page list (and order) lives in
`public/partials.js` and `public/sitemap.xml`; a few anchors:

| Page | Thesis |
|---|---|
| **Home** (`index.html`) | The four-card trick + the one chart they can't spin (rising toll) |
| **The Strategy** (`strategy.html`) | A plan to halve deaths, missing by ~20% and rising; only 2 of 5 targets can be measured |
| **The Money** (`money.html`) | Camera revenue by state, budgeted to grow; the NSW warning-sign spike; "safety funds" left unspent |
| **Speed** (`speed.html`) | "Speed kills" conflates over-limit + too-fast-for-conditions; the missing statistic; tolerances; Kloeden & Solomon, both ways |
| **Surveillance** (`surveillance.html`) | ANPR (16 plates/sec), in-cabin AI cameras, average-speed "function creep", private operators, retention |
| **Cabin Cameras** (`cameras.html`) | Phone + seatbelt AI cameras photograph inside every car; go-live revenue spikes (NSW seatbelt: 11,400 fines in 21 days, no grace period); the ethics check QLD's auditor found was never done; no published error rate |
| **The Law** (`delegations.html`) | Fine amounts, device definitions and owner-onus set by regulation, not voted; reverse onus; administrative suspension |
| **Sources** (`sources.html`) | Every audit, budget paper, Act, study and report, grouped by topic |

## Editorial integrity

The content was assembled from primary sources (auditor-general reports, BITRE, budget papers,
legislation registers) and cross-checked reporting. Figures are labelled:

- `verified` / verbatim — quoted from a primary source
- `claim` — a government or party's assertion, not independently established
- `contested` — genuine but disputed in the literature (e.g. the Solomon-curve low-speed limb)

Where a primary PDF blocked automated retrieval during research, the figure was cross-checked against
reputable secondary reporting and flagged. The site deliberately presents counter-evidence (Kloeden,
VAGO 2011) so the argument attacks the *framing and accountability*, not strawmen.

## Stack

- Static, no build step. Shared nav/footer injected via `public/partials.js`; home counter in `public/app.js`.
- Cloudflare Workers **static assets** hosting (`wrangler.jsonc` → `assets`).
- Radical Party brand tokens (red `#FF2D55` on warm black `#0B0B09`, Syne + IBM Plex Mono).
- `robots.txt` + `sitemap.xml` + `404.html` included.

## Local preview

```bash
npx wrangler dev        # serves ./public via the assets host
# or, no wrangler:
npx serve public
```

## Deploy

```bash
npx wrangler deploy
```

Then attach the custom domain by uncommenting the `routes` block in `wrangler.jsonc` (or via the
Cloudflare dashboard) and redeploying.

## Note

Public-record analysis and opinion. Not legal advice. Verify every figure against the primary source
before relying on it — that's the whole point of the site.
