#!/bin/sh
TARGET='CFG'
echo "#!$(which node)" > "$TARGET"
mtsc -tes2018 -p -o- src/index.ts >> "$TARGET"
chmod +x "$TARGET"
