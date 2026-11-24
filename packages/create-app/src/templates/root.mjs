/** The project's root: README, .gitignore, and the GitHub workflow (tests, then deploy). */
import { FEATURES, PRESETS } from '../answers.mjs';

export function rootFiles(p) {
  return {
    'README.md': readme(p),
    '.gitignore': 'node_modules/\n.DS_Store\n.idea/\n.vscode/\n',
    '.github/workflows/deploy.yml': workflow(p),
  };
}

function readme(p) {
  const w = p.workspace;
  const features = Object.entries(p.features).filter(([, on]) => on).map(([f]) => FEATURES[f]);
  return `# ${p.name}

${p.tagline}

Made with \`create-okjt-app\`: a Laravel API (\`backend/\`) on
[okjt/laravel-kit](https://packagist.org/packages/okjt/laravel-kit) and a React
app (\`frontend/\`) on \`@okjt/site\` and \`@okjt/dashboard\`.

* **Roles:** \`${p.preset}\`: ${PRESETS[p.preset]}
* **What people work on together:** ${w.plural} (\`${w.Model}\`, header \`X-Workspace\`)
* **Features:** ${features.length ? features.join(', ') : 'the essentials (sign-in, two-step verification, sharing, version history, notifications)'}

## Run it on your computer

\`\`\`bash
cd backend
php artisan migrate --seed     # the first user: OKJT_ADMIN_EMAIL / OKJT_ADMIN_PASSWORD in .env
php artisan serve              # the API on http://127.0.0.1:8000
\`\`\`

\`\`\`bash
cd frontend
npm run dev                    # the app on http://localhost:5173 (it calls the API through /api)
\`\`\`

Emails (verification, invitations) go to \`backend/storage/logs/laravel.log\`
until \`MAIL_*\` is set in \`backend/.env\`.

## Where things are

| What | Where |
|---|---|
| Colours and fonts | \`frontend/okjt.config.js\` (\`npm run theme\` writes \`src/okjt-theme.css\`) |
| Public pages: words, links, footer, SEO | \`frontend/src/site.config.jsx\`, \`frontend/src/pages/Home.jsx\` |
| Dashboard: sidebar, roles, modules | \`frontend/src/dashboard.config.js\` |
| Roles, messages, features on the server | \`backend/config/okjt.php\` (over the kit's \`vendor/okjt/laravel-kit/config/okjt.php\`) |
| The starter module to copy | Notes: \`backend/app/Models/Note.php\`, \`NoteController.php\`, \`frontend/src/pages/dashboard/Notes.jsx\` |

## Add a module

1. **Server:** a model with \`BelongsToWorkspace\` and \`RecordsRevisions\` (\`$revisionModule = 'tasks'\`), its migration (with \`${w.foreignKey}\`), a controller, and routes inside the \`auth:sanctum\` group of \`routes/api.php\`.
2. **App:** a page in \`src/pages/dashboard/\`, its route in \`App.jsx\`, a sidebar item and a \`MODULES\` entry in \`dashboard.config.js\`.

## Deploy (deploy-kit, about 30 minutes)

Pushing to \`main\` runs the tests, then deploys to the VPS through
[deploy-kit](https://github.com/Juniortambo2628/OKJT/tree/main/deploy-kit).
Once:

1. **Hestia:** add the domain \`${p.domain}\` (no \`www.\` alias unless its DNS exists) and a MySQL
   database. Hestia prefixes both the database and its user with the account name
   (\`dev_…\`): use the full names from its DB list.
2. **On the server, as root** (copy the script from an OKJT checkout; from Windows, strip
   carriage returns first: \`sed -i 's/\\r$//' new-site.sh\`):
   \`bash new-site.sh laravel ${p.domain} ${p.slug}\`
3. **GitHub secrets** on this repository:
   * \`VPS_HOST\`, \`VPS_PORT\`, \`VPS_USER\`, \`VPS_SSH_KEY\`, \`VPS_KNOWN_HOSTS\`: \`deploy-kit/local/set-vps-secrets.ps1 -Repos <owner>/${p.slug}\`
   * \`KIT_TOKEN\`: a fine-grained token with read access to the OKJT repository's contents
   * \`PROD_ENV\`: the server's \`.env\` (start from \`backend/.env.example\`; \`APP_KEY\` from \`php artisan key:generate --show\`; the database; \`APP_URL=https://${p.domain}\`; \`OKJT_ADMIN_*\`)
   Check a database login before the first deploy:
   \`ssh -t dev@<server> "mysql -u dev_… -p dev_… -e 'SELECT 1'"\`
4. **DNS:** point the A record at the VPS.
5. Push to \`main\`. After the first deploy, create the first user on the server, as \`dev\`:
   \`php artisan db:seed --force\` (in \`~/web/${p.domain}/private/${p.slug}/current\`).
6. **HTTPS**, once the site answers on \`http://\`: Hestia › the domain › SSL with Let's
   Encrypt and the HTTPS redirect.
`;
}

function workflow(p) {
  return `name: Test and deploy

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

jobs:
  backend:
    name: API tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: zip, sqlite3, pdo_sqlite
      - run: composer install --no-interaction --prefer-dist
      - run: cp .env.example .env && php artisan key:generate
      - run: php artisan test

  frontend:
    name: App build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run build

  deploy:
    name: Deploy
    needs: [backend, frontend]
    if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'
    uses: Juniortambo2628/OKJT/.github/workflows/deploy-laravel.yml@main
    with:
      domain: ${p.domain}
      app_name: ${p.slug}
      app_dir: backend
      spa_dir: frontend
      build_assets: false
      health_path: /up
    secrets:
      VPS_HOST: \${{ secrets.VPS_HOST }}
      VPS_PORT: \${{ secrets.VPS_PORT }}
      VPS_USER: \${{ secrets.VPS_USER }}
      VPS_SSH_KEY: \${{ secrets.VPS_SSH_KEY }}
      VPS_KNOWN_HOSTS: \${{ secrets.VPS_KNOWN_HOSTS }}
      ENV_FILE: \${{ secrets.PROD_ENV }}
      KIT_TOKEN: \${{ secrets.KIT_TOKEN }}
`;
}
