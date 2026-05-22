#!/usr/bin/env bash
# Install the repo-versioned over2you.shop nginx config to the live VPS
# location, validate it, and reload nginx. Refuses to overwrite when the
# live file has uncommitted hand-edits — diff first, commit, then re-run.
#
# Usage: sudo scripts/install-nginx.sh
# Env:
#   FORCE=1   bypass the drift guard (last resort, prefer commit-then-install)
#   QUIET=1   skip telegram notification on success

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${REPO_DIR}/infra/nginx/over2you.shop.conf"
DST="/etc/nginx/sites-available/over2you.shop"
ENABLED="/etc/nginx/sites-enabled/over2you.shop"
TG_NOTIFY="/opt/scripts/tg-notify.sh"

if [[ "$EUID" -ne 0 ]]; then
  echo "ERROR: must run as root (use sudo)" >&2
  exit 1
fi

if [[ ! -f "$SRC" ]]; then
  echo "ERROR: repo config missing at $SRC" >&2
  exit 1
fi

# Drift guard — if VPS copy differs from repo copy, refuse without FORCE
if [[ -f "$DST" ]] && ! diff -q "$DST" "$SRC" >/dev/null 2>&1; then
  if [[ "${FORCE:-0}" != "1" ]]; then
    echo "ERROR: $DST differs from $SRC — uncommitted VPS edits would be lost" >&2
    echo "  diff $DST $SRC      # inspect" >&2
    echo "  FORCE=1 $0          # bypass guard (only if you've already committed the diff)" >&2
    exit 1
  fi
  echo "WARN: FORCE=1 — overwriting VPS config; existing diff:"
  diff "$DST" "$SRC" || true
fi

cp "$SRC" "$DST"
ln -sf "$DST" "$ENABLED"

if ! nginx -t 2>&1; then
  echo "ERROR: nginx -t failed; not reloading" >&2
  [[ -x "$TG_NOTIFY" ]] && "$TG_NOTIFY" "install-nginx: nginx -t FAIL on over2you.shop config" alarm || true
  exit 1
fi

systemctl reload nginx
echo "OK: $DST installed and nginx reloaded"

if [[ "${QUIET:-0}" != "1" && -x "$TG_NOTIFY" ]]; then
  "$TG_NOTIFY" "install-nginx: over2you.shop config installed + nginx reloaded" info || true
fi
