#!/usr/bin/env bash
# Shared helpers for the deploy-kit server scripts. Sourced, not run.
log() { printf '\n─── %s ───\n' "$*"; }
die() { printf '!!! %s\n' "$*" >&2; exit 1; }

FAIL=0
ok()   { printf '  ok    %s\n' "$*"; }
bad()  { printf '  FAIL  %s\n' "$*"; FAIL=1; }
check(){ local desc="$1"; shift; if "$@"; then ok "$desc"; else bad "$desc"; fi; }
same() { [[ "$(readlink -f "$1" 2>/dev/null)" == "$(readlink -f "$2" 2>/dev/null)" ]]; }

# Atomically point $1/current at release dir $2.
switch_current() {
  ln -sfn "$2" "$1/current.new"
  mv -Tf "$1/current.new" "$1/current"
}

# Keep the newest $2 releases under $1/releases (never the live one).
prune_releases() {
  local root="$1" keep="$2" live
  live="$(readlink -f "$root/current")"
  ls -1d "$root"/releases/*/ 2>/dev/null | sed 's:/$::' | sort -r | tail -n +"$((keep + 1))" |
    while read -r old; do
      [[ "$old" == "$live" ]] && continue
      echo "removing $old"; rm -rf "$old"
    done
}

# PM2 field for a named process (status, restart_time…), "missing" if absent.
pm2_field() {
  pm2 jlist 2>/dev/null | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const p=JSON.parse(d||"[]").find(x=>x.name===process.argv[1]);console.log(p?(p.pm2_env[process.argv[2]]??""):"missing")})' "$1" "$2"
}

# Fails unless each named PM2 process is online and has not restarted.
check_pm2_stable() {
  local p
  for p in "$@"; do
    [[ "$(pm2_field "$p" status)" == online ]] && ok "$p online" || bad "$p is $(pm2_field "$p" status) (pm2 logs $p)"
  done
  sleep 10   # "online" can hide a crash loop
  for p in "$@"; do
    local r; r="$(pm2_field "$p" restart_time)"
    [[ "$r" == 0 ]] && ok "$p stable (no restarts)" || bad "$p restarted $r times (pm2 logs $p --lines 50)"
  done
}

# HTTP status for a URL on $DOMAIN, sent to this server's public IP (Hestia's
# nginx does not listen on 127.0.0.1) so DNS can still point elsewhere.
http_code() {
  local ip="${VERIFY_IP:-$(hostname -I | awk '{print $1}')}"
  curl -s -o /dev/null -w '%{http_code}' -L --max-time 90 -k \
    --resolve "$DOMAIN:80:$ip" --resolve "$DOMAIN:443:$ip" "$1"
}
