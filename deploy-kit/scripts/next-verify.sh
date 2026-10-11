#!/usr/bin/env bash
# deploy-kit — post-deploy check for a Next.js site. Env: APP_ROOT DOMAIN PORT [APP_NAME]
set -uo pipefail
. "$(dirname "$0")/lib.sh"
: "${APP_ROOT:?}" "${DOMAIN:?}" "${PORT:?}"
APP_NAME="${APP_NAME:-$(basename "$APP_ROOT")}"
CUR="$APP_ROOT/current"

echo "Structure:"
check "current points at a release"   test -f "$CUR/server.js"
check "static assets present"         test -d "$CUR/.next/static"
check ".env not world-readable"       test "$(stat -c %a "$APP_ROOT/shared/.env")" = 600
echo "Processes:"
check_pm2_stable "$APP_NAME"
echo "HTTP:"
c="$(curl -s -o /dev/null -w '%{http_code}' --max-time 90 "http://127.0.0.1:$PORT/")"
[[ "$c" == 200 ]] && ok "app on :$PORT returned 200" || bad "app on :$PORT returned $c (pm2 logs $APP_NAME)"
c="$(http_code "http://$DOMAIN/")"
[[ "$c" == 200 ]] && ok "$DOMAIN via nginx returned 200" \
  || bad "$DOMAIN via nginx returned $c — proxy template not applied? run as ROOT: deploy-kit/server/new-site.sh next $DOMAIN $APP_NAME $PORT"

[[ $FAIL -ne 0 ]] && { echo "Verification FAILED"; exit 1; }
echo "Verification passed — $(basename "$(readlink -f "$CUR")") is live."
