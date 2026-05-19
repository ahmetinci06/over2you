// G3 phase 1 — mobile lightbox + pinch evidence.
// No fix yet — this proves what already works and what doesn't, so the
// follow-up turn picks B-path (UX hint) or fix-path (click handler).
//
// Viewport: iPhone 13 (390×844), hasTouch + isMobile = true.
// Scenarios:
//   1. .c3d-flat img tap → does #pdpLightbox become visible?
//   2. Lightbox image src matches the tapped frame
//   3. Pinch simulation via TouchEvent dispatch → does pinchScale update +
//      img.style.transform reflect scale(N)?
//   4. Close button tap → lightbox hidden again
const { chromium, devices } = require('playwright');
const BASE = 'http://127.0.0.1:4321';
const PASS = (m) => console.log('  ✓ ' + m);
const FAIL = (m) => { console.log('  ✗ ' + m); process.exitCode = 1; };
const INFO = (m) => console.log('  · ' + m);

const mockBDG = {
  id: 1, name: 'BDG', price: 120, category: 'jackets',
  sizes: ['S','M','L','XL'], stock: 'in-stock', stockQty: null, outOfStock: false,
  color: '#c4a47a', colorName: 'Tan', colorFamily: 'brown', description: 'mock',
  images: ['products/bdg-jacket-front.png','products/bdg-jacket-back.png'],
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
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await ctx.newPage();
  await page.route('**/data/products.json', r => r.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify([mockBDG])
  }));
  await page.goto(`${BASE}/product?id=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.c3d-flat img', { timeout: 8000 });
  await page.waitForTimeout(500);

  // 1. Mobile viewport state assertions
  console.log('Scenario 1: mobile viewport assertions');
  const viewportInfo = await page.evaluate(() => ({
    width: window.innerWidth,
    matchMobile: window.matchMedia('(max-width: 768px)').matches,
    matchHoverNone: window.matchMedia('(hover: none)').matches,
    hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  }));
  INFO('viewport: ' + JSON.stringify(viewportInfo));
  viewportInfo.matchMobile ? PASS('matchMedia(max-width:768px) true') : FAIL('not mobile');

  // 2. Lightbox initial state
  let lbHidden = await page.$eval('#pdpLightbox', el => el.hasAttribute('hidden'));
  lbHidden ? PASS('lightbox hidden at start') : FAIL('lightbox visible before tap');

  // 3. Get flat img position then tap
  console.log('Scenario 2: tap .c3d-flat img → lightbox state');
  const imgBox = await page.$eval('.c3d-flat img', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2, w: r.width, h: r.height, src: el.getAttribute('src') };
  });
  INFO('flat img center: (' + imgBox.x.toFixed(0) + ',' + imgBox.y.toFixed(0) + ') size ' + imgBox.w.toFixed(0) + '×' + imgBox.h.toFixed(0));
  INFO('flat img src: ' + imgBox.src);

  // Diagnostic: which element is at the tap point?
  const targetAtPoint = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    return el ? { tag: el.tagName, cls: el.className, id: el.id } : null;
  }, imgBox);
  INFO('elementFromPoint at flat img center: ' + JSON.stringify(targetAtPoint));

  // Use touchscreen tap to simulate a real mobile finger tap
  await page.touchscreen.tap(imgBox.x, imgBox.y);
  await page.waitForTimeout(500);
  lbHidden = await page.$eval('#pdpLightbox', el => el.hasAttribute('hidden'));
  const lbInfo = await page.evaluate(() => {
    const lb = document.getElementById('pdpLightbox');
    const img = lb.querySelector('.lightbox-img');
    return {
      hidden: lb.hasAttribute('hidden'),
      display: getComputedStyle(lb).display,
      opacity: getComputedStyle(lb).opacity,
      imgSrc: img ? img.getAttribute('src') : null,
      bodyOverflow: document.body.style.overflow,
    };
  });
  INFO('after tap: ' + JSON.stringify(lbInfo));
  !lbHidden ? PASS('lightbox opened on tap') : FAIL('lightbox STILL HIDDEN after tap — click handler not firing on mobile');

  // If lightbox is open, src should match flat img
  if (!lbHidden) {
    lbInfo.imgSrc && lbInfo.imgSrc.includes('bdg-jacket-front') ? PASS('lightbox-img src matches front frame') : FAIL('lightbox-img src=' + lbInfo.imgSrc);
  }

  // 4. Pinch via dispatched TouchEvent (only if lightbox is open)
  if (!lbHidden) {
    console.log('Scenario 3: pinch simulation on lightbox img');
    const pinchResult = await page.evaluate(() => {
      const img = document.querySelector('.lightbox-img');
      if (!img) return { error: 'no lightbox img' };
      const r = img.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      function mkTouch(x, y, id) {
        return new Touch({ identifier: id, target: img, clientX: x, clientY: y, pageX: x, pageY: y });
      }
      try {
        const t1Start = mkTouch(cx - 30, cy, 0);
        const t2Start = mkTouch(cx + 30, cy, 1);
        img.dispatchEvent(new TouchEvent('touchstart', {
          touches: [t1Start, t2Start],
          targetTouches: [t1Start, t2Start],
          changedTouches: [t1Start, t2Start],
          bubbles: true, cancelable: true,
        }));
        const t1Move = mkTouch(cx - 90, cy, 0);
        const t2Move = mkTouch(cx + 90, cy, 1);
        img.dispatchEvent(new TouchEvent('touchmove', {
          touches: [t1Move, t2Move],
          targetTouches: [t1Move, t2Move],
          changedTouches: [t1Move, t2Move],
          bubbles: true, cancelable: true,
        }));
        return { transform: img.style.transform, ok: true };
      } catch (e) {
        return { error: e.message };
      }
    });
    INFO('pinch result: ' + JSON.stringify(pinchResult));
    if (pinchResult.error) {
      FAIL('TouchEvent dispatch failed: ' + pinchResult.error);
    } else if (pinchResult.transform && /scale\([23]/.test(pinchResult.transform)) {
      PASS('pinch updated transform: ' + pinchResult.transform);
    } else {
      FAIL('pinch did not scale; transform=' + (pinchResult.transform || 'empty'));
    }

    // 5. Close
    console.log('Scenario 4: close button tap');
    await page.touchscreen.tap(20, 30); // approximate close button location
    await page.waitForTimeout(200);
    const closeBox = await page.$eval('.lightbox-close', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width/2, y: r.top + r.height/2 };
    });
    INFO('close button center: (' + closeBox.x.toFixed(0) + ',' + closeBox.y.toFixed(0) + ')');
    await page.touchscreen.tap(closeBox.x, closeBox.y);
    await page.waitForTimeout(300);
    const lbHiddenAfterClose = await page.$eval('#pdpLightbox', el => el.hasAttribute('hidden'));
    lbHiddenAfterClose ? PASS('lightbox closed on × tap') : FAIL('lightbox still open after close tap');
  }

  await browser.close();
  console.log('\nExit code: ' + (process.exitCode || 0));
})();
