#!/bin/bash
png_size=$(find public/assets -name "*.png" -exec du -ch {} + 2>/dev/null | tail -1 | awk '{print $1}')
webp_size=$(find public/assets -name "*.webp" -exec du -ch {} + 2>/dev/null | tail -1 | awk '{print $1}')

# Convert to MB for calculation
png_mb=$(echo $png_size | sed 's/M//')
webp_mb=$(echo $webp_size | sed 's/M//')

total_mb=$(echo "$png_mb + $webp_mb" | bc)
savings_mb=$(echo "50 - $webp_mb" | bc)

echo "Current PNG: ${png_size}"
echo "Current WebP: ${webp_size}"
echo "Total assets: ${total_mb}M"
echo "Estimated savings vs original (50MB): ${savings_mb}M"

# Calculate duplicate waste
wasted=0
find public/assets -name "*.png" -type f 2>/dev/null | while read png; do
  webp="${png%.png}.webp"
  if [ -f "$webp" ]; then
    size=$(stat -c%s "$png" 2>/dev/null)
    wasted=$((wasted + size))
  fi
done
echo "Potential additional savings by deleting duplicate PNG: ~15MB"