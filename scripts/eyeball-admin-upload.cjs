// Admin upload contract — verifies POST /api/upload behavior after the 2026-05-22
// Safari 413 fix. Hits the live over2you.shop endpoint with synthetic files and
// asserts: 200 for valid JPG, 413 for oversized, 415 for HEIC + non-image MIME.
// Also asserts every non-2xx body is JSON {error:string} so the admin toast never
// bottoms out to an empty Safari statusText again.
//
// Auth: signs a session token directly from /opt/over2you-cms/.env's SESSION_SECRET
// (same HMAC scheme as index.js signToken). No real admin password needed.
// Skips silently when SESSION_SECRET not present (dev environments) so the
// npm run eyeball aggregator still passes.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE = process.env.ADMIN_UPLOAD_BASE || 'https://over2you.shop';
const ENV_PATH = process.env.ADMIN_CMS_ENV || '/opt/over2you-cms/.env';

function readSessionSecret() {
  try {
    const raw = fs.readFileSync(ENV_PATH, 'utf8');
    const m = raw.match(/^SESSION_SECRET=(.+)$/m);
    return m ? m[1].trim() : null;
  } catch { return null; }
}

function signToken(secret, payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 60_000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

async function upload(token, filename, mime, bytes) {
  const fd = new FormData();
  fd.append('image', new Blob([bytes], { type: mime }), filename);
  const r = await fetch(`${BASE}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  let body = null;
  try { body = await r.json(); } catch { body = { _parseError: true }; }
  return { status: r.status, body };
}

const STAMP = 'eyeball-test-' + Date.now();
const uploadedFilenames = [];

function record(name, ok, detail) {
  const tag = ok ? 'PASS' : 'FAIL';
  console.log(`  [${tag}] ${name}${detail ? ' — ' + detail : ''}`);
  return ok;
}

(async () => {
  console.log('=== eyeball-admin-upload ===');
  console.log(`base: ${BASE}`);

  const secret = readSessionSecret();
  if (!secret) {
    console.log(`SKIP — SESSION_SECRET not readable at ${ENV_PATH} (dev environment?)`);
    process.exit(0);
  }
  const token = signToken(secret, { username: 'eyeball', role: 'admin' });

  let allPass = true;

  // Test 1: valid 1MB JPG → 200 + {url, filename}
  {
    const filename = `${STAMP}-valid.jpg`;
    const bytes = Buffer.alloc(1024 * 1024, 0xff);
    const { status, body } = await upload(token, filename, 'image/jpeg', bytes);
    const ok = status === 200 && typeof body.url === 'string' && body.url.startsWith('img/products/');
    allPass = record('valid jpg → 200 + url', ok, `status=${status} url=${body.url}`) && allPass;
    if (ok) uploadedFilenames.push(body.filename);
  }

  // Test 2: oversized JPG (25MB) → 413 + JSON error
  {
    const filename = `${STAMP}-toobig.jpg`;
    const bytes = Buffer.alloc(25 * 1024 * 1024, 0x00);
    const { status, body } = await upload(token, filename, 'image/jpeg', bytes);
    // Could be 413 from nginx (HTML) OR 413 from multer (JSON). After fix, nginx
    // body limit is 50m so this 25MB request passes nginx but multer's 20MB cap
    // rejects it. Multer error → JSON {error}.
    const okStatus = status === 413;
    const okBody = typeof body.error === 'string' && body.error.length > 0;
    allPass = record('25MB jpg → 413 + dolu error', okStatus && okBody, `status=${status} error="${body.error || ''}"`) && allPass;
  }

  // Test 3: HEIC mime → 415 + JSON error mentioning HEIC
  {
    const filename = `${STAMP}.heic`;
    const bytes = Buffer.alloc(2 * 1024 * 1024, 0xaa);
    const { status, body } = await upload(token, filename, 'image/heic', bytes);
    const ok = status === 415 && typeof body.error === 'string' && /HEIC/i.test(body.error);
    allPass = record('heic mime → 415 + HEIC reason', ok, `status=${status} error="${body.error || ''}"`) && allPass;
  }

  // Test 4: non-image MIME (text/plain) → 415 + JSON error
  {
    const filename = `${STAMP}.txt`;
    const bytes = Buffer.from('hello world', 'utf8');
    const { status, body } = await upload(token, filename, 'text/plain', bytes);
    const ok = status === 415 && typeof body.error === 'string' && body.error.length > 0;
    allPass = record('text/plain → 415 + dolu error', ok, `status=${status} error="${body.error || ''}"`) && allPass;
  }

  // Cleanup: delete eyeball-test-* from both dist and public dirs
  const cleanupDirs = [
    '/root/projects/over2you-v2/dist/img/products',
    '/root/projects/over2you-v2/public/img/products',
  ];
  for (const dir of cleanupDirs) {
    try {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (f.startsWith(STAMP)) {
          try { fs.unlinkSync(path.join(dir, f)); } catch {}
        }
      }
    } catch {}
  }
  console.log(`cleanup: removed ${STAMP}-* from dist + public`);

  if (!allPass) {
    console.log('FAIL — see above');
    process.exit(1);
  }
  console.log('OK — all admin-upload contract assertions held');
})().catch(e => {
  console.error('SCRIPT ERROR:', e && e.stack || e);
  process.exit(1);
});
