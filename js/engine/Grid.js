/**
 * User: shaun
 * Date: 6/26/13 7:06 PM
 */

Grid.DEFAULT_SEGMENT_SIZE = 4;

Grid.ORIGIN_X = 0; // 192
Grid.ORIGIN_Y = 0;

Grid.DIR_NONE = 0;
Grid.DIR_LEFT = -1;
Grid.DIR_RIGHT = 1;
Grid.DIR_UP = -1;
Grid.DIR_DOWN = 1;

function Grid(config) {
    this.initConfig(config);
}

Grid.prototype.initConfig = function(config) {
    if(!config) {
        this.exception("Grid: no config provided");
    }

    this.drawFunc                       = config.drawFunc;
    this.containerElement               = config.containerElement || this.exception("Grid: no containerElement provided");
    this.viewWidth                      = config.viewWidth || this.exception("Grid: view width zero or not provided");
    this.viewHeight                     = config.viewHeight || this.exception("Grid: view height zero or not provided");
    this.segmentSize                    = config.segmentSize || Grid.DEFAULT_SEGMENT_SIZE;
    this.gridWidth                      = Math.ceil(this.viewWidth / this.segmentSize) + 1;
    this.gridHeight                     = Math.ceil(this.viewHeight / this.segmentSize) + 1;
    this.gridPositionX                  = Grid.ORIGIN_X;
    this.gridPositionY                  = Grid.ORIGIN_Y;
    this.segments                       = [[], []];
    this.activeSegmentsIndex            = 0;
    this.nextSegmentsIndex              = 1;

    this.posX                           = 0;
    this.posY                           = 0;

    this.queue                          = new FrameQueue();
};

Grid.prototype.exception = function(error) {
    throw error;
};

Grid.prototype.setPosition = function(x, y) {
    var segmentSize = this.segmentSize,
        deltaX = x - this.posX,
        deltaY = y - this.posY,
        shiftX = 0,
        shiftY = 0;

    this.gridPositionX += deltaX;
    this.gridPositionY += deltaY;

    // If delta is positive, then the scene is sliding to the LEFT
    // If delta is negative, then the scene is sliding to the RIGHT

    if(deltaX != 0) {    // Only change state if there's a reason. In this case h-movement happened.
        this.posX = x;

        // gridPositionX >= view width - segment size * Math.floor(segment count)??
        if(deltaX > 0 && this.gridPositionX >= segmentSize) { // Slide left, kick to the right, shift to the left, grid pos is around 0 on shifts
            /// DEBUG this.gridPositionX -= segmentSize;
            shiftX = -1;
                                                // segmentSize
        } else if (deltaX < 0 && this.gridPositionX < 0) { // Slide right, shift to the right, kick to the left, grid pos is around segmentSize on shifts
            /// DEBUG this.gridPositionX += segmentSize;
            shiftX = 1;
        }
    }

    // TODO: v-scrolling still needs to be tested
    if(deltaY != 0) {
        this.posY = y;

        if(deltaY > 0 && this.gridPositionY >= segmentSize) { // Slide left, kick to the right, shift to the left, grid pos is 0 on shifts
            this.gridPositionY -= segmentSize;
            shiftY = -1;

        } else if (deltaY < 0 && this.gridPositionY < 0) { // Slide right, shift to the right, kick to the left, grid pos is -segmentSize on shifts
            this.gridPositionY += segmentSize;
            shiftY = 1;
        }
    }

    if(shiftX != 0 || shiftY != 0) {
        this.shiftPositions(shiftX, shiftY);
    }
};

Grid.prototype.createSegments = function() {
    var gridWidth = this.gridWidth,
        gridHeight = this.gridHeight,
        segments1 = this.segments[this.activeSegmentsIndex],
        segments2 = this.segments[this.nextSegmentsIndex];

    for(var gridY = 0; gridY < gridHeight; gridY++) {
        segments1[gridY] = [];
        segments2[gridY] = [];

        for(var gridX = 0; gridX < gridWidth; gridX++) {
            this.createSegment(gridX, gridY);
        }
    }
};

Grid.prototype.createSegment = function(gridX, gridY) {
    var segment = this.createCanvas(gridX, gridY),
        segments = this.segments[this.activeSegmentsIndex];

    /// DEBUG this.containerElement.appendChild(segment);
    segments[gridY][gridX] = segment;
};

Grid.prototype.createCanvas = function(gridX, gridY) {
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = this.segmentSize + 2;
    canvas.style.position = "absolute";

    this.drawFunc(canvas,
        //Math.floor(((gridX * this.segmentSize) + (this.posX - this.segmentSize)) / this.segmentSize),
        gridX,
        gridY,
        Math.floor(((gridX * this.segmentSize) + this.posX) / this.segmentSize),
        Math.floor(((gridY * this.segmentSize) + this.posY) / this.segmentSize)
    );

    return canvas;
};

Grid.prototype.shiftPositions = function(hDir, vDir) {
    var newX, newY,
        redraw,
        segment;

    for(var gridY = 0; gridY < this.gridHeight; gridY++) {
        for(var gridX = 0; gridX < this.gridWidth; gridX++) {
            segment = this.segments[this.activeSegmentsIndex][gridY][gridX];
            redraw = false;

            if(hDir == -1) {  // move left, kick to the right, shift left
                if(gridX == 0) {
                    newX = this.gridWidth - 1;
                    redraw = true;
                } else {
                    newX = gridX - 1;
                }

            } else if(hDir == 1) { // move right, kick to the left, shift right
                if(gridX == this.gridWidth - 1) {
                    newX = 0;
                    redraw = true;
                } else {
                    newX = gridX + 1;
                }

            } else {
                newX = gridX;
            }

            if(vDir == -1) { // DIR_UP
                if(gridY == 0) {
                    newY = this.gridHeight - 1;
                    redraw = true;
                } else {
                    newY = gridY - 1;
                }

            } else if(vDir == 1) { // DIR_DOWN
                if(gridY == this.gridHeight - 1) {
                    newY = 0;
                    redraw = true;
                } else {
                    newY = gridY + 1;
                }

            } else {
                newY = gridY;
            }

            if(redraw) {
                this.drawFunc(
                    segment,
                    newX,
                    newY,
                    Math.floor(((newX * this.segmentSize) + this.posX) / this.segmentSize),
                    Math.floor(((newY * this.segmentSize) + this.posY) / this.segmentSize)
                );
            }

            this.segments[this.nextSegmentsIndex][newY][newX] = segment;
        }
    }

    if(this.nextSegmentsIndex == 1) {
        this.activeSegmentsIndex++;
        this.nextSegmentsIndex = 0;
    } else {
        this.activeSegmentsIndex = 0;
        this.nextSegmentsIndex++;
    }
};

Grid.prototype.reposition = function() {
    var segment;

    for(var gridY = 0; gridY < this.gridHeight; gridY++) {
        for(var gridX = 0; gridX < this.gridWidth; gridX++) {
            segment = this.segments[this.activeSegmentsIndex][gridY][gridX];

            // This is so that style changes are made all at once. Probably isn't necessary in modern browsers.
            //segment.style.cssText = "position: absolute; left: " + ((gridX * this.segmentSize) - this.gridPositionX) + "px; top: " + ((gridY * this.segmentSize) - this.gridPositionY)  + "px;";
            segment.style.left = ((gridX * this.segmentSize) - (this.gridPositionX))  + "px";
            segment.style.top = ((gridY * this.segmentSize) - (this.gridPositionY)) + "px";
        }
    }
};