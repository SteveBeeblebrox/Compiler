#!/bin/sh
TARGET='LUTHOR'
echo "#!$(which node)" > "$TARGET"
cat src/index.js >> "$TARGET"
chmod +x "$TARGET"
