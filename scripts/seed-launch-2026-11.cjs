#!/usr/bin/env node
'use strict';
// Launch catalog seed — 2026-11 (O2Y / Furkan + Salih, PayTR go-live).
// Upserts by SKU into public/data/products.json (+ dist/data mirror when present),
// so it is safe to re-run. Launch decision (ahmet, 4 kas): only the two JADED LDN
// front-print jeans (sarı + kırmızı) go on sale, 4.499 TL each, no stock numbers
// (unknown stock = "Stokta", no per-size counts). Everything else lands as a hidden
// draft (price 0) for the owner to complete in the admin.
//
// usage: node scripts/seed-launch-2026-11.cjs [--site /root/projects/over2you-v2]
const fs = require('fs');
const path = require('path');

const siteArg = process.argv.indexOf('--site');
const SITE = siteArg !== -1 ? process.argv[siteArg + 1] : path.resolve(__dirname, '..');
const DATA = path.join(SITE, 'public/data/products.json');
const DIST = path.join(SITE, 'dist/data/products.json');

const sizesA = ['26', '28', '30', '32', '34', '36']; // jaded ldn
const sizesB = ['26', '28', '30', '32', '34'];       // jaded mavi nakış
const sizesC = ['29', '30', '31', '32', '33', '34']; // diğerleri
const LAUNCH_PRICE = 4499; // TL, ahmet 4 kas 2026

// No stock figures by decision: sizeStock/stockQty stay unset → storefront reads
// "unknown" = available ("Stokta"), never "Stokta Yok".
function product({ sku, name, slug, sizes, colorId, colorName, hex, images, description, badge, price, live }) {
  return {
    sku, name, slug,
    price: price || 0, salePrice: null,
    category: 'jeans', categories: ['jeans'],
    sizes, badge: badge || null,
    stock: 'in-stock', stockQty: null,
    outOfStock: false,
    draft: !live,
    description,
    images: images.slice(),
    colors: [{ id: colorId, name: colorName, hex, images: images.slice() }],
    seo: { metaTitle: null, metaDescription: null, slug },
    tags: ['jaded'], bundleWith: [],
  };
}

const SEED = [
  product({
    sku: 'JDD-LDN-SARI', name: 'JADED LDN Ön Baskı Kot — Sarı', slug: 'jaded-ldn-on-baski-kot-sari', sizes: sizesA,
    colorId: 'sari-baski', colorName: 'SARI BASKI', hex: '#e8b923',
    images: ['products/jaded-ldn-1.jpg', 'products/jaded-ldn-2.jpg', 'products/jaded-ldn-3.jpg', 'products/jaded-ldn-4.jpg', 'products/jaded-ldn-5.jpg'],
    description: 'Jaded London LDN ön baskılı baggy kot. Koyu lacivert denim, sarı LDN baskı, bol kalıp.', badge: 'NEW',
    price: LAUNCH_PRICE, live: true,
  }),
  product({
    sku: 'JDD-LDN-KIRMIZI', name: 'JADED LDN Ön Baskı Kot — Kırmızı', slug: 'jaded-ldn-on-baski-kot-kirmizi', sizes: sizesA,
    colorId: 'kirmizi-baski', colorName: 'KIRMIZI BASKI', hex: '#c0392b',
    images: [], // fotoğraf gelince eklenir; o güne kadar taslak
    description: 'Jaded London LDN ön baskılı baggy kot. Koyu lacivert denim, kırmızı LDN baskı, bol kalıp.', badge: 'NEW',
    price: LAUNCH_PRICE, live: false,
  }),
  product({
    sku: 'JDD-NAKIS-MAVI', name: 'JADED Önü Nakış Mavi Kot', slug: 'jaded-onu-nakis-mavi-kot', sizes: sizesB,
    colorId: 'mavi', colorName: 'MAVİ', hex: '#3b5b8c',
    images: [], description: 'Jaded London ön nakışlı mavi baggy kot.', badge: 'NEW',
  }),
  product({
    sku: 'JDD-INEK', name: 'İnek Desenli Kot', slug: 'inek-desenli-kot', sizes: sizesC,
    colorId: 'siyah-beyaz', colorName: 'SİYAH / BEYAZ', hex: '#2b2b2b',
    images: [], description: 'İnek desenli baggy kot.',
  }),
  product({
    sku: 'JDD-GRI', name: 'Gri Kot', slug: 'gri-kot', sizes: sizesC,
    colorId: 'gri', colorName: 'GRİ', hex: '#8a8a8a',
    images: [], description: 'Gri baggy kot.',
  }),
  product({
    sku: 'JDD-CAMO', name: 'Camo Kot', slug: 'camo-kot', sizes: sizesC,
    colorId: 'camo', colorName: 'CAMO', hex: '#4b5320',
    images: [], description: 'Kamuflaj desenli baggy kot.',
  }),
  product({
    sku: 'JDD-BEYAZ', name: 'Beyaz Kot', slug: 'beyaz-kot', sizes: sizesC,
    colorId: 'beyaz', colorName: 'BEYAZ', hex: '#f1f1f1',
    images: [], description: 'Beyaz baggy kot.',
  }),
];

// Pre-launch mock products that must not surface on the live store.
const HIDE_NAMES = new Set(['001', 'deneme']);

const products = JSON.parse(fs.readFileSync(DATA, 'utf8'));
let nextId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
const report = [];
for (const seed of SEED) {
  const idx = products.findIndex(p => p.sku === seed.sku);
  if (idx === -1) {
    products.push({ ...seed, id: nextId++ });
    report.push(`+ ${seed.sku} → #${nextId - 1} (${seed.draft ? 'taslak' : 'YAYINDA'}, ${seed.price} TL)`);
  } else {
    // Re-run: keep owner-edited fields; only an untouched record (price still 0)
    // takes the seed's price / live flag. Images refresh only when the seed has some.
    const cur = products[idx];
    const untouched = !cur.price;
    if (untouched && seed.price) { cur.price = seed.price; cur.draft = seed.draft; }
    if (seed.images.length) {
      cur.images = seed.images.slice();
      if (Array.isArray(cur.colors) && cur.colors[0]) cur.colors[0].images = seed.images.slice();
    }
    // Earlier seed wrote all-zero size matrices; by decision there are no stock figures.
    const allZero = (m) => m && typeof m === 'object' && Object.values(m).every(v => v === 0);
    if (allZero(cur.sizeStock)) delete cur.sizeStock;
    for (const c of (cur.colors || [])) if (allZero(c.sizeStock)) delete c.sizeStock;
    report.push(`= ${seed.sku} → #${cur.id} (mevcut${untouched ? ', fiyat/yayın seed\'den' : ', fiyat/stok korundu'})`);
  }
}
for (const p of products) {
  if (HIDE_NAMES.has(p.name) && !p.deletedAt && !p.draft) { p.draft = true; report.push(`~ #${p.id} "${p.name}" → taslak (mock ürün gizlendi)`); }
}

const json = JSON.stringify(products, null, 2);
fs.writeFileSync(DATA, json);
if (fs.existsSync(path.dirname(DIST))) fs.writeFileSync(DIST, json);
console.log(report.join('\n'));
console.log(`\n${products.length} ürün → ${DATA}${fs.existsSync(DIST) ? ' (+dist mirror)' : ''}`);
