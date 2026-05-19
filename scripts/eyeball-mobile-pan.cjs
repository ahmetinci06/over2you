// G3 phase 2 — mobile lightbox pinch + 1-finger pan + scroll lock.
// Verifies the new behavior the PR introduces:
//   1. Pinch to scale(3), then 1-finger drag → transform carries translate()
//      with the user's delta (clamped to overflow bounds).
//   2. While pinched + panning, body scroll stays at 0 (touch-action:none +
//      overscroll-behavior:contain stop pull-to-refresh / page jiggle).
//   3. 360 mode → center slot tap → lightbox opens with spin frames.
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
  images360: [
    { id:'frame-0', src:'products/bdg-jacket-front.png', label:'', deg:'0°',   flip:false },
    { id:'frame-1', src:'products/bdg-jacket-side.png',  label:'', deg:'90°',  flip:false },
    { id:'frame-2', src:'products/bdg-jacket-back.png',  label:'', deg:'180°', flip:false },
    { id:'frame-3', src:'products/bdg-jacket-left.png',  label:'', deg:'270°', flip:false }
  ],
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

  // 1. Tap to open lightbox
  console.log('Scenario 1: tap → lightbox open + transform initial');
  const flatBox = await page.$eval('.c3d-flat img', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2 };
  });
  await page.touchscreen.tap(flatBox.x, flatBox.y);
  await page.waitForTimeout(400);
  const lbState = await page.$eval('#pdpLightbox', el => ({ hidden: el.hasAttribute('hidden'), display: getComputedStyle(el).display }));
  INFO('lightbox: ' + JSON.stringify(lbState));
  !lbState.hidden ? PASS('lightbox opened') : FAIL('lightbox not opened');

  // 2. Pinch to ~3x via TouchEvent dispatch, then 1-finger drag
  console.log('Scenario 2: pinch 3x + 1-finger pan');
  const panResult = await page.evaluate(() => {
    const img = document.querySelector('.lightbox-img');
    if (!img) return { error: 'no img' };
    const r = img.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    function touch(x, y, id) {
      return new Touch({ identifier: id, target: img, clientX: x, clientY: y, pageX: x, pageY: y });
    }
    function dispatch(type, list) {
      img.dispatchEvent(new TouchEvent(type, { touches: list, targetTouches: list, changedTouches: list, bubbles: true, cancelable: true }));
    }
    try {
      // Pinch: start 30px spread → end 90px spread → ratio 3x
      dispatch('touchstart', [touch(cx - 30, cy, 0), touch(cx + 30, cy, 1)]);
      dispatch('touchmove',  [touch(cx - 90, cy, 0), touch(cx + 90, cy, 1)]);
      dispatch('touchend',   []);
      const afterPinch = img.style.transform;
      // Single-finger pan: start at cx,cy → drag +120,+60
      dispatch('touchstart', [touch(cx, cy, 0)]);
      dispatch('touchmove',  [touch(cx + 120, cy + 60, 0)]);
      dispatch('touchend',   []);
      const afterPan = img.style.transform;
      return { afterPinch, afterPan, baseW: img.offsetWidth, baseH: img.offsetHeight, ok: true };
    } catch (e) {
      return { error: e.message };
    }
  });
  INFO('pinch transform: ' + (panResult.afterPinch || '(none)'));
  INFO('pan transform:   ' + (panResult.afterPan || '(none)'));
  INFO('base size: ' + panResult.baseW + '×' + panResult.baseH);
  if (panResult.error) {
    FAIL('TouchEvent dispatch: ' + panResult.error);
  } else {
    /scale\(3/.test(panResult.afterPinch) ? PASS('pinch produced scale(3)') : FAIL(`pinch transform=${panResult.afterPinch}`);
    const hasTranslate = /translate\(/.test(panResult.afterPan);
    hasTranslate ? PASS('pan added translate()') : FAIL(`pan transform missing translate: ${panResult.afterPan}`);
  }

  // 3. Body scroll stayed 0 (lightbox + overscroll-behavior + body.overflow)
  console.log('Scenario 3: body scroll lock during pan');
  const scrollTop = await page.evaluate(() => window.scrollY);
  scrollTop === 0 ? PASS(`window.scrollY === 0 (was ${scrollTop})`) : FAIL(`window.scrollY=${scrollTop}, body scrolled during pan`);
  const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
  bodyOverflow === 'hidden' ? PASS('body.style.overflow=hidden') : FAIL(`body overflow=${bodyOverflow}`);

  // 4. Close
  console.log('Scenario 4: close button tap → lightbox hidden');
  const closeBox = await page.$eval('.lightbox-close', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.touchscreen.tap(closeBox.x, closeBox.y);
  await page.waitForTimeout(300);
  const lbClosed = await page.$eval('#pdpLightbox', el => el.hasAttribute('hidden'));
  lbClosed ? PASS('lightbox closed') : FAIL('lightbox still open after close');

  // 5. 360 mode → center slot tap → lightbox opens with spin frames
  console.log('Scenario 5: 360 toggle → center slot tap → lightbox over spin frames');
  // Use the carousel-3d API directly — synthetic tap into a hidden close
  // button on the previous step leaves the touchscreen pointer at (0,0),
  // which makes the subsequent toggle tap flaky. setMode does the same
  // thing the toggle button click would.
  await page.evaluate(() => document.querySelector('carousel-3d').setMode('360'));
  await page.waitForTimeout(400);
  const mode = await page.$eval('carousel-3d', el => el.mode);
  mode === '360' ? PASS('360 mode active') : FAIL(`mode=${mode}`);
  // Tap the active slot center
  const slotBox = await page.$eval('.c3d-slot.c3d-slot-active img', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.touchscreen.tap(slotBox.x, slotBox.y);
  await page.waitForTimeout(400);
  const lbAfterSlotTap = await page.evaluate(() => {
    const lb = document.getElementById('pdpLightbox');
    const img = lb.querySelector('.lightbox-img');
    const counter = lb.querySelector('.lightbox-counter');
    return { hidden: lb.hasAttribute('hidden'), src: img && img.getAttribute('src'), counter: counter && counter.textContent };
  });
  INFO('after 360 slot tap: ' + JSON.stringify(lbAfterSlotTap));
  !lbAfterSlotTap.hidden ? PASS('360 slot tap → lightbox open') : FAIL('360 slot tap ignored');
  // Spin frames have 4 entries — counter should read "1 / 4" or similar
  /\/ 4$/.test(lbAfterSlotTap.counter) ? PASS(`lightbox using spin frames (counter ${lbAfterSlotTap.counter})`) : FAIL(`counter=${lbAfterSlotTap.counter}, expected ".../4"`);

  // 6. G5 lazy pan: simulate pinch (2-finger) → lift one finger mid-gesture
  //    → continue with single-finger pan. Mid-pinch finger-lift means the
  //    1-finger touchstart branch never fires; the touchmove handler must
  //    seed pan anchors on its first 1-finger event when isPanning === false.
  console.log('Scenario 6: G5 lazy pan — pinch, lift finger, single-finger drag');
  const lazyResult = await page.evaluate(() => {
    const img = document.querySelector('.lightbox-img');
    if (!img) return { error: 'no img' };
    const r = img.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    function touch(x, y, id) {
      return new Touch({ identifier: id, target: img, clientX: x, clientY: y, pageX: x, pageY: y });
    }
    function fire(type, list, changed) {
      img.dispatchEvent(new TouchEvent(type, {
        touches: list, targetTouches: list,
        changedTouches: changed || list,
        bubbles: true, cancelable: true,
      }));
    }
    try {
      // Reset to a known zoomed state via a fresh pinch
      img.style.transform = '';
      fire('touchstart', [touch(cx - 30, cy, 0), touch(cx + 30, cy, 1)]);
      fire('touchmove',  [touch(cx - 90, cy, 0), touch(cx + 90, cy, 1)]);
      // Lift finger 1 — touchend with one remaining finger (id 1 stays)
      fire('touchend', [touch(cx + 90, cy, 1)], [touch(cx - 90, cy, 0)]);
      const afterLift = img.style.transform;
      // Now drag with the remaining finger — no preceding touchstart 1-finger.
      // First touchmove seeds anchors; the second produces actual translate.
      fire('touchmove', [touch(cx + 90, cy, 1)]);
      fire('touchmove', [touch(cx + 190, cy + 60, 1)]);
      const afterDrag = img.style.transform;
      fire('touchend', [], [touch(cx + 200, cy + 80, 1)]);
      return { afterLift, afterDrag, ok: true };
    } catch (e) {
      return { error: e.message };
    }
  });
  INFO('lazy pan result: ' + JSON.stringify(lazyResult));
  if (lazyResult.error) {
    FAIL('lazy pan dispatch failed: ' + lazyResult.error);
  } else {
    /scale\(3/.test(lazyResult.afterLift) ? PASS('pinch produced scale(3) before lift') : FAIL(`pre-lift transform: ${lazyResult.afterLift}`);
    // Match a non-zero translate so the assertion can tell "lazy pan actually
    // moved" from "init fired with dx=0". Need at least one non-zero coord.
    /translate\(\s*(?!0px,\s*0px)/.test(lazyResult.afterDrag)
      ? PASS('single-finger drag after lift produced non-zero translate')
      : FAIL(`post-drag transform: ${lazyResult.afterDrag}`);
  }

  await browser.close();
  console.log('\nExit code: ' + (process.exitCode || 0));
})();
