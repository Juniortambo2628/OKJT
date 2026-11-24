#!/usr/bin/env bash
# ==============================================================================
# deploy-kit — one-time per-site setup on the Hestia VPS. Run as ROOT after
# adding the web domain in Hestia:
#
#   bash new-site.sh laravel <domain> <app_name>          [hestia_user=dev]
#   bash new-site.sh next    <domain> <app_name> <port>   [hestia_user=dev]
#
# laravel: creates private/<app_name>/{releases,shared} and replaces
#          public_html with a symlink to private/<app_name>/current/public.
# next:    creates the same folders and points the domain's nginx at a Node
#          app on 127.0.0.1:<port> via a Hestia proxy template.
# Safe to re-run.
# ==============================================================================
set -euo pipefail
KIND="${1:?laravel|next}"; DOMAIN="${2:?domain}"; APP="${3:?app_name}"
if [[ "$KIND" == next ]]; then PORT="${4:?port}"; HUSER="${5:-dev}"; else HUSER="${4:-dev}"; fi
[[ $EUID -eq 0 ]] || { echo "run as root"; exit 1; }
D="/home/$HUSER/web/$DOMAIN"
[[ -d "$D" ]] || { echo "$D not found — add the domain in Hestia first"; exit 1; }
export PATH="$PATH:/usr/local/hestia/bin"

install -d -o "$HUSER" -g "$HUSER" -m 755 "$D/private/$APP" "$D/private/$APP/releases"
install -d -o "$HUSER" -g "$HUSER" -m 711 "$D/private/$APP/shared"

if [[ "$KIND" == laravel ]]; then
  if [[ -L "$D/public_html" ]]; then
    echo "public_html is already a symlink -> $(readlink "$D/public_html")"
  else
    mv "$D/public_html" "$D/public_html.hestia-default.$(date +%s)"
  fi
  ln -sfn "private/$APP/current/public" "$D/public_html"
  chown -h "$HUSER:$HUSER" "$D/public_html"
  echo "OK: $DOMAIN web root -> private/$APP/current/public"
  exit 0
fi

# --- next: nginx proxy template to 127.0.0.1:$PORT ----------------------------
TPL_DIR=/usr/local/hestia/data/templates/web/nginx
NAME="nodeapp-$PORT"
common() { cat <<TPL
    location ~ /\.(?!well-known\/) { deny all; return 404; }
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }
    location /error/ { alias %home%/%user%/web/%domain%/document_errors/; }
TPL
}
{ cat <<'TPL'
server {
    listen      %ip%:%proxy_port%;
    server_name %domain_idn% %alias_idn%;
    error_log   /var/log/%web_system%/domains/%domain%.error.log error;
    include %home%/%user%/conf/web/%domain%/nginx.forcessl.conf*;
TPL
  common
  echo '    include %home%/%user%/conf/web/%domain%/nginx.conf_*;'
  echo '}'; } > "$TPL_DIR/$NAME.tpl"
{ cat <<'TPL'
server {
    listen      %ip%:%proxy_ssl_port% ssl;
    http2 on;
    server_name %domain_idn% %alias_idn%;
    ssl_certificate      %ssl_pem%;
    ssl_certificate_key  %ssl_key%;
    error_log   /var/log/%web_system%/domains/%domain%.error.log error;
    include %home%/%user%/conf/web/%domain%/nginx.hsts.conf*;
TPL
  common
  echo '    include %home%/%user%/conf/web/%domain%/nginx.ssl.conf_*;'
  echo '}'; } > "$TPL_DIR/$NAME.stpl"
chmod 644 "$TPL_DIR/$NAME.tpl" "$TPL_DIR/$NAME.stpl"

v-change-web-domain-proxy-tpl "$HUSER" "$DOMAIN" "$NAME"
nginx -t && systemctl reload nginx
echo "OK: $DOMAIN -> 127.0.0.1:$PORT (proxy template $NAME)"
