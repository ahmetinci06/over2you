// G6-PR2 verification — mode-aware magnify + G4 lens preserve.
// Scenarios:
//   1. Flat mode hover → lens visible + background-image set
//   2. Color swatch click → stage rebuilt → hover → lens STILL visible
//      (G4 regression: previously innerHTML rebuild deleted lens DOM)
//   3. 360 mode toggle → hover center slot → lens visible
//   4. 360 mode arrow → idx change → lens background updates
//   5. 360 mode side slot hover → lens hidden (out of active img bounds)
// Run with astro preview on :4321.
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:4321';
const PASS = (m) => console.log('  ✓ ' + m);
const FAIL = (m) => { console.log('  ✗ ' + m); process.exitCode = 1; };

const mockBDG = {
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
  colors: [
    { id:'tan',   name:'TAN',   hex:'#c4a47a', default:true },
    { id:'black', name:'BLACK', hex:'#000000', default:false }
  ]
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
  });
  const page = await ctx.newPage();
  await page.route('**/data/products.json', r => r.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify([mockBDG])
  }));

  await page.goto(`${BASE}/product?id=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.c3d-flat img', { timeout: 8000 });
  await page.waitForTimeout(500);

  async function lensState() {
    return await page.$eval('.magnify-lens', el => ({
      hidden: el.hasAttribute('hidden'),
      bg: el.style.backgroundImage,
    }));
  }
  async function moveToCenterOf(selector) {
    const box = await page.$eval(selector, el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.move(box.x, box.y);
    await page.waitForTimeout(200);
  }
  async function moveAwayFromStage() {
    await page.mouse.move(10, 10);
    await page.waitForTimeout(150);
  }

  // 1. Flat hover
  console.log('Scenario 1: Flat hover → lens visible');
  await moveToCenterOf('.c3d-flat img');
  let s = await lensState();
  !s.hidden ? PASS('lens visible after flat hover') : FAIL('lens hidden in flat');
  s.bg && s.bg.includes('bdg-jacket-front.png') ? PASS('lens bg = front frame') : FAIL(`bg=${s.bg}`);

  // 2. Color swatch click → G4 fix
  console.log('Scenario 2: Swatch click → stage rebuild → hover still triggers lens');
  await moveAwayFromStage();
  await page.click('.pdp-color-swatch[data-color-id="black"]');
  await page.waitForTimeout(400);
  // Lens DOM must still exist post-rebuild
  const lensCount = await page.$$eval('.magnify-lens', els => els.length);
  lensCount === 1 ? PASS('lens DOM preserved through rebuild') : FAIL(`lens count=${lensCount}`);
  await moveToCenterOf('.c3d-flat img');
  s = await lensState();
  !s.hidden ? PASS('lens visible after rebuild + hover (G4 fix)') : FAIL('G4 regression: lens hidden post-rebuild');

  // 3. 360 mode toggle → center slot magnify
  console.log('Scenario 3: 360 toggle → center slot hover → lens visible');
  await moveAwayFromStage();
  // Switch back to tan (has own images360 fallback path)
  await page.click('.pdp-color-swatch[data-color-id="tan"]');
  await page.waitForTimeout(400);
  await page.click('.c3d-toggle');
  await page.waitForTimeout(500);
  const ringHidden = await page.$eval('.c3d-360', el => el.hasAttribute('hidden'));
  !ringHidden ? PASS('ring visible after toggle') : FAIL('ring still hidden');
  await moveToCenterOf('.c3d-slot.c3d-slot-active img');
  s = await lensState();
  !s.hidden ? PASS('lens visible on 360 center slot hover') : FAIL('lens hidden in 360 mode');

  // 4. Arrow → idx change → bg updates
  console.log('Scenario 4: Arrow key → idx change → lens bg refreshes');
  const before = s.bg;
  await page.click('.c3d-arrow-r');
  await page.waitForTimeout(300);
  // Move cursor again (idx-change listener also fires, but mousemove confirms)
  await moveToCenterOf('.c3d-slot.c3d-slot-active img');
  s = await lensState();
  s.bg !== before ? PASS(`lens bg updated after arrow (${before.slice(-20)} → ${s.bg.slice(-20)})`) : FAIL('lens bg stale after arrow');

  // 5. Side slot hover → lens hidden
  console.log('Scenario 5: Side slot hover → lens hidden (out of active bounds)');
  await moveAwayFromStage();
  const sideSlots = await page.$$('.c3d-slot:not(.c3d-slot-active)');
  if (sideSlots.length === 0) {
    FAIL('no side slots found');
  } else {
    // Move to side slot — cursor should be in the side slot's img rect but
    // NOT in the active slot's rect, so magnify hides on bounds-check fail.
    const sideBox = await sideSlots[0].evaluate(el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.move(sideBox.x, sideBox.y);
    await page.waitForTimeout(250);
    s = await lensState();
    s.hidden ? PASS('lens hidden on side slot hover') : FAIL('lens visible on side slot');
  }

  await browser.close();
  console.log('\nExit code: ' + (process.exitCode || 0));
})();
