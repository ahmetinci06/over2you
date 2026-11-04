#!/usr/bin/env node
'use strict';
// Launch catalog seed — 2026-11 (O2Y / Furkan + Salih, PayTR go-live).
// Upserts by SKU into public/data/products.json (+ dist/data mirror when present),
// so it is safe to re-run. Products land as `draft: true` with price 0 and a zeroed
// size matrix: the store owner sets price + per-size stock in the admin, then unticks
// "Taslak". Nothing here is visible to customers until that happens.
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
const zero = (sizes) => Object.fromEntries(sizes.map(s => [s, 0]));

function product({ sku, name, slug, sizes, colorId, colorName, hex, images, description, badge }) {
  return {
    sku, name, slug,
    price: 0, salePrice: null,
    category: 'jeans', categories: ['jeans'],
    sizes, badge: badge || null,
    stock: 'in-stock', stockQty: null,
    sizeStock: zero(sizes), outOfStock: false,
    draft: true,
    description,
    images: images.slice(),
    colors: [{ id: colorId, name: colorName, hex, images: images.slice(), sizeStock: zero(sizes) }],
    seo: { metaTitle: null, metaDescription: null, slug },
    tags: ['jaded'], bundleWith: [],
  };
}

const SEED = [
  product({
    sku: 'JDD-LDN-BLK', name: 'JADED LDN Ön Baskı Kot', slug: 'jaded-ldn-on-baski-kot', sizes: sizesA,
    colorId: 'siyah', colorName: 'SİYAH', hex: '#15161a',
    images: ['products/jaded-ldn-1.jpg', 'products/jaded-ldn-2.jpg', 'products/jaded-ldn-3.jpg', 'products/jaded-ldn-4.jpg', 'products/jaded-ldn-5.jpg'],
    description: 'Jaded London LDN ön baskılı baggy kot. Koyu lacivert denim, sarı LDN baskı, bol kalıp.', badge: 'NEW',
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
    report.push(`+ ${seed.sku} → #${nextId - 1} (yeni, taslak)`);
  } else {
    // Re-run: keep owner-edited fields (price, stock, draft flag, description), refresh images only when seed has some.
    const cur = products[idx];
    if (seed.images.length) {
      cur.images = seed.images.slice();
      if (Array.isArray(cur.colors) && cur.colors[0]) cur.colors[0].images = seed.images.slice();
    }
    report.push(`= ${seed.sku} → #${cur.id} (mevcut, fiyat/stok korundu)`);
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
