# Over2You - Streetwear E-Commerce Website

## Project Overview
Clone of https://www.6pmseason.com/ for a streetwear brand called "Over2You" (over2you.shop).
This is a static e-commerce site built with Astro + Tailwind CSS.

## Tech Stack
- Astro 5.x (static site generator)
- Tailwind CSS 4.x
- Vanilla JavaScript (for 360° viewer and interactions)
- js-cloudimage-360-view (for 360° product viewer)

## Design Reference: 6pmseason.com
- Dark/black background, minimal aesthetic
- Clean sans-serif typography (use Inter or similar)
- Product-focused, streetwear vibes
- Sticky header with transparent-to-solid scroll effect
- Full-width hero sections with video/image backgrounds
- Product grid with hover effects and quick-size selection
- Newsletter signup in footer

## Pages Required

### 1. Homepage (/)
- Sticky transparent nav: Logo (Over2You), Shop link, Collections dropdown
- Hero section: full-width image/video banner with CTA "SHOP NOW"
- 3 collection banners (like 6PM's "NEW COLORS ONLINE", "WOMEN", "SPORTS")
- Newsletter signup section
- Footer: links, social icons, copyright

### 2. Collections Page (/collections/[slug])
- Filter sidebar: Color, Size, In Stock toggle
- Product grid (3-4 columns desktop, 2 mobile)
- Each product card: image, name, price, size badges on hover
- "NEW", "LAST STOCK", "UPDATED" badges like 6PM

### 3. Product Detail Page (/products/[slug])
- Large product images (gallery with thumbnails)
- **360° ROTATING MODEL VIEWER** - drag to rotate, uses js-cloudimage-360-view
  - For now use 36 placeholder images (numbered product-01.jpg to product-36.jpg)
  - Component should be reusable and easy to swap real photos in later
- Product name, price (in TL ₺), color selector, size selector
- "ADD TO CART" button (Snipcart integration ready)
- Accordion sections: Product Information, Care Instructions, Size Information, Shipping & Returns
- Model measurements display (like "Male: 185cm | Size: M")

### 4. Brand/About Page (/brand)
- Grid of lookbook/collab cards (like 6PM's brand page)
- Each card: image, category tag, title, description, "More" link

### 5. Cart (Snipcart)
- Integrate Snipcart for cart + checkout functionality
- Add snipcart data attributes to product buttons
- Style snipcart to match dark theme

## Product Data Structure
Use Astro content collections. Each product is a markdown file in src/content/products/:

```yaml
---
name: "Hoodie Black"
slug: "hoodie-black"
price: 1299.99
currency: "TRY"
collection: "basics"
colors: ["black"]
sizes: ["XS", "S", "M", "L", "XL", "XXL"]
inStock: true
badge: "NEW"
images: ["/images/products/hoodie-black/01.jpg"]
has360: true
description: "Premium heavyweight cotton hoodie"
material: "70% Cotton 30% Polyester"
care: ["30°C Easy Care", "Do Not Bleach", "Do Not Tumble Dry", "Iron Low Heat"]
modelInfo: "Male: 185cm | Size: M"
---
```

## 360° Viewer Component
Create a reusable Astro component `ProductSpinner.astro`:
- Uses js-cloudimage-360-view library
- Accepts folder path and image count as props
- Drag to rotate, autoplay option
- Touch support for mobile
- Loading indicator
- For placeholder: generate 36 numbered gradient images or use a CSS-based spinning cube demo

## Sample Products (create 8-10)
Create placeholder products with different names/prices for demo:
- Hoodie Black - ₺1,299.99
- Hoodie Grey Melange - ₺1,299.99
- Sweatpants Black - ₺999.99
- Crewneck Navy - ₺1,099.99
- T-Shirt White - ₺599.99
- T-Shirt Black - ₺599.99
- Zip Hoodie Anthracite - ₺1,499.99
- Tanktop White - ₺449.99

## Collections
- basics (all products)
- hoodies
- sweatpants
- t-shirts
- accessories

## Responsive Design
- Mobile first
- Breakpoints: sm(640) md(768) lg(1024) xl(1280)
- Mobile hamburger menu
- Product grid: 2 cols mobile, 3 cols tablet, 4 cols desktop

## Colors (Brand)
- Background: #000000
- Text: #FFFFFF
- Accent: customize later (use neutral for now)
- Cards: #111111
- Borders: #222222
- Hover: #333333

## Deployment
- Output: static (astro build → dist/)
- Will be deployed to Hostinger shared hosting via FTP
- All assets should be optimized

## Important Notes
- Use placeholder images (colored rectangles with product names) until real photos arrive
- Make the 360° viewer component production-ready but with placeholder content
- Prices in Turkish Lira (₺)
- Currency symbol before price
- Site language: English (international streetwear brand)
- Keep it minimal and clean like 6PM
- Performance matters: lazy load images, optimize everything
