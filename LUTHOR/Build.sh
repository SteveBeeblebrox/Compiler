#!/bin/sh
TARGET='LUTHOR'
echo "#!$(which node)" > "$TARGET"
mtsc -pM -o- -tes2015 src/index.ts >> "$TARGET"
chmod +x "$TARGET"