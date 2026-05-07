# Over2You

Premium streetwear storefront — [over2you.shop](https://over2you.shop)

Astro 5 + vanilla TS/JS over a CMS-managed JSON catalog. TR-first UI with EN
toggle. KVKK and mesafeli satış pages baked in.

## Stack

- **Astro 5** — static output, zero JS by default
- **Vanilla TS/JS** — `app.js`, `i18n.js`, `carousel-3d.js`
- **Söhne** — full weight family self-hosted in `public/fonts/`
- **Playwright** — visual-regression scripts in `scripts/`
- **JSON catalog** — `public/data/{products,settings}.json`, edited via the
  separate [over2you-cms](https://github.com/Sylvan-Ai/over2you-cms)

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/
npm run preview    # serve the build locally
```

Requires Node `18.20+`, `20.3+`, or `22+`.

## Project layout

```
src/
├── layouts/Layout.astro          # header + cart drawer + lang switch
├── components/
│   ├── Footer.astro
│   ├── LegalVar.astro            # injects company info into legal pages
│   └── LegalWarning.astro
├── data/legal-vars.json          # company info source
└── pages/
    ├── index.astro               # home (hero slideshow, featured grid)
    ├── shop.astro                # catalog + filters
    ├── product.astro             # PDP — gallery, 360, magnify, size picker
    ├── checkout.astro            # 3 payment paths
    ├── confirmation.astro
    ├── about.astro
    ├── iletisim.astro            # contact
    ├── kunye.astro               # imprint
    ├── kargo.astro               # shipping policy
    ├── iade-politikasi.astro     # returns
    ├── mesafeli-satis.astro      # distance-selling agreement
    ├── kullanim-kosullari.astro  # terms
    ├── gizlilik-politikasi.astro # privacy
    └── 404.astro

public/
├── admin/    # entry into the CMS
├── css/      # design system
├── js/       # app, i18n, carousel-3d
├── data/     # products.json + settings.json (CMS-owned)
├── fonts/    # Söhne weights
└── img/      # hero + product imagery
```

## i18n

TR is the default (`<html lang="tr">`). `public/js/i18n.js` swaps copy when
the language pill in the header is clicked. All strings live in a single
`O2Y_TRANSLATIONS` object keyed `tr` / `en`.

## Catalog & settings

Both data files in `public/data/` are owned by the
[over2you-cms](https://github.com/Sylvan-Ai/over2you-cms) — a separate Node
service that authenticates against bcrypt-hashed users and writes back to the
storefront's JSON. Settings cover branding, IBAN, hero slides, shipping
thresholds, WhatsApp number, and the announcement bar. `public/admin/` ships
a static admin UI bundled with the build for in-storefront edits.

## Payments

| method        | status        | notes                                           |
| ------------- | ------------- | ----------------------------------------------- |
| iyzico (card) | frontend only | settings slot for keys; payment backend pending |
| bank transfer | wired         | IBAN block shown at checkout                    |
| WhatsApp      | wired         | builds a pre-filled cart message to your number |

## Visual regression

`scripts/eyeball-*.cjs` — Playwright snapshots used to verify product-page
states (cart drawer, 360 mode, gallery, magnify lens) after layout changes.

```bash
node scripts/eyeball-360.cjs
```

## Deploy

Static output. Run `npm run build` and serve `dist/` from any static host;
production is currently behind nginx at over2you.shop.

No GitHub Actions, no Pages workflow — that path was retired.

## License

All rights reserved © 2026 Over2You.
