#!/bin/bash
echo "=== CHECKING WEBP REFERENCES ==="
grep -rh "\.webp" . --include="*.js" --include="*.jsx" --include="*.atlas" ! -path "./backup/*" ! -path "./node_modules/*" ! -path "./dist/*" 2>/dev/null | grep -o "[^'\"]*\.webp" | sed 's|^.*public/||' | sort | uniq | while read ref; do
  if [ ! -f "public/$ref" ] && [ ! -f "$ref" ]; then
    echo "BROKEN WEBP: $ref"
  fi
done

echo -e "\n=== CHECKING PNG REFERENCES ==="
grep -rh "\.png" . --include="*.js" --include="*.jsx" ! -path "./backup/*" ! -path "./node_modules/*" 2>/dev/null | grep -o "[^'\"]*\.png" | sed 's|^.*public/||' | sort | uniq | while read ref; do
  if [ ! -f "public/$ref" ] && [ ! -f "$ref" ]; then
    echo "BROKEN PNG: $ref"
  fi
done