#!/usr/bin/env bash
# deploy-kit — post-deploy check for a Laravel site. Env: APP_ROOT DOMAIN
# [APP_NAME QUEUE=1 SCHEDULER=1]. Exits 1 on any failure.
set -uo pipefail
. "$(dirname "$0")/lib.sh"
: "${APP_ROOT:?}" "${DOMAIN:?}"
APP_NAME="${APP_NAME:-$(basename "$APP_ROOT")}"
DOMAIN_DIR="$(cd "$APP_ROOT/../.." && pwd)"
CUR="$APP_ROOT/current"; SHARED="$APP_ROOT/shared"

echo "Structure:"
check "current points at a release"            test -d "$CUR"
if same "$DOMAIN_DIR/public_html" "$CUR/public"; then ok "web root public_html -> current/public"
else bad "public_html is not linked to current/public — run as ROOT: deploy-kit/server/new-site.sh laravel $DOMAIN $APP_NAME"; fi
check ".env -> shared/.env"                    same "$CUR/.env" "$SHARED/.env"
check "storage -> shared/storage"              same "$CUR/storage" "$SHARED/storage"
check "public/storage -> shared uploads"       same "$CUR/public/storage" "$SHARED/storage/app/public"
check "vendor/autoload.php present"            test -f "$CUR/vendor/autoload.php"
check "public/index.php present"               test -f "$CUR/public/index.php"
check "config cache built"                     test -f "$CUR/bootstrap/cache/config.php"
check "storage/logs writable"                  test -w "$SHARED/storage/logs"
check ".env not world-readable"                test "$(stat -c %a "$SHARED/.env")" = 600
[[ -f "$CUR/vite.config.js" && -d "$CUR/public/build" ]] && check "Vite manifest present" test -f "$CUR/public/build/manifest.json"

procs=()
[[ "${QUEUE:-1}" == 1 ]] && procs+=("$APP_NAME-queue")
[[ "${SCHEDULER:-1}" == 1 ]] && procs+=("$APP_NAME-scheduler")
if ((${#procs[@]})); then echo "Processes:"; check_pm2_stable "${procs[@]}"; fi

echo "HTTP:"
c="$(http_code "http://$DOMAIN${HEALTH_PATH:-/}")"
[[ "$c" =~ ^(200|204)$ ]] && ok "${HEALTH_PATH:-/} returned $c" || bad "${HEALTH_PATH:-/} returned $c (see $SHARED/storage/logs/laravel.log)"

[[ $FAIL -ne 0 ]] && { echo "Verification FAILED"; exit 1; }
echo "Verification passed — $(basename "$(readlink -f "$CUR")") is live."
