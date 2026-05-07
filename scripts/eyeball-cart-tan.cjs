const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('https://over2you.shop/product?id=1&cb=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForSelector('.pdp-color-swatch', { timeout: 8000 });
  // TAN is default, no explicit click needed
  await page.click('.size-btn[data-size="M"]');
  await page.waitForTimeout(150);
  await page.click('#addToCartBtn');
  await page.waitForTimeout(400);
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('over2you_cart') || '[]'));
  console.log('TAN+M:', cart[0] && {
    key: cart[0].key,
    color: cart[0].selectedColorName,
    hex: cart[0].selectedColorHex,
    size: cart[0].selectedSize,
  });
  await page.evaluate(() => localStorage.removeItem('over2you_cart'));
  await browser.close();
})();
