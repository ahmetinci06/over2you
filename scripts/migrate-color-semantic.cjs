// G9 migration — collapse top-level color/colorName/colorFamily into colors[]
// (the canonical variant array) and drop the per-color `default` flag in favour
// of array-position-zero-is-primary semantics. Idempotent: a product already in
// the new shape is reported as CASE C and untouched.
//
// Cases:
//   A — colors[] non-empty AND top-level color present
//       → keep colors, drop default flags, reorder so the entry with default:true
//         goes to index 0, then strip product.color/colorName/colorFamily
//   B — colors[] empty AND top-level color present
//       → synth colors[0] from top-level fields (id 'primary', preserves the
//         product's existing images / sizeStock / images360 so the new variant
//         keeps its content), then strip top-level
//   C — colors[] non-empty AND top-level color absent → already migrated, no-op
//   D — colors[] empty AND top-level absent → bare product, also no-op
//
// Backup files (products.json.bak.YYYYMMDD-HHMMSS) are written next to each
// source. Rollback: cp the .bak over the live file + pm2 restart over2you-cms.
//
// Usage:
//   node scripts/migrate-color-semantic.cjs --dry-run   # diff only
//   node scripts/migrate-color-semantic.cjs             # write

const fs = require('fs');
const path = require('path');

const TARGETS = [
  path.join(__dirname, '..', 'public', 'data', 'products.json'),
  path.join(__dirname, '..', 'dist',   'data', 'products.json'),
];

const dryRun = process.argv.includes('--dry-run');

function timestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function hasTopLevelColor(p) {
  return (typeof p.color === 'string' && p.color.trim() !== '') ||
         (typeof p.colorName === 'string' && p.colorName.trim() !== '') ||
         (typeof p.colorFamily === 'string' && p.colorFamily.trim() !== '');
}

function migrateProduct(p) {
  const colors = Array.isArray(p.colors) ? p.colors : [];
  const topPresent = hasTopLevelColor(p);
  let caseTag, after;

  if (colors.length === 0 && !topPresent) {
    return { caseTag: 'D', changed: false, after: p };
  }

  if (colors.length > 0 && !topPresent) {
    // Idempotent — still need to ensure default flag is removed and order is canonical.
    const hasDefaultFlag = colors.some(c => 'default' in c);
    if (!hasDefaultFlag) return { caseTag: 'C', changed: false, after: p };
    // Reorder if a non-zero entry has default:true
    const defIdx = colors.findIndex(c => c.default === true);
    const reordered = (defIdx > 0)
      ? [colors[defIdx], ...colors.slice(0, defIdx), ...colors.slice(defIdx + 1)]
      : colors;
    const stripped = reordered.map(({ default: _ignored, ...rest }) => rest);
    return { caseTag: 'C', changed: true, after: { ...p, colors: stripped } };
  }

  if (colors.length > 0 && topPresent) {
    // CASE A — full collapse
    const defIdx = colors.findIndex(c => c.default === true);
    const reordered = (defIdx > 0)
      ? [colors[defIdx], ...colors.slice(0, defIdx), ...colors.slice(defIdx + 1)]
      : colors;
    const stripped = reordered.map(({ default: _ignored, ...rest }) => rest);
    const { color: _c, colorName: _cn, colorFamily: _cf, ...withoutTop } = p;
    return { caseTag: 'A', changed: true, after: { ...withoutTop, colors: stripped } };
  }

  // CASE B — empty colors + top-level present → synth
  const synth = {
    id: 'primary',
    name: (p.colorName && p.colorName.trim()) || 'Renk',
    hex: (typeof p.color === 'string' && p.color) || '#000000',
  };
  // Family carries forward as a colors-level field for future filtering.
  if (p.colorFamily && p.colorFamily.trim()) synth.family = p.colorFamily.trim();
  // Move product-level images / sizeStock / images360 / images360Mode INTO
  // the synth variant so the customer-facing render preserves the content
  // they uploaded against the top-level fields. The product-level fields
  // remain (cart + PDP fallback paths still read product.images), but the
  // synth color also carries them so future colors[] consumers can find them.
  if (Array.isArray(p.images) && p.images.length > 0) synth.images = [...p.images];
  if (p.sizeStock && typeof p.sizeStock === 'object') synth.sizeStock = { ...p.sizeStock };
  if (typeof p.stockQty === 'number') synth.stock = p.stockQty;
  if (Array.isArray(p.images360) && p.images360.length > 0) synth.images360 = JSON.parse(JSON.stringify(p.images360));
  if (typeof p.images360Mode === 'string') synth.images360Mode = p.images360Mode;
  const { color: _c, colorName: _cn, colorFamily: _cf, ...withoutTop } = p;
  return { caseTag: 'B', changed: true, after: { ...withoutTop, colors: [synth] } };
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP — ${filePath} missing`);
    return { skipped: true };
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const products = JSON.parse(raw);
  if (!Array.isArray(products)) {
    console.log(`SKIP — ${filePath} not an array`);
    return { skipped: true };
  }

  const summary = { A: [], B: [], C: [], D: [] };
  const out = products.map(p => {
    const { caseTag, changed, after } = migrateProduct(p);
    if (changed) summary[caseTag].push(p.id);
    else if (caseTag === 'C' || caseTag === 'D') summary[caseTag].push(p.id);
    return after;
  });

  console.log(`\n=== ${filePath} ===`);
  for (const [tag, ids] of Object.entries(summary)) {
    if (ids.length === 0) continue;
    const label = {
      A: 'CASE A (collapse top+colors)',
      B: 'CASE B (synth from top-level)',
      C: 'CASE C (already migrated / flag-strip only)',
      D: 'CASE D (bare, no color anywhere)',
    }[tag];
    console.log(`  ${label}: [${ids.join(', ')}]`);
  }

  // Diff preview — show full JSON diff per product for transparency in dry-run
  if (dryRun) {
    for (let i = 0; i < products.length; i++) {
      if (JSON.stringify(products[i]) === JSON.stringify(out[i])) continue;
      console.log(`\n  --- diff product id=${products[i].id} (${products[i].name || '?'}) ---`);
      const beforeKeys = Object.keys(products[i]).sort();
      const afterKeys = Object.keys(out[i]).sort();
      const removed = beforeKeys.filter(k => !afterKeys.includes(k));
      const added = afterKeys.filter(k => !beforeKeys.includes(k));
      const changedKeys = beforeKeys.filter(k => afterKeys.includes(k) && JSON.stringify(products[i][k]) !== JSON.stringify(out[i][k]));
      if (removed.length) console.log(`    removed: ${removed.join(', ')}`);
      if (added.length) console.log(`    added:   ${added.join(', ')}`);
      for (const k of changedKeys) {
        const bef = JSON.stringify(products[i][k]);
        const aft = JSON.stringify(out[i][k]);
        const truncate = s => s.length > 200 ? s.slice(0, 200) + '...' : s;
        console.log(`    ${k}: ${truncate(bef)} → ${truncate(aft)}`);
      }
    }
  }

  if (dryRun) {
    console.log(`  (dry-run) no write`);
    return { summary, written: false };
  }

  // Backup before write
  const backupPath = `${filePath}.bak.${timestamp()}`;
  fs.writeFileSync(backupPath, raw);
  fs.writeFileSync(filePath, JSON.stringify(out, null, 2));
  console.log(`  backup: ${backupPath}`);
  console.log(`  wrote: ${filePath}`);
  return { summary, written: true, backupPath };
}

console.log(dryRun ? '*** DRY RUN (no writes) ***' : '*** REAL RUN ***');
for (const t of TARGETS) processFile(t);
console.log('\ndone');
