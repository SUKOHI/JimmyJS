let JIMMY = {

    bgCanvas: null,
    fgCanvas: null,
    bgCtx: null,
    fgCtx: null,
    text: null,
    textBox: null,
    downloadLink: null,
    backgroundImage: null,
    backgroundColor: null,
    controllerHoveringKey: null,
    drawings: [],
    redoDrawings: [],
    controllerPositions: {},
    fgDrawing: {},
    mousePositions: {
        start: {x: -1, y: -1},
        end: {x: -1, y: -1}
    },
    draggingControllerPosition: {
        x: -1,
        y: -1
    },
    textShadow: {
        x: 1,
        y: 2,
        blurriness: 10,
        opacity: 0.3
    },
    controllerColors: {
        insideTop: 'rgba(61, 178, 255, 1.0)',
        insideBottom: 'rgba(1, 118, 255, 1.0)',
        outside: 'rgba(255, 255, 255, 1.0)'
    },
    drawingType: 'strokeRect',
    drawingColor: '#FF0000',
    fontFamily: 'sans-serif',
    status: 'none',
    fontSize: 18,
    drawingLineWidth: 4,
    controllerRadius: 10,
    hoveringIndex: -1,
    selectingIndex: -1,
    lineHeight: 1.3,
    uniqueId: -1,

    init: function(el, options) {

        JIMMY.uniqueId = Math.random();
        let canvasSize = (options.size != undefined) ? options.size : null;
        JIMMY.initCanvas(el, canvasSize);
        JIMMY.initText();
        JIMMY.initDownloadLink();
        JIMMY.setShadow('fg');
        JIMMY.setShadow('bg');

    },
    initCanvas: function(el, canvasSize) {

        JIMMY.bgCanvas = document.getElementById(el);
        JIMMY.bgCtx = JIMMY.bgCanvas.getContext('2d');
        let computedStyle = window.getComputedStyle(JIMMY.bgCanvas, null);
        let borderTopWidth = parseInt(computedStyle.getPropertyValue('border-top-width'));
        let borderLeftWidth = parseInt(computedStyle.getPropertyValue('border-left-width'));
        let canvasPosition = JIMMY.getCanvasPosition('bg');
        let fgTop = borderTopWidth + parseInt(canvasPosition.y);
        let fgLeft = borderLeftWidth + parseInt(canvasPosition.x);

        if(canvasSize != null) {

            JIMMY.bgCanvas.width = canvasSize.width;
            JIMMY.bgCanvas.height = canvasSize.height;

        }

        JIMMY.fgCanvas = JIMMY.bgCanvas.cloneNode(false);
        JIMMY.fgCanvas.id = 'jimmy-fg-canvas';
        JIMMY.fgCanvas.width = JIMMY.bgCanvas.width;
        JIMMY.fgCanvas.height = JIMMY.bgCanvas.height;
        JIMMY.fgCanvas.addEventListener('mouseup', JIMMY.onMouseUp);
        JIMMY.fgCanvas.addEventListener('mousedown', JIMMY.onMouseDown);
        JIMMY.fgCanvas.addEventListener('mousemove', JIMMY.onMouseMove);
        JIMMY.fgCanvas.style.cssText = [
            'position:absolute',
            'top:' + fgTop + 'px',
            'left:' + fgLeft + 'px',
            'padding:0',
            'margin:0',
            'background:transparent',
        ].join(';');
        JIMMY.fgCtx = JIMMY.fgCanvas.getContext('2d');
        document.body.appendChild(JIMMY.fgCanvas);

    },
    initText: function() {

        let textShadow = JIMMY.textShadow;
        JIMMY.text = document.createElement('textarea');
        JIMMY.text.style.cssText = [
            'position:absolute',
            'outline:none',
            'display:none',
            'background:transparent',
            'padding:5px 7px',
            'line-height:' + JIMMY.lineHeight + 'em',
            'overflow:hidden',
            'resize:none',
            'min-width:150px',
            'border-radius: 5px',
            'opacity:0.7',
            'background:#fff',
            'text-shadow:'+ textShadow.x +'px '+ textShadow.y +'px '+ textShadow.blurriness +'px rgba(0,0,0,'+ textShadow.opacity +')'
        ].join(';');
        JIMMY.text.addEventListener('input', JIMMY.onTextInput);
        JIMMY.text.addEventListener('mouseup', JIMMY.onTextMouseUp);
        JIMMY.text.addEventListener('mousedown', JIMMY.onTextMouseDown);
        document.body.appendChild(JIMMY.text);

        JIMMY.textBox = document.createElement('span');
        JIMMY.textBox.style.cssText = [
            'border:none',
            'line-height:' + JIMMY.lineHeight + 'em',
            'visibility:hidden',
            'position:absolute',
            'left:-100px',
            'top:-100px',
            'padding:5px 7px',
            'cursor:text',
        ].join(';');
        document.body.appendChild(JIMMY.textBox);
        JIMMY.setFontFamily('sans-serif');
        JIMMY.setFontSize(18);
        JIMMY.setTextStyle();

    },
    initDownloadLink: function() {

        JIMMY.downloadLink = document.createElement('a');
        document.body.appendChild(JIMMY.downloadLink);

    },

    /*  Draw  */
    draw: function(whichCanvas, drawing) {

        if(whichCanvas == 'fg') {

            JIMMY.clearRect('fg');

        } else if(!drawing.visible) {

            return;

        }

        let ctx = JIMMY.getCtx(whichCanvas);
        let positions = drawing.positions;
        let correctedPositions = drawing.correctedPositions;
        let minX = correctedPositions.min.x;
        let minY = correctedPositions.min.y;
        let maxX = correctedPositions.max.x;
        let maxY = correctedPositions.max.y;
        let centerX = correctedPositions.center.x;
        let centerY = correctedPositions.center.y;
        let width = correctedPositions.width;
        let height = correctedPositions.height;
        let startX = positions.start.x;
        let startY = positions.start.y;
        let endX = positions.end.x;
        let endY = positions.end.y;
        let type = drawing.type;
        let color = drawing.color;
        let lineWidth = drawing.lineWidth;
        ctx.beginPath();
        ctx.lineCap = 'round';

        if(JIMMY.isRectType(type)) {

            ctx.rect(minX, minY, width, height);

            if(JIMMY.isStrokeType(type)) {

                JIMMY.stroke(whichCanvas, color, lineWidth);

            } else {

                JIMMY.fill(whichCanvas, color);

            }

        } else if(JIMMY.isCircleType(type)) {

            let radiusX = (maxX - minX) * 0.5;
            let radiusY = (maxY - minY) * 0.5;
            let radius = Math.min(radiusX, radiusY);
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);

            if(JIMMY.isStrokeType(type)) {

                JIMMY.stroke(whichCanvas, color, lineWidth);

            } else {

                JIMMY.fill(whichCanvas, color);

            }

        } else if(JIMMY.isOvalType(type)) {

            let kappa = .5522848;
            let diffX = maxX - minX;
            let diffY = maxY - minY;
            let offsetX = diffX * 0.5 * kappa;
            let offsetY = diffY * 0.5 * kappa;
            ctx.moveTo(minX, centerY);
            ctx.bezierCurveTo(minX, centerY - offsetY, centerX - offsetX, minY, centerX, minY);
            ctx.bezierCurveTo(centerX + offsetX, minY, maxX, centerY - offsetY, maxX, centerY);
            ctx.bezierCurveTo(maxX, centerY + offsetY, centerX + offsetX, maxY, centerX, maxY);
            ctx.bezierCurveTo(centerX - offsetX, maxY, minX, centerY + offsetY, minX, centerY);

            if(JIMMY.isStrokeType(type)) {

                JIMMY.stroke(whichCanvas, color, lineWidth);

            } else {

                JIMMY.fill(whichCanvas, color);

            }

        } else if(JIMMY.isLineType(type)) {

            if(type == 'arrow') {

                let radius = lineWidth * 4;
                let angle = Math.atan2(endY - startY, endX - startX);
                endX -= radius * Math.cos(angle);
                endY -= radius * Math.sin(angle);

                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                JIMMY.stroke(whichCanvas, color, lineWidth);

                radius = lineWidth * 2.8;
                let x = radius * Math.cos(angle) + endX;
                let y = radius * Math.sin(angle) + endY;

                ctx.moveTo(x, y);
                angle += (1.0 / 3.0) * (2 * Math.PI);
                x = radius * Math.cos(angle + 0.25) + endX;
                y = radius * Math.sin(angle + 0.25) + endY;
                ctx.lineTo(x, y);

                angle += (1.0 / 3.0) * (2 * Math.PI);
                x = radius * Math.cos(angle - 0.25) + endX;
                y = radius * Math.sin(angle - 0.25) + endY;
                ctx.lineTo(x, y);
                JIMMY.fill(whichCanvas, color);

            } else {

                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                JIMMY.stroke(whichCanvas, color, lineWidth);

                if(type == 'lineWithDot') {

                    let radius = lineWidth * 1.5;
                    ctx.moveTo(endX, endY);
                    ctx.arc(endX, endY, radius, 0, Math.PI * 2, false);
                    JIMMY.fill(whichCanvas, color);

                }

            }

        } else if(JIMMY.isTextType(type)) {

            let fontSize = drawing.fontSize;
            let fontFamily = drawing.fontFamily;
            let lineHeight = Math.floor(fontSize * JIMMY.lineHeight);
            let texts = (drawing.text) ? drawing.text.split("\n") : [];
            let textY = startY + fontSize;

            for (let i in texts) {

                let text = texts[i];
                let textBaseY = textY + lineHeight * i;
                ctx.font = fontSize + 'px ' + fontFamily;

                if(JIMMY.isStrokeType(type)) {

                    JIMMY.stroke(whichCanvas, color, lineWidth);
                    ctx.strokeText(text, startX, textBaseY);

                } else {

                    JIMMY.fill(whichCanvas, color);
                    ctx.fillText(text, startX, textBaseY);

                }

            }

        }

        ctx.closePath();

    },
    drawAll: function(which) {

        for(let i in JIMMY.drawings) {

            let drawing = JIMMY.drawings[i];
            JIMMY.draw(which, drawing);

        }

    },
    drawControllers: function() {

        if(JIMMY.hasController()) {

            for(let key in JIMMY.controllerPositions) {

                JIMMY.drawController(JIMMY.controllerPositions[key]);

            }

        }

    },
    drawController: function(positions) {

        let ctx = JIMMY.getCtx('fg');
        let radius = JIMMY.controllerRadius;

        ctx.beginPath();
        ctx.arc(positions.x, positions.y, radius, 0, Math.PI * 2, true);
        JIMMY.fill('fg', JIMMY.controllerColors.outside);

        let grad = ctx.createLinearGradient(
            positions.x,
            positions.y - radius,
            positions.x,
            positions.y + radius
        );
        grad.addColorStop(0, JIMMY.controllerColors.insideTop);
        grad.addColorStop(1, JIMMY.controllerColors.insideBottom);

        radius -= 2;
        ctx.beginPath();
        ctx.arc(positions.x, positions.y, radius, 0, Math.PI * 2, true);
        JIMMY.fill('fg', grad);
        ctx.closePath();

    },
    edit: function() {

        let targetIndex = JIMMY.selectingIndex;
        let originalDrawing = JIMMY.drawings[targetIndex];
        let drawing = JIMMY.copyDrawing(targetIndex);
        let type = originalDrawing.type;
        let controllerKey = JIMMY.controllerHoveringKey;
        let positions = {};

        if(controllerKey == 'center') {

            positions = JIMMY.getMovedPositions(drawing.positions);

        } else if(JIMMY.isLineType(type)) {

            positions = drawing.positions;
            positions[controllerKey] = JIMMY.mousePositions.end;

        } else if(JIMMY.isOvalType(type)
            || JIMMY.isCircleType(type)
            || JIMMY.isRectType(type)) {

            if(controllerKey == 'topLeft') {

                positions = {
                    start: JIMMY.mousePositions.end,
                    end: drawing.correctedPositions.max
                };

            } else if(controllerKey == 'top') {

                positions = {
                    start: {
                        x: drawing.correctedPositions.min.x,
                        y: JIMMY.mousePositions.end.y
                    },
                    end: drawing.correctedPositions.max
                };

            } else if(controllerKey == 'topRight') {

                positions = {
                    start: {
                        x: drawing.correctedPositions.min.x,
                        y: JIMMY.mousePositions.end.y
                    },
                    end: {
                        x: JIMMY.mousePositions.end.x,
                        y: drawing.correctedPositions.max.y
                    }
                };

            } else if(controllerKey == 'left') {

                positions = {
                    start: {
                        x: JIMMY.mousePositions.end.x,
                        y: drawing.correctedPositions.min.y
                    },
                    end: drawing.correctedPositions.max
                };

            } else if(controllerKey == 'right') {

                positions = {
                    start: drawing.correctedPositions.min,
                    end: {
                        x: JIMMY.mousePositions.end.x,
                        y: drawing.correctedPositions.max.y
                    }
                };

            } else if(controllerKey == 'bottomLeft') {

                positions = {
                    start: {
                        x: JIMMY.mousePositions.end.x,
                        y: drawing.correctedPositions.min.y
                    },
                    end: {
                        x: drawing.correctedPositions.max.x,
                        y: JIMMY.mousePositions.end.y
                    }
                };

            } else if(controllerKey == 'bottom') {

                positions = {
                    start: drawing.correctedPositions.min,
                    end: {
                        x: drawing.correctedPositions.max.x,
                        y: JIMMY.mousePositions.end.y
                    }
                };

            } else if(controllerKey == 'bottomRight') {

                positions = {
                    start: drawing.correctedPositions.min,
                    end: JIMMY.mousePositions.end
                };

            }

        }

        if(originalDrawing.visible) {

            originalDrawing.visible = false;
            JIMMY.refresh('bg', true);

        }

        drawing.positions = positions;
        drawing.correctedPositions = JIMMY.getCorrectedPositions(positions);
        JIMMY.fgDrawing = drawing;
        JIMMY.draw('fg', drawing);
        JIMMY.setControllerPositions(drawing);
        JIMMY.drawControllers();

    },
    stroke: function(which, color, lineWidth) {

        let ctx = JIMMY.getCtx(which);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

    },
    fill: function(which, color) {

        let ctx = JIMMY.getCtx(which);
        ctx.fillStyle = color;
        ctx.fill();

    },
    setType: function(type) {

        if(JIMMY.status == 'typing') {

            JIMMY.endTyping();
            JIMMY.status = 'typingReady';

        }

        JIMMY.drawingType = type;
        JIMMY.clearControllers();

    },
    setColor: function(color) {

        JIMMY.drawingColor = color;
        JIMMY.setTextStyle();

        if(JIMMY.isSelecting()) {

            let drawing = JIMMY.drawings[JIMMY.selectingIndex];

            if(!JIMMY.isTextType(drawing.type)) {

                JIMMY.addDrawing(JIMMY.selectingIndex, {
                    color: color
                });

            }

        }

    },
    setLineWidth: function(lineWidth) {

        JIMMY.drawingLineWidth = lineWidth;

        if(JIMMY.isSelecting()) {

            let drawing = JIMMY.drawings[JIMMY.selectingIndex];

            if(!JIMMY.isTextType(drawing.type)) {

                JIMMY.addDrawing(JIMMY.selectingIndex, {
                    lineWidth: lineWidth
                });

            }

        }

    },
    setFontFamily: function(family) {

        JIMMY.fontFamily = family;
        JIMMY.text.style.fontFamily = family;
        JIMMY.textBox.style.fontFamily = family;
        JIMMY.setTextStyle();
        JIMMY.onTextInput();

    },
    setFontSize: function(size) {

        JIMMY.fontSize = parseInt(size);
        JIMMY.text.style.fontSize = size + 'px';
        JIMMY.textBox.style.fontSize = size + 'px';
        JIMMY.setTextStyle();
        JIMMY.onTextInput();

    },
    setBackgroundColor: function(color) {

        JIMMY.bgCanvas.style.backgroundColor = color;
        JIMMY.backgroundColor = color;

    },
    clearBackgroundColor: function() {

        JIMMY.bgCanvas.style.backgroundColor = 'transparent';
        JIMMY.backgroundColor = null;

    },
    setBackgroundImage: function(imageSource, x, y) {

        JIMMY.bgCanvas.style.backgroundRepeat = 'no-repeat';
        JIMMY.bgCanvas.style.backgroundPosition = x +'px '+ y +'px';
        JIMMY.bgCanvas.style.backgroundImage = 'URL("'+ imageSource +'")';
        JIMMY.backgroundImage = {
            source: imageSource,
            x: x,
            y: y
        };

    },
    clearBackgroundImage: function() {

        JIMMY.bgCanvas.style.backgroundImage = '';
        JIMMY.backgroundImage = null;

    },
    setShadow: function(whichCanvas) {

        let ctx = JIMMY.getCtx(whichCanvas);
        let textShadow = JIMMY.textShadow;
        ctx.shadowColor = 'rgba(0, 0, 0, '+ textShadow.opacity +')';
        ctx.shadowBlur = textShadow.blurriness;
        ctx.shadowOffsetX = textShadow.x;
        ctx.shadowOffsetY = textShadow.y;

    },
    undo: function() {

        let length = JIMMY.drawings.length;

        if(length > 0) {

            let drawing = JIMMY.drawings[length - 1];

            if(drawing.copiedIndex != undefined) {

                let copiedIndex = parseInt(drawing.copiedIndex);
                JIMMY.drawings[copiedIndex].visible = true;

            }

            JIMMY.redoDrawings.push(drawing);
            JIMMY.drawings.splice(-1, 1);
            JIMMY.refresh('bg', true);

        }

        JIMMY.clearControllers();

    },
    redo: function() {

        let length = JIMMY.redoDrawings.length;

        if(length > 0) {

            let drawing = JIMMY.redoDrawings[length - 1];

            if(drawing.copiedIndex != undefined) {

                let copiedIndex = parseInt(drawing.copiedIndex);
                JIMMY.drawings[copiedIndex].visible = false;

            }

            JIMMY.redoDrawings.splice(-1, 1);
            JIMMY.drawings.push(drawing);
            JIMMY.refresh('bg', true);

        }

        JIMMY.clearControllers();

    },
    refresh: function(which, drawingFlag) {

        let canvas = JIMMY.getCanvas(which);
        let ctx = JIMMY.getCtx(which);
        JIMMY.clearRect(which);

        if(drawingFlag) {

            JIMMY.drawAll(which);

        }

    },
    clear: function(which) {

        JIMMY.fgDrawing = [];
        JIMMY.drawings = [];
        JIMMY.redoDrawings = [];
        JIMMY.refresh('fg');
        JIMMY.refresh('bg');

    },
    clearRect: function(which) {

        let ctx = JIMMY.getCtx(which);
        ctx.clearRect(0, 0, JIMMY.bgCanvas.width, JIMMY.bgCanvas.height)

    },
    clearSelectingItem: function() {

        if(JIMMY.isSelecting()) {

            let targetIndex = JIMMY.selectingIndex;
            let canvas = JIMMY.getCanvas('bg');
            let drawing = JIMMY.drawings[targetIndex];
            let hiddenPositions = {
                start: {
                    x: drawing.positions.start.x + canvas.width,
                    y: drawing.positions.start.y + canvas.height
                },
                end: {
                    x: drawing.positions.end.x + canvas.width,
                    y: drawing.positions.end.y + canvas.height
                }
            };
            JIMMY.addDrawing(targetIndex, {
                positions: hiddenPositions,
                correctedPositions: JIMMY.getCorrectedPositions(hiddenPositions)
            });
            JIMMY.clearControllers();

            if(JIMMY.isTextType(drawing.type)) {

                JIMMY.text.style.display = 'none';

            }

        }

    },
    clearStatus: function() {

        if(JIMMY.hoveringIndex > -1) {

            JIMMY.status = 'hovering';

        } else if(JIMMY.isTextType(JIMMY.drawingType)) {

            JIMMY.status = 'typingReady';

        } else {

            JIMMY.status = 'none'

        }

    },
    endTyping: function() {

        JIMMY.onMouseDown();
        JIMMY.status = 'none';

    },

    /*  Mouse Position  */
    setMousePosition: function(e, key) {

        let canvasPosition = JIMMY.getCanvasPosition('fg');
        let position = {
            x: e.clientX - canvasPosition.x,
            y: e.clientY - canvasPosition.y
        };

        if(key == 'start') {

            JIMMY.mousePositions = {
                start: position,
                end: position
            };

        } else if(key == 'end') {

            JIMMY.mousePositions.end = position;

        }

    },
    setCursor: function() {

        let imageDir = JIMMY.getCurrentDir() +'/images';
        let cursor = 'url('+ imageDir +'/cross.cur), auto';
        let type = JIMMY.drawingType;
        let status = JIMMY.status;

        if(JIMMY.inArray(status, ['hovering', 'draggingReady', 'dragging'])) {

            cursor = 'move';

        } else if(JIMMY.inArray(status, ['controllerHovering', 'editingReady', 'editing'])) {

            cursor = 'pointer';

            if(JIMMY.controllerHoveringKey == 'center') {

                cursor = 'move';

            }

        } else if(JIMMY.isTextType(type)) {

            cursor = 'text';

        }

        JIMMY.fgCanvas.style.cursor = cursor;

    },
    setTextStyle: function() {

        JIMMY.text.style.border = '5px solid ' + JIMMY.drawingColor;
        JIMMY.text.style.color = JIMMY.drawingColor;

    },
    setControllerPositions: function(drawing) {

        JIMMY.controllerPositions = {};

        if(JIMMY.isSelecting()) {

            let type = drawing.type;

            if(JIMMY.isLineType(type)) {

                JIMMY.controllerPositions = {
                    start: drawing.positions.start,
                    end: drawing.positions.end,
                    center: drawing.correctedPositions.center
                };

            } else if(JIMMY.isOvalType(type) || JIMMY.isRectType(type)) {

                let positions = drawing.correctedPositions;

                JIMMY.controllerPositions = {
                    topLeft: positions.min,
                    topRight: {x: positions.max.x, y: positions.min.y},
                    bottomRight: positions.max,
                    bottomLeft: {x: positions.min.x, y: positions.max.y},
                    top: {x: positions.center.x, y: positions.min.y},
                    left: {x: positions.min.x, y: positions.center.y},
                    right: {x: positions.max.x, y: positions.center.y},
                    bottom: {x: positions.center.x, y: positions.max.y},
                    center: positions.center
                };

            } else if(JIMMY.isCircleType(type)) {

                let positions = drawing.correctedPositions;

                JIMMY.controllerPositions = {
                    topLeft: positions.min,
                    topRight: {x: positions.max.x, y: positions.min.y},
                    bottomRight: positions.max,
                    bottomLeft: {x: positions.min.x, y: positions.max.y},
                    center: positions.center
                };

            }

        }

    },
    clearControllers: function() {

        JIMMY.selectingIndex = -1;
        JIMMY.controllerPositions = {};
        JIMMY.clearRect('fg');
        JIMMY.clearStatus();

    },
    showText: function(position, value) {

        let computedStyle = window.getComputedStyle(JIMMY.text, null);
        let borderTopWidth = parseInt(computedStyle.getPropertyValue('border-top-width'));
        let borderLeftWidth = parseInt(computedStyle.getPropertyValue('border-left-width'));
        let paddingTop = parseInt(computedStyle.getPropertyValue('padding-top'));
        let paddingLeft = parseInt(computedStyle.getPropertyValue('padding-left'));
        let textPosition = {
            x: position.x + window.scrollX - parseInt(borderLeftWidth) - parseInt(paddingLeft),
            y: position.y + window.scrollY - parseInt(borderTopWidth) - parseInt(paddingTop)
        };
        JIMMY.text.value = (value != undefined) ? value : '';
        JIMMY.text.style.display = 'block';
        JIMMY.text.style.top = textPosition.y +'px';
        JIMMY.text.style.left = textPosition.x +'px';
        JIMMY.setTextStyle();
        JIMMY.onTextInput();
        setTimeout(function() {

            JIMMY.text.focus();

        }, 0);

    },

    /*  Calc  */
    getDistance: function(point1, point2) {

        let diffX = point1.x - point2.x;
        let diffY = point1.y - point2.y;
        return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));

    },

    /* Events */
    onMouseUp: function(e) {

        let status = JIMMY.status;

        if(JIMMY.inArray(status, ['drawing', 'dragging'])) {

            if(status == 'dragging') {

                JIMMY.refresh('bg', true);

            }

            JIMMY.hoveringIndex = -1;
            JIMMY.redoDrawings = [];
            JIMMY.fgDrawing.visible = true;
            JIMMY.drawings.push(JIMMY.fgDrawing);
            JIMMY.clearRect('fg');
            JIMMY.draw('bg', JIMMY.fgDrawing);
            JIMMY.clearStatus();

        } else if(status == 'draggingReady') {

            JIMMY.selectingIndex = JIMMY.hoveringIndex;
            let drawing = JIMMY.drawings[JIMMY.selectingIndex];

            if(JIMMY.isTextType(drawing.type)) {

                JIMMY.status = 'typing';
                JIMMY.drawingType = drawing.type;
                JIMMY.mousePositions.start = drawing.positions.start;
                let canvasPosition = JIMMY.getCanvasPosition('fg');
                let textPosition = {
                    x: drawing.positions.start.x + canvasPosition.x,
                    y: drawing.positions.start.y + canvasPosition.y
                };
                JIMMY.setColor(drawing.color);
                JIMMY.setFontFamily(drawing.fontFamily);
                JIMMY.setFontSize(drawing.fontSize);
                JIMMY.showText(textPosition, drawing.text);

                drawing.visible = false;
                JIMMY.refresh('bg', true);
                return;

            } else {

                JIMMY.status = 'selecting';
                JIMMY.setControllerPositions(JIMMY.drawings[JIMMY.selectingIndex]);
                JIMMY.drawControllers();

            }

        } else if(status == 'drawingReady') {

            JIMMY.selectingIndex = -1;
            JIMMY.controllerPositions = {};
            JIMMY.clearRect('fg');
            JIMMY.clearStatus();

        } else if(status == 'editing') {

            JIMMY.status = 'selecting';
            JIMMY.selectingIndex = JIMMY.drawings.length;
            JIMMY.fgDrawing.visible = true;
            JIMMY.drawings.push(JIMMY.fgDrawing);
            JIMMY.clearRect('fg');
            JIMMY.draw('bg', JIMMY.fgDrawing);
            JIMMY.setControllerPositions(JIMMY.fgDrawing);
            JIMMY.drawControllers();

        } else if(JIMMY.inArray(status, ['textDragging', 'textDraggingReady'])) {

            JIMMY.status = 'typing';

        } else {

            JIMMY.hoveringIndex = -1;
            JIMMY.clearStatus();

        }

        JIMMY.mousePositions = {};
        JIMMY.setCursor();

    },
    onMouseDown: function(e) {

        let status = JIMMY.status;
        let lastMousePositions = JIMMY.mousePositions;

        if(e != undefined) {

            JIMMY.setMousePosition(e, 'start');

        }

        if(status == 'controllerHovering') {

            JIMMY.status = 'editingReady';

        } else if(status == 'hovering') {

            JIMMY.status = 'draggingReady';

        } else if(status == 'typing') {

            if(JIMMY.text.value != '') {

                let computedStyle = window.getComputedStyle(JIMMY.textBox, null);
                let rectWidth = parseInt(computedStyle.getPropertyValue('width'));
                let rectHeight = parseInt(computedStyle.getPropertyValue('height'));
                let startX = lastMousePositions.start.x;
                let startY = lastMousePositions.start.y;
                let endX = startX + rectWidth;
                let endY = startY + rectHeight;
                let positions = {
                    start: {x: startX, y: startY},
                    end: {x: endX, y: endY}
                };
                let drawing = {
                    type: JIMMY.drawingType,
                    color: JIMMY.drawingColor,
                    text: JIMMY.text.value,
                    positions: positions,
                    correctedPositions: JIMMY.getCorrectedPositions(positions),
                    fontSize: JIMMY.fontSize,
                    fontFamily: JIMMY.fontFamily,
                    lineWidth: JIMMY.drawingLineWidth,
                    visible: true
                };
                JIMMY.redoDrawings = [];
                JIMMY.drawings.push(drawing);
                JIMMY.draw('bg', drawing);

            }

            JIMMY.text.style.display = 'none';
            JIMMY.clearStatus();

        } else if(status == 'typingReady') {

            let position = {
                x: e.clientX,
                y: e.clientY
            };
            JIMMY.showText(position);
            JIMMY.clearControllers();
            JIMMY.status = 'typing';

        } else if(status != 'drawing') {

            JIMMY.status = 'drawingReady';

        }

        JIMMY.setCursor();

    },
    onMouseMove: function(e) {

        let status = JIMMY.status;

        if(JIMMY.inArray(status, ['typing'])) {

            return;

        }

        JIMMY.setMousePosition(e, 'end');

        if(status == 'editing') {

            JIMMY.edit();

        } else if(status == 'editingReady') {

            JIMMY.status = 'editing';

        } else if(JIMMY.inArray(status, ['selecting', 'controllerHovering'])) {

            JIMMY.setControllerHoveringKey();

            if(JIMMY.controllerHoveringKey != null) {

                JIMMY.status = 'controllerHovering';

            } else {

                JIMMY.status = 'selecting';

            }

        } else if(status == 'dragging') {

            let targetIndex = JIMMY.hoveringIndex;
            let originalDrawing = JIMMY.drawings[targetIndex];
            let drawing = JIMMY.copyDrawing(targetIndex);
            let drawingPositions = JIMMY.getMovedPositions(drawing.positions);
            drawing.positions = drawingPositions;
            drawing.correctedPositions = JIMMY.getCorrectedPositions(drawingPositions);

            if(originalDrawing.visible) {

                originalDrawing.visible = false;
                JIMMY.refresh('bg', true);

            }

            JIMMY.fgDrawing = drawing;
            JIMMY.draw('fg', drawing);

        } else if(status == 'drawing') {

            JIMMY.fgDrawing = {
                type: JIMMY.drawingType,
                color: JIMMY.drawingColor,
                lineWidth: JIMMY.drawingLineWidth,
                positions: JIMMY.mousePositions,
                correctedPositions: JIMMY.getCorrectedPositions(JIMMY.mousePositions)
            };
            JIMMY.draw('fg', JIMMY.fgDrawing);

        } else if(status == 'drawingReady') {

            JIMMY.status = 'drawing';

        } else if(status == 'draggingReady') {

            JIMMY.status = 'dragging';

        } else if(status == 'textDraggingReady') {

            JIMMY.status = 'textDragging';

        } else if(status == 'textDragging') {

            JIMMY.status = 'typing';
            JIMMY.endTyping();

        } else {

            JIMMY.setHoveringIndex();

        }

        JIMMY.setCursor();

    },
    onTextInput: function() {

        let computedStyle = window.getComputedStyle(JIMMY.text, null);
        let paddingTop = parseInt(computedStyle.getPropertyValue('padding-top'));
        let paddingBottom = parseInt(computedStyle.getPropertyValue('padding-bottom'));
        let fontSize = parseInt(computedStyle.getPropertyValue('font-size'));
        JIMMY.text.scrollTop = 0;
        JIMMY.textBox.innerHTML = JIMMY.text.value.replace(/\n/g, '<br>') + "<br>";
        JIMMY.text.style.width = JIMMY.textBox.offsetWidth + fontSize;
        JIMMY.text.style.height = JIMMY.textBox.offsetHeight + paddingTop + paddingBottom;

    },
    onTextMouseUp: function() {

        JIMMY.status = 'typing';

    },
    onTextMouseDown: function() {

        JIMMY.status = 'textDraggingReady';

    },

    /*  Others  */
    isRectType: function(type) {

        return JIMMY.inArray(type, ['strokeRect', 'fillRect']);

    },
    isCircleType: function(type) {

        return JIMMY.inArray(type, ['strokeCircle', 'fillCircle']);

    },
    isOvalType: function(type) {

        return JIMMY.inArray(type, ['strokeOval', 'fillOval']);

    },
    isLineType: function(type) {

        return JIMMY.inArray(type, ['line', 'lineWithDot', 'arrow']);

    },
    isTextType: function(type) {

        return JIMMY.inArray(type, ['strokeText', 'fillText']);

    },
    isStrokeType: function(type) {

        return JIMMY.inArray(type, [
            'arrow',
            'line',
            'lineWithDot',
            'strokeOval',
            'strokeCircle',
            'strokeRect',
            'strokeText'
        ]);

    },
    isFillType: function(type) {

        return JIMMY.inArray(type, [
            'fillOval',
            'fillCircle',
            'fillRect'
        ]);

    },
    isSelecting: function() {

        return (JIMMY.selectingIndex > -1);

    },
    hasController: function() {

        return (Object.keys(JIMMY.controllerPositions).length > 0);

    },
    setHoveringIndex: function() {

        let mousePoint = JIMMY.mousePositions.end;
        JIMMY.hoveringIndex = -1;
        JIMMY.clearRect('bg');

        for(let i in JIMMY.drawings) {

            let drawing = JIMMY.drawings[i];
            let type = drawing.type;
            let visible = drawing.visible;

            if(!visible) {

                continue;

            }

            JIMMY.draw('bg', drawing);

            if(JIMMY.hoveringIndex == -1) {

                if(JIMMY.isStrokeType(type) &&
                    JIMMY.bgCtx.isPointInStroke(mousePoint.x, mousePoint.y)) {

                    JIMMY.hoveringIndex = i;

                } else if(JIMMY.isFillType(type) &&
                    JIMMY.bgCtx.isPointInPath(mousePoint.x, mousePoint.y)) {

                    JIMMY.hoveringIndex = i;

                } else if(JIMMY.isTextType(type)) {

                    let positions = drawing.correctedPositions;

                    if(positions.min.x <= mousePoint.x &&
                        positions.min.y <= mousePoint.y &&
                        positions.max.x >= mousePoint.x &&
                        positions.max.y >= mousePoint.y) {

                        JIMMY.hoveringIndex = i;

                    }

                }

            }

        }

        JIMMY.clearStatus();

    },
    setControllerHoveringKey: function() {

        JIMMY.controllerHoveringKey = null;

        if(JIMMY.hasController()) {

            let mousePositions = JIMMY.mousePositions.end;

            for(let key in JIMMY.controllerPositions) {

                let controllerPosition = JIMMY.controllerPositions[key];
                let diffX = mousePositions.x - controllerPosition.x;
                let diffY = mousePositions.y - controllerPosition.y;
                let distance = Math.pow(diffX, 2) + Math.pow(diffY, 2);

                if(distance <= Math.pow(JIMMY.controllerRadius, 2)) {

                    JIMMY.controllerHoveringKey = key;
                    JIMMY.draggingControllerPosition = controllerPosition;
                    break;

                }

            }

        }

    },
    getCanvas: function(which) {

        if(which == 'fg') {

            return JIMMY.fgCanvas;

        }

        return JIMMY.bgCanvas;

    },
    getCtx: function(which) {

        if(which == 'fg') {

            return JIMMY.fgCtx;

        }

        return JIMMY.bgCtx;

    },
    getDrawings: function(which) {

        if(which == 'fg') {

            return [JIMMY.fgDrawing];

        }

        return JIMMY.drawings;

    },
    getCorrectedPositions: function(positions) {

        let startX = positions.start.x;
        let startY = positions.start.y;
        let endX = positions.end.x;
        let endY = positions.end.y;
        let minX = Math.min(startX, endX);
        let minY = Math.min(startY, endY);
        let maxX = Math.max(startX, endX);
        let maxY = Math.max(startY, endY);
        return {
            min: {
                x: minX,
                y: minY
            },
            max: {
                x: maxX,
                y: maxY
            },
            center: {
                x: parseInt((minX + maxX) * 0.5),
                y: parseInt((minY + maxY) * 0.5)
            },
            width: maxX - minX,
            height: maxY - minY
        }

    },
    getMovedPositions: function(positions) {

        let movedPositions = {};
        let mousePositions = JIMMY.mousePositions;
        let diffX = mousePositions.end.x - mousePositions.start.x;
        let diffY = mousePositions.end.y - mousePositions.start.y;

        for(let key in positions) {

            let position = positions[key];
            movedPositions[key] = {
                x: position.x + diffX,
                y: position.y + diffY
            };

        }

        return movedPositions;

    },
    getCanvasPosition: function(whichCanvas) {

        let canvas = JIMMY.getCanvas(whichCanvas);
        return {
            x: canvas.getBoundingClientRect().left,
            y: canvas.getBoundingClientRect().top
        };

    },
    inArray: function(value, array) {

        return (array.indexOf(value) > -1);

    },
    copyDrawing: function(index) {

        let originalDrawing = JIMMY.drawings[index];
        let copiedDrawing = JSON.parse(JSON.stringify(originalDrawing));
        copiedDrawing.copiedIndex = index;
        return copiedDrawing;

    },
    addDrawing: function(targetIndex, params) {

        let originalDrawing = JIMMY.drawings[targetIndex];
        let drawing = JIMMY.copyDrawing(targetIndex);

        for(let key in params) {

            drawing[key] = params[key];

        }

        originalDrawing.visible = false;
        JIMMY.selectingIndex = JIMMY.drawings.length;
        JIMMY.drawings.push(drawing);
        JIMMY.refresh('bg', true);

    },
    getCurrentDir: function() {

        let scripts = document.getElementsByTagName('script');

        if(scripts && scripts.length > 0) {

            for(let i in scripts) {

                if(scripts[i].src && scripts[i].src.match(new RegExp('jimmy\\.js$'))) {

                    return scripts[i].src.replace(new RegExp('(.*)jimmy\\.js$'), '$1');

                }

            }

        }

    },
    toDataURL: function(fileType, quality, callback) {

        JIMMY.clearRect('bg');

        if(JIMMY.backgroundColor != null) {

            let canvas = JIMMY.getCanvas('bg');
            let ctx = JIMMY.getCtx('bg');
            ctx.rect(0, 0, canvas.width, canvas.height);
            JIMMY.fill('bg', JIMMY.backgroundColor);

        }

        if(JIMMY.backgroundImage != null) {

            let image = new Image();
            image.onload = function(){

                JIMMY.bgCtx.drawImage(image, JIMMY.backgroundImage.x, JIMMY.backgroundImage.y);
                JIMMY.drawAll('bg');

                if(typeof callback == 'function') {

                    callback(JIMMY.bgCanvas.toDataURL(fileType, quality));

                }

            };
            image.src = JIMMY.backgroundImage.source;

        } else {

            JIMMY.drawAll('bg');

            if(typeof callback == 'function') {

                callback(JIMMY.bgCanvas.toDataURL());

            }

        }

    },
    download: function(fileType, quality, filename) {

        if(JIMMY.status == 'typing') {

            JIMMY.endTyping();

        }

        JIMMY.toDataURL(fileType, quality, function(dataUrl){

            JIMMY.downloadLink.href = dataUrl;
            JIMMY.downloadLink.download = filename;
            JIMMY.downloadLink.click();

        });

    }

};