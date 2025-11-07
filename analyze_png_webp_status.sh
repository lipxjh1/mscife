#!/bin/bash
echo "=== ANALYZING PNG/WEBP STATUS ==="
echo ""

# Count PNG files
png_total=$(find public/assets -name "*.png" -type f 2>/dev/null | wc -l)
echo "Total PNG files: $png_total"

# Count PNG with WebP
png_with_webp=0
png_without_webp=0
echo ""
echo "Checking PNG files..."
find public/assets -name "*.png" -type f 2>/dev/null | while read png; do
  webp="${png%.png}.webp"
  if [ -f "$webp" ]; then
    echo "✅ Has WebP: $png"
    png_with_webp=$((png_with_webp + 1))
  else
    echo "❌ Missing WebP: $png"
    png_without_webp=$((png_without_webp + 1))
  fi
done

echo ""
echo "=== SUMMARY ==="
echo "PNG with WebP: $png_with_webp"
echo "PNG without WebP: $png_without_webp"