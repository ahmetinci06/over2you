/* ========================================
   OVER2YOU — Full Functional App JS
   ======================================== */

// ===== PRODUCT DATA (fallback — overridden by data/products.json fetch) =====
let products = [
  { id: 1, name: "BDG Corduroy Bomber Jacket", price: 120, category: "jackets", sizes: ["S","M","L","XL"], badge: "NEW", color: "#c4a47a", colorName: "Tan", colorFamily: "brown", description: "BDG Jeans corduroy zip-up bomber jacket in tan/khaki. Wide-wale corduroy fabric, full-length front zipper, spread collar, elasticized waistband and cuffs, side pockets. Relaxed oversized fit.", images: ["products/bdg-jacket-front.png","products/bdg-jacket-side.png","products/bdg-jacket-back.png","products/bdg-jacket-left.png"] },
];

// ===== UTILITIES =====
const BASE = window.O2Y_BASE || '/';

function getImgBase() {
  return BASE + 'img/';
}

function getPageBase() {
  return BASE;
}

// ===== SLIDESHOW =====
(function() {
  const track = document.getElementById('slideshowTrack');
  const dots = document.querySelectorAll('.slideshow-dot');
  const prevBtn = document.getElementById('slidePrev');
  const nextBtn = document.getElementById('slideNext');
  if (!track) return;

  let current = 0;
  const slides = track.querySelectorAll('.slide');
  const total = slides.length;
  let autoplayTimer;

  function goTo(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAutoplay() { autoplayTimer = setInterval(() => goTo(current + 1), 5000); }
  function resetAutoplay() { clearInterval(autoplayTimer); startAutoplay(); }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });
  dots.forEach(dot => dot.addEventListener('click', () => { goTo(parseInt(dot.dataset.index)); resetAutoplay(); }));

  // Touch/swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); resetAutoplay(); }
  }, { passive: true });

  startAutoplay();
})();

// ===== TRANSPARENT HEADER — SCROLL BEHAVIOR =====
(function() {
  const header = document.getElementById('header');
  if (!header || !header.classList.contains('header--transparent')) return;

  let scrolled = false;
  function checkScroll() {
    const shouldBeScrolled = window.scrollY > 80;
    if (shouldBeScrolled !== scrolled) {
      scrolled = shouldBeScrolled;
      if (scrolled) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    }
  }
  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();
})();

// ===== SIDEBAR MENU =====
(function() {
  const toggleBtn = document.getElementById('menuToggle');
  const overlay = document.getElementById('mobileNavOverlay');
  const nav = document.getElementById('mobileNav');
  const closeBtn = document.getElementById('menuCloseBtn');

  if (!nav) return;

  function openNav() {
    nav.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    nav.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    nav.classList.remove('submenu-active');
    document.querySelectorAll('.submenu-container.active').forEach(s => s.classList.remove('active'));
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (overlay) overlay.addEventListener('click', closeNav);

  // Desktop "SHOP ALL" and other # links open sidebar
  document.querySelectorAll('.nav-dropdown-trigger').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openNav(); });
  });

  // Submenu slide
  document.querySelectorAll('.has-submenu').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target');
      if (targetId) {
        const targetMenu = document.getElementById(targetId);
        if (targetMenu) { targetMenu.classList.add('active'); nav.classList.add('submenu-active'); }
      }
    });
  });

  document.querySelectorAll('.submenu-back').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.submenu-container');
      if (parent) parent.classList.remove('active');
      nav.classList.remove('submenu-active');
    });
  });
})();

// ===== SEARCH — with live product filtering =====
(function() {
  const btn = document.getElementById('searchBtn');
  const modal = document.getElementById('searchModal');
  const close = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  const resultsContainer = document.getElementById('searchResults');

  if (!btn || !modal) return;

  btn.addEventListener('click', () => { modal.classList.add('active'); if (input) input.focus(); });
  if (close) close.addEventListener('click', () => { modal.classList.remove('active'); if (input) input.value = ''; clearResults(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { modal.classList.remove('active'); clearResults(); } });

  function clearResults() {
    if (resultsContainer) resultsContainer.innerHTML = '';
  }

  if (input) {
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!resultsContainer) return;
      if (q.length < 2) { clearResults(); return; }

      const matches = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.colorName && p.colorName.toLowerCase().includes(q))
      ).slice(0, 8);

      const base = getPageBase();
      resultsContainer.innerHTML = matches.length === 0
        ? '<p class="search-no-results">No products found</p>'
        : matches.map(p => `
          <a href="${base}product?id=${p.id}" class="search-result-item">
            <div class="search-result-swatch" style="background:${p.color};"></div>
            <div class="search-result-info">
              <span class="search-result-name">${p.name}</span>
              <span class="search-result-price">₺${(typeof p.salePrice === 'number' && p.salePrice < p.price ? p.salePrice : p.price).toFixed(2)}</span>
            </div>
          </a>
        `).join('');
    });
  }
})();

// ===== STOCK RESOLUTION =====
// Single source of truth for size/color stock lookups. Mirrors the
// effectiveGallery pattern in product.astro — both PDP and Cart query
// these via window.O2Y.*. product.outOfStock master override wins.
//
// Fallback chain (effectiveStock):
//   color present → color.sizeStock[size] → color.stock → null
//   color absent  → product.sizeStock[size] → product.stockQty → null
//
// null means "unknown" — caller treats as unlimited. 0 means OOS.
function effectiveStock(product, color, size) {
  if (!product) return null;
  if (product.outOfStock) return 0;
  if (color) {
    const ss = color.sizeStock;
    if (ss && typeof ss[size] === 'number') return ss[size];
    if (typeof color.stock === 'number') return color.stock;
    return null;
  }
  const ss = product.sizeStock;
  if (ss && typeof ss[size] === 'number') return ss[size];
  if (typeof product.stockQty === 'number') return product.stockQty;
  return null;
}
function effectiveStockSum(product, color) {
  if (!product) return null;
  if (product.outOfStock) return 0;
  const obj = color ? color.sizeStock : product.sizeStock;
  if (obj && typeof obj === 'object') {
    const vals = Object.values(obj).filter(v => typeof v === 'number');
    if (vals.length > 0) return vals.reduce((a, b) => a + b, 0);
  }
  if (color && typeof color.stock === 'number') return color.stock;
  if (!color && typeof product.stockQty === 'number') return product.stockQty;
  return null;
}

// ===== TOAST =====
// Single toast slot at bottom-center. New toasts replace the current one
// (no queue). CSS injected lazily on first call. Idempotent.
let __o2yToastTimeout = null;
function toast(msg, opts) {
  if (!document.getElementById('o2yToastStyle')) {
    const s = document.createElement('style');
    s.id = 'o2yToastStyle';
    s.textContent = '.o2y-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgb(20,20,20);color:#fff;padding:0.7rem 1.2rem;font:600 13px/1.4 var(--heading-font-family,system-ui);letter-spacing:0.02em;z-index:9999;opacity:0;pointer-events:none;transition:opacity 0.2s;border-radius:2px;max-width:90vw;text-align:center}.o2y-toast.show{opacity:1}.o2y-toast.error{background:#c94c4c}';
    document.head.appendChild(s);
  }
  let el = document.getElementById('o2yToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'o2yToast';
    el.className = 'o2y-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'o2y-toast' + (opts && opts.error ? ' error' : '');
  requestAnimationFrame(() => el.classList.add('show'));
  if (__o2yToastTimeout) clearTimeout(__o2yToastTimeout);
  __o2yToastTimeout = setTimeout(() => el.classList.remove('show'), 2200);
}

window.O2Y = window.O2Y || {};
window.O2Y.effectiveStock = effectiveStock;
window.O2Y.effectiveStockSum = effectiveStockSum;
window.O2Y.toast = toast;

// ===== CART =====
const Cart = (function() {
  let items = JSON.parse(localStorage.getItem('over2you_cart') || '[]');
  const overlay = document.getElementById('cartOverlay');
  const drawer = document.getElementById('cartDrawer');
  const closeBtn = document.getElementById('cartClose');
  const body = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  const totalEl = document.getElementById('cartTotal');
  const countEl = document.getElementById('cartCount');

  function open() {
    if (drawer) drawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function save() { localStorage.setItem('over2you_cart', JSON.stringify(items)); }

  function add(product, size, selectedColor) {
    const selectedSize = size || product.selectedSize || product.sizes[Math.floor(product.sizes.length / 2)];
    // Resolve active color: explicit arg → product default → top-level fallback.
    const colorObj = selectedColor
      || (Array.isArray(product.colors) && product.colors.find(c => c.default))
      || (Array.isArray(product.colors) && product.colors[0])
      || null;
    const colorId = colorObj ? colorObj.id : (product.colorName || 'default').toLowerCase();
    const colorName = colorObj ? colorObj.name : (product.colorName || '');
    const colorHex = colorObj ? colorObj.hex : (product.color || '#eee');
    // Variant-aware dedupe key — same product+size in different colors are
    // separate cart lines.
    const key = `${product.id}-${selectedSize}-${colorId}`;
    const existing = items.find(i => i.key === key);
    // Stock hard limit (color × size aware). null = unknown → unlimited.
    const stockLimit = effectiveStock(product, colorObj, selectedSize);
    const currentQty = existing ? existing.qty : 0;
    if (stockLimit !== null && currentQty + 1 > stockLimit) {
      toast(stockLimit === 0 ? 'Bu beden stokta yok' : `Stokta sadece ${stockLimit} adet kaldı`, { error: true });
      return;
    }
    if (existing) {
      existing.qty += 1;
    } else {
      // Store the effective (charged) price so cart/checkout math is sale-aware.
      const onSale = typeof product.salePrice === 'number' && product.salePrice < product.price;
      const effective = onSale ? product.salePrice : product.price;
      // Pick a color-aware thumbnail when the variant has its own images.
      const colorImage = (colorObj && Array.isArray(colorObj.images) && colorObj.images[0])
        || (Array.isArray(product.images) && product.images[0])
        || null;
      items.push({
        ...product,
        price: effective,
        key,
        selectedSize,
        selectedColorId: colorId,
        selectedColorName: colorName,
        selectedColorHex: colorHex,
        selectedImage: colorImage,
        qty: 1,
      });
    }
    save(); render(); open();
  }

  function remove(key) {
    items = items.filter(i => i.key !== key);
    save(); render();
  }

  function updateQty(key, delta) {
    const item = items.find(i => i.key === key);
    if (!item) return;
    if (delta > 0) {
      // item carries product.colors (via spread in add()); find the variant
      // by selectedColorId so per-color sizeStock honours its fallback chain.
      const itemColor = (Array.isArray(item.colors) && item.colors.find(c => c.id === item.selectedColorId)) || null;
      const stockLimit = effectiveStock(item, itemColor, item.selectedSize);
      if (stockLimit !== null && item.qty + delta > stockLimit) {
        toast(`Stokta sadece ${stockLimit} adet kaldı`, { error: true });
        return;
      }
    }
    item.qty += delta;
    if (item.qty <= 0) { remove(key); return; }
    save(); render();
  }

  function render() {
    const totalItems = items.reduce((s, i) => s + i.qty, 0);
    if (countEl) countEl.textContent = totalItems;
    if (!body) return;

    if (items.length === 0) {
      body.innerHTML = '<p class="cart-empty-msg">Your cart is empty</p>';
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = 'block';
    body.innerHTML = items.map(item => `
      <div class="cart-item">
        <div class="cart-item-swatch" style="background:${item.selectedColorHex || item.color || '#eee'};"></div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-variant">${item.selectedColorName ? (window.o2yT ? o2yT('common.color') : 'Renk') + ': ' + item.selectedColorName + ' · ' : ''}${window.o2yT ? o2yT('common.size') : 'Beden'}: ${item.selectedSize}</div>
          <div class="cart-item-qty-row">
            <button class="qty-btn" onclick="Cart.updateQty('${item.key}', -1)">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" onclick="Cart.updateQty('${item.key}', 1)">+</button>
          </div>
          <div class="cart-item-price">₺${(item.price * item.qty).toFixed(2)}</div>
          <button class="cart-item-remove" onclick="Cart.remove('${item.key}')">Remove</button>
        </div>
      </div>
    `).join('');

    const total = items.reduce((s, i) => s + (i.price * i.qty), 0);
    if (totalEl) totalEl.textContent = `₺${total.toFixed(2)}`;
  }

  // Events
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (overlay) overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // Checkout — redirect to checkout page
  const checkoutBtn = document.querySelector('.btn-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (items.length === 0) return;
      close();
      const base = getPageBase();
      window.location.href = base + 'checkout';
    });
  }

  render();
  return { add, remove, updateQty, open, close, render, getItems: () => items };
})();


// ===== RENDER PRODUCTS (Shop Page Grid) =====
function renderProducts(filter, targetEl) {
  const grid = targetEl || document.getElementById('shopProductGrid');
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const colorFilter = params.get('color');

  let filtered = products;
  if (filter && filter !== 'all') filtered = filtered.filter(p => p.category === filter);
  if (colorFilter) filtered = filtered.filter(p => p.colorFamily === colorFilter);

  const base = getPageBase();
  const imgBase = getImgBase();

  grid.innerHTML = filtered.length === 0
    ? '<p style="padding:2rem;text-align:center;color:#999;">No products found</p>'
    : filtered.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="product-card-img">
        <a href="${base}product?id=${product.id}">
          ${(product.images && product.images[0])
            ? `<img src="${imgBase}${product.images[0]}" alt="${product.name}" loading="lazy">`
            : `<div class="product-card-img-placeholder" style="background:${product.color};">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5">
                   <path d="M12 2C8 2 4 4 4 8v12a2 2 0 002 2h12a2 2 0 002-2V8c0-4-4-6-8-6z"/>
                   <path d="M8 2v4M16 2v4"/>
                 </svg>
               </div>`}
        </a>
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        <div class="product-quick-add" onclick="Cart.add(products.find(p=>p.id===${product.id}))">+ QUICK ADD</div>
      </div>
      <div class="product-sizes">
        ${product.sizes.map(s => `<span class="product-size-tag">${s}</span>`).join('')}
      </div>
      <a href="${base}product?id=${product.id}" style="text-decoration:none;color:inherit;">
        <div class="product-name">${product.name}</div>
        ${(() => {
          const onSale = typeof product.salePrice === 'number' && product.salePrice < product.price;
          return onSale
            ? `<div class="product-price"><strong style="color:#c94c4c;">₺${product.salePrice.toFixed(2)}</strong> <del style="opacity:0.5;font-weight:400;margin-left:0.3em;">₺${product.price.toFixed(2)}</del></div>`
            : `<div class="product-price">₺${product.price.toFixed(2)}</div>`;
        })()}
      </a>
    </div>
  `).join('');
}


// ===== LOAD DATA FROM JSON (CMS-managed) =====
window.productsReady = false;
(async function loadData() {
  try {
    const [prodRes, settRes] = await Promise.all([
      fetch(BASE + 'data/products.json').catch(() => null),
      fetch(BASE + 'data/settings.json').catch(() => null)
    ]);
    if (prodRes && prodRes.ok) {
      const data = await prodRes.json();
      if (Array.isArray(data) && data.length > 0) {
        // Filter soft-deleted products from public storefront views.
        products = data.filter(p => !p.deletedAt);
        window.products = products;
        const shopGrid = document.getElementById('shopProductGrid');
        if (shopGrid) {
          const params = new URLSearchParams(window.location.search);
          const cat = params.get('cat');
          renderProducts(cat || 'all', shopGrid);
          const filtered = cat && cat !== 'all' ? products.filter(p => p.category === cat) : products;
          const countEl = document.getElementById('shopCount');
          if (countEl) countEl.textContent = filtered.length + ' ' + (window.o2yT ? o2yT('product.products') : 'ürün');
        }
      }
    }
    if (settRes && settRes.ok) {
      const settings = await settRes.json();
      window.siteSettings = settings;
      document.querySelectorAll('.logo-text').forEach(el => {
        if (settings.logoText) el.textContent = settings.logoText;
      });
    }
  } catch(e) { /* fallback to hardcoded data */ }
  finally {
    window.productsReady = true;
    window.dispatchEvent(new Event('o2y:products-ready'));
  }
})();

// ===== Expose globally =====
window.Cart = Cart;
window.products = products;
window.renderProducts = renderProducts;

// 360 viewer is set up inline in product.astro where product frames are known.
