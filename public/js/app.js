/* ========================================
   OVER2YOU — Full Functional App JS
   ======================================== */

// ===== PRODUCT DATA (fallback — overridden by data/products.json fetch) =====
let products = [
  { id: 1, name: "Hoodie Lapis Blue", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: "NEW", color: "#2a5a8a", colorName: "Lapis Blue", colorFamily: "blue", description: "Premium heavyweight hoodie in Lapis Blue. 400gsm organic cotton, brushed fleece interior. Oversized fit with kangaroo pocket and ribbed cuffs.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 2, name: "Hoodie Cyber Purple", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL"], badge: "NEW", color: "#5a2d82", colorName: "Cyber Purple", colorFamily: "dark", description: "Premium heavyweight hoodie in Cyber Purple. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 3, name: "Hoodie Grapefruit", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: "NEW", color: "#c94c4c", colorName: "Grapefruit", colorFamily: "red", description: "Premium heavyweight hoodie in Grapefruit. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 4, name: "Hoodie Grey Melange", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#8a8a8a", colorName: "Grey Melange", colorFamily: "grey", description: "Premium heavyweight hoodie in Grey Melange. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 5, name: "Hoodie Black", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#1a1a1a", colorName: "Black", colorFamily: "black", description: "Premium heavyweight hoodie in Black. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 6, name: "Hoodie Anthracite", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#3a3a3a", colorName: "Anthracite", colorFamily: "dark", description: "Premium heavyweight hoodie in Anthracite. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 7, name: "Hoodie Navy", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#1b2838", colorName: "Navy", colorFamily: "blue", description: "Premium heavyweight hoodie in Navy. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 8, name: "Hoodie Wine Red", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#5c1a2a", colorName: "Wine Red", colorFamily: "red", description: "Premium heavyweight hoodie in Wine Red. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 9, name: "Hoodie Mocca Cream", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#a89070", colorName: "Mocca Cream", colorFamily: "brown", description: "Premium heavyweight hoodie in Mocca Cream. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 10, name: "Hoodie Orbit Blue", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#3a6a8a", colorName: "Orbit Blue", colorFamily: "blue", description: "Premium heavyweight hoodie in Orbit Blue. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 11, name: "Hoodie Persian Blue", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#2a4a7a", colorName: "Persian Blue", colorFamily: "blue", description: "Premium heavyweight hoodie in Persian Blue. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 12, name: "Hoodie Hot Pink", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#e04080", colorName: "Hot Pink", colorFamily: "pink", description: "Premium heavyweight hoodie in Hot Pink. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 13, name: "Hoodie Dark Emerald", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#1a4a2a", colorName: "Dark Emerald", colorFamily: "dark", description: "Premium heavyweight hoodie in Dark Emerald. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 14, name: "Hoodie Plum", price: 84.00, category: "hoodies", sizes: ["M","L","XL","XXL"], badge: null, color: "#5a2a4a", colorName: "Plum", colorFamily: "dark", description: "Premium heavyweight hoodie in Plum. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 15, name: "Hoodie Dark Grey Melange", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#4a4a4a", colorName: "Dark Grey Melange", colorFamily: "grey", description: "Premium heavyweight hoodie in Dark Grey Melange. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 16, name: "Hoodie Soft Violet", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#8a6aaa", colorName: "Soft Violet", colorFamily: "dark", description: "Premium heavyweight hoodie in Soft Violet. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 17, name: "Hoodie Forest Night", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#2a4a2a", colorName: "Forest Night", colorFamily: "dark", description: "Premium heavyweight hoodie in Forest Night. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 18, name: "Hoodie Light Grey", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#c0c0c0", colorName: "Light Grey", colorFamily: "grey", description: "Premium heavyweight hoodie in Light Grey. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 19, name: "Hoodie Chocolate Brown", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#5a3a1a", colorName: "Chocolate Brown", colorFamily: "brown", description: "Premium heavyweight hoodie in Chocolate Brown. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 20, name: "Hoodie Coconut White", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#f0ece0", colorName: "Coconut White", colorFamily: "white", description: "Premium heavyweight hoodie in Coconut White. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 21, name: "Hoodie Ice Blue", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#b0d0e0", colorName: "Ice Blue", colorFamily: "blue", description: "Premium heavyweight hoodie in Ice Blue. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 22, name: "Hoodie Turquoise", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#40b0b0", colorName: "Turquoise", colorFamily: "blue", description: "Premium heavyweight hoodie in Turquoise. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 23, name: "Hoodie Princess Blue", price: 84.00, category: "hoodies", sizes: ["L","XL","XXL"], badge: "LAST STOCK", color: "#4060c0", colorName: "Princess Blue", colorFamily: "blue", description: "Premium heavyweight hoodie in Princess Blue. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 24, name: "Crewneck Hoodie Black/Grey", price: 89.00, category: "crewnecks", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#2a2a2a", colorName: "Black/Grey", colorFamily: "black", description: "Premium crewneck hoodie in Black/Grey two-tone. 380gsm organic cotton.", images: ["col-crewnecks.jpg","col-6pm.jpg"] },
  { id: 25, name: "Polo Black", price: 69.00, category: "tshirts", sizes: ["XXS","XS","S","M","L","XXL"], badge: null, color: "#111111", colorName: "Black", colorFamily: "black", description: "Classic polo shirt in Black. Breathable piqué cotton.", images: ["col-tshirts.jpg","col-6pm.jpg"] },
  { id: 26, name: "Hoodie Baby Pink", price: 84.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#f0b0c0", colorName: "Baby Pink", colorFamily: "pink", description: "Premium heavyweight hoodie in Baby Pink. 400gsm organic cotton, brushed fleece interior.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 27, name: "Sweatpants Black", price: 74.00, category: "sweatpants", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#1a1a1a", colorName: "Black", colorFamily: "black", description: "Premium sweatpants in Black. 400gsm organic cotton, elastic waistband with drawstring.", images: ["col-sweatpants.jpg","col-6pm.jpg"] },
  { id: 28, name: "Sweatpants Grey Melange", price: 74.00, category: "sweatpants", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#8a8a8a", colorName: "Grey Melange", colorFamily: "grey", description: "Premium sweatpants in Grey Melange. 400gsm organic cotton.", images: ["col-sweatpants.jpg","col-6pm.jpg"] },
  { id: 29, name: "Sweatpants Navy", price: 74.00, category: "sweatpants", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#1b2838", colorName: "Navy", colorFamily: "blue", description: "Premium sweatpants in Navy. 400gsm organic cotton.", images: ["col-sweatpants.jpg","col-6pm.jpg"] },
  { id: 30, name: "Sweatpants Anthracite", price: 74.00, category: "sweatpants", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#3a3a3a", colorName: "Anthracite", colorFamily: "dark", description: "Premium sweatpants in Anthracite. 400gsm organic cotton.", images: ["col-sweatpants.jpg","col-6pm.jpg"] },
  { id: 31, name: "Sweatpants Wine Red", price: 74.00, category: "sweatpants", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#5c1a2a", colorName: "Wine Red", colorFamily: "red", description: "Premium sweatpants in Wine Red. 400gsm organic cotton.", images: ["col-sweatpants.jpg","col-6pm.jpg"] },
  { id: 32, name: "Sweatpants Mocca Cream", price: 74.00, category: "sweatpants", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#a89070", colorName: "Mocca Cream", colorFamily: "brown", description: "Premium sweatpants in Mocca Cream. 400gsm organic cotton.", images: ["col-sweatpants.jpg","col-6pm.jpg"] },
  { id: 33, name: "T-Shirt Black", price: 39.00, category: "tshirts", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#111111", colorName: "Black", colorFamily: "black", description: "Essential t-shirt in Black. 200gsm organic cotton, relaxed fit.", images: ["col-tshirts.jpg","col-6pm.jpg"] },
  { id: 34, name: "T-Shirt White", price: 39.00, category: "tshirts", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#f5f5f5", colorName: "White", colorFamily: "white", description: "Essential t-shirt in White. 200gsm organic cotton, relaxed fit.", images: ["col-tshirts.jpg","col-6pm.jpg"] },
  { id: 35, name: "Zip Hoodie Black", price: 89.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#0d0d0d", colorName: "Black", colorFamily: "black", description: "Premium zip hoodie in Black. Full-length YKK zipper, 400gsm organic cotton.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 36, name: "Zip Hoodie Dark Grey Melange", price: 89.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#4a4a4a", colorName: "Dark Grey Melange", colorFamily: "grey", description: "Premium zip hoodie in Dark Grey Melange. Full-length YKK zipper, 400gsm organic cotton.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 37, name: "Zip Hoodie Mocca Cream", price: 89.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#a89070", colorName: "Mocca Cream", colorFamily: "brown", description: "Premium zip hoodie in Mocca Cream. Full-length YKK zipper, 400gsm organic cotton.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 38, name: "Zip Hoodie Plum", price: 89.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#5a2a4a", colorName: "Plum", colorFamily: "dark", description: "Premium zip hoodie in Plum. Full-length YKK zipper, 400gsm organic cotton.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 39, name: "Zip Hoodie Soft Violet", price: 89.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: null, color: "#8a6aaa", colorName: "Soft Violet", colorFamily: "dark", description: "Premium zip hoodie in Soft Violet. Full-length YKK zipper, 400gsm organic cotton.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
  { id: 40, name: "Zip Hoodie Lapis Blue", price: 89.00, category: "hoodies", sizes: ["XXS","XS","S","M","L","XL","XXL"], badge: "NEW", color: "#2a5a8a", colorName: "Lapis Blue", colorFamily: "blue", description: "Premium zip hoodie in Lapis Blue. Full-length YKK zipper, 400gsm organic cotton.", images: ["col-hoodies.jpg","col-6pm.jpg"] },
];

// ===== UTILITIES =====
const BASE = window.O2Y_BASE || '/over2you/';

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

// ===== PRODUCT PAGE — Dynamic Rendering =====
(function() {
  const container = document.querySelector('.product-container');
  if (!container) return;

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
        atcBtn.textContent = 'ADD TO CART';
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
(async function loadData() {
  // base handled by global BASE
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
        // Re-render if shop grid exists
        const shopGrid = document.getElementById('shopProductGrid');
        if (shopGrid) {
          const params = new URLSearchParams(window.location.search);
          const cat = params.get('cat');
          renderProducts(cat || 'all', shopGrid);
          // Update count
          const filtered = cat && cat !== 'all' ? products.filter(p => p.category === cat) : products;
          const countEl = document.getElementById('shopCount');
          if (countEl) countEl.textContent = filtered.length + ' products';
        }
        // Re-render product page if on it
        if (document.querySelector('.product-container')) {
          // Product page re-init handled by its own IIFE on load
        }
      }
    }
    if (settRes && settRes.ok) {
      const settings = await settRes.json();
      window.siteSettings = settings;
      // Apply dynamic settings
      document.querySelectorAll('.logo-text').forEach(el => {
        if (settings.logoText) el.textContent = settings.logoText;
      });
    }
  } catch(e) { /* fallback to hardcoded data */ }
})();

// ===== Expose globally =====
window.Cart = Cart;
window.products = products;
window.renderProducts = renderProducts;

// ===== 360 DEGREE VIEWER =====
(function() {
  const btn = document.getElementById('open360Btn');
  const modal = document.getElementById('viewer360Modal');
  const closeBtn = document.getElementById('close360Btn');
  const container = document.getElementById('viewer360Container');
  const img = document.getElementById('viewer360Image');

  if (!btn || !modal || !img || !container) return;

  btn.addEventListener('click', () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function close360() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  closeBtn.addEventListener('click', close360);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close360(); });

  // Since we don't have a real 360 dataset (72 frames), we simulate it with an array of images.
  // In a real prod enviroment, this array should contain the 36 images covering every angle.
  const frames = [
    '../img/col-hoodies.jpg',
    '../img/grid-1.jpg',
    '../img/col-crewnecks.jpg',
    '../img/grid-2.jpg',
  ];

  let currentFrame = 0;
  let isDragging = false;
  let startX = 0;

  function updateFrame(e, deltaX) {
    // 25px drag = 1 frame change
    if (Math.abs(deltaX) > 25) {
      if (deltaX > 0) {
        currentFrame = (currentFrame + 1) % frames.length;
      } else {
        currentFrame = (currentFrame - 1 + frames.length) % frames.length;
      }
      img.src = frames[currentFrame];
      startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    }
  }

  // Mouse Events
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    container.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateFrame(e, e.clientX - startX);
  });

  // Touch Events (Mobile Drag)
  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
  });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    updateFrame(e, e.touches[0].clientX - startX);
  });
})();
