/**
 * @author shaun
 */

function Level(tileSet, spriteSet, levelData, gameArea) {
	if (arguments[0] === inheriting) return;

    this.tileSet            = tileSet;
    this.tileSize           = tileSet.tileSize;

    this.spriteSet          = spriteSet;
	this.levelData          = levelData;
    this.gameArea           = gameArea;

    this.segmentGrid        = [];
    this.segmentCache       = {};
    this.segmentSize        = 4;
    this.segmentSizePixels  = this.segmentSize * this.tileSize;

	this.height             = levelData.length;
	this.width              = levelData[0].length;
	
	this.pixelHeight        = this.height * this.tileSize;
	this.pixelWidth         = this.width * this.tileSize;

    this.viewTarget         = null;

    this.viewX              = 0;
    this.viewY              = 0;

    this.viewMoveX          = 0;
    this.viewMoveY          = 0;
    this.dirX               = 0;
    this.dirY               = 0;

    this.viewWidth          = 17;
    this.viewHeight         = 17;

    this.viewMarginLeft     = 288; //192; //64;
    this.viewMarginRight    = 384; //480; //160;

	this.entities           = [];
	this.triggers           = [];

    this.frameNumber        = 0;
    this.maxFrames          = 100;
    this.frameSpeedMult     = 3;

    this.grid               = new Grid({containerElement: gameArea,
        viewWidth: this.viewWidth * this.tileSize,
        viewHeight: this.viewHeight * this.tileSize,
        viewX: -this.viewX,
        viewY: -this.viewY,
        dataSource: levelData,
        assetTable: tileSet.tiles,
        cellsPerSegment: 4,
        dataSourceCellSize: this.tileSize});
}

Level.prototype.init = function() {
    this.grid.createSegments();
};

Level.prototype.addEntity = function(entity) {
	this.entities.push(entity);
};

Level.prototype.addTrigger = function(entity) {
	this.triggers.push(entity);
};

Level.prototype.updateEntity = function(entity, secondsElapsed) {
	entity.updateStart(secondsElapsed);

	if(entity.levelCollisions) {
		this.checkXCollision(entity);
		this.checkYCollision(entity); // if coll with moveY, reposition, cancel moveY;
	}

	if(entity.entityCollisions) {
		this.checkEntityCollisions(entity);
		this.checkTriggerCollisions(entity);
	}

    var moveX = entity.moveX;
    var moveY = entity.moveY;

    if(entity === this.viewTarget) {
        var newX = entity.x + moveX;
        var newY = entity.y + moveY;

        //trace(moveX);

        if(moveX > 0) {
            if(newX < this.pixelWidth - this.viewMarginRight && newX - this.viewX > this.viewMarginRight) {
                this.viewMoveX = moveX;
                this.dirX = 1;

            } else {
                this.viewMoveX = 0;
                this.dirX = 0;
            }

            entity.x = newX;

        } else if(moveX < 0) {
            if(newX > this.viewMarginLeft && newX - this.viewX < this.viewMarginLeft) {
               this.viewMoveX = moveX;
                this.dirX = -1;

            } else {
                this.viewMoveX = 0;
                this.dirX = 0;
            }

            entity.x = newX;

        } else {
            this.viewMoveX = 0;
            this.viewMoveY = 0;
            this.dirX = 0;
            this.dirY = 0;
        }

        entity.y = newY;

    } else {
        entity.x += moveX;
        entity.y += moveY;
    }

	entity.updateEnd(secondsElapsed);
};

Level.prototype.removeEntity = function(entity) {
	for(var i = 0; i < this.entities.length; i++) {
		if(entity == this.entities[i]) {
			delete this.entities[i];
		}
	}
};

Level.prototype.setViewTarget = function(entity) {
    this.viewTarget = entity;
};

Level.prototype.checkEntityCollisions = function(entity1) {
	for(var i = 0; i < this.entities.length; i++) {
		var entity2 = this.entities[i];
		if(entity2 && entity1 !== entity2) {
			var intersection = entity1.intersects(entity2);
			if(intersection) {
                entity1.lastIntersection = intersection;
                this.handleEntityCollision(entity1, entity2, intersection);
			}

            // TODO: can this be changed to only get called under certain conditions?
            var attackIntersection = entity1.attackIntersects(entity2);
            if(attackIntersection) {
                entity1.lastAttackIntersection = attackIntersection;
                entity2.lastHitIntersection = attackIntersection;

                this.handleEntityAttackCollision(entity1, entity2, attackIntersection);
            }
		}
	}
};

Level.prototype.checkTriggerCollisions = function(entity) {
	for(var i = 0; i < this.triggers.length; i++) {
		var trigger = this.triggers[i];
		if(trigger) {
			var intersection = entity.intersects(trigger);
			if(intersection) {
				this.handleTriggerCollision(entity, trigger, intersection);
			}
		}
	}
};

Level.prototype.handleEntityCollision = function(entity1, entity2, intersection) {
};

Level.prototype.handleTriggerCollision = function(entity, trigger, intersection) {
};

Level.prototype.handleEntityAttackCollision = function(attackingEntity, attackedEntity, intersection) {
};

Level.prototype.checkXCollision = function(entity) {
    var moveX = entity.moveX;
    var bounds = entity.adjustedBounds();

    var x1 = bounds.left + moveX,
        tx1 = Math.floor(x1 / this.tileSize);

    var x2 = bounds.right + moveX,
        tx2 = Math.floor((x2 - 1) / this.tileSize);

    var y1 = bounds.top,
        ty1 = Math.floor(y1 / this.tileSize);

    var y2 = bounds.bottom,
        ty2 = Math.floor((y2 - 1) / this.tileSize);

    if(y1 >= 0 && y2 < this.pixelHeight) {
        if(moveX > 0) {
            if((x2 - 1) >= this.pixelWidth - 192) { // 192 is twice the width of the player TODO: make configurable
                this.stopRight(entity, tx2);
                entity.levelCollisionX(1);

            } else {
                for(var i = ty1; i <= ty2; i++) {
                    if(this.isSolid(tx2, i)) {
                        this.stopRight(entity, tx2);
                        entity.levelCollisionX(1, this.getTile(tx2, i));
                        break;
                    }
                }
            }

        } else if(moveX < 0) {
            if(tx1 < 1) {
                this.stopLeft(entity, tx1);
                entity.levelCollisionX(-1);

            } else {
                for(i = ty1; i <= ty2; i++) {
                    if(this.isSolid(tx1, i)) {
                        this.stopLeft(entity, tx1);
                        entity.levelCollisionX(-1, this.getTile(tx1, i));
                        break;
                    }
                }
            }
        }
    }
};
		
Level.prototype.checkYCollision = function(entity) {
	var moveY = entity.moveY;
    var bounds = entity.adjustedBounds();
	
	var x1 = bounds.left,
        tx1 = Math.floor(x1 / this.tileSize);
	
	var x2 = bounds.right,
        tx2 = Math.floor((x2 - 1) / this.tileSize);
	
	var y1 = bounds.top + moveY,
        ty1 = Math.floor(y1 / this.tileSize);
	
	var y2 = bounds.bottom + moveY,
        ty2 = Math.floor((y2 - 1) / this.tileSize);

	if(tx1 >= 0 && tx2 <= this.width) {
		if(moveY > 0) { // seems to be crashing when player hits bottom border of level
			if((y2 - 1) > this.pixelHeight) {
				this.stopDown(entity, ty2);
				entity.levelCollisionY(1);
				
			} else {
                for(var i = tx1; i <= tx2; i++) {
                    if(this.isSolid(i, ty2) || this.isPlatform(i, ty2)) {
                        this.stopDown(entity, ty2);
                        entity.levelCollisionY(1, this.getTile(i, ty2));
                        break;
                    }
                }
            }

		} else if(moveY < 0) {
			if(ty1 < 1) {
				this.stopUp(entity, ty1);
				entity.levelCollisionY(-1);
				
			} else {
                for(i = tx1; i <= tx2; i++) {
                    if(this.isSolid(i, ty1)) {
                        this.stopUp(entity, ty1);
                        entity.levelCollisionY(-1, this.getTile(i, ty1));
                        break;
                    }
                }
            }
		}
	}
};

Level.prototype.stopRight = function(entity, value) {
	if(entity.resolveCollisions) {
		entity.x = (value * this.tileSize) + entity.bounds.right;
		entity.x -= entity.size;
	}
};

Level.prototype.stopLeft = function(entity, value) {
	if(entity.resolveCollisions) {
		entity.x = ((value + 1) * this.tileSize) - entity.bounds.left;
	}
};

Level.prototype.stopDown = function(entity, value) {
	if(entity.resolveCollisions) {
		entity.y = (value * this.tileSize) + entity.bounds.bottom;
		entity.y -= entity.size;
	} 
};

Level.prototype.stopUp = function(entity, value) {
	if(entity.resolveCollisions) {
		entity.y = ((value + 1) * this.tileSize) - entity.bounds.top;
	}
};

Level.prototype.isSolid = function(x, y) {
	var def = this.getTile(x, y);
	
	return def.solid;
};

Level.prototype.isPlatform = function(x, y) {
	var def = this.getTile(x, y);
	
	return def.platform;
};

Level.prototype.getTile = function(x, y) {
	var tileId = this.levelData[y][x];
	//return this.tileDefinitions[tileId];
    return this.tileSet.getTileDefinition(tileId);
};

Level.prototype.moveView = function(deltaX, deltaY, dirX, dirY) {
    this.viewX += deltaX;
    this.viewY += deltaY;

    if(this.viewX < 0) {
        this.viewX = 0;
    }

    if(this.viewY < 0) {
        this.viewY = 0;
    }

    this.grid.scroll(-dirX, -dirY, Math.abs(deltaX), Math.abs(deltaY));
};

Level.prototype.getView = function() {
    return {
        'x': this.viewX,
        'y': this.viewY
    };
};

/*Level.prototype.createSegments = function(gameArea) {
    var segment,
        segmentSize = this.segmentSize,
        endX = Math.floor(this.viewWidth / segmentSize),
        endY =  Math.floor(this.viewHeight / segmentSize),
        segmentGrid = this.segmentGrid;

    for(var x = 0; x <= endX; x++) {
        segmentGrid[x] = [];

        for(var y = 0; y <= endY; y++) {
            segment = new Segment(segmentSize, segmentSize, this);

            this.moveSegment(segment, x, y);
            gameArea.appendChild(segment.canvas);

            segmentGrid[x][y] = segment;
        }
    }
};

Level.prototype.updateSegments = function(gameArea) {
    var segmentSize = this.segmentSize,
        segmentSizePixels = this.segmentSizePixels,
        startX = Math.floor(this.viewX / segmentSizePixels),    // start and end values should be in segment coordinates
        startY = Math.floor(this.viewY / segmentSizePixels),
        endX   = startX + Math.floor(this.viewWidth / segmentSize), // convert from tiles to segments
        endY   = startY + Math.floor(this.viewHeight / segmentSize),
        activeSegments = this.segmentCache,
        newActiveSegments = [],
        displayGrid = this.segmentGrid,
        gridWidth = displayGrid.length,
        gridHeight = displayGrid[0].length,
        segment;

    for(var gridY = 0; gridY < gridHeight; gridY++) {
        for(var gridX = 0; gridX < gridWidth; gridX++) {
            var activeX = gridX + startX;
            var activeY = gridY + startY;

            if(displayGrid[gridX]) {
                segment = displayGrid[gridX][gridY];

                if(segment) {
                    if(activeSegments[activeX] && activeSegments[activeX][activeY]) {
                        if(!newActiveSegments[activeX]) {
                            newActiveSegments[activeX] = [];
                        }

                        newActiveSegments[activeX][activeY] = true;

                        this.moveSegment(segment, activeX, activeY);

                    } else {
                        if(!newActiveSegments[activeX]) {
                            newActiveSegments[activeX] = [];
                        }
                        newActiveSegments[activeX][activeY] = true;

                        this.moveSegment(segment, activeX, activeY);

                        segment.render(activeX, activeY);
                    }
                }
            }
        }
    }

    this.segmentCache = newActiveSegments;
};

Level.prototype.moveSegment = function(segment, segmentX, segmentY) {
    var canvasX, canvasY,
        segmentSize = this.segmentSizePixels,
        canvas;

    canvasX = (segmentX * segmentSize)  // convert from segment coords to pixel coords
        - this.viewX;                  // move to view coords by subtracting view position

    canvasY = (segmentY * segmentSize)
        - this.viewY;

    // Apply newly calculated canvas position
    canvas = segment.canvas;
    canvas.style.left = canvasX + "px";
    canvas.style.top = canvasY + "px";
};

Level.prototype.clearSegments = function(gameArea, segmentCache) {
    var segment;

    for(var i in segmentCache) {
        for(var j in segmentCache[i]) {
            if(segmentCache[i][j]) {
                segment = segmentCache[i][j];
                gameArea.removeChild(segment.canvas);
            }
        }
    }
};*/

// TODO break down into multiple functions
Level.prototype.updateAndDraw = function(context, gameArea, secondsElapsed) {
    //this.updateSegments(gameArea);

    // Track tile animation frames (zero-based)
    this.frameNumber += (secondsElapsed * this.frameSpeedMult);
    if(this.frameNumber >= this.maxFrames) {
        this.frameNumber = 0;
    }

    // Draw entities
    for(var i = 0; i < this.entities.length; i++) {
		var entity = this.entities[i];
		if(entity) {
			this.updateEntity(entity, secondsElapsed);

            if(entity.isVisible) {
                var currentFrames = entity.getCurrentFrames();
                for(var j = 0; j < currentFrames.length; j++) {
                    var frame = currentFrames[j];
                    context.drawImage(frame.image, frame.x - this.viewX, frame.y - this.viewY);
                }
            }
		}
	}

    // Adjust the view position if necessary
    this.moveView(this.viewMoveX, this.viewMoveY, this.dirX, this.dirY);

    this.grid.update();
};


