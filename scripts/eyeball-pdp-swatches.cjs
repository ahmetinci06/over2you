// PDP color-swatch eyeball — verifies cross-color contamination guard +
// stale-stage fix (G1):
//   1. TAN (default) — stage shows base.images[0], 360 toggle present
//      because TAN is default and falls back to baseFrames360.
//   2. Click BLACK (non-default, no own images360) — flat falls back to
//      base.images, but 360 toggle DISAPPEARS (color-accurate: no leak).
//   3. Click TAN again — toggle returns; flat stage rebuilt cleanly
//      (the stale-stage bug from before G1 would skip the rebuild).
const { chromium } = require('playwright');
const { getFirstLiveProduct, skipIfNoFixture, loadProducts } = require('./eyeball-helpers.cjs');

// This test verifies the G1 cross-color contamination guard: clicking a
// non-default color whose variant has no own images360 should hide the 360
// toggle but keep the flat image falling back to base.images[0]. Needs a
// product with at least 2 colors, where the default has own images360 and
// at least one alternate does NOT. BDG (id=1) was the fixture; until a
// replacement product with this shape exists, this script skips.
const FIX = getFirstLiveProduct({ minColors: 2, require360: true });
skipIfNoFixture(FIX, 'eyeball-pdp-swatches.cjs');

const product = (loadProducts() || []).find(p => p.id === FIX.id);
const defaultColor = (product.colors || []).find(c => c.default) || (product.colors || [])[0];
const altColor = (product.colors || []).find(c => c.id !== defaultColor?.id && !c.images360);
if (!defaultColor || !altColor) {
  console.log(`SKIP — fixture ${product.name} lacks default+alt color with mixed images360 shape`);
  process.exit(0);
}
const baseFlatPath = '/img/' + (product.images || [])[0];

(async () => {
  const browser = await chromium.launch();
  const fails = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', m => errs.push('pageerror: ' + m.message));

  await page.goto(`https://over2you.shop/product?id=${FIX.id}&cb=${Date.now()}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.c3d-flat img', { timeout: 8000 });
  await page.waitForTimeout(400);

  const tanInitial = await page.evaluate(() => {
    const flatImg = document.querySelector('.c3d-flat img');
    const has360 = !!document.querySelector('.c3d-toggle');
    const swatches = [...document.querySelectorAll('.pdp-color-swatch')].map(s => ({ id: s.dataset.colorId, active: s.classList.contains('active') }));
    return { flat: flatImg ? new URL(flatImg.src).pathname : null, has360, swatches };
  });
  console.log(`${defaultColor.id} initial:`, JSON.stringify(tanInitial));
  if (!tanInitial.has360)                                     fails.push(`${defaultColor.id} initial: 360 toggle missing`);
  if (tanInitial.flat !== baseFlatPath)                       fails.push(`${defaultColor.id} initial: flat wrong (expected ${baseFlatPath})`);
  if (!tanInitial.swatches.find(s => s.id === defaultColor.id)?.active) fails.push(`${defaultColor.id} initial: not active`);

  // alt color — non-default, no own images/360
  await page.click(`.pdp-color-swatch[data-color-id="${altColor.id}"]`);
  await page.waitForTimeout(400);
  const black = await page.evaluate(() => {
    const flatImg = document.querySelector('.c3d-flat img');
    const has360 = !!document.querySelector('.c3d-toggle');
    return { flat: flatImg ? new URL(flatImg.src).pathname : null, has360 };
  });
  console.log(`${altColor.id} click:`, JSON.stringify(black));
  if (black.has360)                     fails.push(`${altColor.id}: 360 toggle should be hidden (color-accurate)`);
  if (black.flat !== baseFlatPath)      fails.push(`${altColor.id}: flat should fall back to base.images[0]`);

  // Back to default — stage should refresh, 360 toggle returns
  await page.click(`.pdp-color-swatch[data-color-id="${defaultColor.id}"]`);
  await page.waitForTimeout(400);
  const tanAgain = await page.evaluate(() => {
    const flatImg = document.querySelector('.c3d-flat img');
    const has360 = !!document.querySelector('.c3d-toggle');
    return { flat: flatImg ? new URL(flatImg.src).pathname : null, has360 };
  });
  console.log(`${defaultColor.id} restored:`, JSON.stringify(tanAgain));
  if (!tanAgain.has360)                 fails.push(`${defaultColor.id} restored: 360 toggle missing (stale-stage bug?)`);
  if (tanAgain.flat !== baseFlatPath)   fails.push(`${defaultColor.id} restored: flat wrong`);

  if (errs.length) fails.push(...errs);
  await ctx.close();
  await browser.close();

  if (fails.length) {
    console.log('\nFAIL:');
    fails.forEach(f => console.log('  ' + f));
    process.exitCode = 1;
  } else {
    console.log('\nPASS');
  }
})();
