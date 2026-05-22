# nginx config — over2you.shop

Source-controlled copy of `/etc/nginx/sites-available/over2you.shop` on the
production VPS (Hostinger KVM, 145.223.82.188). The live file is the source
of truth at runtime, but if it's lost (VPS rebuild, accidental delete,
config-management revert) this file is the recovery seed.

## Layout (G8 baseline, 2026-05-22)

- `/admin` + `/api/` proxy to over2you-cms (:3005, pm2-managed)
- `/api/` body limit: `client_max_body_size 50m;` — required for the
  Safari image upload fix (Turn 1 G8). Lowering this back to 10M
  silently reintroduces the customer-facing 413.
- Static root: `/root/projects/over2you-v2/dist` (astro build output)
- Cache headers: 1h for assets, no-cache for JSON

## Recovery

```bash
sudo cp infra/nginx/over2you.shop.conf /etc/nginx/sites-available/over2you.shop
sudo ln -sf /etc/nginx/sites-available/over2you.shop /etc/nginx/sites-enabled/over2you.shop
sudo nginx -t
sudo systemctl reload nginx
```

Or use the helper: `sudo scripts/install-nginx.sh` (validates + reloads +
telegram-notifies; see comments in the script).

## When this file drifts

If a hand-edit lands on the VPS and never makes it back here, the next
recovery will silently revert. After ANY change to
`/etc/nginx/sites-available/over2you.shop`:

```bash
diff /etc/nginx/sites-available/over2you.shop infra/nginx/over2you.shop.conf
# if not identical: cp + commit
```

The `scripts/install-nginx.sh` helper does the diff for you and refuses
to install when the VPS copy has uncommitted local edits.
