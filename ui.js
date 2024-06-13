"use strict";

const ui = (() => {
    let canvas, ctx, w, h, frameWidth, frameHeight;

    return {
        init: (canvasElement, blockNumHorizontally, blockNumVertically) => {
            canvas = canvasElement;
            ctx = canvas.getContext("2d");
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.objectFit = "contain";
            frameWidth = canvas.width;
            frameHeight = canvas.height;
            w = blockNumHorizontally;
            h = blockNumVertically;
        },

        drawPieces: pieces => {
            ctx.globalCompositeOperation = 'destination-under'
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < pieces.length; i++) {
                let p = pieces[i];
                let aspect = p.image.naturalWidth / p.image.naturalHeight;
                let x = frameWidth / w * (p.x + .5 - .5*p.scale);
                let y = frameHeight / h * (p.y + .5 - .5/aspect*p.scale);
                let u = frameWidth / w * p.scale;
                let v = frameHeight / h / aspect * p.scale
                ctx.drawImage(p.image, x, y, u, v);
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