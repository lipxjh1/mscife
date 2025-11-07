#!/bin/bash
echo "=== PNG FILES WITH WEBP COUNTERPART ==="
total=0
find public/assets -name "*.png" -type f 2>/dev/null | while read png; do
  webp="${png%.png}.webp"
  if [ -f "$webp" ]; then
    pngsize=$(stat -c%s "$png" 2>/dev/null)
    webpsize=$(stat -c%s "$webp" 2>/dev/null)
    total=$((total + pngsize))
    pairtotal=$((pngsize + webpsize))
    if [ $pairtotal -gt 100000 ]; then
      echo "DUPLICATE PAIR ($(($pairtotal/1024))KB): $png + $webp"
    fi
  fi
done

echo -e "\n=== TOTAL WASTED SPACE ==="
wasted=0
find public/assets -name "*.png" -type f 2>/dev/null | while read png; do
  webp="${png%.png}.webp"
  if [ -f "$webp" ]; then
    size=$(stat -c%s "$png" 2>/dev/null)
    wasted=$((wasted + size))
  fi
done
echo "Total wasted from duplicate PNG: $(($wasted/1024/1024))MB"