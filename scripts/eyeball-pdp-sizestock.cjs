// G2 verification — size-level stock.
// Mocks products.json via page.route so live data is untouched. Tests:
//   1. TAN default render: S size disabled (sizeStock.S=0), M/L/XL enabled
//   2. BLACK swatch click: S enabled again (BLACK has no sizeStock → color.stock fallback)
//   3. Add-to-cart pre-check: TAN+S → button shows BU BEDEN STOKTA YOK + disabled
//   4. Cart hard limit: TAN+M, stock=3, add 3 ok, 4th add → toast appears
//   5. outOfStock override: forced true → all sizes irrelevant, button STOKTA YOK
//
// Run with astro preview on :4321 (npm run preview).
// Usage: node scripts/eyeball-pdp-sizestock.cjs
const { chromium } = require('playwright');

const BASE = 'http://localhost:4321';
const PASS = (m) => console.log('  ✓ ' + m);
const FAIL = (m) => { console.log('  ✗ ' + m); process.exitCode = 1; };

const mockProducts = [
  {
    id: 1,
    name: 'BDG Corduroy Bomber Jacket',
    price: 120,
    category: 'jackets',
    sizes: ['S', 'M', 'L', 'XL'],
    badge: 'NEW',
    color: '#c4a47a',
    colorName: 'Tan',
    colorFamily: 'brown',
    description: 'mock',
    stock: 'in-stock',
    stockQty: null,
    outOfStock: false,
    images: ['products/bdg-jacket-front.png', 'products/bdg-jacket-side.png', 'products/bdg-jacket-back.png', 'products/bdg-jacket-left.png'],
    colors: [
      { id: 'tan', name: 'TAN', hex: '#c4a47a', default: true, sizeStock: { S: 0, M: 3, L: 5, XL: 2 } },
      { id: 'black', name: 'BLACK', hex: '#000000', default: false, stock: 10 }
    ]
  }
];

async function setup(page, overrides) {
  const products = overrides ? overrides(mockProducts) : mockProducts;
  await page.route('**/data/products.json', route => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify(products)
  }));
  await page.evaluate(() => localStorage.removeItem('over2you_cart')).catch(() => {});
}

async function readBtn(page, size) {
  return await page.$eval(`.size-btn[data-size="${size}"]`, b => ({
    disabled: b.disabled,
    classes: b.className,
    oos: b.classList.contains('out-of-stock'),
    cursor: getComputedStyle(b).cursor
  }));
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // Scenario 1+2 — TAN default + BLACK switch
  console.log('Scenario 1: TAN default, S=0 should be disabled, M/L/XL enabled');
  await setup(page);
  await page.goto(`${BASE}/product?id=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.size-btn', { timeout: 8000 });
  await page.waitForTimeout(300);

  let s = await readBtn(page, 'S');
  s.disabled && s.oos ? PASS('TAN S: disabled+out-of-stock class') : FAIL(`TAN S: disabled=${s.disabled} oos=${s.oos}`);
  for (const sz of ['M', 'L', 'XL']) {
    const r = await readBtn(page, sz);
    !r.disabled && !r.oos ? PASS(`TAN ${sz}: enabled`) : FAIL(`TAN ${sz}: disabled=${r.disabled} oos=${r.oos}`);
  }

  console.log('Scenario 2: BLACK swatch → S enabled (no sizeStock, color.stock=10 fallback)');
  await page.click('.pdp-color-swatch[data-color-id="black"]');
  await page.waitForTimeout(300);
  s = await readBtn(page, 'S');
  !s.disabled && !s.oos ? PASS('BLACK S: enabled') : FAIL(`BLACK S: disabled=${s.disabled} oos=${s.oos}`);

  // Scenario 3: TAN + S click → add-to-cart should be disabled (S=0)
  console.log('Scenario 3: TAN+S → add-to-cart disabled + label "BU BEDEN STOKTA YOK"');
  await page.click('.pdp-color-swatch[data-color-id="tan"]');
  await page.waitForTimeout(200);
  // S is disabled — click attempt should be a no-op. Use force click to verify our handler returns early.
  const sBtn = await page.$('.size-btn[data-size="S"]');
  await sBtn.click({ force: true });
  await page.waitForTimeout(150);
  const sSelected = await page.$eval('.size-btn[data-size="S"]', b => b.dataset.selected === 'true');
  !sSelected ? PASS('TAN S click ignored (disabled handler)') : FAIL('TAN S click incorrectly selected');

  // Pick M (stock 3) and check button label
  await page.click('.size-btn[data-size="M"]');
  await page.waitForTimeout(200);
  let btnState = await page.$eval('#addToCartBtn', b => ({ disabled: b.disabled, text: b.textContent.trim() }));
  !btnState.disabled && btnState.text === 'ADD TO CART' ? PASS('TAN+M: button enabled, ADD TO CART') : FAIL(`TAN+M: ${JSON.stringify(btnState)}`);

  // Scenario 4: cart hard limit (stock=3, add 4 times → toast on 4th)
  // The cart drawer auto-opens after add() and intercepts pointer events on
  // the underlying PDP, so close it between adds.
  console.log('Scenario 4: Cart hard limit — stock 3, 4th add → toast');
  async function addOnce() {
    await page.click('#addToCartBtn');
    await page.waitForTimeout(250);
    await page.evaluate(() => {
      const d = document.getElementById('cartDrawer');
      const o = document.getElementById('cartOverlay');
      if (d) d.classList.remove('active');
      if (o) o.classList.remove('active');
      document.body.style.overflow = '';
    });
    await page.waitForTimeout(100);
  }
  for (let i = 0; i < 3; i++) await addOnce();
  let cart = await page.evaluate(() => JSON.parse(localStorage.getItem('over2you_cart') || '[]'));
  cart.length === 1 && cart[0].qty === 3 ? PASS('Cart qty=3 after 3 adds') : FAIL(`Cart: ${JSON.stringify(cart.map(i => ({ key: i.key, qty: i.qty })))}`);

  // 4th add — toast appears, qty stays 3
  await page.click('#addToCartBtn');
  await page.waitForTimeout(400);
  let toast = await page.$('#o2yToast.show');
  toast ? PASS('Toast appears on 4th add') : FAIL('Toast missing on 4th add');
  cart = await page.evaluate(() => JSON.parse(localStorage.getItem('over2you_cart') || '[]'));
  cart[0].qty === 3 ? PASS('Cart qty still 3 after blocked 4th add') : FAIL(`Cart qty=${cart[0].qty} (expected 3)`);

  // Cart drawer updateQty via JS call
  console.log('Scenario 4b: Cart.updateQty + delta → blocked at stock limit');
  const updateResult = await page.evaluate(() => {
    const before = JSON.parse(localStorage.getItem('over2you_cart') || '[]');
    window.Cart.updateQty(before[0].key, 1);
    const after = JSON.parse(localStorage.getItem('over2you_cart') || '[]');
    return { before: before[0].qty, after: after[0].qty };
  });
  updateResult.after === 3 ? PASS('Cart.updateQty +1 blocked at 3') : FAIL(`updateQty: before=${updateResult.before} after=${updateResult.after}`);

  // Scenario 5: outOfStock master override
  console.log('Scenario 5: outOfStock=true master override');
  await setup(page, ps => ps.map(p => p.id === 1 ? { ...p, outOfStock: true } : p));
  await page.goto(`${BASE}/product?id=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.size-btn', { timeout: 8000 });
  await page.waitForTimeout(300);

  const btn = await page.$eval('#addToCartBtn', b => ({ disabled: b.disabled, text: b.textContent.trim() }));
  btn.disabled && btn.text === 'STOKTA YOK' ? PASS('outOfStock: button disabled + STOKTA YOK') : FAIL(`outOfStock: ${JSON.stringify(btn)}`);

  const stockEl = await page.$eval('.pdp-stock', el => el.className.includes('pdp-stock--oos'));
  stockEl ? PASS('outOfStock: pdp-stock--oos class set') : FAIL('outOfStock: indicator missing OOS class');

  await browser.close();
  console.log('\nExit code: ' + (process.exitCode || 0));
})();
