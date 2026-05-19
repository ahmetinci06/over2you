// G5 — shop card "STOKTA YOK" badge.
// Mocks three products and asserts which ones get the OOS badge:
//   1. outOfStock=true → badge (master override)
//   2. effectiveStockSum===0 via stockQty=0 → badge
//   3. effectiveStockSum===0 via sizeStock all-zero → badge
//   4. normal product (stockQty>0) → no badge
//   5. unknown stock (stockQty=null, no sizeStock) → no badge (null != 0)
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:4321';
const PASS = (m) => console.log('  ✓ ' + m);
const FAIL = (m) => { console.log('  ✗ ' + m); process.exitCode = 1; };

const mocks = [
  { id: 1, name: 'OOS Master', price: 100, category: 'jackets', sizes: ['S','M'], stock: 'out-of-stock', stockQty: 5, outOfStock: true, color: '#111', images: ['products/bdg-jacket-front.png'], description: '' },
  { id: 2, name: 'Zero StockQty', price: 100, category: 'jackets', sizes: ['S','M'], stock: 'out-of-stock', stockQty: 0, outOfStock: false, color: '#222', images: ['products/bdg-jacket-front.png'], description: '' },
  { id: 3, name: 'Zero sizeStock', price: 100, category: 'jackets', sizes: ['S','M'], stock: 'low-stock', stockQty: 0, outOfStock: false, sizeStock: { S: 0, M: 0 }, color: '#333', images: ['products/bdg-jacket-front.png'], description: '' },
  { id: 4, name: 'In Stock', price: 100, category: 'jackets', sizes: ['S','M'], stock: 'in-stock', stockQty: 10, outOfStock: false, color: '#444', images: ['products/bdg-jacket-front.png'], description: '' },
  { id: 5, name: 'Unknown Stock', price: 100, category: 'jackets', sizes: ['S','M'], stock: 'in-stock', stockQty: null, outOfStock: false, color: '#555', images: ['products/bdg-jacket-front.png'], description: '' },
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.route('**/data/products.json', r => r.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify(mocks)
  }));
  await page.goto(`${BASE}/shop`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.product-card', { timeout: 8000 });
  await page.waitForTimeout(400);

  async function hasOOSBadge(id) {
    return await page.$eval(`.product-card[data-id="${id}"]`, el => !!el.querySelector('.product-badge--oos'));
  }

  for (const m of mocks) {
    const has = await hasOOSBadge(m.id);
    const expectOOS = !!(m.outOfStock || m.stockQty === 0 || (m.sizeStock && Object.values(m.sizeStock).every(v => v === 0)));
    if (has === expectOOS) {
      PASS(`#${m.id} "${m.name}" → badge ${has ? 'shown' : 'hidden'} (expected ${expectOOS ? 'shown' : 'hidden'})`);
    } else {
      FAIL(`#${m.id} "${m.name}" → badge ${has ? 'shown' : 'hidden'}, expected ${expectOOS ? 'shown' : 'hidden'}`);
    }
  }

  await browser.close();
  console.log('\nExit code: ' + (process.exitCode || 0));
})();
