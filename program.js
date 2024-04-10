/* TODO:
- Undo
- Steplimits
- Move limited blocks
- Replay
*/

const w = 10, h = 7;
const frameWidth = 1000;
const frameHeight = frameWidth * h/w;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const stepSound = new Audio("sfx/pawn.mp3");
const slideSound = new Audio("sfx/slide.mp3");
const slideEndSound = new Audio("sfx/thump.mp3");
slideEndSound.volume = 0.5;
const flagSound = new Audio("sfx/flag.mp3");

let pawnImages, pawnUpImages, pawnDownImages, pawnLeftImages, pawnRightImages, blockImages, flagImages;

loadImages([
    ...(pawnImages = createImages("pawn.png")),
    ...(pawnUpImages = createImages("pawn_up_*.png", 20)),
    ...(pawnDownImages = createImages("pawn_down_*.png", 20)),
    ...(pawnLeftImages = createImages("pawn_left_*.png", 20)),
    ...(pawnRightImages = createImages("pawn_right_*.png", 20)),
    ...(blockImages = createImages("block.png")),
    ...(flagImages = createImages("flag_*.png", 48))
], ready);

function createImages(file, n) {
    if (!n) {
        let image = new Image();
        image.src = "img/" + file;
        image.alt = "Failed to load image " + file;
        return [image];
    }

    let images = [];
    for (let i = 0; i < n; i++) {
        let image = new Image();
        image.src = "img/" + file.replace("*", i);
        image.alt = "Failed to load image " + file;
        images.push(image);
    }
    return images;
}

function loadImages(images, onload) {
    let imagesLoaded = 0;
    let imageLoaded = function () {
        if (++imagesLoaded == images.length)
            onload();
    }

    for (let i = 0; i < images.length; i++) {
        images[i].onload = imageLoaded;
    }
}

const levels = [
    " P [ ]               [ ]      " +
    "               [ ][ ]   [ ][ ]" +
    "                     [ ][ ]   " +
    "[ ]   [ ]         [ ][ ]   [ ]" +
    "            [ ][ ]            " +
    "[ ]            [ ]   [ ][ ]   " +
    "      [ ][ ][ ][ ]      [ ][O]",

    "                              " +
    "   [ ][ ][ ]      [ ][ ][ ]   " +
    "   [ ]                  [ ]   " +
    "             P  P             " +
    "   [ ]                  [ ]   " +
    "   [ ][ ][ ]      [ ][ ][O]   " +
    "                              "
];

const game = {
    init: (levelNo, pawn, blocks, flags) => {
        let pieces = [...blocks, ...flags, pawn];
        let updateLoop, drawLoop, stateCheck, keyListener;
        update = () => {
            for (let i = 0; i < pieces.length; i++) {
                pieces[i].update();
            }
        };
        draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < pieces.length; i++) {
                let p = pieces[i];
                let aspect = p.image.naturalWidth / p.image.naturalHeight;
                let x = frameWidth / w * (p.x + .5 - .5*p.scale);
                let y = frameHeight / h * (p.y + .5 - .5/aspect*p.scale);
                let u = frameWidth / w * p.scale;
                let v = frameHeight / h / aspect * p.scale
                ctx.drawImage(p.image, x, y, u, v);
            }
        };
        pieceAt = (group, x, y) => {
            for (let i = 0; i < group.length; i++) {
                if (Math.abs(group[i].xTarget - x) < .0001 && Math.abs(group[i].yTarget - y) < .0001)
                    return group[i];
            }
            return null;
        }
        blockAt = (x, y) => pieceAt(blocks, x, y);
        flagAt = (x, y) => pieceAt(flags, x, y);
        move = (dx, dy) => {
            if (blockAt(pawn.xTarget + dx, pawn.yTarget + dy)) {
                pawn.move(pawn.xTarget + dx, pawn.yTarget + dy);
                let flag = flagAt(pawn.xTarget, pawn.yTarget);
                if (flag) {
                    setTimeout(() => {
                        flag.removed();
                        flags.splice(flags.indexOf(flag), 1);
                        pieces.splice(pieces.indexOf(flag), 1);
                    }, 100);
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
                blockUnder.move(x, y);
            }
        };
        checkState = () => {
            let restart = levelNo => {
                document.removeEventListener("keydown", keyListener);
                clearInterval(drawLoop);
                clearInterval(updateLoop);
                clearInterval(stateCheck);
                ready(levelNo);
            }

            if (flags.length == 0) {
                if (levelNo == levels.length - 1) {
                    alert("You win!");
                    restart();
                } else {
                    restart(levelNo + 1);
                }
                return;
            }

            if (blockAt(pawn.xTarget, pawn.yTarget)
                    || blockAt(pawn.xTarget - 1, pawn.yTarget) || blockAt(pawn.xTarget + 1, pawn.yTarget)
                    || blockAt(pawn.xTarget, pawn.yTarget - 1) || blockAt(pawn.xTarget, pawn.yTarget + 1))
                return;

            alert("You fail");
            restart(levelNo);
        };


        keyListener = e => {
            if (e.key === "Up" || e.key === "ArrowUp" || e.key === "w")
                move(0, -1);
            else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a")
                move(-1, 0);
            else if (e.key === "Down" || e.key === "ArrowDown" || e.key === "s")
                move(0, 1);
            else if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d")
                move(1, 0);
        };
        document.addEventListener("keydown", keyListener);

        updateLoop = setInterval(update, 10);
        drawLoop = setInterval(draw, 10);
        stateCheck = setInterval(checkState, 1000);
    }
};

function ready(levelNo) {
    if (!levelNo)
        levelNo = 0;
    let level = levels[levelNo];

    let pawn = null;
    let blocks = [];
    let flags = [];
    let blocksize = level.length / (w * h);
    for (let j = 0; j < h; j++) {
        let row = level.substring(w * blocksize * j, w * blocksize * (j + 1));
        for (let i = 0; i < w; i++) {
            let cell = row.substring(blocksize * i, blocksize * (i + 1));
            if (cell === "[ ]" || cell === "[O]" || cell === "[P]")
                blocks.push(createBlock(i, j));
            if (cell === " P " || cell === "[P]")
                flags.push(createFlag(i, j));
            if (cell === " O " || cell === "[O]")
                pawn = createPawn(i, j);
        }
    }

    game.init(levelNo, pawn, blocks, flags);
}

function playSound(snd) {
    snd.pause();
    snd.currentTime = 0;
    snd.play();
}

function stopSound(snd) {
    snd.pause();
}

function createPawn(x, y) {
    let p = createPiece(pawnImages, x, y, 0.06);
    p.moved = (dx, dy) => {
        playSound(stepSound);
        if (dx < 0 && dy == 0)
            p.switchImages(pawnLeftImages, 0.6, 1.7);
        else if (dx > 0 && dy == 0)
            p.switchImages(pawnRightImages, 0.6, 1.7);
        else if (dx == 0 && dy < 0)
            p.switchImages(pawnDownImages, 0.6);
        else if (dx == 0 && dy > 0)
            p.switchImages(pawnDownImages, 0.6);
    };
    p.stoppedMoving = () => {
        p.switchImages(pawnImages);
    };
    return p;
}

function createBlock(x, y) {
    let b = createPiece(blockImages, x, y, 0.07);
    b.moved = () => playSound(slideSound);
    b.stoppedMoving = () => {
        playSound(slideEndSound);
        stopSound(slideSound);
    }
    return b;
}

function createFlag(x, y) {
    let f = createPiece(flagImages, x, y);
    f.removed = () => playSound(flagSound);
    f.scale = .8;
    f.frameSpeed = .3;
    return f;
}

function createPiece(images, x, y, speed) {
    const p = {
        images: images,
        image: images[0],
        frame: 0,
        frameSpeed: 1,
        scale: 1,
        x: x,
        y: y,
        xTarget: x,
        yTarget: y,
        speed: speed ? speed : Infinity,
        moving: false
    };
    p.moved = (dx, dy) => {};
    p.stoppedMoving = () => {};
    p.removed = () => {};
    p.switchImages = (images, frameSpeed, scale) => {
        p.frame = 0;
        p.images = images;
        p.image = images[0];
        p.frameSpeed = frameSpeed || 1;
        p.scale = scale || 1;
    };
    p.move = (xTarget, yTarget) => {
        p.x = p.xTarget;
        p.y = p.yTarget;
        p.xTarget = xTarget;
        p.yTarget = yTarget;
        let dx = Math.round(p.xTarget - p.x);
        let dy = Math.round(p.yTarget - p.y);
        if (dx != 0 || dy != 0)
            p.moved(dx, dy);
    };
    p.update = () => {
        p.frame = (p.frame + p.frameSpeed) % p.images.length;
        p.image = p.images[Math.floor(p.frame)];
        if (p.speed === Infinity || (Math.abs(p.xTarget - p.x) < p.speed && Math.abs(p.yTarget - p.y) < p.speed)) {
            p.x = p.xTarget;
            p.y = p.yTarget;
            if (p.moving) {
                p.stoppedMoving();
                p.moving = false;
            }
            return;
        }
        p.x += p.speed * Math.sign(p.xTarget - p.x);
        p.y += p.speed * Math.sign(p.yTarget - p.y);
        p.moving = true;
    };
    return p;
}