"use strict";

const levels = (() => {
    const data = [
        {
            layout: " P [ ]               [ ]      " +
                    "               [ ][ ]   [ ][ ]" +
                    "                     [ ][ ]   " +
                    "[ ]   [ ]         [ ][ ]   [ ]" +
                    "            [ ][ ]            " +
                    "[ ]            [ ]   [ ][ ]   " +
                    "      [ ][ ][ ][ ]      [ ][O]",
            solution: [2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 0, 2, 3, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2]
        },
        {
            layout: "                              " +
                    "   [ ][ ][ ]      [ ][ ][ ]   " +
                    "   [ ]                  [ ]   " +
                    "             P  P             " +
                    "   [ ]                  [ ]   " +
                    "   [ ][ ][ ]      [ ][ ][O]   " +
                    "                              ",
            solution: [2, 2, 1, 0, 2, 0, 2, 1, 1, 1, 1, 1, 2, 2, 2, 0, 2, 0, 2, 3, 2, 2, 2, 1, 2, 3, 2, 2, 3, 2, 2, 3, 0, 1, 0, 0, 0, 3, 0, 0, 0, 3, 3, 3, 2, 2]
        },
        {
            layout: "                  [ ]      [ ]" +
                    "[ ]                     [ ]   " +
                    "                     [ ]      " +
                    "                  [ ]   [ ]   " +
                    "                      P    [ ]" +
                    "                   P [O] P    " +
                    "   [ ]   [ ]   [ ]            ",
            solution: [3, 3, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 0, 2, 2, 2, 2, 2, 2, 0, 2, 0, 2, 0, 2, 2, 2, 2, 2, 1, 0, 2, 0, 2, 0, 2, 2, 2, 2, 1, 0, 2, 0, 2, 2, 2, 1, 0, 2, 2, 1, 1, 1, 1, 1, 1, 1, 3, 1, 3, 1, 3, 1, 3, 1, 1, 1, 1, 1, 1, 0, 3, 1, 3, 1, 3, 1, 3, 1, 1, 1, 1, 1, 0, 3, 1, 3, 1, 3, 1, 1, 1, 1, 0, 3, 1, 3, 1, 1, 1, 0, 3, 1, 1, 0, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 2, 2, 2, 2, 2, 2, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 2, 2, 2, 2, 2, 3, 0, 2, 0, 2, 0, 2, 0, 2, 2, 2, 2, 2, 3, 0, 2, 0, 2, 0, 2, 2, 2, 2, 3, 0, 2, 0, 2, 2, 2, 3, 0, 2, 2, 3, 3, 3, 3, 0, 1, 3, 1, 3, 3, 3, 0, 3, 1, 3, 1, 3, 1, 1, 1, 1, 0, 3, 1, 3, 1, 1, 1, 0, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 3, 2, 0, 2, 0, 0, 0, 3, 2, 0, 0, 3, 0, 0, 0, 0, 3, 2, 1, 2, 2, 3, 2, 3, 2, 3, 3, 0, 1, 0, 1, 0, 3, 3, 0, 0]
        }
    ];

    return {
        init: () => {},

        size: () => data.length,

        getSolution: levelNo => data[levelNo].solution,

        loadLevel: levelNo => {
            let level = data[levelNo].layout;
            let pawn = null;
            let blocks = [];
            let flags = [];
            let blocksize = level.length / (w * h);
            for (let j = 0; j < h; j++) {
                let row = level.substring(w * blocksize * j, w * blocksize * (j + 1));
                for (let i = 0; i < w; i++) {
                    let cell = row.substring(blocksize * i, blocksize * (i + 1));
                    if (cell === "[ ]" || cell === "[O]" || cell === "[P]")
                        blocks.push(res.createBlock(i, j));
                    if (cell === " P " || cell === "[P]")
                        flags.push(res.createFlag(i, j));
                    if (cell === " O " || cell === "[O]")
                        pawn = res.createPawn(i, j);
                }
            }
            return {
                pawn: pawn,
                blocks: blocks,
                flags: flags
            };
        }
    }
})();