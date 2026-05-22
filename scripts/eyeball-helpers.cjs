// Shared fixture loader for eyeball-*.cjs scripts. Single source of truth for
// "which product should this test use" so soft-deleting id=1 doesn't silently
// turn every PDP test into "Product Not Found" + empty carousel.
//
// public/data/products.json is the authoritative file — CMS writeJSON syncs
// public/+dist on every save, so reading from public matches what astro build
// will deploy.

const fs = require('fs');
const path = require('path');

const PRODUCTS_JSON = path.join(__dirname, '..', 'public', 'data', 'products.json');

function loadProducts() {
  try {
    return JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
  } catch (e) {
    return null;
  }
}

// Returns { id, slug, name, defaultColorId, colorCount, hasImages360, hasImages }
// for the first non-soft-deleted product matching the given shape predicate,
// or null when nothing usable exists. Predicate options:
//   - minColors    — require colors[].length >= N (default 0)
//   - require360   — require images360 to be present
//   - requireImages — require images[].length >= 1 (default false)
function getFirstLiveProduct(opts = {}) {
  const { minColors = 0, require360 = false, requireImages = false } = opts;
  const products = loadProducts();
  if (!Array.isArray(products) || products.length === 0) return null;
  const live = products.filter(p => p && !p.deletedAt);
  const match = live.find(p => {
    const variants = Array.isArray(p.colors) && p.colors.length
      ? p.colors
      : (Array.isArray(p.variantColors) ? p.variantColors : []);
    if (variants.length < minColors) return false;
    if (require360 && !p.images360) return false;
    if (requireImages && !(Array.isArray(p.images) && p.images.length > 0)) return false;
    return true;
  });
  if (!match) return null;
  const variants = Array.isArray(match.colors) && match.colors.length
    ? match.colors
    : (Array.isArray(match.variantColors) ? match.variantColors : []);
  return {
    id: match.id,
    slug: match.seo?.slug || null,
    name: match.name || '',
    defaultColorId: variants.length
      ? (variants.find(c => c && c.default)?.id || variants[0]?.id || null)
      : null,
    colorCount: variants.length,
    hasImages360: !!match.images360,
    hasImages: Array.isArray(match.images) && match.images.length > 0,
    images: Array.isArray(match.images) ? match.images : [],
  };
}

// Returns all live products matching the shape predicate (same opts as
// getFirstLiveProduct). Used by tests that loop over multiple fixtures
// (e.g. eyeball-pdp-thumbs.cjs verifying thumb rail across products).
function getLiveProducts(opts = {}) {
  const { minColors = 0, require360 = false, requireImages = false } = opts;
  const products = loadProducts();
  if (!Array.isArray(products)) return [];
  return products
    .filter(p => p && !p.deletedAt)
    .filter(p => {
      const variants = Array.isArray(p.colors) ? p.colors : [];
      if (variants.length < minColors) return false;
      if (require360 && !p.images360) return false;
      if (requireImages && !(Array.isArray(p.images) && p.images.length > 0)) return false;
      return true;
    });
}

// Standard skip used by every script when there's no fixture to test against.
// Exits 0 (npm run eyeball treats as PASS) and prints a clear marker so the
// log shows why the script was bypassed.
function skipIfNoFixture(fixture, scriptName) {
  if (fixture) return;
  console.log(`SKIP — no live product in public/data/products.json (script: ${scriptName || 'unknown'})`);
  process.exit(0);
}

module.exports = { getFirstLiveProduct, getLiveProducts, skipIfNoFixture, loadProducts };
