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
 *   N>=4     → flat default + 360 toggle, IF data-has-360="true". Otherwise
 *              flat-only with idx switching (e.g. 4 plain images, no
 *              dedicated turntable shot).
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
  const POS = {
    '-1': { l: 18, t: 50, s: 0.55, o: 0.95, z: 3 },
    '0':  { l: 50, t: 50, s: 1.00, o: 1.00, z: 6 },
    '1':  { l: 82, t: 50, s: 0.55, o: 0.95, z: 3 },
    '2':  { l: 50, t: 50, s: 0.10, o: 0.00, z: 0 },
    '-2': { l: 50, t: 50, s: 0.10, o: 0.00, z: 0 },
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
      this.has360 = this.dataset.has360 === 'true' && this.frames.length >= 4;
      this.idx = 0;
      this.mode = 'flat';

      if (!this.frames.length) { this._renderEmpty(); return; }

      this._renderShell();
      this._renderModeView();
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
      this._emit('idx-change');
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
        slot.style.top = p.t + '%';
        slot.style.transform = 'translate(-50%, -50%) scale(' + p.s + ')';
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
        if (this.mode !== '360') return;
        if (e.key === 'ArrowRight') { e.preventDefault(); this.setIdx(this.idx + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); this.setIdx(this.idx - 1); }
        else if (e.key === 'Escape') { e.preventDefault(); this.setMode('flat'); }
      };
      window.addEventListener('keydown', this._keyHandler);
    }

    _observeResize() {
      if (typeof ResizeObserver === 'undefined') return;
      this._ro = new ResizeObserver(() => {
        if (this.mode === '360') this._updateSlotPositions();
      });
      this._ro.observe(this);
    }
  }

  customElements.define('carousel-3d', Carousel3D);
})();
