#!/bin/sh
TARGET='WRECK'
echo "#!$(which node)" > "$TARGET"
mtsc -tes2018 -po- -I../lib src/index.ts >> "$TARGET"
chmod +x "$TARGET"
