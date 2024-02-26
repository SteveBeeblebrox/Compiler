#!/bin/sh
echo "#!$(which node)" > NFAMATCH
bin/mtsc-compat -pcomment -o=- -tes2015 -M src/index.ts >> NFAMATCH
chmod +x NFAMATCH