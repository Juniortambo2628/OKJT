#!/bin/bash
# OKJTech launch reel from the four product videos: intro card, ~6.7 s of each, outro card, 0.6 s crossfades, reel music.
set -e
T=$(cd "$(dirname "$0")" && pwd); ROOT=$(dirname "$T"); R="$ROOT/reel"; V="$ROOT/videos"
[ -f "$R/fonts.css" ] || python3 "$T/fetchfonts.py" "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800;1,900&display=swap" "$R"
[ -f "$R/music.wav" ] || { python3 "$T/music2.py" reel "$R/music44.wav"; ffmpeg -y -loglevel error -i "$R/music44.wav" -ar 32000 "$R/music.wav"; rm "$R/music44.wav"; }
rm -rf "$R/frames_intro" "$R/frames_outro"; node "$T/cards.cjs"
W=$(mktemp -d); X=0.6; E=6.7
ffmpeg -y -loglevel error -framerate 30 -i "$R/frames_intro/f%04d.jpg" -c:v libx264 -pix_fmt yuv420p -crf 16 "$W/intro.mp4"
ffmpeg -y -loglevel error -framerate 30 -i "$R/frames_outro/f%04d.jpg" -c:v libx264 -pix_fmt yuv420p -crf 16 "$W/outro.mp4"
for p in naoa najenga tfe tenafi; do ffmpeg -y -loglevel error -ss 0.3 -t $E -i "$V/$p.mp4" -an -c:v libx264 -pix_fmt yuv420p -crf 16 -r 30 "$W/$p.mp4"; done
o1=$(echo "2.6-$X" | bc); o2=$(echo "$o1+$E-$X" | bc); o3=$(echo "$o2+$E-$X" | bc); o4=$(echo "$o3+$E-$X" | bc); o5=$(echo "$o4+$E-$X" | bc)
ffmpeg -y -loglevel error -i "$W/intro.mp4" -i "$W/naoa.mp4" -i "$W/najenga.mp4" -i "$W/tfe.mp4" -i "$W/tenafi.mp4" -i "$W/outro.mp4" -i "$R/music.wav" \
  -filter_complex "[0][1]xfade=transition=fade:duration=$X:offset=$o1[a];[a][2]xfade=transition=fade:duration=$X:offset=$o2[b];[b][3]xfade=transition=fade:duration=$X:offset=$o3[c];[c][4]xfade=transition=fade:duration=$X:offset=$o4[d];[d][5]xfade=transition=fade:duration=$X:offset=$o5,format=yuv420p[v];[6:a]afade=t=out:st=28.4:d=1.6[au]" \
  -map "[v]" -map "[au]" -c:v libx264 -preset slow -crf 20 -c:a aac -b:a 192k -t 30 -movflags +faststart "$V/okjtech-reel.mp4"
rm -rf "$W" "$R/frames_intro" "$R/frames_outro"; echo "Wrote videos/okjtech-reel.mp4"
