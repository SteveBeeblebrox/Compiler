#!/bin/sh
TARGET='CZAR'
echo "#!$(which node)" > "$TARGET"
cat src/index.js >> "$TARGET"
chmod +x "$TARGET"
