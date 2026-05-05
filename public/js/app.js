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
              <span class="search-result-price">€${p.price.toFixed(2)}</span>
            </div>
          </a>
        `).join('');
    });
  }
})();

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

  function add(product, size) {
    const selectedSize = size || product.selectedSize || product.sizes[Math.floor(product.sizes.length / 2)];
    const key = `${product.id}-${selectedSize}`;
    const existing = items.find(i => i.key === key);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ ...product, key, selectedSize, qty: 1 });
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
        <div class="cart-item-swatch" style="background:${item.color || '#eee'};"></div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-variant">Size: ${item.selectedSize}</div>
          <div class="cart-item-qty-row">
            <button class="qty-btn" onclick="Cart.updateQty('${item.key}', -1)">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" onclick="Cart.updateQty('${item.key}', 1)">+</button>
          </div>
          <div class="cart-item-price">€${(item.price * item.qty).toFixed(2)}</div>
          <button class="cart-item-remove" onclick="Cart.remove('${item.key}')">Remove</button>
        </div>
      </div>
    `).join('');

    const total = items.reduce((s, i) => s + (i.price * i.qty), 0);
    if (totalEl) totalEl.textContent = `€${total.toFixed(2)}`;
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

// ===== NEWSLETTER =====
(function() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    if (email) {
      form.innerHTML = '<p style="color:#4ade80;font-size:var(--text-sm);letter-spacing:0.04em;">✓ SUBSCRIBED SUCCESSFULLY</p>';
    }
  });
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
          <div class="product-card-img-placeholder" style="background:${product.color};">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5">
              <path d="M12 2C8 2 4 4 4 8v12a2 2 0 002 2h12a2 2 0 002-2V8c0-4-4-6-8-6z"/>
              <path d="M8 2v4M16 2v4"/>
            </svg>
          </div>
        </a>
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        <div class="product-quick-add" onclick="Cart.add(products.find(p=>p.id===${product.id}))">+ QUICK ADD</div>
      </div>
      <div class="product-sizes">
        ${product.sizes.map(s => `<span class="product-size-tag">${s}</span>`).join('')}
      </div>
      <a href="${base}product?id=${product.id}" style="text-decoration:none;color:inherit;">
        <div class="product-name">${product.name}</div>
        <div class="product-price">€${product.price.toFixed(2)}</div>
      </a>
    </div>
  `).join('');
}

// ===== PRODUCT PAGE — Dynamic Rendering (legacy, superseded by product.astro inline script) =====
(function() {
  const container = document.querySelector('.product-container');
  if (!container) return;
  // Skip if the new Astro product page is active — it renders into #productLayout with real images.
  if (document.getElementById('productLayout')) return;

  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id')) || 1;
  const product = products.find(p => p.id === productId) || products[0];

  const imgBase = getImgBase();
  const pageBase = getPageBase() || '';

  // Update page title
  document.title = `${product.name} | Over2You`;

  // Find related products (same category, different color)
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 6);

  // Render the full product page
  container.innerHTML = `
    <div class="product-gallery">
      <div class="product-thumbnails">
        ${(product.images || []).map((img, i) => `
          <div class="thumb-item ${i === 0 ? 'active' : ''}" data-index="${i}">
            <div style="width:100%;aspect-ratio:2/3;background:${product.color};display:flex;align-items:center;justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"><path d="M12 2C8 2 4 4 4 8v12a2 2 0 002 2h12a2 2 0 002-2V8c0-4-4-6-8-6z"/></svg>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="product-main-images">
        ${(product.images || ['placeholder']).map(() => `
          <div style="width:100%;aspect-ratio:3/4;background:${product.color};display:flex;align-items:center;justify-content:center;">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5">
              <path d="M12 2C8 2 4 4 4 8v12a2 2 0 002 2h12a2 2 0 002-2V8c0-4-4-6-8-6z"/>
              <path d="M8 2v4M16 2v4"/>
            </svg>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="product-info">
      <nav class="breadcrumb" style="font-size:11px;margin-bottom:2rem;color:#888;">
        <a href="${BASE}">Home</a> /
        <a href="${pageBase}shop?cat=${product.category}">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</a> /
        ${product.name}
      </nav>
      <h1 class="product-title">${product.name}</h1>
      <div class="product-price-display">€${product.price.toFixed(2)}</div>

      <span class="option-label">Color: ${product.colorName}</span>
      <div class="color-swatches-product" id="productColorSwatches">
        ${related.slice(0, 8).map(r => `
          <a href="product?id=${r.id}" class="swatch-product ${r.id === product.id ? 'selected' : ''}" style="background:${r.color};" title="${r.colorName}"></a>
        `).join('')}
        <a href="product?id=${product.id}" class="swatch-product selected" style="background:${product.color};" title="${product.colorName}"></a>
      </div>

      <span class="option-label">Size: <span id="selectedSizeLabel">Select Size</span></span>
      <div class="size-picker" id="sizePicker">
        ${product.sizes.map(s => `<div class="size-chip" data-size="${s}">${s}</div>`).join('')}
      </div>

      <button class="atc-btn" id="addToCartBtn">ADD TO CART</button>

      <div class="inventory-status">
        <div class="status-dot"></div>
        <span><strong>${product.badge === 'LAST STOCK' ? 'Low stock.' : 'In stock.'}</strong> Shipping in 3 - 5 days</span>
      </div>

      <div class="product-accordion" id="productAccordion">
        <div class="accordion-item" data-content="details">
          <span>Product Details</span>
          <span class="accordion-icon">+</span>
        </div>
        <div class="accordion-content" id="accordion-details" style="display:none;">
          <p>${product.description || 'Premium quality. Made with organic cotton.'}</p>
          <ul style="margin-top:0.75rem;padding-left:1rem;list-style:disc;">
            <li>400gsm premium organic cotton</li>
            <li>Brushed fleece interior</li>
            <li>Oversized fit</li>
            <li>Kangaroo pocket</li>
            <li>Ribbed cuffs and hem</li>
          </ul>
        </div>
        <div class="accordion-item" data-content="shipping">
          <span>Shipping & Returns</span>
          <span class="accordion-icon">+</span>
        </div>
        <div class="accordion-content" id="accordion-shipping" style="display:none;">
          <p><strong>Shipping:</strong> Free shipping on orders over €100. Standard delivery 3-5 business days.</p>
          <p style="margin-top:0.5rem;"><strong>Returns:</strong> 30-day return policy. Items must be unworn with tags attached.</p>
        </div>
        <div class="accordion-item" data-content="sizing">
          <span>Size Guide</span>
          <span class="accordion-icon">+</span>
        </div>
        <div class="accordion-content" id="accordion-sizing" style="display:none;">
          <table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:0.5rem;">
            <tr style="border-bottom:1px solid #ddd;"><th style="text-align:left;padding:4px 8px;">Size</th><th>Chest</th><th>Length</th></tr>
            <tr><td style="padding:4px 8px;">XS</td><td>52cm</td><td>68cm</td></tr>
            <tr><td style="padding:4px 8px;">S</td><td>55cm</td><td>70cm</td></tr>
            <tr><td style="padding:4px 8px;">M</td><td>58cm</td><td>72cm</td></tr>
            <tr><td style="padding:4px 8px;">L</td><td>61cm</td><td>74cm</td></tr>
            <tr><td style="padding:4px 8px;">XL</td><td>64cm</td><td>76cm</td></tr>
            <tr><td style="padding:4px 8px;">XXL</td><td>67cm</td><td>78cm</td></tr>
          </table>
        </div>
      </div>
    </div>
  `;

  // === Logo Color: set to current product color, hover changes to swatch color ===
  const logoEls = document.querySelectorAll('.header .logo-text');
  const productColor = product.color;
  logoEls.forEach(el => el.style.color = productColor);
  document.querySelectorAll('.swatch-product').forEach(swatch => {
    swatch.addEventListener('mouseenter', () => {
      const c = swatch.style.background || swatch.style.backgroundColor;
      logoEls.forEach(el => el.style.color = c);
    });
    swatch.addEventListener('mouseleave', () => {
      logoEls.forEach(el => el.style.color = productColor);
    });
  });

  // === Size Picker Logic ===
  let selectedSize = null;
  const sizeLabel = document.getElementById('selectedSizeLabel');
  document.querySelectorAll('.size-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.size-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedSize = chip.dataset.size;
      if (sizeLabel) sizeLabel.textContent = selectedSize;
    });
  });

  // === Add to Cart ===
  const atcBtn = document.getElementById('addToCartBtn');
  if (atcBtn) {
    atcBtn.addEventListener('click', () => {
      if (!selectedSize) {
        // Flash the size picker
        document.querySelectorAll('.size-chip').forEach(c => {
          c.style.borderColor = '#c94c4c';
          setTimeout(() => c.style.borderColor = '', 1000);
        });
        if (sizeLabel) { sizeLabel.textContent = '← Please select a size'; sizeLabel.style.color = '#c94c4c'; setTimeout(() => sizeLabel.style.color = '', 2000); }
        return;
      }
      Cart.add(product, selectedSize);
      atcBtn.textContent = '✓ ADDED TO CART';
      atcBtn.style.background = '#28a745';
      setTimeout(() => {
        atcBtn.textContent = window.o2yT ? o2yT('product.addToCart') : 'SEPETE EKLE';
        atcBtn.style.background = '';
      }, 2000);
    });
  }

  // === Accordion Logic ===
  document.querySelectorAll('.accordion-item').forEach(item => {
    item.addEventListener('click', () => {
      const contentId = item.dataset.content;
      const content = document.getElementById(`accordion-${contentId}`);
      const icon = item.querySelector('.accordion-icon');
      if (!content) return;
      const isOpen = content.style.display !== 'none';
      // Close all
      document.querySelectorAll('.accordion-content').forEach(c => c.style.display = 'none');
      document.querySelectorAll('.accordion-icon').forEach(i => i.textContent = '+');
      // Toggle current
      if (!isOpen) {
        content.style.display = 'block';
        if (icon) icon.textContent = '−';
      }
    });
  });
})();

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
        products = data;
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
