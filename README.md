# Over2You — E-Commerce Store

Premium streetwear e-commerce site built with [Astro](https://astro.build).

## 🚀 Quick Start

```bash
npm install
npm run dev        # Dev server → localhost:4321
npm run build      # Build to dist/
npm run preview    # Preview build
```

## 📁 Project Structure

```
├── src/
│   ├── layouts/Layout.astro    # Main layout (header, footer, cart, nav)
│   └── pages/
│       ├── index.astro         # Homepage
│       └── 404.astro           # 404 page
├── public/
│   ├── pages/                  # Shop, product, checkout, confirmation
│   ├── admin/                  # CMS admin panel
│   ├── css/style.css           # Design system
│   ├── js/app.js               # Cart, search, 360 viewer
│   ├── data/
│   │   ├── products.json       # Product catalog (CMS-managed)
│   │   └── settings.json       # Site config (CMS-managed)
│   ├── fonts/                  # Söhne font family
│   └── img/                    # Product & hero images
├── .github/workflows/deploy.yml # Auto-deploy to GitHub Pages
└── astro.config.mjs
```

## 🛠 CMS Admin Panel

Access: `https://your-site.com/admin/`

Login with a GitHub Personal Access Token (needs `repo` scope).

**Features:**
- Product management (add, edit, delete)
- Store settings (branding, contact, shipping)
- Payment config (iyzico, bank transfer, WhatsApp)
- Order viewer + CSV export
- Bulk product import/export (JSON)
- Image upload via GitHub API

## 💳 Payment Methods

1. **Credit Card** — iyzico integration (needs API backend)
2. **Bank Transfer** — IBAN details shown at checkout
3. **WhatsApp Order** — Sends cart via WhatsApp message

## 🔧 Configuration

### iyzico (Card Payments)
1. Get API keys from [iyzico](https://www.iyzico.com)
2. Set keys in CMS → Settings → Payment → iyzico
3. Run the API backend: `cd api/ && npm install && npm start`

### GitHub Pages Deploy
Automatic via GitHub Actions on push to `main`.

Or manual: Settings → Pages → Source: GitHub Actions.

## 📦 Key Features

- Responsive design (mobile-first)
- Hero slideshow with auto-play
- Product grid with category/color filters
- Product detail page with 360° viewer
- Size picker with validation
- Cart drawer with localStorage persistence
- Live search (name, category, color)
- Checkout with 3 payment methods
- Order confirmation page
- CMS admin panel (no backend needed)
- SEO meta tags + Open Graph

## 📄 License

All rights reserved © 2026 Over2You
