// PDP color-swatch eyeball — verifies cross-color contamination guard +
// stale-stage fix (G1):
//   1. TAN (default) — stage shows base.images[0], 360 toggle present
//      because TAN is default and falls back to baseFrames360.
//   2. Click BLACK (non-default, no own images360) — flat falls back to
//      base.images, but 360 toggle DISAPPEARS (color-accurate: no leak).
//   3. Click TAN again — toggle returns; flat stage rebuilt cleanly
//      (the stale-stage bug from before G1 would skip the rebuild).
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const fails = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', m => errs.push('pageerror: ' + m.message));

  await page.goto(`https://over2you.shop/product?id=1&cb=${Date.now()}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.c3d-flat img', { timeout: 8000 });
  await page.waitForTimeout(400);

  const tanInitial = await page.evaluate(() => {
    const flatImg = document.querySelector('.c3d-flat img');
    const has360 = !!document.querySelector('.c3d-toggle');
    const swatches = [...document.querySelectorAll('.pdp-color-swatch')].map(s => ({ id: s.dataset.colorId, active: s.classList.contains('active') }));
    return { flat: flatImg ? new URL(flatImg.src).pathname : null, has360, swatches };
  });
  console.log('TAN initial:', JSON.stringify(tanInitial));
  if (!tanInitial.has360)                                       fails.push('TAN initial: 360 toggle missing');
  if (tanInitial.flat !== '/img/products/bdg-jacket-front.png') fails.push('TAN initial: flat wrong');
  if (!tanInitial.swatches.find(s => s.id === 'tan')?.active)   fails.push('TAN initial: not active');

  // BLACK — non-default, no own images/360
  await page.click('.pdp-color-swatch[data-color-id="black"]');
  await page.waitForTimeout(400);
  const black = await page.evaluate(() => {
    const flatImg = document.querySelector('.c3d-flat img');
    const has360 = !!document.querySelector('.c3d-toggle');
    return { flat: flatImg ? new URL(flatImg.src).pathname : null, has360 };
  });
  console.log('BLACK click:', JSON.stringify(black));
  if (black.has360)                                          fails.push('BLACK: 360 toggle should be hidden (color-accurate)');
  if (black.flat !== '/img/products/bdg-jacket-front.png')   fails.push('BLACK: flat should fall back to base.images[0]');

  // Back to TAN — stage should refresh, 360 toggle returns
  await page.click('.pdp-color-swatch[data-color-id="tan"]');
  await page.waitForTimeout(400);
  const tanAgain = await page.evaluate(() => {
    const flatImg = document.querySelector('.c3d-flat img');
    const has360 = !!document.querySelector('.c3d-toggle');
    return { flat: flatImg ? new URL(flatImg.src).pathname : null, has360 };
  });
  console.log('TAN restored:', JSON.stringify(tanAgain));
  if (!tanAgain.has360)                                       fails.push('TAN restored: 360 toggle missing (stale-stage bug?)');
  if (tanAgain.flat !== '/img/products/bdg-jacket-front.png') fails.push('TAN restored: flat wrong');

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
