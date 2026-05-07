const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const { w, h, label } of [{ w: 1920, h: 1080, label: '1920' }, { w: 375, h: 667, label: '375' }]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto('https://over2you.shop/product?id=1&cb=' + Date.now(), { waitUntil: 'networkidle' });
    await page.waitForSelector('.c3d-flat img', { timeout: 8000 });
    await page.waitForTimeout(400);
    // flat mode screenshot
    await page.screenshot({ path: `/tmp/flat-${label}.png` });
    // 360 mode (only on desktop, mobile may have different layout)
    try {
      await page.click('.c3d-toggle', { timeout: 2000 });
      await page.waitForTimeout(700);
      await page.screenshot({ path: `/tmp/360-${label}.png` });
      const data = await page.evaluate(() => {
        const stage = document.querySelector('.c3d-stage')?.getBoundingClientRect();
        const center = [...document.querySelectorAll('.c3d-slot')].find(s => s.classList.contains('c3d-slot-active'));
        const cr = center?.querySelector('img')?.getBoundingClientRect();
        return { stageTop: stage?.top, stageH: stage?.height, imgTop: cr?.top, imgH: cr?.height, headroom: cr && stage ? (cr.top - stage.top) : null };
      });
      console.log(`${label}: ${JSON.stringify(data)}`);
    } catch (e) { console.log(`${label}: 360 toggle failed (${e.message.slice(0,40)})`); }
    await ctx.close();
  }
  await browser.close();
})();
