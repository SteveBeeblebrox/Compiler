(c) 2024 Trin Wasinger

`zlang.json.lz` and `zlex.json.lz` contain precompiled tables to speed up execution. If you delete these, Zlang will recreate them on the next run, but it may take a few minutes.

Instead of trying to recreate the trees from the `*.def` files, I just parse the `*.src` files of the same name instead.

I did the extra credit for the data segment and if/else statements. I also implemented while and do-while loops, so I think this implementation should technically be turning complete. The only features missing from ZOBOS are mixed expressions and functions.

I went the route of using virtual registers; however, I ran out of time to finish the optimizations relating to those, so there is a bit of redundant load/store instructions that could definitely be improved.