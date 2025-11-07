#!/bin/bash
echo "=== PNG TO WEBP CONVERSION STATUS ==="
echo ""

# Count all PNG files
total_png=$(find public/assets -name "*.png" -type f 2>/dev/null | wc -l)
echo "Total PNG files in public/assets: $total_png"
echo ""

# Check which ones have WebP
echo "Checking files..."
count_with=0
count_without=0
> png_with_webp.txt
> png_without_webp.txt

find public/assets -name "*.png" -type f 2>/dev/null | while read png; do
  webp="${png%.png}.webp"
  if [ -f "$webp" ]; then
    echo "$png" >> png_with_webp.txt
    count_with=$((count_with + 1))
  else
    echo "$png" >> png_without_webp.txt
    count_without=$((count_without + 1))
  fi
done

# Wait for process to complete
sleep 1

# Show counts
echo ""
echo "=== RESULTS ==="
echo "PNG files WITH WebP: $(wc -l < png_with_webp.txt)"
echo "PNG files WITHOUT WebP: $(wc -l < png_without_webp.txt)"
echo ""

if [ -s png_without_webp.txt ]; then
  echo "=== FILES WITHOUT WEBP ==="
  head -20 png_without_webp.txt
fi