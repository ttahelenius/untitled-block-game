"use strict";

const res = (() => {
    let stepSound, slideSound, slideEndSound, flagSound;
    let pawnImages, pawnUpImages, pawnDownImages, pawnLeftImages, pawnRightImages;
    let blockImages, flagImages, buttonImages, buttonPressedImages, buttonHighlightedImages;
    let muted = false;

    let createImages = (file, n) => {
        if (!n) {
            let image = new Image();
            image.src = file;
            image.alt = "Failed to load image " + file;
            return [image];
        }

        let images = [];
        for (let i = 0; i < n; i++) {
            let image = new Image();
            image.src = file.replace("*", i);
            image.alt = "Failed to load image " + file;
            images.push(image);
        }
        return images;
    };

    let loadImages = (images, onload) => {
        let imagesLoaded = 0;
        let imageLoaded = function () {
            if (++imagesLoaded == images.length)
                onload();
        }

        for (let i = 0; i < images.length; i++) {
            images[i].onload = imageLoaded;
        }
    };

    let createPiece = (images, x, y, speed) => {
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
        p.move = (xTarget, yTarget, immediately) => {
            if (immediately) {
                p.x = xTarget;
                p.y = yTarget;
                p.xTarget = xTarget;
                p.yTarget = yTarget;
            } else {
                p.x = p.xTarget;
                p.y = p.yTarget;
                p.xTarget = xTarget;
                p.yTarget = yTarget;
                let dx = Math.round(p.xTarget - p.x);
                let dy = Math.round(p.yTarget - p.y);
                if (dx != 0 || dy != 0)
                    p.moved(dx, dy);
            }
        };
        p.update = () => {
            p.frame = (p.frame + p.frameSpeed) % p.images.length;
            p.image = p.images[Math.floor(p.frame)];
            if (p.speed === Infinity || (Math.abs(p.xTarget - p.x) < p.speed && Math.abs(p.yTarget - p.y) < p.speed)) {
                p.x = p.xTarget;
                p.y = p.yTarget;
                p.stop();
                return;
            }
            p.x += p.speed * Math.sign(p.xTarget - p.x);
            p.y += p.speed * Math.sign(p.yTarget - p.y);
            p.moving = true;
        };
        p.stop = () => {
            if (p.moving) {
                p.stoppedMoving();
                p.moving = false;
            }
        }
        return p;
    };

    let createButton = (label, action, image, imageHighlighted, imagePressed) => {
        const b = {
            label: label,
            x: undefined,
            y: undefined,
            radius: 40,
            image: image
        };
        b.moveTo = (x, y) => {
            b.x = x;
            b.y = y;
        };
        b.scaleTo = (w, h) => {
            b.radius = Math.min(w, h);
        };
        b.update = (mouseX, mouseY, pressed) => {
            let pos = ui.toGameCoordinates(mouseX, mouseY);
            if ((b.x - pos.x)**2 + (b.y - pos.y)**2 < b.radius**2) {
                if (pressed) {
                    b.image = imagePressed;
                } else {
                    b.image = imageHighlighted;
                }
            } else {
                b.image = image;
            }
        };
        b.press = (mouseX, mouseY) => {
            let pos = ui.toGameCoordinates(mouseX, mouseY);
            if ((b.x - pos.x)**2 + (b.y - pos.y)**2 < b.radius**2) {
                action();
            }
        };
        return b;
    };

    let playSound = (snd) => {
        if (muted)
            return;
        snd.pause();
        snd.currentTime = 0;
        snd.play();
    };

    let stopSound = (snd) => {
        if (muted)
            return;
        snd.pause();
    };

    return {
        init: (imgDir, sfxDir, successCallback) => {
            imgDir = imgDir + (imgDir.endsWith("/") ? "" : "/");
            loadImages([
                ...(pawnImages = createImages(imgDir + "pawn.png")),
                ...(pawnUpImages = createImages(imgDir + "pawn_up_*.png", 20)),
                ...(pawnDownImages = createImages(imgDir + "pawn_down_*.png", 20)),
                ...(pawnLeftImages = createImages(imgDir + "pawn_left_*.png", 20)),
                ...(pawnRightImages = createImages(imgDir + "pawn_right_*.png", 20)),
                ...(blockImages = createImages(imgDir + "block.png")),
                ...(flagImages = createImages(imgDir + "flag_*.png", 48)),
                ...(buttonImages = createImages(imgDir + "button.png")),
                ...(buttonPressedImages = createImages(imgDir + "button_pressed.png")),
                ...(buttonHighlightedImages = createImages(imgDir + "button_highlight.png"))
            ], successCallback);

            sfxDir = sfxDir + (sfxDir.endsWith("/") ? "" : "/");
            stepSound = new Audio(sfxDir + "pawn.mp3");
            slideSound = new Audio(sfxDir + "slide.mp3");
            flagSound = new Audio(sfxDir + "flag.mp3");
            slideEndSound = new Audio(sfxDir + "thump.mp3");
            slideEndSound.volume = 0.5;
        },

        createPawn: (x, y) => {
            let p = createPiece(pawnImages, x, y, 0.06);
            p.moved = (dx, dy) => {
                playSound(stepSound);
                if (dx < 0 && dy == 0)
                    p.switchImages(pawnLeftImages, 0.6, 1.7);
                else if (dx > 0 && dy == 0)
                    p.switchImages(pawnRightImages, 0.6, 1.7);
                else if (dx == 0 && dy < 0)
                    p.switchImages(pawnUpImages, 0.6);
                else if (dx == 0 && dy > 0)
                    p.switchImages(pawnDownImages, 0.6);
            };
            p.stoppedMoving = () => {
                p.switchImages(pawnImages);
            };
            return p;
        },

        createBlock: (x, y) => {
            let b = createPiece(blockImages, x, y, 0.07);
            b.moved = () => playSound(slideSound);
            b.stoppedMoving = () => {
                playSound(slideEndSound);
                stopSound(slideSound);
            }
            return b;
        },

        createFlag: (x, y) => {
            let f = createPiece(flagImages, x, y);
            f.removed = () => playSound(flagSound);
            f.scale = .8;
            f.frameSpeed = .3;
            return f;
        },

        createButton: (label, action) => {
            return createButton(label, action, buttonImages[0], buttonHighlightedImages[0], buttonPressedImages[0]);
        },

        mute: () => muted = true,
        unmute: () => muted = false
    };
})();