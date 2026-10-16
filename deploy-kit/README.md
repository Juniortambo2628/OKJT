# deploy-kit — GitHub Actions → Hestia VPS

One deploy system for every OKJTech project on the VPS (`102.212.246.224`,
Debian 12 + Hestia, Hestia user `dev`). Push to `main` → tests → the app is
built on the runner, rsynced into a new release folder, activated, and
verified. Rollback = repoint a symlink.

| Stack | Workflow | Runs as |
|---|---|---|
| Laravel (Blade) | `deploy-laravel.yml` with `build_assets: false` | PHP-FPM (Hestia pool) |
| Laravel + Vite / React / Inertia | `deploy-laravel.yml` (default `build_assets: true`) | PHP-FPM |
| Laravel API + separate Vite/React app on one domain | `deploy-laravel.yml` with `spa_dir: frontend` (see below) | PHP-FPM |
| Laravel API + Next.js | `deploy-laravel.yml` for the API **and** `deploy-next.yml` for the web app | PHP-FPM + Node under PM2 |
| Next.js alone | `deploy-next.yml` | Node under PM2 |

## Layout on the server

```
/home/dev/web/<domain>/
  public_html -> private/<app>/current/public     (Laravel; Next.js is proxied instead)
  private/<app>/
    releases/<UTC timestamp>-<sha>/               last 5 kept
    shared/.env                                   chmod 600, written from the ENV_FILE secret
    shared/storage/                               Laravel only: uploads, logs, sessions
    current -> releases/<live>
```

Why `private/`: Hestia's PHP-FPM pool restricts `open_basedir` to the
domain's `public_html` and `private`, and PHP checks the *resolved* path, so
the code must live there; `private/` is never served, so `.env` and `vendor/`
are unreachable from a browser.

What each deploy does

* **Laravel**: link shared `.env`/storage → `migrate --force` → optional seed
  and `post_migrate` → config/route/view/event caches → atomic switch →
  reload PHP-FPM (OPcache) → restart `<app>-queue` and `<app>-scheduler` under
  PM2 on the new release → prune → verify (structure, PM2 stable for 10s,
  HTTP 200 on `health_path` via the server's public IP).
* **Next.js** (`output: 'standalone'`): `ENV_FILE` is written to
  `.env.production` for the build (bakes `NEXT_PUBLIC_*`) and to
  `shared/.env` for runtime → switch → restart `<app>` under PM2
  (`node --env-file=shared/.env server.js` on `127.0.0.1:<port>`) → verify
  (PM2 stable, 200 on the port, 200 through nginx).

Hestia quirks the scripts already handle: nginx listens on the public IP only
(not 127.0.0.1); the CLI `php.ini` disables `pcntl_*`/`proc_open` (cleared for
the PM2 PHP processes only); the first request after a deploy can be slow.

## One-time server setup (already done on this VPS)

As root: PHP 8.3, Composer, Node 24, PM2, rsync installed;
`pm2 startup systemd -u dev --hp /home/dev`;
`/etc/sudoers.d/tfe-deploy` = `dev ALL=(root) NOPASSWD: /usr/bin/systemctl reload php8.3-fpm`.
The deploy key's public half is in `/home/dev/.ssh/authorized_keys`.

## Adding a project (≈30 min)

1. **Hestia** → add the web domain (and `api.` domain if it has one), create
   the MySQL database.
2. **As root**, once per domain (`deploy-kit/server/new-site.sh`, copy it to the
   server or `curl` it from GitHub):
   ```bash
   bash new-site.sh laravel api.example.com example-api
   bash new-site.sh next    example.com     example-web 3101   # unique port per Next app
   ```
3. **GitHub secrets** on the project repo. The five shared ones (`VPS_HOST`,
   `VPS_PORT`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`) come from one set
   of local files via `deploy-kit/local/set-vps-secrets.ps1` (personal
   accounts have no account-wide secrets, so it copies them per repo):
   ```powershell
   .\set-vps-secrets.ps1 -Repos Juniortambo2628/NewApp
   ```
   Then add the app's own env secret (`PROD_ENV`, or `BACKEND_ENV` /
   `FRONTEND_ENV`) in the repo's settings.
4. **Workflow** in the project:
   ```yaml
   jobs:
     test: …
     deploy:
       needs: test
       uses: Juniortambo2628/OKJT/.github/workflows/deploy-laravel.yml@main
       with: { domain: example.com, app_name: example }
       secrets:
         VPS_HOST: ${{ secrets.VPS_HOST }}
         VPS_PORT: ${{ secrets.VPS_PORT }}
         VPS_USER: ${{ secrets.VPS_USER }}
         VPS_SSH_KEY: ${{ secrets.VPS_SSH_KEY }}
         VPS_KNOWN_HOSTS: ${{ secrets.VPS_KNOWN_HOSTS }}
         ENV_FILE: ${{ secrets.PROD_ENV }}
   ```
   If OKJT is private, enable OKJT → Settings → Actions → General →
   **Access: accessible from repositories owned by the user**, and give the
   caller a `KIT_TOKEN` secret (fine-grained PAT with read access to OKJT
   contents) so the kit scripts can be checked out.
5. **Data**: import the DB dump (`mariadb -u USER -p DB < dump.sql`) and untar
   uploads into `private/<app>/shared/storage/app/` — before the first deploy.
6. **Cutover**: hosts-file test → A record → Hestia SSL + Let's Encrypt +
   HTTPS redirect → `APP_ENV=production` in the env secret, re-run deploy.

Ports in use: `okjt-web` 3100.

## Inputs

`deploy-laravel.yml`: `domain`, `app_name` (required); `app_dir` (`.`),
`php_version` (8.3), `node_version` (24), `build_assets` (true), `npm_flags`,
`spa_dir`, `spa_out` (`dist`), `queue` (true), `scheduler` (true), `seed`
(false), `post_migrate`, `health_path` (`/`), `kit_ref` (main). Optional
secret `SPA_ENV` = the SPA's build-time env (`VITE_*`).

### A separate SPA on the same domain (`spa_dir`)

For a repo with the Laravel API in one folder and a Vite/React app in another
(e.g. `app_dir: backend`, `spa_dir: frontend`): the runner builds the SPA
(`npm ci && npm run build`, with `SPA_ENV` written to `.env.production`) and
copies its output (`spa_out`, default `dist`) into the Laravel app's
`public/` before upload — never over `index.php` or `.htaccess`. Static files
(`/index.html`, `/assets/…`) are then served by nginx, and everything else
goes to Laravel. The Laravel app must answer the SPA's client-side routes
with `public/index.html`, e.g. a last route in `routes/web.php`:

```php
Route::get('/{any?}', fn () => response()->file(public_path('index.html')))
    ->where('any', '^(?!api|up|storage).*$');
```

Set `build_assets: false` unless the Laravel app also has its own Vite build.

`deploy-next.yml`: `domain`, `app_name`, `port` (required); `app_dir`,
`node_version`, `npm_flags`, `kit_ref`.

## Rollback (as dev)

```bash
cd ~/web/<domain>/private/<app> && ls releases/
ln -sfn "$PWD/releases/<previous>" current.new && mv -Tf current.new current
sudo -n systemctl reload php8.3-fpm     # Laravel
pm2 restart <app>                       # Next.js (or re-run the deploy for the old commit)
```
Migrations are not rolled back — only code.
