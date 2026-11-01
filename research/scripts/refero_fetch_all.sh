#!/bin/bash
# usage: fetch_all.sh <sitemap.xml> <rawdir> <outdir> <extract.py>
set -u
SM=$1; RAW=$2; OUT=$3; EX=$4
mkdir -p "$RAW" "$OUT"
M="$OUT/manifest.csv"
[ -f "$M" ] || echo "id,file,brand,theme,rc,lines,has_colors" > "$M"
grep -oE '<loc>https://styles.refero.design/style/[0-9a-f-]{36}' "$SM" | sed 's#.*/style/##' | while read id; do
  grep -q "^$id," "$M" && continue
  f="$RAW/$id.html"
  [ -s "$f" ] || { curl -sL --max-time 30 -A "Mozilla/5.0 (research fetch for user)" "https://styles.refero.design/style/$id" -o "$f"; sleep 1; }
  tmp="$OUT/.tmp.md"
  python3 -I "$EX" "$f" > "$tmp"; rc=$?
  brand=$(head -1 "$tmp" | sed -E 's/^# (.*) — Style Reference$/\1/')
  slug=$(printf '%s' "$brand" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g')
  [ -z "$slug" ] && slug=unknown
  theme=$(grep -m1 -oE '^\*\*Theme:\*\* .*' "$tmp" | sed 's/\*\*Theme:\*\* //')
  if [ $rc -eq 0 ]; then
    name="$slug-${id:0:8}.md"; mv "$tmp" "$OUT/$name"
    lines=$(wc -l < "$OUT/$name" | tr -d ' ')
    hc=$(grep -c '^## Tokens — Colors' "$OUT/$name")
  else name=""; lines=0; hc=0; rm -f "$tmp"; fi
  echo "$id,$name,\"${brand//\"/}\",$theme,$rc,$lines,$hc" >> "$M"
done
echo DONE
