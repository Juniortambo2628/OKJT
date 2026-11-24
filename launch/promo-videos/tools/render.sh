#!/bin/bash
# Render one product promo end to end: ./render.sh <naoa|najenga|tfe|tenafi> [preview "1,6,12"]
# Needs Node with Playwright (and its Chromium), Python 3 with numpy and scipy, ffmpeg.
set -e
T=$(cd "$(dirname "$0")" && pwd); ROOT=$(dirname "$T"); P=$1; DIR="$ROOT/products/$P"
[ -d "$DIR" ] || { echo "No product $P"; exit 1; }
[ -d "$T/node_modules/three" ] || (cd "$T" && npm i --no-save --no-audit --no-fund three@0.160.0 >/dev/null)
cp "$ROOT/player.html" "$DIR/index.html"
if [ ! -f "$DIR/fonts.css" ]; then
  HREF=$(cd "$DIR" && node -e "global.window={};require('./product.js');console.log(window.PROMO.theme.fontsHref)")
  python3 "$T/fetchfonts.py" "$HREF" "$DIR"
fi
if [ ! -f "$DIR/music.wav" ]; then
  if [ "$P" = naoa ]; then python3 "$T/music_naoa.py" "$DIR/music44.wav"; else python3 "$T/music2.py" "$P" "$DIR/music44.wav"; fi
  ffmpeg -y -loglevel error -i "$DIR/music44.wav" -ar 32000 "$DIR/music.wav" && rm "$DIR/music44.wav"
fi
cd "$T"
if [ "$2" = preview ]; then BUILD="$DIR" node render.cjs preview "${3:-1,6,12,18,24,29}"; echo "Stills in $T/prev"; exit 0; fi
F="$T/frames_$P"; rm -rf "$F"
BUILD="$DIR" FRAMES="$F" node render.cjs full
ffmpeg -y -loglevel error -framerate 30 -i "$F/f%04d.jpg" -i "$DIR/music.wav" -c:v libx264 -preset slow -pix_fmt yuv420p -crf 20 -c:a aac -b:a 192k -shortest -movflags +faststart "$ROOT/videos/$P.mp4"
rm -rf "$F"; echo "Wrote videos/$P.mp4"
