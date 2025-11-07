#!/bin/bash
echo "=== PNG FILES WITHOUT WEBP COUNTERPART ==="
echo ""
total=0
find public/assets -name "*.png" -type f -size +100k 2>/dev/null | while read png; do
  webp="${png%.png}.webp"
  if [ ! -f "$webp" ]; then
    size=$(du -h "$png" | cut -f1)
    echo "$size    $png"
    total=$((total + 1))
  fi
done | sort -hr
echo ""
echo "Total files: $total"