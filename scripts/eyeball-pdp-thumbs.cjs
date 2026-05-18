// PDP thumb rail + 360 toggle eyeball — exercises the split-state carousel
// (flatFrames / spinFrames). For each product:
//   1. confirms 2-thumb rail from images[], no off-by-N
//   2. clicks thumb[1] → expects carousel.flatIdx == 1, flat src == eFlatImages[1]
//   3. opens 360, expects ring with 4 slots
//   4. closes 360, expects flat idx restored to whatever it was
// Pass list (id → expected eFlatImages):
const TARGETS = [
  { id: 1, name: 'BDG',  expectFlat: ['/img/products/bdg-jacket-front.png', '/img/products/bdg-jacket-back.png'] },
  { id: 2, name: '001',  expectFlat: ['/img/products/001-1.png',            '/img/products/001-2.png'] },
];

const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const fails = [];
  for (const { id, name, expectFlat } of TARGETS) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(`[${name}] ${m.text()}`); });
    page.on('pageerror', m => errs.push(`[${name}] pageerror: ${m.message}`));

    await page.goto(`https://over2you.shop/product?id=${id}&cb=${Date.now()}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.c3d-flat img', { timeout: 8000 });
    await page.waitForTimeout(400);

    const initial = await page.evaluate(() => {
      const c = document.querySelector('carousel-3d');
      const flatImg = document.querySelector('.c3d-flat img');
      const thumbs = [...document.querySelectorAll('.pd-thumb img')].map(i => new URL(i.src).pathname);
      return {
        thumbs,
        flatSrc: flatImg ? new URL(flatImg.src).pathname : null,
        flatIdx: c ? c.flatIdx : null,
        spinIdx: c ? c.spinIdx : null,
        mode: c ? c.mode : null,
        has360: c ? c.has360 : null,
      };
    });
    console.log(`[${name}] initial:`, JSON.stringify(initial));
    if (JSON.stringify(initial.thumbs) !== JSON.stringify(expectFlat)) {
      fails.push(`[${name}] thumbs mismatch: got ${JSON.stringify(initial.thumbs)} expected ${JSON.stringify(expectFlat)}`);
    }
    if (initial.flatSrc !== expectFlat[0]) {
      fails.push(`[${name}] initial flatSrc ${initial.flatSrc} != ${expectFlat[0]}`);
    }

    // Click thumb[1] — direct 1:1 mapping now
    await page.click('.pd-thumb[data-idx="1"]');
    await page.waitForTimeout(300);
    const afterClick = await page.evaluate(() => {
      const c = document.querySelector('carousel-3d');
      const flatImg = document.querySelector('.c3d-flat img');
      const active = document.querySelector('.pd-thumb.active');
      return {
        flatIdx: c ? c.flatIdx : null,
        flatSrc: flatImg ? new URL(flatImg.src).pathname : null,
        activeIdx: active ? active.dataset.idx : null,
      };
    });
    console.log(`[${name}] thumb[1] click:`, JSON.stringify(afterClick));
    if (afterClick.flatIdx !== 1)            fails.push(`[${name}] flatIdx ${afterClick.flatIdx} != 1`);
    if (afterClick.flatSrc !== expectFlat[1]) fails.push(`[${name}] flatSrc ${afterClick.flatSrc} != ${expectFlat[1]}`);
    if (afterClick.activeIdx !== '1')        fails.push(`[${name}] activeIdx ${afterClick.activeIdx} != "1"`);

    // 360 toggle (only if has360)
    if (initial.has360) {
      await page.click('.c3d-toggle');
      await page.waitForTimeout(500);
      const inSpin = await page.evaluate(() => {
        const c = document.querySelector('carousel-3d');
        const stage = document.querySelector('.c3d-stage');
        const slots = document.querySelectorAll('.c3d-slot');
        return { mode: c && c.mode, stageMode: stage && stage.dataset.mode, slotCount: slots.length, flatIdx: c && c.flatIdx };
      });
      console.log(`[${name}] 360 open:`, JSON.stringify(inSpin));
      if (inSpin.mode !== '360')       fails.push(`[${name}] mode ${inSpin.mode} != 360 after toggle`);
      if (inSpin.slotCount !== 4)      fails.push(`[${name}] slotCount ${inSpin.slotCount} != 4`);
      if (inSpin.flatIdx !== 1)        fails.push(`[${name}] flatIdx ${inSpin.flatIdx} lost after 360 open`);

      // Advance spin idx via arrow, then close 360 — flat idx must still be 1
      await page.click('.c3d-arrow-r');
      await page.waitForTimeout(400);
      await page.click('.c3d-toggle');  // close
      await page.waitForTimeout(400);
      const backToFlat = await page.evaluate(() => {
        const c = document.querySelector('carousel-3d');
        const flatImg = document.querySelector('.c3d-flat img');
        return {
          mode: c && c.mode,
          flatIdx: c && c.flatIdx,
          flatSrc: flatImg ? new URL(flatImg.src).pathname : null,
        };
      });
      console.log(`[${name}] 360 close:`, JSON.stringify(backToFlat));
      if (backToFlat.mode !== 'flat')           fails.push(`[${name}] mode ${backToFlat.mode} != flat after close`);
      if (backToFlat.flatIdx !== 1)             fails.push(`[${name}] flatIdx ${backToFlat.flatIdx} != 1 after close`);
      if (backToFlat.flatSrc !== expectFlat[1]) fails.push(`[${name}] flatSrc ${backToFlat.flatSrc} != ${expectFlat[1]} after close`);
    } else {
      console.log(`[${name}] no 360 toggle`);
    }

    if (errs.length) fails.push(...errs);
    await ctx.close();
  }
  await browser.close();

  if (fails.length) {
    console.log('\nFAIL:');
    fails.forEach(f => console.log('  ' + f));
    process.exitCode = 1;
  } else {
    console.log('\nPASS');
  }
})();
