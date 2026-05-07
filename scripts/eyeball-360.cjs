// Phase D verification — 360 mode head overflow + ghost shadow.
// Compares post-tweak (turn 23) state against the stage bounding box.

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const url = 'https://over2you.shop/product?id=1&cb=' + Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for carousel-3d to mount.
  await page.waitForSelector('carousel-3d .c3d-flat img', { timeout: 8000 });
  await page.waitForTimeout(500);

  // Toggle to 360 mode.
  await page.click('.c3d-toggle');
  await page.waitForSelector('.c3d-360:not([hidden])', { timeout: 3000 });
  await page.waitForTimeout(800); // wait for transition

  // Screenshot stage area
  const stageBox = await page.locator('.c3d-stage').first().boundingBox();
  await page.screenshot({
    path: '/tmp/360-after.png',
    clip: stageBox ? {
      x: Math.max(0, stageBox.x - 20),
      y: Math.max(0, stageBox.y - 20),
      width: Math.min(1440, stageBox.width + 40),
      height: Math.min(900, stageBox.height + 40),
    } : undefined,
  });

  // Geometric report
  const data = await page.evaluate(() => {
    const stage = document.querySelector('.c3d-stage');
    const stageRect = stage?.getBoundingClientRect();
    const slots = [...document.querySelectorAll('.c3d-slot')].map((s) => {
      const r = s.getBoundingClientRect();
      const img = s.querySelector('img');
      const ir = img ? img.getBoundingClientRect() : null;
      return {
        slotIdx: s.dataset.slot,
        active: s.classList.contains('c3d-slot-active'),
        slotTop: r.top, slotLeft: r.left, slotW: r.width, slotH: r.height,
        imgTop: ir?.top, imgLeft: ir?.left, imgW: ir?.width, imgH: ir?.height,
        opacity: getComputedStyle(s).opacity,
        transform: s.style.transform,
      };
    });
    const floor = document.querySelector('.c3d-floor');
    const floorBg = floor ? getComputedStyle(floor).background : null;
    const stageBg = stage ? getComputedStyle(stage).background : null;
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
      stage: stageRect,
      slots: slots.filter(s => parseFloat(s.opacity) > 0.05),
      floorBg,
      stageBg,
    };
  });

  console.log(JSON.stringify(data, null, 2));

  // Headroom check on the active center slot.
  const center = data.slots.find(s => s.active);
  if (center && data.stage) {
    const headroom = center.imgTop - data.stage.top;
    const overflow = headroom < 0;
    const headroomPct = (headroom / data.stage.height * 100).toFixed(1);
    console.log('\n=== HEADROOM ===');
    console.log(`stage.top: ${data.stage.top.toFixed(1)} | center.img.top: ${center.imgTop?.toFixed(1)}`);
    console.log(`headroom: ${headroom.toFixed(1)}px (${headroomPct}% of stage height)`);
    console.log(overflow ? 'OVERFLOW (head clips above stage)' : (headroom < 12 ? 'TIGHT (<12px clearance)' : 'OK'));
  }

  await browser.close();
})();
