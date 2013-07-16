/**
 * User: shaun
 * Date: 6/26/13 7:06 PM
 */


Grid.DEFAULT_CELL_SIZE = 48;
Grid.DEFAULT_CELLS_PER_SEGMENT = 4;

Grid.ORIGIN_X = 0;
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

    this.dataSource                     = config.dataSource || this.exception("Grid: no data source provided");

    if(!(this.dataSource instanceof Array) || !(this.dataSource[0] instanceof Array)) {
        this.exception("Grid: data source malformed. Should be 2-d Array.");
    }

    this.containerElement               = config.containerElement || this.exception("Grid: no containerElement provided");

    this.viewX                          = config.viewX || Grid.ORIGIN_X;
    this.viewY                          = config.viewY || Grid.ORIGIN_Y;
    this.viewWidth                      = config.viewWidth || this.exception("Grid: view width not provided or 0");
    this.viewHeight                     = config.viewHeight || this.exception("Grid: view height not provided or 0");

    this.dataSourceCellSize             = config.dataSourceCellSize || Grid.DEFAULT_CELL_SIZE;
    this.dataSourceHeight               = this.dataSource.length;
    this.dataSourceWidth                = this.dataSource[0].length;
    this.sourceWidthPixels              = this.dataSourceWidth * this.dataSourceCellSize;
    this.sourceHeightPixels             = this.dataSourceHeight * this.dataSourceCellSize;

    this.assetTable                     = config.assetTable || this.exception("Grid: no asset table provided");

    if(!(this.assetTable instanceof Object)) {
        this.exception("Grid: assetTable malformed. Should be Object.");
    }

    this.cellsPerSegment                = config.cellsPerSegment || Grid.DEFAULT_CELLS_PER_SEGMENT;
    this.segmentSize                    = this.cellsPerSegment * this.dataSourceCellSize;       // value in pixels
    this.gridWidth                      = Math.floor(this.viewWidth / this.segmentSize) + 1;    // add 1 extra segment
    this.gridHeight                     = Math.floor(this.viewHeight / this.segmentSize) + 1;
    //this.containerElement.style.width   = this.gridWidth * this.segmentSize;
    //this.containerElement.style.height  = this.gridHeight * this.segmentSize;
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
        gridPositionX = this.gridPositionX + deltaX,
        gridPositionY = this.gridPositionY + deltaY,
        shiftX = 0,
        shiftY = 0;

    if(deltaX != 0) {    // Only change state if there's a reason. In this case h-movement happened.
        this.posX = x;

        if(deltaX > 0 && gridPositionX >= segmentSize) { // Slide left, kick to the right, shift to the left, grid pos is 0 on shifts
            gridPositionX = gridPositionX - segmentSize;
            shiftX = -1;

        } else if (deltaX < 0 && gridPositionX < 0) { // Slide right, shift to the right, kick to the left, grid pos is -segmentSize on shifts
            gridPositionX = segmentSize + gridPositionX;
            shiftX = 1;
        }
    }

    // TODO: v-scrolling still needs to be tested
    if(deltaY != 0) {
        this.posY = y;

        if(deltaY > 0 && gridPositionY >= segmentSize) { // Slide left, kick to the right, shift to the left, grid pos is 0 on shifts
            gridPositionY = gridPositionY - segmentSize;
            shiftY = -1;

        } else if (deltaY < 0 && gridPositionY < 0) { // Slide right, shift to the right, kick to the left, grid pos is -segmentSize on shifts
            gridPositionY = segmentSize + gridPositionY;
            shiftY = 1;
        }
    }

    if(shiftX != 0 || shiftY != 0) {
        this.shiftPositions(shiftX, shiftY);
    }

    this.gridPositionX = gridPositionX;
    this.gridPositionY = gridPositionY;
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

    this.containerElement.appendChild(segment);
    segments[gridY][gridX] = segment;
};

Grid.prototype.createCanvas = function(gridX, gridY) {
    var dataSourceCellSize = this.dataSourceCellSize,
        cellsPerSegment = this.cellsPerSegment,
        cellX = gridX * cellsPerSegment,
        cellY = gridY * cellsPerSegment;

    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = this.segmentSize + 2;
    canvas.style.position = "absolute";

    this.renderSegment(canvas, cellX + Math.floor(this.posX / dataSourceCellSize), cellY + Math.floor(this.posY / dataSourceCellSize));

    return canvas;
};

Grid.prototype.shiftPositions = function(hDir, vDir) {
    var newX, newY,
        redraw, adjustX = 0,
        segment;

    for(var gridY = 0; gridY < this.gridHeight; gridY++) {
        for(var gridX = 0; gridX < this.gridWidth; gridX++) {
            segment = this.segments[this.activeSegmentsIndex][gridY][gridX];
            redraw = false;

            if(hDir == -1) {  // move left, kick to the right, shift left
                if(gridX == 0) {
                    newX = this.gridWidth - 1;
                    redraw = true;
                    adjustX = 0;
                } else {
                    newX = gridX - 1;
                }

            } else if(hDir == 1) { // move right, kick to the left, shift right
                if(gridX == this.gridWidth - 1) {
                    newX = 0;
                    redraw = true;
                    adjustX = 4;
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
                this.queue.enqueue(
                    Util.call(
                        this,
                        this.renderSegment,
                        segment,
                        (Math.floor(((newX * this.segmentSize) + this.posX) / this.segmentSize) * this.cellsPerSegment), // - adjustX,
                        Math.floor(((newY * this.segmentSize) + this.posY) / this.segmentSize) * this.cellsPerSegment
                    )
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

Grid.prototype.update = function() {
    var segment;
    for(var gridY = 0; gridY < this.gridHeight; gridY++) {
        for(var gridX = 0; gridX < this.gridWidth; gridX++) {
            segment = this.segments[this.activeSegmentsIndex][gridY][gridX];

            // This is so that style changes are made all at once. Probably isn't necessary in modern browsers.
            //segment.style.cssText = "position: absolute; left: " + ((gridX * this.segmentSize) - this.gridPositionX) + "px; top: " + ((gridY * this.segmentSize) - this.gridPositionY)  + "px;";
            segment.style.left = ((gridX * this.segmentSize) - this.gridPositionX)  + "px";
            segment.style.top = ((gridY * this.segmentSize) - this.gridPositionY) + "px";
        }
    }
};

Grid.prototype.renderSegment = function(segment, dataX, dataY) {
    var cellSize = this.dataSourceCellSize,
        context2d = segment.getContext('2d'),
        finalX, finalY,
        dataId, asset;

    for(var cellY = 0; cellY < this.cellsPerSegment; cellY++) {
        for(var cellX = 0; cellX < this.cellsPerSegment; cellX++) {
            finalX = dataX + cellX;
            finalY = dataY + cellY;

            if(this.dataSource[finalY]) {
                dataId = this.dataSource[finalY][finalX];
                if(dataId !== undefined) {
                    asset = this.assetTable[dataId];
                    if(asset) {
                        context2d.drawImage(asset.image, cellX * cellSize, cellY * cellSize);

                        /*// Append two pixels from the next segment along the right edge.
                        // This is to fix a display glitch in iOS devices.
                        if(cellX == this.cellsPerSegment - 1) {
                            //if(this.dataSource[finalX + 1]) {
                            if(this.dataSource[finalY][finalX + 1]) {
                                asset = this.assetTable[this.dataSource[finalY][finalX + 1]];
                                                  // image,sx,sy,sw,    sh,    dx,      dy, dw, dh
                                context2d.drawImage(asset.image, 0, 0, 2, cellSize, cellSize, 0, 2, cellSize);
                            }
                        }

                        // Append two pixels along the bottom edge as well.
                        if(cellY == this.cellsPerSegment - 1) {
                            //if(this.dataSource[finalX][finalY + 1]) {
                            if(this.dataSource[finalY + 1]) {
                                asset = this.assetTable[this.dataSource[finalY + 1][finalX]];

                                context2d.drawImage(
                                    asset.image,         // image
                                    0, 0,           // sx,sy
                                    cellSize, 2,    // sw,sh
                                    0, cellSize,    // dx,dy
                                    cellSize, 2);   // dw,dh
                            }
                        }*/
                    }
                }
            }
        }
    }
};