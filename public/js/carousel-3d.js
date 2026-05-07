/* <carousel-3d> — flat ↔ cylinder ring 360 viewer
 *
 * Accepted data-frames shapes:
 *   - object array (new schema):  [{ id, src, label, deg, flip }, ...]
 *   - string array (legacy):      ["products/foo.png", ...]
 *   - empty:                      [] → renders a "no image" placeholder
 *
 * Per-N rendering:
 *   N=0      → placeholder, no toggle
 *   N=1      → flat single image, no toggle
 *   N=2..3   → flat with idx switching (driven by external thumb rail)
 *   N>=4     → flat default + 360 toggle, IF data-has360="true". Otherwise
 *              flat-only with idx switching (e.g. 4 plain images, no
 *              dedicated turntable shot).
 *
 * NOTE: attribute is data-has360 (no hyphen before the digit). HTML's dataset
 *       translation only converts hyphen+lowercase-letter to camelCase, so a
 *       hyphen before a digit stays in the attribute name and breaks
 *       dataset.has360 access. data-has-360 was the bug fixed here.
 *
 * The cylinder POS table is N=4 tuned; N>4 falls back to off-stage for d>±2.
 */
(function () {
  if (customElements.get('carousel-3d')) return;

  function normalizeFrames(raw) {
    let parsed;
    try { parsed = JSON.parse(raw || '[]'); } catch (e) { return []; }
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    if (typeof parsed[0] === 'object' && parsed[0] && parsed[0].src) return parsed;
    if (typeof parsed[0] === 'string') {
      return parsed.map((src, i) => ({
        id: 'frame-' + i,
        src: src,
        label: '',
        deg: '',
        flip: false,
      }));
    }
    return [];
  }

  /* Slot positions for the cylinder.
     -1/0/+1 are the visible band (left/center/right) — all on the same
     vertical line so rotation reads as pure horizontal motion.
     ±2 is the wrap state (back of the cylinder); collapsed to center with
     scale 0 + opacity 0 so a slot fades into / out of the center as it
     rotates past the visible band. No diagonal travel. */
  // Center scale 0.92 (was 1.00) so tall product photos (figure with head)
  // get ~4% top clearance instead of pressing against the stage edge.
  // Side scales also nudged down to keep the visual ratio with center.
  const POS = {
    '-1': { l: 18, t: 90, s: 0.65, o: 0.95, z: 3 },
    '0':  { l: 50, t: 90, s: 0.92, o: 1.00, z: 6 },
    '1':  { l: 82, t: 90, s: 0.65, o: 0.95, z: 3 },
    '2':  { l: 50, t: 90, s: 0.10, o: 0.00, z: 0 },
    '-2': { l: 50, t: 90, s: 0.10, o: 0.00, z: 0 },
  };
  const TRANSITION =
    'left .7s cubic-bezier(.22,.61,.36,1),' +
    'top .7s cubic-bezier(.22,.61,.36,1),' +
    'transform .7s cubic-bezier(.22,.61,.36,1),' +
    'opacity .55s ease';

  class Carousel3D extends HTMLElement {
    connectedCallback() {
      if (this._mounted) return;
      this._mounted = true;

      this.frames = normalizeFrames(this.dataset.frames);
      this.imgBase = this.dataset.imgBase || '';
      // dataset.has360 reads the data-has360 attribute (note: no hyphen before
      // the digit, otherwise dataset translation breaks — see header comment).
      this.has360 = this.dataset.has360 === 'true' && this.frames.length >= 4;
      this.idx = 0;
      this.mode = 'flat';
      this.isMobile = window.matchMedia('(max-width: 768px)').matches;

      if (!this.frames.length) { this._renderEmpty(); return; }

      this._renderShell();
      this._renderModeView();
      this._renderDots();
      this._preloadAdjacent();
      this._setupSwipe();
      this._bindKeys();
      this._observeResize();
    }

    _renderEmpty() {
      this.innerHTML = `
        <div class="c3d-stage c3d-stage-empty" data-mode="empty">
          <div class="c3d-empty-msg">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            <p>Görsel yok</p>
          </div>
        </div>
      `;
    }

    disconnectedCallback() {
      if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
      if (this._ro) { this._ro.disconnect(); this._ro = null; }
    }

    setIdx(i) {
      const N = this.frames.length;
      this.idx = ((i % N) + N) % N;
      this._renderModeView();
      this._renderDots();
      this._preloadAdjacent();
      this._emit('idx-change');
    }

    _preloadAdjacent() {
      const N = this.frames.length;
      if (N <= 1) return;
      [this.idx - 1, this.idx + 1].forEach(j => {
        const k = ((j % N) + N) % N;
        const f = this.frames[k];
        if (!f || !f.src) return;
        const img = new Image();
        img.src = this.imgBase + f.src;
      });
    }

    setMode(mode) {
      if (mode !== 'flat' && mode !== '360') return;
      if (mode === '360' && !this.has360) return;
      this.mode = mode;
      this._renderModeView();
      this._emit('mode-change');
    }

    _emit(name) {
      this.dispatchEvent(new CustomEvent('c3d:' + name, {
        detail: { idx: this.idx, mode: this.mode, frame: this.frames[this.idx] },
        bubbles: true,
      }));
    }

    _renderShell() {
      const slotsHTML = this.has360 ? this.frames.map((f, i) => `
        <button class="c3d-slot" type="button" data-slot="${i}" aria-label="View ${f.label || ('frame ' + (i+1))}">
          <img src="${this.imgBase}${f.src}" alt="${f.label || ''}"
               draggable="false"
               style="${f.flip ? 'transform:scaleX(-1);' : ''}">
        </button>
      `).join('') : '';

      const ringHTML = this.has360 ? `
        <div class="c3d-360" hidden>
          <div class="c3d-floor" aria-hidden="true"></div>
          ${slotsHTML}
          <button class="c3d-arrow c3d-arrow-l" type="button" aria-label="Previous angle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 6l-6 6 6 6"/></svg>
          </button>
          <button class="c3d-arrow c3d-arrow-r" type="button" aria-label="Next angle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 6l6 6-6 6"/></svg>
          </button>
          <div class="c3d-counter" aria-live="polite"></div>
        </div>
      ` : '';

      this.innerHTML = `
        <div class="c3d-stage" data-mode="flat">
          <div class="c3d-flat"></div>
          ${ringHTML}
          ${this.has360 ? `
            <button class="c3d-toggle" type="button" aria-label="Toggle 360° view" title="360° preview">
              <span class="c3d-lbl"></span>
            </button>
          ` : ''}
        </div>
        <div class="c3d-dots" hidden></div>
      `;

      const toggle = this.querySelector('.c3d-toggle');
      if (toggle) toggle.addEventListener('click', () => {
        this.setMode(this.mode === '360' ? 'flat' : '360');
      });

      const al = this.querySelector('.c3d-arrow-l');
      const ar = this.querySelector('.c3d-arrow-r');
      if (al) al.addEventListener('click', () => this.setIdx(this.idx - 1));
      if (ar) ar.addEventListener('click', () => this.setIdx(this.idx + 1));

      this.querySelectorAll('.c3d-slot').forEach(slot => {
        slot.addEventListener('click', () => {
          const i = parseInt(slot.dataset.slot, 10);
          if (i !== this.idx) this.setIdx(i);
        });
      });
    }

    _renderModeView() {
      const stage = this.querySelector('.c3d-stage');
      const flat = this.querySelector('.c3d-flat');
      const ring = this.querySelector('.c3d-360');
      const lbl = this.querySelector('.c3d-toggle .c3d-lbl');
      const counter = this.querySelector('.c3d-counter');
      const cur = this.frames[this.idx];
      if (!stage || !flat || !cur) return;

      stage.dataset.mode = this.mode;

      if (lbl) {
        lbl.innerHTML = this.mode === '360'
          ? 'CLOSE<b>×</b>'
          : 'VIEW<b>360°</b>';
      }

      if (this.mode === 'flat' || !ring) {
        if (ring) ring.hidden = true;
        flat.hidden = false;
        flat.innerHTML = `
          <img src="${this.imgBase}${cur.src}" alt="${cur.label || ''}"
               draggable="false"
               style="${cur.flip ? 'transform:scaleX(-1);' : ''}">
        `;
      } else {
        flat.hidden = true;
        ring.hidden = false;
        this._updateSlotPositions();
        if (counter) {
          counter.textContent =
            String(this.idx + 1).padStart(2, '0') + ' / ' +
            String(this.frames.length).padStart(2, '0') +
            (cur.label ? ' · ' + cur.label : '');
        }
      }
    }

    _updateSlotPositions() {
      const N = this.frames.length;
      this.querySelectorAll('.c3d-slot').forEach(slot => {
        const i = parseInt(slot.dataset.slot, 10);
        let d = ((i - this.idx) % N + N) % N;
        if (d > N / 2) d -= N;

        const p = POS[d];
        const isActive = d === 0;

        if (!p) {
          slot.style.opacity = '0';
          slot.style.pointerEvents = 'none';
          slot.style.transform = 'translate(-50%, -50%) scale(0.2)';
          slot.classList.remove('c3d-slot-active');
          return;
        }

        slot.style.left = p.l + '%';
        slot.style.top = 'auto';
        slot.style.bottom = (100 - p.t) + '%';
        slot.style.transform = 'translate(-50%, 0) scale(' + p.s + ')';
        slot.style.transformOrigin = 'center bottom';
        slot.style.opacity = String(p.o);
        slot.style.zIndex = String(p.z);
        slot.style.transition = TRANSITION;
        slot.style.pointerEvents = isActive ? 'none' : 'auto';
        slot.style.cursor = isActive ? 'default' : 'pointer';
        slot.classList.toggle('c3d-slot-active', isActive);
      });
    }

    _bindKeys() {
      this._keyHandler = (e) => {
        // Skip when user is typing in a form field.
        const ae = document.activeElement;
        if (ae && ['INPUT', 'TEXTAREA', 'SELECT'].includes(ae.tagName)) return;
        // Lightbox owns ←/→ when open — avoid double-fire.
        const lb = document.getElementById('pdpLightbox');
        if (lb && !lb.hasAttribute('hidden')) return;

        if (this.mode === '360') {
          if (e.key === 'ArrowRight') { e.preventDefault(); this.setIdx(this.idx + 1); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); this.setIdx(this.idx - 1); }
          else if (e.key === 'Escape') { e.preventDefault(); this.setMode('flat'); }
        } else {
          // Flat mode: navigate the image list (only meaningful for multi-frame).
          if (this.frames.length <= 1) return;
          if (e.key === 'ArrowRight') { e.preventDefault(); this.setIdx(this.idx + 1); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); this.setIdx(this.idx - 1); }
        }
      };
      window.addEventListener('keydown', this._keyHandler);
    }

    _renderDots() {
      const dotsEl = this.querySelector('.c3d-dots');
      if (!dotsEl) return;
      // Mobile-only, flat-mode-only, multi-image-only.
      const showDots = this.isMobile && this.mode === 'flat' && this.frames.length > 1;
      dotsEl.hidden = !showDots;
      if (!showDots) return;
      dotsEl.innerHTML = this.frames.map((_, i) =>
        `<button class="c3d-dot${i === this.idx ? ' active' : ''}" type="button" data-dot="${i}" aria-label="Görsel ${i + 1}"></button>`
      ).join('');
      dotsEl.querySelectorAll('.c3d-dot').forEach(d => {
        d.addEventListener('click', () => this.setIdx(parseInt(d.dataset.dot, 10)));
      });
    }

    _setupSwipe() {
      const flat = this.querySelector('.c3d-flat');
      if (!flat) return;
      let startX = 0, startY = 0, deltaX = 0, isHoriz = false;

      flat.addEventListener('touchstart', (e) => {
        if (this.mode !== 'flat' || this.frames.length <= 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        deltaX = 0;
        isHoriz = false;
      }, { passive: true });

      flat.addEventListener('touchmove', (e) => {
        if (this.mode !== 'flat' || this.frames.length <= 1) return;
        deltaX = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (!isHoriz && Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(dy)) {
          isHoriz = true;
        }
        // Block vertical scroll only once the gesture is clearly horizontal.
        if (isHoriz) e.preventDefault();
      }, { passive: false });

      flat.addEventListener('touchend', () => {
        if (this.mode !== 'flat' || !isHoriz) return;
        if (Math.abs(deltaX) > 50) {
          this.setIdx(deltaX < 0 ? this.idx + 1 : this.idx - 1);
        }
        deltaX = 0;
        isHoriz = false;
      });
    }

    _observeResize() {
      if (typeof ResizeObserver === 'undefined') return;
      this._ro = new ResizeObserver(() => {
        const wasMobile = this.isMobile;
        this.isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (wasMobile !== this.isMobile) this._renderDots();
        if (this.mode === '360') this._updateSlotPositions();
      });
      this._ro.observe(this);
    }
  }

  customElements.define('carousel-3d', Carousel3D);
})();
