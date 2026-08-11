# Production Deployment Guide

This project is deployed across two environments:
1. **Frontend (Next.js):** Deployed automatically via Vercel.
2. **Backend (Laravel):** Deployed automatically to a VPS via GitHub Actions on every push to `main`.

---

## 1. Frontend Deployment (Vercel)

The frontend is deployed on Vercel. **Native linking is used**, which means Vercel watches the GitHub repository and triggers a deployment whenever code is pushed to `main`.

### Initial Vercel Setup (One-time)
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... > Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: Next.js (should be auto-detected).
   - **Root Directory**: `okjt-app/frontend`. Click "Edit" next to Root Directory and select this folder.
   - **Environment Variables**: Add the variables from your frontend `.env` here (see below).
4. Click **Deploy**. Vercel will build and deploy the frontend automatically.

### Recommended Environment Variables for Vercel

```env
NEXT_PUBLIC_API_URL=https://api.okjtech.co.ke/api
NEXT_PUBLIC_APP_URL=https://okjtech.co.ke
NEXT_PUBLIC_PUSHER_APP_KEY=218fac0420174a7b7896
NEXT_PUBLIC_PUSHER_APP_CLUSTER=mt1
```

---

## 2. Backend Deployment (GitHub Actions to VPS)

The backend is deployed via the GitHub Actions pipeline (`.github/workflows/deploy.yml`).

### What the pipeline does
1. **Lint and Fix:** Automatically runs code formatters (`pint` for Laravel, `eslint` for Next.js) and commits any fixes back to `main`.
2. **Tests:** Runs the Laravel test suite. Deployment is aborted if any tests fail.
3. **Deploy Backend:** 
   - Installs PHP + Composer dependencies.
   - Writes production `.env` files from GitHub Secrets.
   - Deploys backend files to `/home/zhpebukm/okj-core`.
   - Deploys backend `public/` contents to `/home/zhpebukm/public_html/api/` (the public API entry point).
   - Runs migrations, clears/caches Laravel config/route/views, sets permissions.

### Required GitHub Secrets

Go to **Settings > Secrets and variables > Actions > New repository secret** and add:

| Secret Name | Description |
|-------------|-------------|
| `SSH_PRIVATE_KEY` | Your server's private SSH key (the matching public key must be in `~/.ssh/authorized_keys` on the server). |
| `SSH_HOST` | `51.89.113.223` |
| `SSH_USER` | `zhpebukm` |
| `SSH_PORT` | `1624` |
| `BACKEND_ENV` | Full contents of the production `.env` file for Laravel. |

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

BROADCAST_CONNECTION=pusher
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

PUSHER_APP_ID=2178421
PUSHER_APP_KEY=218fac0420174a7b7896
PUSHER_APP_SECRET=d71024281a045e14d419
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

> Generate `APP_KEY` once with `php artisan key:generate` and store the value in `BACKEND_ENV`. Do not regenerate it on every deploy.

### Server prerequisites (Backend VPS)

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
4. **MySQL database** exists and the configured user has full privileges.
5. Target directories exist or are creatable:
   - `/home/zhpebukm/okj-core`
   - `/home/zhpebukm/public_html/api`

### Directory layout after deploy (Backend)

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
└── public_html/
    └── api/                   # Public API entry point
        ├── index.php          # points to ../../okj-core
        ├── .htaccess
        └── ...
```

## How `public_html/api/index.php` works

The file auto-detects the backend location:

- **Production** (`/home/zhpebukm/public_html/api/index.php`): finds `/home/zhpebukm/okj-core` two directories up.
- **Development** (`okjt-app/backend/public/index.php`): finds the backend one directory up as usual.

## Security notes

- Never commit `.env` files, SSH keys, or server passwords to the repository.
- Use `APP_DEBUG=false` in production.
- Rotate the server password after switching to SSH-key authentication.
