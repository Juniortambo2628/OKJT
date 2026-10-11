# Production Deployment Guide

Both halves of OKJTech run on the Hestia VPS (`102.212.246.224`) and deploy
automatically on every push to `main` (`.github/workflows/deploy.yml`):

| Part | Domain | How |
|---|---|---|
| Laravel API (`okjt-app/backend`) | `api.okjtech.co.ke` | `deploy-laravel.yml` → `private/okjt-api` |
| Next.js site (`okjt-app/frontend`) | `okjtech.co.ke` | `deploy-next.yml` → PM2 `okjt-web` on :3100 |

Pipeline: lint/format autofix → backend tests → deploy API → deploy web.
The deploy system is the shared **deploy-kit** in this repo — read
[`deploy-kit/README.md`](deploy-kit/README.md) for the layout, what each deploy
does, rollback, and how other projects reuse it.

## Secrets (Settings → Secrets → Actions)

| Secret | Value |
|---|---|
| `VPS_HOST` / `VPS_PORT` / `VPS_USER` | `102.212.246.224` / `22` / `dev` |
| `VPS_SSH_KEY` | private deploy key (same one TFE uses) |
| `VPS_KNOWN_HOSTS` | output of `ssh-keyscan -p 22 102.212.246.224` |
| `BACKEND_ENV` | full Laravel `.env` (MySQL creds from Hestia, `APP_KEY` from the old server) |
| `FRONTEND_ENV` | `NEXT_PUBLIC_API_URL=https://api.okjtech.co.ke/api`, `NEXT_PUBLIC_APP_URL=…`, `NEXT_PUBLIC_PUSHER_*`, `NEXT_REVALIDATION_SECRET=…` |

The old `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER`, `SSH_PORT` secrets (shared
host `51.89.113.223`) are no longer used.

## First deploy (one time)

1. Hestia (user `dev`): add web domains `okjtech.co.ke` and `api.okjtech.co.ke`;
   create the MySQL database.
2. As root on the VPS:
   ```bash
   curl -fsSLo /root/new-site.sh https://raw.githubusercontent.com/Juniortambo2628/OKJT/main/deploy-kit/server/new-site.sh
   bash /root/new-site.sh laravel api.okjtech.co.ke okjt-api
   bash /root/new-site.sh next    okjtech.co.ke     okjt-web 3100
   ```
   (Private repo? copy the file over with scp instead of curl.)
3. Import data as `dev`: DB dump with `mariadb -u dev_USER -p dev_DB < dump.sql`;
   uploads (old `okj-core/storage/app/public`) into
   `~/web/api.okjtech.co.ke/private/okjt-api/shared/storage/app/public`.
4. Merge to `main`; both deploy jobs must end with `Verification passed`.
5. Cutover: hosts-file test both domains → switch the `A` records for
   `okjtech.co.ke`, `www` and `api` to the VPS → Hestia SSL + Let's Encrypt +
   HTTPS redirect on both → `APP_ENV=production` in `BACKEND_ENV` → re-run.
6. Disconnect the Vercel project so it stops building `main`.
