# Production Deployment Guide

OKJTech runs on the Hestia VPS (`102.212.246.224`) as **one Laravel app**:
the API, plus the public site and dashboard (`okjt-app/web`, a static React
app on the OKJT kit) built into its `public/`. nginx serves the app's files,
PHP-FPM answers `/api` and each page's HTML (with that page's title,
description and preview tags). **No Node process runs on the VPS**, and the
API runs no queue worker or scheduler.

It deploys on every push to `main` (`.github/workflows/deploy.yml`):
lint/format autofix → backend tests → build the kit, the site and the
dashboard → deploy through deploy-kit (`deploy-laravel.yml` with
`spa_dir: okjt-app/web`). See [`deploy-kit/README.md`](deploy-kit/README.md)
for the layout, what a deploy does, rollback, and how other projects reuse it.

| Domain | What answers |
|---|---|
| `okjtech.co.ke`, `www.okjtech.co.ke` | the site and the dashboard (`/admin`); the API under `/api` |
| `api.okjtech.co.ke` | the API (`/api/...`, `/storage/...`); any page address redirects to `okjtech.co.ke` |

All three are the same Hestia web domain (`api.okjtech.co.ke`, with the other
two as aliases), so the app keeps its folder: `~/web/api.okjtech.co.ke/private/okjt-api`
(releases, `shared/.env`, `shared/storage` with the uploads).

## Secrets (Settings → Secrets → Actions)

The five `VPS_*` secrets are shared with every project: set them with
`deploy-kit/local/set-vps-secrets.ps1 -Repos Juniortambo2628/OKJT`.

| Secret | Value |
|---|---|
| `VPS_HOST` / `VPS_PORT` / `VPS_USER` | `102.212.246.224` / `22` / `dev` |
| `VPS_SSH_KEY` | private deploy key (same one TFE uses) |
| `VPS_KNOWN_HOSTS` | output of `ssh-keyscan -p 22 102.212.246.224` |
| `BACKEND_ENV` | full Laravel `.env` (see below) |

The app needs no build-time secrets: it calls the API on its own domain
(`/api`). `FRONTEND_ENV` is no longer used and can be deleted.

In `BACKEND_ENV`, set (or check):

```
APP_URL=https://okjtech.co.ke
FRONTEND_URL=https://okjtech.co.ke,https://www.okjtech.co.ke
QUEUE_CONNECTION=sync
```

and remove `NEXT_URL` and `NEXT_REVALIDATION_SECRET`.

## Moving off Next.js (one time)

Until these steps are done, `okjtech.co.ke` keeps serving the old Next.js
site while the new one deploys to `api.okjtech.co.ke`. Check the new site
there first (its pages redirect to `FRONTEND_URL`, so set
`FRONTEND_URL=https://api.okjtech.co.ke` in `BACKEND_ENV` for that check, or
use a hosts-file entry).

1. Update `BACKEND_ENV` as above and merge to `main`. The deploy must end with
   `Verification passed`.
2. Hestia (user `dev`) → Web → `okjtech.co.ke` → **Delete** (the old Next.js
   proxy domain; this doesn't touch DNS or the API).
3. Hestia → Web → `api.okjtech.co.ke` → Edit → **Aliases**: add
   `okjtech.co.ke` and `www.okjtech.co.ke` → Save. Then tick **SSL** →
   **Let's Encrypt** (the certificate now covers the aliases) and
   **HTTPS redirect** → Save.
4. As `dev` on the VPS, stop the Node process and forget it:
   ```bash
   pm2 delete okjt-web; pm2 delete okjt-api-queue; pm2 delete okjt-api-scheduler; pm2 save
   ```
   (`okjt-api-queue` and `okjt-api-scheduler` are already gone if a deploy ran
   with `queue: false` and `scheduler: false`; the commands are harmless then.)
5. Check: `https://okjtech.co.ke`, a project page, `/admin` (sign in),
   `https://api.okjtech.co.ke/api/services`, and that an uploaded image under
   `/storage/uploads/...` loads.

DNS doesn't change: the `A` records for `okjtech.co.ke`, `www` and `api`
already point to the VPS.

## A new server (from scratch)

1. Hestia (user `dev`): add the web domain `api.okjtech.co.ke` with aliases
   `okjtech.co.ke` and `www.okjtech.co.ke`; create the MySQL database.
2. As root on the VPS:
   ```bash
   curl -fsSLo /root/new-site.sh https://raw.githubusercontent.com/Juniortambo2628/OKJT/main/deploy-kit/server/new-site.sh
   bash /root/new-site.sh laravel api.okjtech.co.ke okjt-api
   ```
3. Import data as `dev`: DB dump with `mariadb -u dev_USER -p dev_DB < dump.sql`;
   uploads into `~/web/api.okjtech.co.ke/private/okjt-api/shared/storage/app/public`.
4. Set the secrets, merge to `main`, then SSL (Let's Encrypt) and HTTPS
   redirect in Hestia.
