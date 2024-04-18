#!/bin/sh
TARGET='WRECK'
echo "#!$(which node)" > "$TARGET"
mtsc -tes2018 -po- -I../lib -I../core -M src/index.ts >> "$TARGET"
chmod +x "$TARGET"
