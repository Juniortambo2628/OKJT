# Production Deployment Guide

This project uses **GitHub Actions** to deploy automatically on every push to `main`.

## What the pipeline does

1. Installs PHP + Composer dependencies for the Laravel backend.
2. Installs Node.js + npm dependencies for the Next.js frontend.
3. Builds the frontend using `next build` (standalone output).
4. Writes production `.env` files from GitHub Secrets.
5. Deploys backend files to `/home/zhpebukm/okj-core`.
6. Deploys backend `public/` contents to `/home/zhpebukm/public_html/api/` (the public API entry point).
7. Deploys the standalone frontend bundle to `/home/zhpebukm/okj-frontend`.
8. Runs migrations, clears/caches Laravel config/route/views, sets permissions.
9. Starts/restarts the frontend Node.js server.

## Required GitHub Secrets

Go to **Settings > Secrets and variables > Actions > New repository secret** and add:

| Secret Name | Description |
|-------------|-------------|
| `SSH_PRIVATE_KEY` | Your server's private SSH key (the matching public key must be in `~/.ssh/authorized_keys` on the server). |
| `SSH_HOST` | `51.89.113.223` |
| `SSH_USER` | `zhpebukm` |
| `SSH_PORT` | `1624` |
| `BACKEND_ENV` | Full contents of the production `.env` file for Laravel. |
| `FRONTEND_ENV` | Full contents of the production `.env.production` file for Next.js. |

### Recommended backend `.env` (`BACKEND_ENV`)

```env
APP_NAME="OKJTechnologies"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_TIMEZONE=Africa/Nairobi
APP_URL=https://api.okjtech.co.ke
FRONTEND_URL=https://okjtech.co.ke,https://www.okjtech.co.ke
SANCTUM_STATEFUL_DOMAINS=okjtech.co.ke,www.okjtech.co.ke,api.okjtech.co.ke,www.api.okjtech.co.ke

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=database

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=YOUR_DB_DATABASE
DB_USERNAME=YOUR_DB_USERNAME
DB_PASSWORD=YOUR_DB_PASSWORD

SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=.okjtech.co.ke

BROADCAST_CONNECTION=reverb
FILESYSTEM_DISK=public
QUEUE_CONNECTION=database

CACHE_STORE=file
CACHE_PREFIX=okjtech

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_HOST=mail.okjtech.co.ke
MAIL_PORT=465
MAIL_USERNAME=YOUR_MAIL_USERNAME
MAIL_PASSWORD=YOUR_MAIL_PASSWORD
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="info@okjtech.co.ke"
MAIL_FROM_NAME="${APP_NAME}"

REVERB_APP_ID=YOUR_REVERB_APP_ID
REVERB_APP_KEY=YOUR_REVERB_APP_KEY
REVERB_APP_SECRET=YOUR_REVERB_APP_SECRET
REVERB_HOST="api.okjtech.co.ke"
REVERB_PORT=443
REVERB_SCHEME=https

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
VITE_APP_NAME="${APP_NAME}"
```

> Generate `APP_KEY` once with `php artisan key:generate` and store the value in `BACKEND_ENV`. Do not regenerate it on every deploy.

### Recommended frontend `.env` (`FRONTEND_ENV`)

```env
NEXT_PUBLIC_API_URL=https://api.okjtech.co.ke/api
NEXT_PUBLIC_APP_URL=https://okjtech.co.ke
NEXT_PUBLIC_REVERB_APP_KEY=YOUR_REVERB_APP_KEY
NEXT_PUBLIC_REVERB_HOST=api.okjtech.co.ke
NEXT_PUBLIC_REVERB_PORT=443
NEXT_PUBLIC_REVERB_SCHEME=https
```

## Server prerequisites

1. **SSH key access** — Password login is not used by the workflow.
   - Generate a key pair: `ssh-keygen -t ed25519 -C "github-actions"`
   - Add the public key to the server:
     ```bash
     mkdir -p ~/.ssh
     cat github-actions.pub >> ~/.ssh/authorized_keys
     chmod 700 ~/.ssh
     chmod 600 ~/.ssh/authorized_keys
     ```
   - Add the **private** key to the `SSH_PRIVATE_KEY` GitHub Secret.

2. **PHP 8.2+ CLI** with extensions: `bcmath ctype curl fileinfo intl json mbstring openssl pdo_mysql tokenizer xml zip`.

3. **Composer** installed globally.

4. **Node.js 20+** and `npm` installed.

5. **MySQL database** exists and the configured user has full privileges.

6. Target directories exist or are creatable:
   - `/home/zhpebukm/okj-core`
   - `/home/zhpebukm/public_html/api`
   - `/home/zhpebukm/okj-frontend`

7. **Frontend process manager (optional but recommended)**
   - The workflow tries `pm2` first. If not installed, it falls back to `nohup`.
   - For shared hosting without PM2, you may need to configure the Node.js app via cPanel or use a reverse proxy.

## Directory layout after deploy

```
/home/zhpebukm/
├── okj-core/                  # Laravel backend files (not publicly accessible)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/                # copied to public_html/api
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── artisan
│   └── .env
├── public_html/
│   └── api/                   # Public API entry point
│       ├── index.php          # points to ../../okj-core
│       ├── .htaccess
│       └── ...
└── okj-frontend/              # Next.js standalone bundle
    ├── server.js
    ├── .next/
    └── public/
```

## How `public_html/api/index.php` works

The file auto-detects the backend location:

- **Production** (`/home/zhpebukm/public_html/api/index.php`): finds `/home/zhpebukm/okj-core` two directories up.
- **Development** (`okjt-app/backend/public/index.php`): finds the backend one directory up as usual.

## Manual deployment

You can trigger the workflow manually from the **Actions** tab in GitHub.

## Security notes

- Never commit `.env` files, SSH keys, or server passwords to the repository.
- Use `APP_DEBUG=false` in production.
- Rotate the server password after switching to SSH-key authentication.
