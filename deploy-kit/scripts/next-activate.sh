#!/usr/bin/env bash
# ==============================================================================
# deploy-kit — activate an uploaded Next.js `output: 'standalone'` release.
# Env: APP_ROOT RELEASE PORT [APP_NAME KEEP_RELEASES=5]
# Runtime env comes from $APP_ROOT/shared/.env (node --env-file). The app
# listens on 127.0.0.1:$PORT; Hestia's nginx proxies the domain to it.
# ==============================================================================
set -euo pipefail
. "$(dirname "$0")/lib.sh"
: "${APP_ROOT:?}" "${RELEASE:?}" "${PORT:?}"
APP_NAME="${APP_NAME:-$(basename "$APP_ROOT")}"
REL="$APP_ROOT/releases/$RELEASE"; SHARED="$APP_ROOT/shared"

[[ -f "$REL/server.js" ]] || die "$REL/server.js missing — is next.config output: 'standalone'?"
mkdir -p "$SHARED"; touch "$SHARED/.env"; chmod 711 "$SHARED"; chmod 600 "$SHARED/.env"
chmod 755 "$APP_ROOT" "$APP_ROOT/releases"

log "Switching current -> $RELEASE"
switch_current "$APP_ROOT" "$REL"

log "Restarting $APP_NAME on 127.0.0.1:$PORT"
pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
PORT="$PORT" HOSTNAME=127.0.0.1 NODE_ENV=production \
  pm2 start "$(command -v node)" --name "$APP_NAME" --interpreter none --cwd "$REL" \
  -- --env-file="$SHARED/.env" "$REL/server.js"
pm2 save

# Wait for it to answer before calling the deploy done.
for i in $(seq 1 30); do
  curl -sf -o /dev/null "http://127.0.0.1:$PORT/" && break
  sleep 2
done

log "Pruning old releases"
prune_releases "$APP_ROOT" "${KEEP_RELEASES:-5}"
log "Release $RELEASE is live"
