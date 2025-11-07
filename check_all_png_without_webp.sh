#!/bin/bash
echo "=== ALL PNG FILES WITHOUT WEBP ==="
echo ""
find public/assets -name "*.png" -type f 2>/dev/null | while read png; do
  webp="${png%.png}.webp"
  if [ ! -f "$webp" ]; then
    size=$(du -h "$png" | cut -f1)
    echo "$size    $png"
  fi
done | sort -hr > all_missing_webp.txt
echo "Found $(wc -l < all_missing_webp.txt) files"
echo ""
echo "Top 40 largest:"
head -40 all_missing_webp.txt