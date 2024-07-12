/* TODO:
- Undo for touch usecase
- Steplimits
- Move limited blocks
*/

"use strict";

const canvas = document.querySelector("canvas");

const w = 10, h = 7;
const frameWidth = canvas.width;
const frameHeight = canvas.height;
const godMode = true;

ui.init(canvas, w, h);
levels.init();
res.init("img", "sfx", ready);

const game = {
    init: (levelNo, pawn, blocks, flags, history=[]) => {
        let pieces = [...blocks, ...flags, pawn];
        let updateLoop, drawLoop, stateCheck, keyListener, touchListener, replayLoop, replaying;

        game.update = () => {
            for (let i = 0; i < pieces.length; i++) {
                pieces[i].update();
            }
        };

        game.draw = () => ui.drawPieces(pieces);

        game.replay = (moveArray, immediately) => {
            if (immediately)
                res.mute();
            try {
                clearTimeout(replayLoop);
                if (moveArray.length) {
                    replaying = true;
                    let nextMove = moveArray[0];
                    let nextPlay = () => game.replay(moveArray.slice(1), immediately);
                    if (nextMove === 0)
                        move(1, 0, immediately);
                    else if (nextMove === 1)
                        move(0, -1, immediately);
                    else if (nextMove === 2)
                        move(-1, 0, immediately);
                    else if (nextMove === 3)
                        move(0, 1, immediately);

                    if (immediately) {
                        game.update();
                        nextPlay();
                    } else {
                        replayLoop = setTimeout(nextPlay, 300);
                    }
                } else {
                    replaying = false;
                }
            } finally {
                if (immediately)
                    res.unmute();
            }
        };


        let pieceAt = (group, x, y) => {
            for (let i = 0; i < group.length; i++) {
                if (Math.abs(group[i].xTarget - x) < .0001 && Math.abs(group[i].yTarget - y) < .0001)
                    return group[i];
            }
            return null;
        }
        let blockAt = (x, y) => pieceAt(blocks, x, y);
        let flagAt = (x, y) => pieceAt(flags, x, y);
        let move = (dx, dy, immediately) => {
            if (dx === 1 && dy === 0)
                history.push(0);
            else if (dx === 0 && dy === -1)
                history.push(1);
            else if (dx === -1 && dy === 0)
                history.push(2);
            else if (dx === 0 && dy === 1)
                history.push(3);

            if (blockAt(pawn.xTarget + dx, pawn.yTarget + dy)) {
                pawn.move(pawn.xTarget + dx, pawn.yTarget + dy, immediately);
                let flag = flagAt(pawn.xTarget, pawn.yTarget);
                if (flag) {
                    let capture = () => {
                        flag.removed();
                        flags.splice(flags.indexOf(flag), 1);
                        pieces.splice(pieces.indexOf(flag), 1);
                    };
                    if (immediately)
                        capture();
                    else
                        setTimeout(capture, 100);
                }
            } else {
                let blockUnder = blockAt(pawn.xTarget, pawn.yTarget);
                if (!blockUnder)
                    return;
                let x = blockUnder.xTarget;
                let y = blockUnder.yTarget;
                while (!blockAt(x + dx, y + dy)) {
                    if (x + dx < -0.0001 || x + dx > w - 1 + 0.0001 || y + dy < -0.0001 || y + dy > h - 1 + 0.0001)
                        break;
                    x += dx;
                    y += dy;
                }
                blockUnder.move(x, y, immediately);
            }
        };
        let stopLevel = () => {
            for (let i = 0; i < pieces.length; i++) {
                pieces[i].stop();
            }
            document.removeEventListener("touchstart", touchListener);
            document.removeEventListener("keydown", keyListener);
            clearInterval(drawLoop);
            clearInterval(updateLoop);
            clearInterval(stateCheck);
        };
        let startLevel = targetLevelNo => {
            stopLevel();
            ready(targetLevelNo);
        };
        let checkState = () => {
            if (flags.length == 0) {
                if (levelNo == levels.size() - 1) {
                    alert("You win!");
                    startLevel();
                } else {
                    startLevel(levelNo + 1);
                }
                return;
            }

            if (blockAt(pawn.xTarget, pawn.yTarget)
                    || blockAt(pawn.xTarget - 1, pawn.yTarget) || blockAt(pawn.xTarget + 1, pawn.yTarget)
                    || blockAt(pawn.xTarget, pawn.yTarget - 1) || blockAt(pawn.xTarget, pawn.yTarget + 1))
                return;

            alert("You fail");
            startLevel(levelNo);
        };

        keyListener = e => {
            if (!replaying) {
                if (e.key === "Up" || e.key === "ArrowUp" || e.key === "w") {
                    move(0, -1);
                } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") {
                    move(-1, 0);
                } else if (e.key === "Down" || e.key === "ArrowDown" || e.key === "s") {
                    move(0, 1);
                } else if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d") {
                    move(1, 0);
                } else if (e.key === "Backspace" || e.key === "Delete") {
                    startLevel(levelNo);
                    game.replay(history.slice(0, history.length-1), true);
                } else if (godMode) {
                    if (e.key === "End") {
                        startLevel(levelNo);
                        setTimeout(() => game.replay(levels.getSolution(levelNo)), 300);
                    } else if (e.key === "Home") {
                        startLevel(levelNo);
                    } else if (e.key === "PageUp") {
                        startLevel(levelNo + 1);
                    } else if (e.key === "PageDown") {
                        startLevel(levelNo - 1);
                    } else if (e.key === "p") {
                        console.log(history);
                    }
                }
            } else {
                if (e.key === "Escape") {
                    clearTimeout(replayLoop);
                    replaying = false;
                }
            }
        };
        document.addEventListener("keydown", keyListener);

        touchListener = e => {
            if (replaying)
                return;
            var touchpos = ui.toGameCoordinates(e.touches[0].clientX, e.touches[0].clientY);
            var x = touchpos.x * w / frameWidth;
            var y = touchpos.y * h / frameHeight;
            var dx = x - (pawn.xTarget + .5);
            var dy = y - (pawn.yTarget + .5);
            if (Math.abs(dx) > .5 || Math.abs(dy) > .5) {
                if (Math.abs(dx) < -dy)
                    move(0, -1);
                else if (Math.abs(dy) < -dx)
                    move(-1, 0);
                else if (Math.abs(dx) < dy)
                    move(0, 1);
                else if (Math.abs(dy) < dx)
                    move(1, 0);
            }
        }
        document.addEventListener("touchstart", touchListener);

        updateLoop = setInterval(game.update, 10);
        drawLoop = setInterval(game.draw, 10);
        stateCheck = setInterval(checkState, 1000);
    }
};

function ready(levelNo) {
    if (!levelNo || levelNo < 0)
        levelNo = 0;
    if (levelNo >= levels.size() - 1)
        levelNo = levels.size() - 1;

    let level = levels.loadLevel(levelNo);

    game.init(levelNo, level.pawn, level.blocks, level.flags);
}