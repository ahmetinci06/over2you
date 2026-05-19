// G6-PR3 verification — partial 2-6 frame + dual-mode (rotation/showcase).
// Mocks 4 product variants and asserts:
//   1. 2-frame rotation: 360 toggle visible, ring rotates
//   2. 4-frame rotation (BDG-like legacy): regression intact
//   3. 6-frame rotation: ring rotates with 6 slots
//   4. 4-slot showcase: toggle HIDDEN, thumb rail concats images + frames
// Run with astro preview on :4321.
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:4321';
const PASS = (m) => console.log('  ✓ ' + m);
const FAIL = (m) => { console.log('  ✗ ' + m); process.exitCode = 1; };

function frames(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: 'frame-' + i,
    src: 'products/bdg-jacket-' + (i % 2 ? 'side' : 'front') + '.png',
    label: '',
    deg: (i * 360 / n) + '°',
    flip: false
  }));
}
function mockProduct(id, opts) {
  return {
    id, name: opts.name || 'Mock', price: 100, category: 'jackets',
    sizes: ['S','M','L'], stock: 'in-stock', stockQty: null, outOfStock: false,
    color: '#888', colorName: 'Mock', colorFamily: 'dark', description: 'mock',
    images: opts.images || ['products/bdg-jacket-front.png', 'products/bdg-jacket-back.png'],
    images360: opts.frames || [],
    images360Mode: opts.mode || undefined,
    colors: []
  };
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  async function loadWith(mockList, id) {
    await page.route('**/data/products.json', r => r.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify(mockList)
    }));
    await page.goto(`${BASE}/product?id=${id}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('carousel-3d', { timeout: 8000 });
    await page.waitForTimeout(400);
  }

  async function toggleVisible() {
    const t = await page.$('.c3d-toggle');
    if (!t) return false;
    return await t.isVisible();
  }
  async function ringFramesCount() {
    return await page.$$eval('.c3d-slot', els => els.length);
  }
  async function thumbCount() {
    return await page.$$eval('.pd-thumb', els => els.length);
  }

  // 1. 2-frame rotation
  console.log('Scenario 1: 2-frame rotation — toggle visible, ring 2 slots');
  await loadWith([mockProduct(1, { frames: frames(2) })], 1);
  (await toggleVisible()) ? PASS('toggle visible') : FAIL('toggle missing');
  await page.click('.c3d-toggle'); await page.waitForTimeout(400);
  const r1 = await ringFramesCount();
  r1 === 2 ? PASS(`ring has 2 slots`) : FAIL(`ring has ${r1} slots`);

  // 2. 4-frame rotation (legacy BDG)
  console.log('Scenario 2: 4-frame rotation — regression');
  await loadWith([mockProduct(1, { frames: frames(4) })], 1);
  (await toggleVisible()) ? PASS('toggle visible') : FAIL('toggle missing');
  await page.click('.c3d-toggle'); await page.waitForTimeout(400);
  const r2 = await ringFramesCount();
  r2 === 4 ? PASS(`ring has 4 slots`) : FAIL(`ring has ${r2} slots`);
  // Arrow advances idx
  const before = await page.$eval('carousel-3d', el => el.spinIdx);
  await page.click('.c3d-arrow-r'); await page.waitForTimeout(250);
  const after = await page.$eval('carousel-3d', el => el.spinIdx);
  after === before + 1 ? PASS(`arrow advances (${before} → ${after})`) : FAIL(`arrow stuck`);

  // 3. 6-frame rotation
  console.log('Scenario 3: 6-frame rotation');
  await loadWith([mockProduct(1, { frames: frames(6) })], 1);
  await page.click('.c3d-toggle'); await page.waitForTimeout(400);
  const r3 = await ringFramesCount();
  r3 === 6 ? PASS(`ring has 6 slots`) : FAIL(`ring has ${r3} slots`);

  // 4. Showcase mode — toggle hidden, thumb rail concat
  console.log('Scenario 4: 4-slot showcase — toggle HIDDEN, thumb rail concat');
  await loadWith([mockProduct(1, {
    images: ['products/bdg-jacket-front.png', 'products/bdg-jacket-back.png'],
    frames: [
      { id:'frame-0', src:'products/bdg-jacket-side.png', label:'Erkek Yan', flip:false },
      { id:'frame-1', src:'products/bdg-jacket-left.png', label:'Erkek Sol', flip:false }
    ],
    mode: 'showcase'
  })], 1);
  const showcaseToggleVis = await toggleVisible();
  !showcaseToggleVis ? PASS('toggle hidden in showcase') : FAIL('toggle still visible in showcase');
  const tc = await thumbCount();
  tc === 4 ? PASS(`thumb rail concat: 4 thumbs (2 images + 2 frames)`) : FAIL(`thumb rail has ${tc} thumbs (expected 4)`);

  // Click 3rd thumb (first frame from images360) — should switch flat to it
  const thumbs = await page.$$('.pd-thumb');
  if (thumbs[2]) {
    await thumbs[2].click(); await page.waitForTimeout(300);
    const flatSrc = await page.$eval('.c3d-flat img', el => el.getAttribute('src'));
    flatSrc.includes('side.png') ? PASS('thumb[2] click → flat shows showcase frame 1') : FAIL(`thumb[2] flat src=${flatSrc}`);
  } else {
    FAIL('thumb[2] not found in showcase');
  }

  await browser.close();
  console.log('\nExit code: ' + (process.exitCode || 0));
})();
