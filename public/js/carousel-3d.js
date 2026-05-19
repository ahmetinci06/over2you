/* <carousel-3d> — flat ↔ cylinder ring 360 viewer
 *
 * Two independent frame sources:
 *   - data-flat-frames (optional, object array): drives flat mode + thumbs.
 *   - data-frames (object or string array): drives the 360 ring (spin).
 *
 * Backwards compat: if data-flat-frames is missing/empty, flat mode falls
 * back to data-frames (single-source legacy behavior). Slot HTML and the
 * cylinder ring always read from spinFrames (the data-frames source).
 *
 * State model:
 *   - this.flatFrames / this.spinFrames — separate normalized arrays.
 *   - this.flatIdx / this.spinIdx — separate cursors, preserved across
 *     mode switches so closing 360 returns the user to where they were
 *     in flat (and vice versa).
 *   - this.has360 = (data-has360 === 'true') && spinFrames.length >= 2.
 *     (Was >= 4 before partial-upload support — see G6-PR3.)
 *
 * Events:
 *   c3d:idx-change   detail: { idx, mode, frame }   — idx is mode-local.
 *   c3d:mode-change  detail: { idx, mode, frame }   — idx is the new mode's.
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

      const parsedFlat = normalizeFrames(this.dataset.flatFrames);
      const parsedSpin = normalizeFrames(this.dataset.frames);
      this.spinFrames = parsedSpin;
      this.flatFrames = parsedFlat.length > 0 ? parsedFlat : parsedSpin;

      this.imgBase = this.dataset.imgBase || '';
      // dataset.has360 reads the data-has360 attribute (note: no hyphen before
      // the digit, otherwise dataset translation breaks — see header comment).
      this.has360 = this.dataset.has360 === 'true' && this.spinFrames.length >= 2;
      this.flatIdx = 0;
      this.spinIdx = 0;
      this.mode = 'flat';
      this.isMobile = window.matchMedia('(max-width: 768px)').matches;

      if (!this.flatFrames.length && !this.spinFrames.length) { this._renderEmpty(); return; }

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

    // Mode-local accessors. Public read-only `frames` / `idx` getters are
    // kept for external callers (lightbox, eyeball scripts) that previously
    // peeked at the single-array state model.
    _frames() { return this.mode === '360' ? this.spinFrames : this.flatFrames; }
    _idx()    { return this.mode === '360' ? this.spinIdx    : this.flatIdx; }
    get frames() { return this._frames(); }
    get idx()    { return this._idx(); }

    setIdx(i) {
      const frames = this._frames();
      const N = frames.length;
      if (N === 0) return;
      const newIdx = ((i % N) + N) % N;
      if (this.mode === '360') this.spinIdx = newIdx;
      else this.flatIdx = newIdx;
      this._renderModeView();
      this._renderDots();
      this._preloadAdjacent();
      this._emit('idx-change');
    }

    _preloadAdjacent() {
      const frames = this._frames();
      const N = frames.length;
      if (N <= 1) return;
      const idx = this._idx();
      [idx - 1, idx + 1].forEach(j => {
        const k = ((j % N) + N) % N;
        const f = frames[k];
        if (!f || !f.src) return;
        const img = new Image();
        img.src = this.imgBase + f.src;
      });
    }

    setMode(mode) {
      if (mode !== 'flat' && mode !== '360') return;
      if (mode === '360' && !this.has360) return;
      if (this.mode === mode) return;
      this.mode = mode;
      this._renderModeView();
      this._renderDots();
      this._emit('mode-change');
    }

    _emit(name) {
      const frames = this._frames();
      const idx = this._idx();
      this.dispatchEvent(new CustomEvent('c3d:' + name, {
        detail: { idx: idx, mode: this.mode, frame: frames[idx] },
        bubbles: true,
      }));
    }

    _renderShell() {
      const slotsHTML = this.has360 ? this.spinFrames.map((f, i) => `
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
      if (al) al.addEventListener('click', () => this.setIdx(this.spinIdx - 1));
      if (ar) ar.addEventListener('click', () => this.setIdx(this.spinIdx + 1));

      this.querySelectorAll('.c3d-slot').forEach(slot => {
        slot.addEventListener('click', () => {
          const i = parseInt(slot.dataset.slot, 10);
          if (i !== this.spinIdx) this.setIdx(i);
        });
      });
    }

    _renderModeView() {
      const stage = this.querySelector('.c3d-stage');
      const flat = this.querySelector('.c3d-flat');
      const ring = this.querySelector('.c3d-360');
      const lbl = this.querySelector('.c3d-toggle .c3d-lbl');
      const frames = this._frames();
      const idx = this._idx();
      const cur = frames[idx];
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
      }
    }

    _updateSlotPositions() {
      const N = this.spinFrames.length;
      if (N === 0) return;
      const idx = this.spinIdx;
      this.querySelectorAll('.c3d-slot').forEach(slot => {
        const i = parseInt(slot.dataset.slot, 10);
        let d = ((i - idx) % N + N) % N;
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
          if (e.key === 'ArrowRight') { e.preventDefault(); this.setIdx(this.spinIdx + 1); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); this.setIdx(this.spinIdx - 1); }
          else if (e.key === 'Escape') { e.preventDefault(); this.setMode('flat'); }
        } else {
          if (this.flatFrames.length <= 1) return;
          if (e.key === 'ArrowRight') { e.preventDefault(); this.setIdx(this.flatIdx + 1); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); this.setIdx(this.flatIdx - 1); }
        }
      };
      window.addEventListener('keydown', this._keyHandler);
    }

    _renderDots() {
      const dotsEl = this.querySelector('.c3d-dots');
      if (!dotsEl) return;
      // Mobile-only, flat-mode-only, multi-image-only.
      const showDots = this.isMobile && this.mode === 'flat' && this.flatFrames.length > 1;
      dotsEl.hidden = !showDots;
      if (!showDots) return;
      dotsEl.innerHTML = this.flatFrames.map((_, i) =>
        `<button class="c3d-dot${i === this.flatIdx ? ' active' : ''}" type="button" data-dot="${i}" aria-label="Görsel ${i + 1}"></button>`
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
        if (this.mode !== 'flat' || this.flatFrames.length <= 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        deltaX = 0;
        isHoriz = false;
      }, { passive: true });

      flat.addEventListener('touchmove', (e) => {
        if (this.mode !== 'flat' || this.flatFrames.length <= 1) return;
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
          this.setIdx(deltaX < 0 ? this.flatIdx + 1 : this.flatIdx - 1);
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
