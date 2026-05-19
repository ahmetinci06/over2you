// G3-A — mobile PDP scroll routing.
// Asserts that touch-action: pan-y on .c3d-stage / .c3d-flat lets the page
// scroll on vertical swipes while horizontal swipes change carousel idx.
// Diagonal swipe → still treated as horizontal (widget owns, page stays).
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:4321';
const PASS = (m) => console.log('  ✓ ' + m);
const FAIL = (m) => { console.log('  ✗ ' + m); process.exitCode = 1; };
const INFO = (m) => console.log('  · ' + m);

const mockBDG = {
  id: 1, name: 'BDG', price: 120, category: 'jackets',
  sizes: ['S','M','L','XL'], stock: 'in-stock', stockQty: null, outOfStock: false,
  color: '#c4a47a', colorName: 'Tan', colorFamily: 'brown', description: 'mock',
  images: ['products/bdg-jacket-front.png','products/bdg-jacket-back.png','products/bdg-jacket-side.png'],
  images360: [],
  colors: []
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  await page.route('**/data/products.json', r => r.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify([mockBDG])
  }));
  await page.goto(`${BASE}/product?id=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.c3d-flat img', { timeout: 8000 });
  await page.waitForTimeout(400);

  // CSS touch-action assertion
  console.log('Scenario 1: touch-action on stage');
  const ta = await page.$eval('.c3d-stage', el => getComputedStyle(el).touchAction);
  INFO('computed touch-action: ' + ta);
  ta === 'pan-y' ? PASS('.c3d-stage touch-action: pan-y') : FAIL(`got ${ta}`);
  const taFlat = await page.$eval('.c3d-flat', el => getComputedStyle(el).touchAction);
  taFlat === 'pan-y' ? PASS('.c3d-flat touch-action: pan-y') : FAIL(`got ${taFlat}`);

  // Lightbox touch-action: none
  const taLb = await page.$eval('.pdp-lightbox', el => getComputedStyle(el).touchAction);
  taLb === 'none' ? PASS('.pdp-lightbox touch-action: none') : FAIL(`got ${taLb}`);
  const taLbImg = await page.$eval('.pdp-lightbox .lightbox-img', el => getComputedStyle(el).touchAction);
  taLbImg === 'none' ? PASS('.lightbox-img touch-action: none') : FAIL(`got ${taLbImg}`);

  // Horizontal swipe on flat image → flatIdx advances
  console.log('Scenario 2: horizontal swipe → carousel advances');
  const beforeIdx = await page.$eval('carousel-3d', el => el.flatIdx);
  const flatBox = await page.$eval('.c3d-flat img', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2 };
  });
  await page.evaluate((b) => {
    const flat = document.querySelector('.c3d-flat');
    function t(x, y, id) { return new Touch({ identifier: id, target: flat, clientX: x, clientY: y, pageX: x, pageY: y }); }
    function fire(type, list) {
      flat.dispatchEvent(new TouchEvent(type, { touches: list, targetTouches: list, changedTouches: list, bubbles: true, cancelable: true }));
    }
    // Strong left swipe — 200px horizontal, 5px vertical (diagonal-ish drift)
    fire('touchstart', [t(b.x + 100, b.y, 0)]);
    fire('touchmove',  [t(b.x + 50, b.y + 5, 0)]);
    fire('touchmove',  [t(b.x - 50, b.y + 5, 0)]);
    fire('touchmove',  [t(b.x - 100, b.y + 5, 0)]);
    fire('touchend',   []);
  }, flatBox);
  await page.waitForTimeout(300);
  const afterIdx = await page.$eval('carousel-3d', el => el.flatIdx);
  afterIdx > beforeIdx ? PASS(`horizontal swipe advanced idx (${beforeIdx} → ${afterIdx})`) : FAIL(`idx ${beforeIdx} → ${afterIdx}`);

  // Vertical swipe → page would scroll natively (touch-action: pan-y).
  // We simulate by reading window.scrollY before/after a deliberate window.scrollTo.
  // Since synthetic TouchEvent doesn't trigger native scroll in chromium, the
  // assertion here is structural: touch-action allows pan-y, vertical scroll
  // path is not blocked by JS handler.
  console.log('Scenario 3: vertical swipe — handler does not preventDefault');
  const preventedCount = await page.evaluate(() => {
    const flat = document.querySelector('.c3d-flat');
    let prevented = 0;
    function t(x, y, id) { return new Touch({ identifier: id, target: flat, clientX: x, clientY: y, pageX: x, pageY: y }); }
    function fire(type, list) {
      const ev = new TouchEvent(type, { touches: list, targetTouches: list, changedTouches: list, bubbles: true, cancelable: true });
      flat.dispatchEvent(ev);
      if (ev.defaultPrevented) prevented++;
    }
    const r = flat.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    // Pure vertical swipe
    fire('touchstart', [t(cx, cy, 0)]);
    fire('touchmove',  [t(cx + 1, cy + 30, 0)]);
    fire('touchmove',  [t(cx + 1, cy + 60, 0)]);
    fire('touchmove',  [t(cx + 1, cy + 100, 0)]);
    fire('touchend',   []);
    return prevented;
  });
  INFO(`preventDefault count on vertical swipe: ${preventedCount}`);
  preventedCount === 0 ? PASS('vertical swipe: handler never preventDefault\'d (browser owns scroll)') : FAIL(`handler called preventDefault ${preventedCount} times on vertical`);

  await browser.close();
  console.log('\nExit code: ' + (process.exitCode || 0));
})();
