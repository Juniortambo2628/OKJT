#!/usr/bin/env bash
# ==============================================================================
# deploy-kit — activate an uploaded Laravel release. Runs as the Hestia user,
# called by .github/workflows/deploy-laravel.yml after rsync.
#
# Env: APP_ROOT RELEASE  [APP_NAME QUEUE=1 SCHEDULER=1 SEED=0 KEEP_RELEASES=5
#      PHP_BIN=php FPM_SERVICE=php8.3-fpm]
#
# Layout: $APP_ROOT/{releases/<r>, shared/.env, shared/storage, current}
# Fails before the switch leave the live release untouched.
# ==============================================================================
set -euo pipefail
. "$(dirname "$0")/lib.sh"

: "${APP_ROOT:?}" "${RELEASE:?}"
APP_NAME="${APP_NAME:-$(basename "$APP_ROOT")}"
PHP_BIN="${PHP_BIN:-php}"
FPM_SERVICE="${FPM_SERVICE:-php8.3-fpm}"
REL="$APP_ROOT/releases/$RELEASE"
SHARED="$APP_ROOT/shared"

[[ -d "$REL" ]] || die "release $REL not found"
[[ -f "$SHARED/.env" ]] || die "$SHARED/.env is missing — set the env secret, or create it by hand"

log "Linking shared .env and storage"
mkdir -p "$SHARED/storage/app/public" "$SHARED/storage/framework/"{cache/data,sessions,views} "$SHARED/storage/logs"
rm -rf "$REL/storage" "$REL/public/storage"
ln -sfn "$SHARED/storage" "$REL/storage"
ln -sfn "$SHARED/.env" "$REL/.env"
ln -sfn "$SHARED/storage/app/public" "$REL/public/storage"
mkdir -p "$REL/bootstrap/cache"

log "Permissions"
# PHP-FPM runs as this user; nginx/Apache (www-data) only read public files.
chmod 755 "$APP_ROOT" "$APP_ROOT/releases" "$REL"
find "$REL" -path "$REL/storage" -prune -o -type d -exec chmod 755 {} +
find "$REL" -path "$REL/storage" -prune -o -type f -exec chmod 644 {} +
chmod 755 "$REL/artisan"
chmod 711 "$SHARED"; chmod 600 "$SHARED/.env"
find "$SHARED/storage" -type d -exec chmod 755 {} +
find "$SHARED/storage/app/public" -type f -exec chmod 644 {} +

cd "$REL"
log "Migrating"
"$PHP_BIN" artisan cache:clear || true
"$PHP_BIN" artisan migrate --force
if [[ "${SEED:-0}" == 1 ]]; then
  log "Seeding (non-fatal)"
  "$PHP_BIN" artisan db:seed --force || echo "!!! SEEDING FAILED — deploy continues."
fi
[[ -n "${POST_MIGRATE:-}" ]] && { log "Post-migrate: $POST_MIGRATE"; bash -c "$POST_MIGRATE" || true; }

log "Building caches"
"$PHP_BIN" artisan config:cache
"$PHP_BIN" artisan route:cache
"$PHP_BIN" artisan view:cache
"$PHP_BIN" artisan event:cache

log "Switching current -> $RELEASE"
switch_current "$APP_ROOT" "$REL"
# OPcache would serve the old release for ~2 min after the symlink moves.
sudo -n /usr/bin/systemctl reload "$FPM_SERVICE" && echo "Reloaded $FPM_SERVICE" \
  || echo "!!! Could not reload $FPM_SERVICE — old code may be served for ~2 minutes."

# Background processes under PM2, pinned to THIS release. Hestia's CLI
# php.ini disables pcntl_* / proc_open, which queue:work and schedule:work
# need, so clear disable_functions for these processes only.
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete "$APP_NAME-queue" "$APP_NAME-scheduler" >/dev/null 2>&1 || true
  if [[ "${QUEUE:-1}" == 1 ]]; then
    pm2 start "$PHP_BIN" --name "$APP_NAME-queue" --interpreter none --cwd "$REL" --kill-timeout 60000 \
      -- -d disable_functions= "$REL/artisan" queue:work --sleep=3 --tries=3 --max-time=3600
  fi
  if [[ "${SCHEDULER:-1}" == 1 ]]; then
    pm2 start "$PHP_BIN" --name "$APP_NAME-scheduler" --interpreter none --cwd "$REL" \
      -- -d disable_functions= "$REL/artisan" schedule:work
  fi
  pm2 save
else
  echo "!!! pm2 not on PATH — queue worker / scheduler NOT started."
fi

log "Pruning old releases"
prune_releases "$APP_ROOT" "${KEEP_RELEASES:-5}"
log "Release $RELEASE is live"
