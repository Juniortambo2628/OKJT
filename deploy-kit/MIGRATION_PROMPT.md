# Migration prompt — move a project onto the Hestia VPS

Paste everything below the line into a new Claude Code session that has the
target repo attached. Fill in the `<…>` placeholders first.

---

Migrate **`<owner>/<repo>`** onto my Hestia VPS using my existing deploy-kit.
Inspect the repo first and give me a plan + a checklist of what I must prepare
BEFORE you write any files.

## The project
- Stack: `<Laravel | Laravel + Vite/React/Inertia | Laravel API + Next.js>`
- Laravel app folder in the repo: `<. or e.g. backend>`
- Next.js app folder (if any): `<e.g. frontend>`
- Domains: Laravel → `<api.example.okjtech.co.ke>`, Next.js → `<example.okjtech.co.ke>`
- Currently hosted on: `<cPanel / Vercel / nothing yet>`
- Needs queue worker: `<yes/no>` · scheduler: `<yes/no>` · seed on deploy: `<yes/no>`

## Where everything is
- **Deploy-kit** lives in `Juniortambo2628/OKJT` on `main` (read it there; do not copy it):
  - `.github/workflows/deploy-laravel.yml` — reusable workflow (`workflow_call`).
    Inputs: `domain, app_name, app_dir, php_version, node_version, build_assets,
    npm_flags, queue, scheduler, seed, post_migrate, health_path`. Secret `ENV_FILE`
    = the full production `.env`.
  - `.github/workflows/deploy-next.yml` — reusable; inputs `domain, app_name, port,
    app_dir`; `ENV_FILE` is written to `.env.production` for the build and
    `shared/.env` at runtime.
  - `deploy-kit/scripts/` — `laravel-activate.sh`, `laravel-verify.sh`,
    `next-activate.sh`, `next-verify.sh`, `lib.sh` (run on the server).
  - `deploy-kit/server/new-site.sh` — one-time per site, run as **root**.
  - `deploy-kit/local/set-vps-secrets.ps1` — copies the shared `VPS_*` secrets into a repo.
  - `deploy-kit/README.md` — full reference. Worked examples: OKJT's own
    `.github/workflows/deploy.yml` (API + Next.js) and `Juniortambo2628/TFE` (Laravel + Vite).
- **VPS**: Debian 12 + Hestia, IP `102.212.246.224`, Hestia user `dev`.
  - Root SSH from my PC: `ssh vps1`. Deploys run as `dev`, never root.
  - Apps live at `/home/dev/web/<domain>/private/<app_name>/` with `releases/`,
    `shared/.env` (600), `shared/storage`, `current` symlink; last 5 releases kept.
  - Laravel: `public_html` → `private/<app>/current/public` (open_basedir only
    allows `public_html` + `private`).
  - Next.js: `output: "standalone"` (skip it when `process.env.VERCEL` is set),
    run by PM2 on `127.0.0.1:<port>`, nginx proxy template `nodeapp-<port>`.
    Ports in use: 3100 (okjt-web). Pick a new one.
  - PM2 runs `<app>-queue` / `<app>-scheduler` as `dev`; CLI php needs
    `-d disable_functions=` (the kit already does this).
  - `/root/new-site.sh` is already on the server.
- **Secrets on my PC**: `C:\Users\kevin\.vps\` holds `vps.env`, `deploy_key`,
  `known_hosts`. Run from PowerShell (in an OKJT clone):
  `.\deploy-kit\local\set-vps-secrets.ps1 -Repos <owner>/<repo>`
- **Per-repo secrets I add myself**: `PROD_ENV` (single Laravel app) or
  `BACKEND_ENV` + `FRONTEND_ENV` (API + Next.js).

## What to do
1. Add a `.github/workflows/deploy.yml` in the target repo that runs its own
   checks, then calls the OKJT reusable workflow(s)
   `uses: Juniortambo2628/OKJT/.github/workflows/deploy-<laravel|next>.yml@main`.
   If OKJT is private, pass `KIT_TOKEN`.
2. Make only the code changes the VPS needs (e.g. Next.js standalone output,
   Vercel-only components gated on `process.env.VERCEL`, `trustProxies`).
   Don't change the server stack.
3. Never hardcode credentials; everything goes in the env secrets.
4. Give me copy-paste command blocks labelled **root (`ssh vps1`)**, **dev**, or
   **my PC (PowerShell)**, in this order: Hestia domain(s) + DB → `new-site.sh` →
   secrets → data import (mysqldump + uploads tar into `shared/storage/app`) →
   first deploy → hosts-file test → DNS → Let's Encrypt → `APP_ENV=production`
   → cleanup of old hosting.

## Lessons already learned — check these up front
- Each Hestia DB has its own user: `DB_DATABASE` and `DB_USERNAME` must be the
  same row of `v-list-databases dev`.
- Saving a domain in Hestia's Edit form resets the proxy template; re-run
  `v-change-web-domain-proxy-tpl dev <domain> nodeapp-<port> yes`.
- CORS: `FRONTEND_URL` must list apex AND www (comma-separated, apex first);
  `SANCTUM_STATEFUL_DOMAINS` likewise without scheme.
- Keep `APP_ENV=staging` until SSL is on (production forces https).
- Rotate `APP_KEY` via `APP_PREVIOUS_KEYS`, never just replace it.
- `@vercel/analytics` / `speed-insights` 404 off Vercel — gate them.
