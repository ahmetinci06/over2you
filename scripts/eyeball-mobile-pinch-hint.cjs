// G5 — pinch hint badge first-open behavior.
//   1. Mobile viewport, fresh localStorage → open lightbox → hint visible
//   2. Wait ≥2.5s → hint fades out (opacity 0 / hidden true)
//   3. localStorage flag set
//   4. Close + reopen → hint NOT shown
//   5. Reset flag → open → hint shown again
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:4321';
const PASS = (m) => console.log('  ✓ ' + m);
const FAIL = (m) => { console.log('  ✗ ' + m); process.exitCode = 1; };
const INFO = (m) => console.log('  · ' + m);

const mockBDG = {
  id: 1, name: 'BDG', price: 120, category: 'jackets',
  sizes: ['S','M','L','XL'], stock: 'in-stock', stockQty: null, outOfStock: false,
  color: '#c4a47a', colorName: 'Tan', colorFamily: 'brown', description: 'mock',
  images: ['products/bdg-jacket-front.png','products/bdg-jacket-back.png'],
  images360: [], colors: []
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, hasTouch: true, isMobile: true,
  });
  const page = await ctx.newPage();
  await page.route('**/data/products.json', r => r.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify([mockBDG])
  }));
  await page.goto(`${BASE}/product?id=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('o2y_pinch_hint_seen'));
  await page.waitForSelector('.c3d-flat img', { timeout: 8000 });
  await page.waitForTimeout(400);

  async function hintState() {
    return await page.$eval('.pinch-hint', el => ({
      hidden: el.hasAttribute('hidden'),
      visible: el.classList.contains('visible'),
      opacity: getComputedStyle(el).opacity,
    }));
  }
  async function lightboxOpen() {
    return !(await page.$eval('#pdpLightbox', el => el.hasAttribute('hidden')));
  }
  async function tapFlatImg() {
    const box = await page.$eval('.c3d-flat img', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.touchscreen.tap(box.x, box.y);
  }
  async function tapClose() {
    const box = await page.$eval('.lightbox-close', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.touchscreen.tap(box.x, box.y);
  }

  console.log('Scenario 1: fresh localStorage → open → hint visible');
  await tapFlatImg();
  await page.waitForTimeout(300);
  (await lightboxOpen()) ? PASS('lightbox opened') : FAIL('lightbox not opened');
  const s1 = await hintState();
  INFO('hint state: ' + JSON.stringify(s1));
  (!s1.hidden && s1.visible) ? PASS('hint visible after first open') : FAIL(`hint: ${JSON.stringify(s1)}`);

  console.log('Scenario 2: wait 2.7s → hint fades out');
  await page.waitForTimeout(2700);
  const s2 = await hintState();
  INFO('hint after timeout: ' + JSON.stringify(s2));
  !s2.visible ? PASS('hint .visible class removed') : FAIL('hint still .visible after 2.7s');

  console.log('Scenario 3: localStorage flag set');
  const flag = await page.evaluate(() => localStorage.getItem('o2y_pinch_hint_seen'));
  flag === '1' ? PASS('o2y_pinch_hint_seen === "1"') : FAIL(`flag=${flag}`);

  console.log('Scenario 4: close + reopen → hint NOT shown');
  await tapClose();
  await page.waitForTimeout(300);
  (await lightboxOpen()) === false ? PASS('lightbox closed') : FAIL('lightbox still open');
  await tapFlatImg();
  await page.waitForTimeout(300);
  const s4 = await hintState();
  INFO('hint on second open: ' + JSON.stringify(s4));
  (s4.hidden || !s4.visible) ? PASS('hint not shown on second open') : FAIL(`hint still visible: ${JSON.stringify(s4)}`);

  console.log('Scenario 5: reset flag → hint shown again');
  await tapClose();
  await page.waitForTimeout(200);
  await page.evaluate(() => localStorage.removeItem('o2y_pinch_hint_seen'));
  await tapFlatImg();
  await page.waitForTimeout(300);
  const s5 = await hintState();
  INFO('hint after flag reset: ' + JSON.stringify(s5));
  (!s5.hidden && s5.visible) ? PASS('hint shown again after flag reset') : FAIL(`hint: ${JSON.stringify(s5)}`);

  await browser.close();
  console.log('\nExit code: ' + (process.exitCode || 0));
})();
