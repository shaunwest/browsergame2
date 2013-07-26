/**
 * @author shaun
 */

function Level(tileSet, spriteSet, levelData, gameArea, viewWidth, viewHeight) {
	if (arguments[0] === inheriting) return;

    this.tileSet            = tileSet;
    this.tileSize           = tileSet.tileSize;
    this.tilesPerSegment    = 4;

    this.spriteSet          = spriteSet;
	this.levelData          = levelData;
    this.gameArea           = gameArea;

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

    this.viewWidthPixels    = viewWidth || gameArea.offsetWidth;
    this.viewHeightPixels   = viewHeight || gameArea.offsetHeight;

    this.viewWidth          = Math.floor(this.viewWidthPixels / this.tileSize) + 1;
    this.viewHeight         = Math.floor(this.viewHeightPixels / this.tileSize) + 1;

    this.viewMarginLeft     = 288; //192; //64;
    this.viewMarginRight    = 384; //480; //160;

	this.entities           = [];
	this.triggers           = [];

    this.segmentRenders     = [];

    this.frameNumber        = 0;
    this.maxFrames          = 100;
    this.frameSpeedMult     = 3;

    this.queue              = new FrameQueue();

    this.grid               = new Grid({
        containerElement: gameArea,
        drawFunc: Util.call(this, this.drawSegment),
        viewWidth: this.viewWidth * this.tileSize,
        viewHeight: this.viewHeight * this.tileSize,
        viewX: this.viewX,
        viewY: this.viewY,
        segmentSize: this.tileSize * this.tilesPerSegment
    });

    this.x1 = 0;
    this.tx1 = 0;
    this.x2 = 0;
    this.tx2 = 0;
    this.y1 = 0;
    this.ty1 = 0;
    this.y2 = 0;
    this.ty2 = 0;

    this.tileX = 0;
    this.tileY = 0;
    this.context2d = null;
    this.finalX = 0;
    this.finalY = 0;
    this.dataId = "";
    this.asset = null;
    this.cellX = 0;
    this.cellY = 0;
}

Level.prototype.init = function() {
    this.initSegmentRenders();
    this.grid.createSegments();
};

Level.prototype.initSegmentRenders = function() {
    var gridWidth = this.grid.gridWidth,
        gridHeight = this.grid.gridHeight,
        segmentSize = this.grid.segmentSize,
        segmentRenders = this.segmentRenders,
        canvas, context;

    for(var gridX = 0; gridX < gridWidth; gridX++) {
        segmentRenders[gridX] = [];

        for(var gridY = 0; gridY < gridHeight; gridY++) {
            canvas = document.createElement('canvas');
            canvas.width = canvas.height = segmentSize;
            /*context = canvas.getContext('2d');
            context.beginPath();
            context.rect(0, 0, this.grid.segmentSize, this.grid.segmentSize);
            context.fillStyle = 'yellow';
            context.fill();
            context.lineWidth = 7;
            context.strokeStyle = 'black';
            context.stroke();*/
            segmentRenders[gridX][gridY] = canvas;
        }
    }
};

Level.prototype.addEntity = function(entity) {
	this.entities.push(entity);
};

Level.prototype.addTrigger = function(entity) {
	this.triggers.push(entity);
};

Level.prototype.updateEntity = function(entity, secondsElapsed) {
	var moveX, moveY,
        newX, newY;

    entity.updateStart(secondsElapsed);

	if(entity.levelCollisions) {
		this.checkXCollision(entity);
		this.checkYCollision(entity); // if coll with moveY, reposition, cancel moveY;
	}

	if(entity.entityCollisions) {
		this.checkEntityCollisions(entity);
		this.checkTriggerCollisions(entity);
	}

    moveX = entity.moveX;
    moveY = entity.moveY;

    if(entity === this.viewTarget) {
        newX = entity.x + moveX;
        newY = entity.y + moveY;

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
	var entity2;

    for(var i = 0; i < this.entities.length; i++) {
		entity2 = this.entities[i];
		if(entity2 && entity1 !== entity2) {
            if(entity1.intersects(entity2)) {
                this.handleEntityCollision(entity1, entity2, entity1.lastIntersectionX, entity1.lastIntersectionY);
            }

            // DEBUG: removed temporarily for performance testing
            // TODO: can this be changed to only get called under certain conditions?
            /*var attackIntersection = entity1.attackIntersects(entity2);
            if(attackIntersection) {
                entity1.lastAttackIntersection = attackIntersection;
                entity2.lastHitIntersection = attackIntersection;

                this.handleEntityAttackCollision(entity1, entity2, attackIntersection);
            }*/
		}
	}
};

// TODO: test
Level.prototype.checkTriggerCollisions = function(entity) {
	for(var i = 0; i < this.triggers.length; i++) {
		var trigger = this.triggers[i];
		if(trigger) {
			if(entity.intersects(trigger)) {
				this.handleTriggerCollision(entity, trigger, entity.lastIntersectionX, entity.lastIntersectionY);
			}
		}
	}
};

Level.prototype.handleEntityCollision = function(entity1, entity2, intersectionX, intersectionY) {
};

Level.prototype.handleTriggerCollision = function(entity, trigger, intersectionX, intersectionY) {
};

Level.prototype.handleEntityAttackCollision = function(attackingEntity, attackedEntity, intersection) {
};


Level.prototype.checkXCollision = function(entity) {
    var moveX = entity.moveX, i,
        x1 = entity.boundsLeft() + moveX,
        tx1 = Math.floor(x1 / this.tileSize),
        x2 = entity.boundsRight() + moveX,
        tx2 = Math.floor((x2 - 1) / this.tileSize),
        y1 = entity.boundsTop(),
        ty1 = Math.floor(y1 / this.tileSize),
        y2 = entity.boundsBottom(),
        ty2 = Math.floor((y2 - 1) / this.tileSize);

    if(y1 >= 0 && y2 < this.pixelHeight) {
        if(moveX > 0) {
            if((x2 - 1) >= this.pixelWidth - 192) { // 192 is twice the width of the player TODO: make configurable
                this.stopRight(entity, tx2);
                entity.levelCollisionX(1);

            } else {
                for(i = ty1; i <= ty2; i++) {
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

/*
Level.prototype.checkXCollision = function(entity) {
    var moveX = entity.moveX, i;
        this.x1 = entity.boundsLeft() + moveX;
        this.tx1 = Math.floor(this.x1 / this.tileSize);
        this.x2 = entity.boundsRight() + moveX;
        this.tx2 = Math.floor((this.x2 - 1) / this.tileSize);
        this.y1 = entity.boundsTop();
        this.ty1 = Math.floor(this.y1 / this.tileSize);
        this.y2 = entity.boundsBottom();
        this.ty2 = Math.floor((this.y2 - 1) / this.tileSize);

    if(this.y1 >= 0 && this.y2 < this.pixelHeight) {
        if(moveX > 0) {
            if((this.x2 - 1) >= this.pixelWidth - 192) { // 192 is twice the width of the player TODO: make configurable
                this.stopRight(entity, this.tx2);
                entity.levelCollisionX(1);

            } else {
                for(i = this.ty1; i <= this.ty2; i++) {
                    if(this.isSolid(this.tx2, i)) {
                        this.stopRight(entity, this.tx2);
                        entity.levelCollisionX(1, this.getTile(this.tx2, i));
                        break;
                    }
                }
            }

        } else if(moveX < 0) {
            if(this.tx1 < 1) {
                this.stopLeft(entity, this.tx1);
                entity.levelCollisionX(-1);

            } else {
                for(i = this.ty1; i <= this.ty2; i++) {
                    if(this.isSolid(this.tx1, i)) {
                        this.stopLeft(entity, this.tx1);
                        entity.levelCollisionX(-1, this.getTile(this.tx1, i));
                        break;
                    }
                }
            }
        }
    }
};*/
		
/*
Level.prototype.checkYCollision = function(entity) {
	var moveY = entity.moveY, i;
    this.x1 = entity.boundsLeft();
    this.tx1 = Math.floor(this.x1 / this.tileSize);
    this.x2 = entity.boundsRight();
    this.tx2 = Math.floor((this.x2 - 1) / this.tileSize);
    this.y1 = entity.boundsTop() + moveY;
    this.ty1 = Math.floor(this.y1 / this.tileSize);
    this.y2 = entity.boundsBottom() + moveY;
    this.ty2 = Math.floor((this.y2 - 1) / this.tileSize);

	if(this.tx1 >= 0 && this.tx2 <= this.width) {
		if(moveY > 0) { // seems to be crashing when player hits bottom border of level
			if((this.y2 - 1) > this.pixelHeight) {
				this.stopDown(entity, this.ty2);
				entity.levelCollisionY(1);
				
			} else {
                for(i = this.tx1; i <= this.tx2; i++) {
                    if(this.isSolid(i, this.ty2) || this.isPlatform(i, this.ty2)) {
                        this.stopDown(entity, this.ty2);
                        entity.levelCollisionY(1, this.getTile(i, this.ty2));
                        break;
                    }
                }
            }

		} else if(moveY < 0) {
			if(this.ty1 < 1) {
				this.stopUp(entity, this.ty1);
				entity.levelCollisionY(-1);
				
			} else {
                for(i = this.tx1; i <= this.tx2; i++) {
                    if(this.isSolid(i, this.ty1)) {
                        this.stopUp(entity, this.ty1);
                        entity.levelCollisionY(-1, this.getTile(i, this.ty1));
                        break;
                    }
                }
            }
		}
	}
};*/


Level.prototype.checkYCollision = function(entity) {
    var moveY = entity.moveY,
        x1 = entity.boundsLeft(),
        tx1 = Math.floor(x1 / this.tileSize),
        x2 = entity.boundsRight(),
        tx2 = Math.floor((x2 - 1) / this.tileSize),
        y1 = entity.boundsTop() + moveY,
        ty1 = Math.floor(y1 / this.tileSize),
        y2 = entity.boundsBottom() + moveY,
        ty2 = Math.floor((y2 - 1) / this.tileSize),
        i;

    if(tx1 >= 0 && tx2 <= this.width) {
        if(moveY > 0) { // seems to be crashing when player hits bottom border of level
            if((y2 - 1) > this.pixelHeight) {
                this.stopDown(entity, ty2);
                entity.levelCollisionY(1);

            } else {
                for(i = tx1; i <= tx2; i++) {
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
		entity.x = (value * this.tileSize) + entity.boundsDefinition.right;
		entity.x -= entity.size;
	}
};

Level.prototype.stopLeft = function(entity, value) {
	if(entity.resolveCollisions) {
		entity.x = ((value + 1) * this.tileSize) - entity.boundsDefinition.left;
	}
};

Level.prototype.stopDown = function(entity, value) {
	if(entity.resolveCollisions) {
		entity.y = (value * this.tileSize) + entity.boundsDefinition.bottom;
		entity.y -= entity.size;
	} 
};

Level.prototype.stopUp = function(entity, value) {
	if(entity.resolveCollisions) {
		entity.y = ((value + 1) * this.tileSize) - entity.boundsDefinition.top;
	}
};

Level.prototype.isSolid = function(x, y) {
    return this.getTile(x, y)['solid'];
};

Level.prototype.isPlatform = function(x, y) {
    return this.getTile(x, y)['platform'];
};

Level.prototype.getTile = function(x, y) {
    return this.tileSet.getTileDefinition(this.levelData[y][x]);
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

    this.grid.setPosition(this.viewX, this.viewY);
};

Level.prototype.drawSegment = function(segment, segmentX, segmentY, levelX, levelY) {
    var that = this;
    this.queue.enqueue(function() {
        that.preRenderSegment(segment, segmentX, segmentY, levelX, levelY);
        //that.preRenderSegmentBox(segmentX, segmentY);
    });

    this.queue.enqueue(function() {
        that.renderSegment(segment, segmentX, segmentY);
    });

    //this.queue.enqueue(Util.call(this, this.preRenderSegment, segment, segmentX, segmentY, levelX, levelY));
    //this.queue.enqueue(Util.call(this, this.preRenderSegmentBox, segmentX, segmentY));
    //this.queue.enqueue(Util.call(this, this.renderSegment, segment, segmentX, segmentY));
};

Level.prototype.renderSegment = function(segment, segmentX, segmentY) {
    /*var context2d = segment.getContext('2d'),
        image = this.segmentRenders[segmentX][segmentY];

    context2d.drawImage(image, 0, 0);*/
    segment.getContext('2d').drawImage(this.segmentRenders[segmentX][segmentY], 0, 0);
};

/*Level.prototype.preRenderSegmentBox = function(segmentX, segmentY) {
    var image = this.segmentRenders[segmentX][segmentY],
        context = image.getContext('2d');

    context.beginPath();
    context.rect(0, 0, this.grid.segmentSize, this.grid.segmentSize);
    context.fillStyle = 'yellow';
    context.fill();
    context.lineWidth = 7;
    context.strokeStyle = 'black';
    context.stroke();
};*/

/*
Level.prototype.preRenderSegment = function(segment, segmentX, segmentY, levelX, levelY) {
    this.tileX = levelX * this.tilesPerSegment;
    this.tileY = levelY * this.tilesPerSegment;
    this.context2d = this.segmentRenders[segmentX][segmentY].getContext('2d');

    for(this.cellY = 0; this.cellY < this.tilesPerSegment; this.cellY++) {
        for(this.cellX = 0; this.cellX < this.tilesPerSegment; this.cellX++) {
            this.finalX = this.tileX + this.cellX;
            this.finalY = this.tileY + this.cellY;

            if(this.levelData[this.finalY]) {
                this.dataId = this.levelData[this.finalY][this.finalX];
                if(this.dataId !== undefined) {
                    this.asset = this.tileSet.tiles[this.dataId];
                    if(this.asset) {
                        this.context2d.drawImage(this.asset.image, this.cellX * this.tileSize, this.cellY * this.tileSize);
                    }
                }
            }
        }
    }
};
*/

Level.prototype.preRenderSegment = function(segment, segmentX, segmentY, levelX, levelY) {
    var tileX = levelX * this.tilesPerSegment,
        tileY = levelY * this.tilesPerSegment,
        context2d = this.segmentRenders[segmentX][segmentY].getContext('2d'),
        finalX, finalY,
        dataId, asset;

    for(var cellY = 0; cellY < this.tilesPerSegment; cellY++) {
        for(var cellX = 0; cellX < this.tilesPerSegment; cellX++) {
            finalX = tileX + cellX;
            finalY = tileY + cellY;

            if(this.levelData[finalY]) {
                dataId = this.levelData[finalY][finalX];
                if(dataId !== undefined) {
                    asset = this.tileSet.tiles[dataId];
                    if(asset) {
                        context2d.drawImage(asset.image, cellX * this.tileSize, cellY * this.tileSize);
                    }
                }
            }
        }
    }
};


Level.prototype.update = function(secondsElapsed) {
    // Track tile animation frames (zero-based)
    /*this.frameNumber += (secondsElapsed * this.frameSpeedMult);
    if(this.frameNumber >= this.maxFrames) {
        this.frameNumber = 0;
    }*/
    this.queue.update();
    this.moveView(this.viewMoveX, this.viewMoveY, this.dirX, this.dirY);
    this.updateEntities(secondsElapsed);
};

Level.prototype.draw = function(context) {
    this.drawEntities(context);
    this.grid.reposition();
};

Level.prototype.updateEntities = function(secondsElapsed) {
    for(var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        if(entity) {
            this.updateEntity(entity, secondsElapsed);
        }
    }
};

Level.prototype.drawEntities = function(context) {
    for(var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        if(entity && entity.isVisible) {
            var currentFrames = entity.getCurrentFrames();
            for(var j = 0; j < currentFrames.length; j++) {
                var frame = currentFrames[j];
                context.drawImage(frame.image, frame.x - this.viewX, frame.y - this.viewY);
            }
        }
    }
};


