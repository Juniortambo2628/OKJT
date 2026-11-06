# OKJTech: the site, the dashboard and the API

```
okjt-app/
├── web/       the public site and the dashboard (/admin): React 19 + Vite +
│              Tailwind 4 on the OKJT kit (@okjt/site, @okjt/dashboard,
│              @okjt/ui, linked from ../packages), in the deep brown theme
└── backend/   Laravel 11 API (Sanctum): content, settings, uploads, enquiries;
               also answers every page with the built app and its SEO tags
```

When deployed, `web/` is built into `backend/public/`: one PHP site, no Node
process on the server (see `../DEPLOYMENT.md`).

## Run it locally

```bash
# The API (terminal 1)
cd backend
composer install
cp .env.example .env && php artisan key:generate
touch database/database.sqlite   # DB_CONNECTION=sqlite in .env
php artisan migrate --seed && php artisan storage:link
php artisan serve                # http://127.0.0.1:8000

# The site and dashboard (terminal 2)
cd web
npm install
npm run dev                      # http://localhost:5173, /api proxied to :8000
```

The first `npm run dev` or `npm run build` builds the kit in `../packages`
(`npm run kit` rebuilds it after you change it). Seeded admin:
`admin@okjtech.com` / `admin123`; change it after the first sign-in.

To try it as it runs in production: `cd web && npm run build && cp -r dist/. ../backend/public/`,
then open http://127.0.0.1:8000.

## Where things are (web/)

| What | Where |
|---|---|
| Colours and fonts | `okjt.config.js` (the theme file `src/okjt-theme.css` is generated from it) |
| Nav, footer, legal links, SEO titles | `src/site.config.jsx` |
| Public pages | `src/pages/` |
| Dashboard | `src/admin/`: `dashboard.config.jsx` (sidebar), `resources.js` (every content list and its form), `Settings.jsx`, `Media.jsx`, `Overview.jsx` |
| Words and pictures | the dashboard's Site settings (stored in the API's `site_settings`) |

To manage a new kind of content: add its API routes in `backend`, then one
entry in `src/admin/resources.js` and one sidebar item in `dashboard.config.jsx`.

## Tests

```bash
cd backend && php artisan test          # the API and the page/SEO serving
cd ../../packages && npm test           # the kit
```
