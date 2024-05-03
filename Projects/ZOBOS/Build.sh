#!/bin/sh
TARGET='ZOBOS'
echo "#!$(which node)" > "$TARGET"
cat src/index.js >> "$TARGET"
chmod +x "$TARGET"
