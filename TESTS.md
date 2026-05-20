# over2you — Manuel QA + Regresyon

Bu dosya QA session'larında uçtan-uca senaryoları + sayfa-sayfa kontrol noktalarını listeler.

**Otomatik regresyon:** `npm run eyeball`
**Precondition:** Yerel-target script'ler `astro preview` ayağa kalkmış olmasını bekler (port 4321). Prod-target script'ler `https://over2you.shop` üzerinden çalışır — son commit'in deploy edilmiş olduğunu varsayar.

```bash
# Tipik QA akışı
npm run build && npx astro preview --port 4321 &
sleep 3
npm run eyeball         # 15 script, ilk fail'de durur
# veya gruplar
npm run eyeball:pdp     # 5 PDP senaryosu (yerel)
npm run eyeball:mobile  # 4 mobile senaryosu (yerel)
npm run eyeball:shop    # 1 shop OOS senaryosu (yerel)
npm run eyeball:misc    # 3 misc senaryosu (cart/multi/360-counter)
```

Pre-push hook YOK — preview olmadan eyeball'ların yarısı fail eder, otomasyon kıvamında değil. Push öncesi manuel `npm run eyeball` çalıştır.

---

## Senaryo 1 — Müşteri yeni ürün ekler (admin)

**Persona:** Brand owner. **Sayfa:** `/admin`

### Ürün temel bilgileri
1. Admin'e login (basic auth)
2. "Yeni ürün ekle" → form açılır
3. İsim, fiyat, kategori, açıklama doldur
4. Beden listesi gir (S,M,L,XL) [G2 admin]

### Görsel upload
5. Drag-drop ile 3-5 ürün foto upload [G7]
6. Thumb preview görünür, order badge 1/2/3 sıralı [G7]
7. Drag-drop reorder çalışır

### 360 viewer
8. "Mod" select: rotation (default) veya showcase [G6-PR3]
9. 2-6 slot foto upload (2 min, 6 max, partial OK) [G6-PR3]
10. 1 dolu slot → save button DISABLED + kırmızı hint "1/2" [G6-PR3 guard]
11. Flip checkbox per slot — sol-yüzlü model için işaretle [G6-PR1]
12. Showcase mode'da slot label yaz (opsiyonel, "Erkek Ön" vb.) [G6-PR3]

### Stok
13. Üst seviye stockQty veya size grid doldur [G2 admin]
14. Bulk modal "her bedene N adet eşit dağıt" çalışır [G2]

### Save
15. Save → `products.json` güncellenir
16. Storefront'ta yeni ürün shop'ta görünür

---

## Senaryo 2 — Müşteri stok günceller (admin)

**Persona:** Brand owner. **Sayfa:** `/admin`

1. Mevcut ürünü edit
2. Size grid'de bir size stoğunu 0'a getir [G2 admin]
3. Save → PDP'de o size disabled (line-through + opacity 0.4) [G2]
4. Color advanced section'da bir color için ayrı sizeStock `{S:0, M:3}` → save [G2]
5. PDP'de o color seçildiğinde S disabled, başka color'larda S enabled [G2]
6. Bulk modal "Toplam stok ata" mode → stockQty güncellenir, sizeStock değişmez [G2]
7. outOfStock checkbox → master override, tüm size'lar disabled + button "STOKTA YOK" [G2]

---

## Senaryo 3 — Müşteri renk variant ekler (admin)

**Persona:** Brand owner. **Sayfa:** `/admin`

1. Mevcut ürünü edit, "Renkler" section'a in
2. Yeni color ekle: ad, hex
3. Advanced toggle aç [G7]
4. Color foto upload (drag-drop, multi, reorder) [G7]
5. Per-color sizeStock grid doldur [G2]
6. Per-color 360 row 2-6 slot upload [G6-PR3]
7. Per-color flip ↔ toggle (slot küçük, sağ-alt buton) [G6-PR1]
8. Save → storefront'ta PDP'de swatch görünür
9. Storefront PDP: yeni color swatch'a tıkla → görseller değişir [G1]
10. Color'ın kendi 360'ı varsa toggle visible, yoksa hidden [G1 color-accurate]

---

## Senaryo 4 — Kullanıcı PDP'de gezer + sepete ekler (desktop)

**Persona:** Shopper desktop. **Sayfa:** `/shop`, `/product`

### Shop
1. `/shop` → ürün card'ları görünür
2. Stokta olmayan ürün (outOfStock veya stockQty=0) → "STOKTA YOK" badge sağ üst [G5-batch-A]
3. Stokta olan veya bilinmeyen ürün → badge yok [G5-batch-A]
4. Card'a tıkla → PDP açılır

### PDP açılış
5. BDG PDP → TAN default, ana foto bdg-jacket-front [G1]
6. Thumb[1] tıkla → ana foto değişir (1:1 mapping, off-by-N yok) [G1-A]
7. TAN → BLACK swatch → BLACK foto, 360 toggle disappear (BLACK'in kendi 360'ı yok) [G1 color-accurate]
8. BLACK → TAN → 360 toggle geri (stale-stage fix) [G1]
9. Counter overlay (eski "04/04 · FRONT") YOK [G6-PR1]

### Magnify
10. TAN flat foto hover → magnify lens görünür [G6-PR2]
11. Swatch click → tekrar hover → magnify hâlâ çalışır (lens DOM preserve) [G6-PR2 G4 fix]
12. 360 mode aç → center slot hover → magnify lens 360'da uygulanır [G6-PR2]
13. Arrow → idx değişir → lens bg refresh [G6-PR2]

### Stok + sepet
14. M size seç → add-to-cart enabled [G2]
15. Sepete ekle → cart drawer açılır
16. Aynı M'i 4. kez ekle (sizeStock=3) → toast "Stokta sadece 3 adet kaldı" [G2 hard limit]
17. Cart drawer'da "Renk: TAN · Beden: M · 3x" görünür
18. Cart drawer + butonu ile qty++ → stok limitinde dururur, toast tekrar [G2]

---

## Senaryo 5 — Mobil kullanıcı zoom yapar

**Persona:** Mobile shopper (iPhone Safari / Android Chrome). **Sayfa:** `/product`

### Touch + scroll
1. PDP aç (mobil viewport)
2. Yatay swipe foto üstünde → carousel ilerler, sayfa kaymaz [G3 scroll routing]
3. Dikey swipe → sayfa kayar (mevcut e-commerce convention) [G3]
4. Diagonal swipe (hafif aşağı + yan) → sayfa kaymaz, widget yatay çalışır [G3 touch-action: pan-y]

### Lightbox + pinch
5. Ana foto tıkla → lightbox açılır [G3 mobile tap]
6. İlk açılışta "🤏 İki parmakla yakınlaştır" hint 2.5s [G5-batch-A]
7. Pinch out → 1-4x zoom [G3]
8. Zoomed iken 1-finger drag → image pan, sayfa kaymaz [G3 pan + boundary clamp]
9. Pinch sonrası 1 parmağı kaldır, kalanla drag → pan başlar (lazy pan) [G5-batch-A]
10. iOS Safari pull-to-refresh tetiklenmiyor [G3 overscroll-behavior]
11. × tap → lightbox close (image scaled olsa bile button erişilebilir) [G3 z-index]
12. Tekrar aç → hint görünmüyor (localStorage flag) [G5-batch-A]

---

## Senaryo 6 — Kullanıcı 360 viewer kullanır

**Persona:** Shopper desktop + mobile. **Sayfa:** `/product`

### Desktop rotation mode
1. "VIEW 360°" toggle tıkla → cylinder ring döner [G6-PR3]
2. ← → tuşları → frame değişir
3. Side slot tıkla → o frame center'a gelir
4. Center slot hover → magnify lens 360'a uygulanır [G6-PR2]
5. Center slot tıkla → spin frame lightbox açılır [G3-C]
6. Counter görünmüyor (eski "04/04 · FRONT" yok) [G6-PR1]

### Sol-yüzlü model (flip)
7. Admin'de flip=true ile yüklenmiş frame'e geç → görsel sola bakıyor [G6-PR1 flip user-controlled]
8. Default (flip=false) frame → natural orientation
9. Lightbox'ta flip korunur, pinch + pan'da da [G3]

### Rotation mode 2-6 frame
10. 2-frame ürün → toggle visible, ring döner (asimetrik kabul, sağ slot only) [G6-PR3]
11. 4-frame ürün (BDG legacy) → ring + arka 2 slot wrap [G6-PR3 regression]
12. 6-frame ürün → ön 3 visible + arka 3 wrap [G6-PR3]

### Showcase mode
13. Showcase mode ürün PDP'de → 360 toggle YOK [G6-PR3]
14. Thumb rail'de tüm images + images360 concat → kullanıcı tıklayıp gezer [G6-PR3]
15. Storefront'ta label görünmez (sadece admin organization) [G6-PR3]

---

## Regresyon Paneli

Her push öncesi `npm run eyeball` PASS olmalı (preview 4321'de ayakta + son commit prod'a deploy edilmiş).

| Grup | Komut | Script'ler | Hedef |
|---|---|---|---|
| Hepsi | `npm run eyeball` | tüm `eyeball-*.cjs` sırayla, ilk fail'de durur | karma (yerel + prod) |
| PDP | `npm run eyeball:pdp` | thumbs · swatches · sizestock · magnify · 360-partial | thumbs/swatches: PROD, kalanı YEREL |
| Mobile | `npm run eyeball:mobile` | zoom · pan · scroll · pinch-hint | YEREL (preview) |
| Shop | `npm run eyeball:shop` | shop-oos | YEREL (preview) |
| Misc | `npm run eyeball:misc` | 360-counter · cart · multi | counter: YEREL, cart/multi: PROD |

**Yerel-only hızlı doğrulama** (preview ayakta, prod'a dokunmadan):

```bash
npm run eyeball:mobile && npm run eyeball:shop && \
  node scripts/eyeball-pdp-sizestock.cjs scripts/eyeball-pdp-magnify.cjs \
       scripts/eyeball-pdp-360-partial.cjs scripts/eyeball-360-counter.cjs
```

**Prod-only smoke** (deploy sonrası):

```bash
node scripts/eyeball-pdp-thumbs.cjs && \
  node scripts/eyeball-pdp-swatches.cjs && \
  node scripts/eyeball-cart.cjs
```

---

## G5 Backlog — Açık Konular

### Müşteri-bekleyen / data fix (kod fix değil)
- **"001" admin re-upload:** `id=2` ürünün `images[]`'ında manken upload edilmiş, gerçek düz ürün foto ile re-upload gerek. PDP'de manken görünmesinin sebebi bu veri yanlışlığı, kod doğru çalışıyor.
- **BDG mock ürün:** gerçek katalog ürünü değil, müşteri ürünleri gelince çıkarılacak.
- **Real katalog ürünleri:** müşteriden gelecek (foto + isim + fiyat + colors[]).

### Kod backlog (v2 — gelecek sprint)
- **POS table side-far visible (N≥5):** cylinder ring'de en uzaktaki frame'ler off-stage (`opacity: 0`); 5-6 frame için zenginleştirilebilir [G6 deferred].
- **360 drag-to-rotate (mobile):** şu an arrow + slot tap var, swipe-to-rotate eklenebilir [G6 deferred].
- **Per-color showcase mode admin UI override:** save path hazır, admin UI yok [G6-PR3 deferred].
- **Timestamp-based pinch hint re-show:** 90-day re-show, şu an localStorage tek-defa [G5-batch-A advisor flag].
- **Eyeball lazy pan synthetic limit:** mevcut eyeball TouchEvent dispatch ile, gerçek iOS Safari/Android Chrome timing test edilemiyor. Manuel QA Senaryo 5 adım 9 doğrular.

### Kod backlog (v3 — uzak gelecek)
- **In-place PDP magnify (mobile tap-and-hold):** desktop magnify mobile'da yok, alternative pattern. Lightbox + pinch yeterli bulunduysa skip [G3 deferred].
- **Safari "unknown download" eski Mac 2015:** ayrı debug session [Turn 25 açık].

### Infra / hygiene
- **Cylinder center top_y -248 head overflow + ghost shadow:** eski v3 backlog, 360 mode'da görsel artifakt. Ahmet manuel inceleyip "hâlâ var" derse fix turn [Turn 22 D defer].
- **Sylvan vault sanitize:** MEMORY+IDENTITY.md plaintext token, `/root/sylvan-vault/`'a move.
- **Cloudflare cache purge protokolü:** prod deploy sonrası asset güncellenmiyorsa CF purge nasıl yapılır belgelensin.
- **Pre-push hook husky/lefthook ile:** preview otomatik ayağa kaldırma + eyeball sıralı çalışma. Şu an manuel.
- **eyeball-360.cjs + eyeball-cart-tan.cjs sub-script'lerde değil:** sırasıyla legacy + spesifik test, gerekirse `eyeball:misc`'e dahil et veya kaldır.

---

## Grup Tag Sözlüğü

| Tag | İçerik | Commit'ler |
|---|---|---|
| G1 | PDP gallery unification + color-accurate 360 + stale-stage | 8f30637 |
| G1-A | Flat/spin state split (thumb click no off-by-N) | c146386 |
| G2 | Size-level stock (sizeStock matrix) + cart hard limit | 886786f |
| G3 | Mobile touch — scroll lock + lightbox pan + 360 tap | 0064c30 |
| G6-PR1 | 360 counter remove + flip per-slot toggle | d15a2aa |
| G6-PR2 | Mode-aware magnify + lens DOM preserve (G4 fix) | a273769 |
| G6-PR3 | Partial 2-6 frame upload + dual-mode rotation/showcase | 043ed60 |
| G7 | Color image upload UX parity + isolated re-render | d0e6f46 |
| G5-batch-A | Shop OOS badge + pinch hint + lazy pan edge case | 1182683 |
| G5-batch-B | Eyeball orchestration + TESTS.md (this commit) | — |
