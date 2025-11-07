#!/bin/bash
find public/assets -name "*.png" -type f -size +100k 2>/dev/null | while read png; do
  webp="${png%.png}.webp"
  if [ ! -f "$webp" ]; then
    size=$(du -h "$png" | cut -f1)
    echo "$size    $png"
  fi
done | sort -hr > missing_webp_files.txt
wc -l missing_webp_files.txt