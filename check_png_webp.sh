#!/bin/bash
find public/assets -name "*.png" -type f 2>/dev/null | while read png; do
  webp="${png%.png}.webp"
  if [ ! -f "$webp" ]; then
    echo "MISSING WEBP: $png"
  fi
done