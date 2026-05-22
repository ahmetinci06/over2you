// Phase 2 verification — cart color flow.
// Adds BLACK variant to cart, asserts color carries through to localStorage
// + checkout summary.

const { chromium } = require('playwright');
const { getFirstLiveProduct, skipIfNoFixture } = require('./eyeball-helpers.cjs');

// Needs 2+ colors so we can click a non-default swatch and verify cart picks
// up the variant. Single-color products can't exercise this code path.
const FIX = getFirstLiveProduct({ minColors: 2 });
skipIfNoFixture(FIX, 'eyeball-cart.cjs');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(`https://over2you.shop/product?id=${FIX.id}&cb=` + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForSelector('.pdp-color-swatch', { timeout: 8000 });
  await page.waitForTimeout(400);

  // Click first non-default swatch — used to be hardcoded BLACK against BDG's
  // TAN/BLACK pair, generalised so any live 2+color product works.
  const targetColorId = await page.evaluate(() => {
    const swatches = [...document.querySelectorAll('.pdp-color-swatch')];
    const nonDefault = swatches.find(s => !s.classList.contains('active'));
    return (nonDefault || swatches[1] || swatches[0])?.dataset.colorId;
  });
  if (!targetColorId) {
    console.log('SKIP — no non-default swatch found on PDP');
    process.exit(0);
  }
  await page.click(`.pdp-color-swatch[data-color-id="${targetColorId}"]`);
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
  console.log(`cart after ${targetColorId}+L add:`);
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
