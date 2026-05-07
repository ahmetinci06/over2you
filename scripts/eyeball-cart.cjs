// Phase 2 verification — cart color flow.
// Adds BLACK variant to cart, asserts color carries through to localStorage
// + checkout summary.

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto('https://over2you.shop/product?id=1&cb=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForSelector('.pdp-color-swatch', { timeout: 8000 });
  await page.waitForTimeout(400);

  // Click BLACK swatch (index 1, since TAN is default at idx 0)
  const blackSwatch = page.locator('.pdp-color-swatch[data-color-id="black"]');
  await blackSwatch.click();
  await page.waitForTimeout(300);

  // Pick size L
  await page.click('.size-btn[data-size="L"]');
  await page.waitForTimeout(200);

  // Add to cart
  await page.click('#addToCartBtn');
  await page.waitForTimeout(800);

  // Read cart from localStorage
  const cart = await page.evaluate(() => {
    const raw = localStorage.getItem('over2you_cart');
    return raw ? JSON.parse(raw) : null;
  });
  console.log('cart after BLACK+L add:');
  if (cart && cart[0]) {
    console.log('  key:', cart[0].key);
    console.log('  selectedSize:', cart[0].selectedSize);
    console.log('  selectedColorId:', cart[0].selectedColorId);
    console.log('  selectedColorName:', cart[0].selectedColorName);
    console.log('  selectedColorHex:', cart[0].selectedColorHex);
    console.log('  selectedImage:', cart[0].selectedImage);
    console.log('  qty:', cart[0].qty);
  } else {
    console.log('  ERROR: cart empty or invalid');
  }

  // Now navigate to checkout to verify summary render
  await page.goto('https://over2you.shop/checkout?cb=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForSelector('.summary-item', { timeout: 5000 });

  const summary = await page.evaluate(() => {
    const item = document.querySelector('.summary-item');
    if (!item) return null;
    return {
      swatchBg: item.querySelector('.summary-item-swatch')?.style.background,
      name: item.querySelector('.summary-item-name')?.textContent,
      variant: item.querySelector('.summary-item-variant')?.textContent,
      price: item.querySelector('.summary-item-price')?.textContent,
    };
  });
  console.log('\ncheckout summary:');
  console.log(JSON.stringify(summary, null, 2));

  await page.screenshot({ path: '/tmp/cart-checkout.png' });

  // Cleanup — clear cart for next runs
  await page.evaluate(() => localStorage.removeItem('over2you_cart'));

  await browser.close();
})();
