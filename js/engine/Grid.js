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
    this.init(config);
}

Grid.prototype.init = function(config) {
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
    this.dataSourceWidth                = this.dataSource.length;
    this.dataSourceHeight               = this.dataSource[0].length;
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
    this.containerElement.style.width   = this.gridWidth * this.segmentSize;
    this.containerElement.style.height  = this.gridHeight * this.segmentSize;
    this.gridPositionX                  = Grid.ORIGIN_X;
    this.gridPositionY                  = Grid.ORIGIN_Y;
    this.segments                       = [[], []];
    this.activeSegmentsIndex            = 0;
    this.nextSegmentsIndex              = 1;

    this.queue                          = new FrameQueue();
};

Grid.prototype.exception = function(error) {
    throw error;
};

Grid.prototype.scroll = function(xDir, yDir, xAmount, yAmount) {
    var segmentSize = this.segmentSize,
        deltaX = xDir * xAmount,
        deltaY = yDir * yAmount,
        doShiftX = false,
        doShiftY = false,
        gridPositionX = this.gridPositionX,
        gridPositionY = this.gridPositionY;

    if(xDir != 0 || yDir != 0) {
        this.viewX += deltaX;

        if(this.viewX > 0) {
            this.viewX = 0;
            gridPositionX = 0;

        } else if(this.viewX < -this.sourceWidthPixels + this.viewWidth) {
            this.viewX = -this.sourceWidthPixels + this.viewWidth;

        } else {
            gridPositionX += deltaX;
        }

        if(gridPositionX > 0) {
            gridPositionX = -segmentSize + 1;
            doShiftX = true;

        } else if(gridPositionX <= -segmentSize) {
            gridPositionX = 0;
            doShiftX = true;
        }

        this.viewY += deltaY;

        if(this.viewY > 0) {
            this.viewY = 0;
            gridPositionY = 0;

        } else if(this.viewY < -this.sourceHeightPixels + this.viewHeight) {
            this.viewY = -this.sourceHeightPixels + this.viewHeight;

        } else {
            gridPositionY += deltaY;
        }

        if(gridPositionY > 0) {
            gridPositionY = -segmentSize + 1;
            doShiftY = true;

        } else if(gridPositionY <= -segmentSize) {
            gridPositionY = 0;
            doShiftY = true;
        }

        if(doShiftX && doShiftY) {
            this.shiftPositions(xDir, yDir);
        } else if(doShiftX) {
            this.shiftPositions(xDir, 0);
        } else if(doShiftY) {
            this.shiftPositions(0, yDir);
        }

        this.gridPositionX = gridPositionX;
        this.gridPositionY = gridPositionY;
    }
};

Grid.prototype.createSegments = function() {
    var gridWidth = this.gridWidth,
        gridHeight = this.gridHeight,
        segments1 = this.segments[this.activeSegmentsIndex],
        segments2 = this.segments[this.nextSegmentsIndex];

    for(var gridX = 0; gridX < gridWidth; gridX++) {
        segments1[gridX] = [];
        segments2[gridX] = [];

        for(var gridY = 0; gridY < gridHeight; gridY++) {
            this.createSegment(gridX, gridY);
        }
    }
};

Grid.prototype.createSegment = function(gridX, gridY) {
    var segment = this.createCanvas(gridX, gridY),
        segments = this.segments[this.activeSegmentsIndex];

    this.containerElement.appendChild(segment);
    segments[gridX][gridY] = segment;
};

Grid.prototype.createCanvas = function(gridX, gridY) {
    var dataSourceCellSize = this.dataSourceCellSize,
        cellsPerSegment = this.cellsPerSegment,
        cellX = gridX * cellsPerSegment,
        cellY = gridY * cellsPerSegment;

    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = this.segmentSize + 2;
    canvas.style.position = "absolute";

    this.renderSegment(canvas, cellX - Math.floor(this.viewX / dataSourceCellSize), cellY - Math.floor(this.viewY / dataSourceCellSize));

    return canvas;
};

Grid.prototype.shiftPositions = function(hDir, vDir) {
    var newX, newY,
        redraw,
        segment;

    for(var gridX = 0; gridX < this.gridWidth; gridX++) {
        for(var gridY = 0; gridY < this.gridHeight; gridY++) {
            segment = this.segments[this.activeSegmentsIndex][gridX][gridY];
            redraw = false;

            if(hDir == -1) {  //DIR_LEFT
                if(gridX == 0) {
                    newX = this.gridWidth - 1;
                    redraw = true;
                } else {
                    newX = gridX + hDir;
                }

            } else if(hDir == 1) { // DIR_RIGHT
                if(gridX == this.gridWidth - 1) {
                    newX = 0;
                    redraw = true;
                } else {
                    newX = gridX + hDir;
                }

            } else {
                newX = gridX;
            }

            if(vDir == -1) { // DIR_UP
                if(gridY == 0) {
                    newY = this.gridHeight - 1;
                    redraw = true;
                } else {
                    newY = gridY + vDir;
                }

            } else if(vDir == 1) { // DIR_DOWN
                if(gridY == this.gridHeight - 1) {
                    newY = 0;
                    redraw = true;
                } else {
                    newY = gridY + vDir;
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
                        Math.floor(((newX * this.segmentSize) - this.viewX) / this.dataSourceCellSize),
                        Math.floor(((newY * this.segmentSize) - this.viewY) / this.dataSourceCellSize)
                    )
                );
            }

            this.segments[this.nextSegmentsIndex][newX][newY] = segment;
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

    for(var gridX = 0; gridX < this.gridWidth; gridX++) {
        for(var gridY = 0; gridY < this.gridHeight; gridY++) {
            segment = this.segments[this.activeSegmentsIndex][gridX][gridY];

            segment.style.left = (this.gridPositionX + (gridX * this.segmentSize))  + "px";
            segment.style.top = (this.gridPositionY + (gridY * this.segmentSize)) + "px";
        }
    }

    //this.queue.update();
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

            if(this.dataSource[finalX]) {
                dataId = this.dataSource[finalX][finalY];
                if(dataId !== undefined) {
                    asset = this.assetTable[dataId];
                    if(asset) {
                        context2d.drawImage(asset, cellX * cellSize, cellY * cellSize);

                        // Append two pixels from the next segment along the right edge.
                        // This is to fix a display glitch in iOS devices.
                        if(cellX == this.cellsPerSegment - 1) {
                            if(this.dataSource[finalX + 1]) {
                                asset = this.assetTable[this.dataSource[finalX + 1][finalY]];
                                                  // image,sx,sy,sw,    sh,    dx,      dy, dw, dh
                                context2d.drawImage(asset, 0, 0, 2, cellSize, cellSize, 0, 2, cellSize);
                            }
                        }

                        // Append two pixels along the bottom edge as well.
                        if(cellY == this.cellsPerSegment - 1) {
                            if(this.dataSource[finalX][finalY + 1]) {
                                asset = this.assetTable[this.dataSource[finalX][finalY + 1]];

                                context2d.drawImage(
                                    asset,         // image
                                    0, 0,           // sx,sy
                                    cellSize, 2,    // sw,sh
                                    0, cellSize,    // dx,dy
                                    cellSize, 2);   // dw,dh
                            }
                        }
                    }
                }
            }
        }
    }
};