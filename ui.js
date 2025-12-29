"use strict";

const ui = (() => {
    let canvas, ctx, w, h, frameWidth, frameHeight, uiDimRecalculate;
    let rightButton, upButton, leftButton, downButton;
    let pointermoveHandler, mousedownHandler, mouseupHandler, touchstartHandler, touchendHandler;
    let backgroundColor = "#282828";

    return {
        init: (canvasElement, blockNumHorizontally, blockNumVertically) => {
            canvas = canvasElement;
            ctx = canvas.getContext("2d");
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.objectFit = "contain";
            document.querySelector("body").style.backgroundColor = backgroundColor;
            w = blockNumHorizontally;
            h = blockNumVertically;
            let layOutDirectionalButtons = (xMin, yMin, xMax, yMax) => {
                let xAvg = (xMin + xMax)/2;
                let yAvg = (yMin + yMax)/2;
                let w = xMax - xMin;
                let h = yMax - yMin;
                let rf = .2;
                rightButton?.moveTo(xAvg + h*.3, yAvg);
                upButton?.moveTo(xAvg, yAvg - w*.3);
                leftButton?.moveTo(xAvg - h*.3, yAvg);
                downButton?.moveTo(xAvg, yAvg + w*.3);
                rightButton?.scaleTo(w*rf, h*rf);
                upButton?.scaleTo(w*rf, h*rf);
                leftButton?.scaleTo(w*rf, h*rf);
                downButton?.scaleTo(w*rf, h*rf);
            };
            uiDimRecalculate = () => {
                if (visualViewport.height * 1.05 < visualViewport.width) {
                    frameWidth = 1000;
                    frameHeight = 1000 * h / w;
                    canvas.width = Math.min(Math.max(1350, visualViewport.width * (700 / visualViewport.height)), 2000);
                    canvas.height = 700;
                    let size = Math.min(canvas.width - frameWidth, 350);
                    layOutDirectionalButtons(canvas.width-size, canvas.height-size, canvas.width, canvas.height);
                } else {
                    frameWidth = 700 * w / h;
                    frameHeight = 700;
                    canvas.width = 1000;
                    canvas.height = visualViewport.height;
                    let size = Math.min(canvas.height - frameHeight, 500);
                    layOutDirectionalButtons(canvas.width-size, canvas.height-size, canvas.width, canvas.height);
                }
            };
            window.addEventListener("resize", uiDimRecalculate);
            uiDimRecalculate();
        },

        initButtons: () => {
            let buttons = [
                rightButton = res.createButton("\u{25B6}", () => document.dispatchEvent(new CustomEvent("moveRight"))),
                upButton = res.createButton("\u{25B2}", () => document.dispatchEvent(new CustomEvent("moveUp"))),
                leftButton = res.createButton("\u{25C0}", () => document.dispatchEvent(new CustomEvent("moveLeft"))),
                downButton = res.createButton("\u{25BC}", () => document.dispatchEvent(new CustomEvent("moveDown")))
            ];
            let updatehandler = (x, y, pressed, activateAction) => {
                for (let i = 0; i < buttons.length; i++) {
                    let b = buttons[i];
                    b.update(x, y, pressed);
                    if (activateAction)
                        b.press(x, y);
                }
            };
            pointermoveHandler = ev => updatehandler(ev.x, ev.y, ev.buttons === 1);
            mousedownHandler = ev => updatehandler(ev.x, ev.y, true, true);
            mouseupHandler = ev => updatehandler(null, null, false);
            touchstartHandler = ev => updatehandler(ev.touches[0].clientX, ev.touches[0].clientY, true);
            touchendHandler = ev => updatehandler(null, null, false);
            canvas.addEventListener("pointermove", pointermoveHandler);
            canvas.addEventListener("mousedown", mousedownHandler);
            canvas.addEventListener("mouseup", mouseupHandler);
            canvas.addEventListener("touchstart", touchstartHandler);
            canvas.addEventListener("touchend", touchendHandler);
            uiDimRecalculate();
            return buttons;
        },

        deinitButtons: () => {
            canvas.removeEventListener("pointermove", pointermoveHandler);
            canvas.removeEventListener("mousedown", mousedownHandler);
            canvas.removeEventListener("mouseup", mouseupHandler);
            canvas.removeEventListener("touchstart", touchstartHandler);
            canvas.removeEventListener("touchend", touchendHandler);
        },

        draw: (pieces, buttons) => {
            ctx.globalCompositeOperation = 'destination-under'
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, frameWidth, frameHeight);
            for (let i = 0; i < pieces.length; i++) {
                let p = pieces[i];
                let aspect = p.image.naturalWidth / p.image.naturalHeight;
                let x = frameWidth / w * (p.x + .5 - .5*p.scale);
                let y = frameHeight / h * (p.y + .5 - .5/aspect*p.scale);
                let u = frameWidth / w * p.scale;
                let v = frameHeight / h / aspect * p.scale
                ctx.drawImage(p.image, x, y, u, v);
            }
            for (let i = 0; i < buttons.length; i++) {
                let b = buttons[i];
                let x = b.x - b.radius;
                let y = b.y - b.radius;
                let u = 2 * b.radius;
                let v = 2 * b.radius;
                ctx.drawImage(b.image, x, y, u, v);
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = `${b.radius}px serif`;
                ctx.fillText(b.label, b.x, b.y, b.radius);
            }
        },

        toGameCoordinates: (x, y) => {
            var canvasRect = canvas.getBoundingClientRect();
            var scale, offsetX, offsetY;

            if (canvasRect.height / canvas.height > canvasRect.width / canvas.width) {
                scale = canvasRect.width / canvas.width;
                offsetX = 0;
                offsetY = (canvasRect.height - canvas.height*scale)/2;
            } else {
                scale = canvasRect.height / canvas.height;
                offsetX = (canvasRect.width - canvas.width*scale)/2;
                offsetY = 0;
            }
            return {x: (x - offsetX) / scale, y: (y - offsetY) / scale};
        }
    };
})();