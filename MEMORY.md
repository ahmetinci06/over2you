# over2you — Project Memory

Bu dosya proje tarihçesini ve uzun vadeli kararları özetler.
Manuel QA: TESTS.md. Otomatik regresyon: `npm run eyeball`.

---

## Sprint Tarihçesi

### 2026-05-07 — Renk variant + form UX sprint (turns 10-23, ~30+ commit)
- Colors[] schema (opsiyonel, fallback sync), cart variant-aware (Cart.add ile size+color dedupe)
- Admin: 5 details accordion, drag-drop+thumb reorder, per-color 360 4-slot
- Form polish, bulk edit, footer redesign, Footer.astro extract, about TR, mobile drawer, social minimalist, legal-vars.json
- Auth: bcrypt+HMAC, admin password rotate
- PDP lightbox, mobile swipe, i18n EN
- Newsletter subscribe + CSV export, bundle dormant (bundleWith[]), soft-delete + undo toast
- 360 viewer: D POS center 0.92 + side 0.65 + floor 0.06; E1 magnify lens 220px; E2 pinch 1-4x + double-tap
- Eyeball infra: playwright+chromium VPS, scripts/eyeball-*.cjs reusable

### 2026-05-18 — Hygiene + G1/G1-A/G7/G2 (5 commit)
- **e682c77** chore(cms): hero buttonLink hygiene (pages/shop.html → /shop)
- **8f30637** feat(pdp): G1 effectiveGallery + color-accurate 360 + stale-stage fix
- **c146386** feat(pdp): G1-A carousel state split (flatFrames+spinFrames, thumb 1:1, mode idx restore, data-flat-frames opsiyonel)
- **8a23256** chore(scripts): G1-A eyeball-pdp-thumbs + eyeball-pdp-swatches reusable
- **d0e6f46** feat(admin): G7 color upload UX parity + renderColorRail(i) izole re-render
- **886786f** feat(stock): G2 size × color stock matrix + cart hard limit (window.O2Y.effectiveStock strict + effectiveStockSum + toast)

### 2026-05-19 — G6 + G3 + G5 (6 commit)
- **d15a2aa** feat(360): G6-PR1 counter remove + flip per-slot user checkbox (asıl bug: SLOT_DEFS side-l flip:true hardcoded)
- **a273769** feat(pdp): G6-PR2 magnify mode-aware + G4 stage rebuild lens preserve (oldCarousel.replaceWith atomic swap)
- **043ed60** feat(360): G6-PR3 partial 2-6 frame + max 6 cap + dual-mode rotation/showcase
- **0064c30** feat(pdp): G3 mobile touch — scroll routing + lightbox pan + 360 tap-to-lightbox
- **1182683** feat(polish): G5-batch-A shop OOS badge + pinch hint + G3 lazy pan edge case
- **ce2b511** chore(test): G5-batch-B npm scripts + TESTS.md (6 senaryo, b+c hibrit)

---

## Mimari Notlar

### Helpers (window.O2Y namespace)
- `effectiveGallery(product, color, baseImages, baseFrames360)` → `{eImages, eFrames360, eHas360, eFlatImages, eThumbs}`. Color path strict, base fallback yok cross-color.
- `effectiveStock(product, color, size)` → number|null. Color path strict, outOfStock=true → 0.
- `effectiveStockSum(product, color)` → number|null. Sum sizeStock veya total stock.
- `toast(msg, opts)` → bottom-center single slot, idempotent CSS.

### Schema (products.json — opsiyonel field'lar)
- `product.sizeStock?: { S: 5, M: 3 }` — color yoksa top-level
- `colors[i].sizeStock?` — color × size matrix
- `colors[i].stock?` — color toplam, fallback (G2)
- `product.images360Mode?: 'rotation' | 'showcase'` — default 'rotation' implicit
- `colors[i].images360Mode?` — per-color override
- `images360[i].flip?` — user-controlled per-slot checkbox (G6-PR1, eski hardcoded side-l flip:true silindi)

### Carousel-3d state model (G1-A split sonrası)
- `flatFrames` + `spinFrames` ayrı array
- `flatIdx` + `spinIdx` ayrı state
- `mode` 'flat' | '360', mode switch'te idx restore (back'teyken 360 aç-kapa → back kalır)
- Eşik: `spinFrames.length >= 2` (G6-PR3 öncesi 4 fixed idi)
- POS table N=2..6 robust, side-far (N≥5 d=±2) v2'de

### Deploy + cache
- `npm run build` = deploy adımı, nginx dist/ serve eder
- **Build hazardı:** `rm -rf dist` her seferinde, dist-only dosyalar uçar. `public/` altında static asset.
- Cache bust: `src/layouts/Layout.astro` `?v=N` query — şu an v=14 (G3'te artırıldı)

---

## Açık Konular

### Customer-pending (kod fix değil)
- **"001" admin re-upload:** id=2 ürünün `images[]`'ında manken upload edilmiş, düz ürün foto ile re-upload gerekli. PDP kod doğru, sadece veri yanlışlığı.
- **Real katalog ürünleri:** müşteriden gelecek (foto, isim, fiyat, colors[]).
- **BDG mock:** gerçek ürün değil, müşteri ürünleri gelince çıkarılacak.

### Kod backlog (v2 — gelecek sprint)
- POS table side-far visible (N≥5)
- 360 drag-to-rotate (mobile swipe)
- Per-color showcase mode admin UI override
- Timestamp-based pinch hint re-show (90-day)

### Kod backlog (v3 — uzak gelecek)
- In-place PDP magnify (mobile tap-and-hold)

### Açık bug'lar
- **Safari "unknown download" eski Mac 2015:** Root cause belirsiz. Hygiene commit (e682c77) settings.json'u temizledi ama gerçek bug çözümlenmedi. Repro için gerekli: Safari versiyonu, devtools network response (status, content-type, disposition), service worker durumu, Chrome aynı Mac'te karşılaştırma, inspect element `<a>` attrs.

### Infra / hygiene
- Cylinder center top_y -248 head overflow + ghost shadow (eski v3 backlog, 360 mode'da görsel artifakt — ahmet gözle "hâlâ var" diyerek confirm edince fix turn)
- Pre-push hook eklenmedi (yerel/prod hedef ayrımı agresif otomatize edilemez, TESTS.md manuel cadence belgeler)

---

## Eyeball Test Kapsamı (13 script)

| script | kapsam |
|---|---|
| eyeball-multi.cjs | 1920+375 screenshot + geometry (eski, turn 10) |
| eyeball-cart.cjs | Cart variant-aware (size+color dedupe) |
| eyeball-cart-tan.cjs | TAN variant cart flow spesifik |
| eyeball-360.cjs | Legacy 360 viewer geometry |
| eyeball-pdp-thumbs.cjs | G1-A thumb click idx mapping |
| eyeball-pdp-swatches.cjs | G1 color-accurate + stale-stage |
| eyeball-pdp-sizestock.cjs | G2 size disable + cart hard limit + toast |
| eyeball-360-counter.cjs | G6-PR1 counter gone + flip |
| eyeball-pdp-magnify.cjs | G6-PR2 mode-aware + G4 lens preserve |
| eyeball-pdp-360-partial.cjs | G6-PR3 2-6 frame + showcase |
| eyeball-mobile-zoom.cjs | G3 mobile lightbox + pinch synthetic |
| eyeball-mobile-pan.cjs | G3 lightbox pan + boundary clamp + lazy pan |
| eyeball-mobile-scroll.cjs | G3 yatay/dikey/diagonal swipe routing |
| eyeball-mobile-pinch-hint.cjs | G5-batch-A hint localStorage flag |
| eyeball-shop-oos.cjs | G5-batch-A stockQty=0 badge |

Total ~110 test PASS. `npm run eyeball` orchestration.

---

## Son Güncelleme

2026-05-19 — G5-batch-B shipped (ce2b511). G serisi tüm gruplar kapandı, müşteri QA session'a hazır.

Sonraki sprint'lerde bu dosyayı her shipped grup sonrası 1-2 satır güncelle. Detay TESTS.md ve git log'da.
