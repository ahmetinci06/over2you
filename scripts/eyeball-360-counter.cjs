// G6-PR1 verification — counter removed + 360 ring still works.
// Hits local astro preview on :4321. Mocks a 4-frame product so the toggle
// is guaranteed available, then asserts:
//   1. .c3d-counter is gone from the DOM
//   2. Toggle button opens the ring
//   3. Arrow click advances spinIdx
//   4. Slot click jumps to that index
// Run alongside scripts/eyeball-pdp-sizestock.cjs for full regression cover.
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:4321';
const PASS = (m) => console.log('  ✓ ' + m);
const FAIL = (m) => { console.log('  ✗ ' + m); process.exitCode = 1; };

const mock = [{
  id: 1, name: 'BDG', price: 120, category: 'jackets',
  sizes: ['S','M','L','XL'], stock: 'in-stock', stockQty: null, outOfStock: false,
  color: '#c4a47a', colorName: 'Tan', colorFamily: 'brown', description: 'mock',
  images: ['products/bdg-jacket-front.png','products/bdg-jacket-side.png','products/bdg-jacket-back.png','products/bdg-jacket-left.png'],
  images360: [
    { id:'front',  src:'products/bdg-jacket-front.png', label:'FRONT', deg:'0°',   flip:false },
    { id:'side-r', src:'products/bdg-jacket-side.png',  label:'3/4 R', deg:'90°',  flip:false },
    { id:'back',   src:'products/bdg-jacket-back.png',  label:'BACK',  deg:'180°', flip:false },
    { id:'side-l', src:'products/bdg-jacket-left.png',  label:'3/4 L', deg:'270°', flip:false }
  ],
  colors: []
}];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.route('**/data/products.json', r => r.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify(mock)
  }));

  await page.goto(`${BASE}/product?id=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('carousel-3d', { timeout: 8000 });
  await page.waitForTimeout(400);

  // 1. counter gone
  const counterCount = await page.$$eval('.c3d-counter', els => els.length);
  counterCount === 0 ? PASS('counter element removed from DOM') : FAIL(`counter still present (${counterCount} found)`);

  // 2. toggle opens ring
  const toggle = await page.$('.c3d-toggle');
  toggle ? PASS('toggle button present') : FAIL('toggle missing');
  await toggle.click();
  await page.waitForTimeout(400);
  const ringHidden = await page.$eval('.c3d-360', el => el.hasAttribute('hidden'));
  !ringHidden ? PASS('ring visible after toggle') : FAIL('ring still hidden');

  // 3. arrow click advances
  const before = await page.$eval('carousel-3d', el => el.spinIdx);
  await page.click('.c3d-arrow-r');
  await page.waitForTimeout(250);
  const after = await page.$eval('carousel-3d', el => el.spinIdx);
  after === before + 1 ? PASS(`arrow advances spinIdx (${before} → ${after})`) : FAIL(`arrow no-op (${before} → ${after})`);

  // 4. slot click jumps
  const target = (after + 2) % 4;
  await page.click(`.c3d-slot[data-slot="${target}"]`);
  await page.waitForTimeout(250);
  const finalIdx = await page.$eval('carousel-3d', el => el.spinIdx);
  finalIdx === target ? PASS(`slot click jumps to idx ${target}`) : FAIL(`slot click target=${target} actual=${finalIdx}`);

  await browser.close();
  console.log('\nExit code: ' + (process.exitCode || 0));
})();
