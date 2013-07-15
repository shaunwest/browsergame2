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
        viewX: this.viewX,
        viewY: this.viewY,
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
	var entity2;

    for(var i = 0; i < this.entities.length; i++) {
		entity2 = this.entities[i];
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
    var moveX = entity.moveX,
        bounds = entity.adjustedBounds(),
        x1 = bounds.left + moveX,
        tx1 = Math.floor(x1 / this.tileSize),
        x2 = bounds.right + moveX,
        tx2 = Math.floor((x2 - 1) / this.tileSize),
        y1 = bounds.top,
        ty1 = Math.floor(y1 / this.tileSize),
        y2 = bounds.bottom,
        ty2 = Math.floor((y2 - 1) / this.tileSize),
        i;

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
		
Level.prototype.checkYCollision = function(entity) {
	var moveY = entity.moveY,
        bounds = entity.adjustedBounds(),
        x1 = bounds.left,
        tx1 = Math.floor(x1 / this.tileSize),
        x2 = bounds.right,
        tx2 = Math.floor((x2 - 1) / this.tileSize),
        y1 = bounds.top + moveY,
        ty1 = Math.floor(y1 / this.tileSize),
        y2 = bounds.bottom + moveY,
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

    //this.grid.scroll(-dirX, -dirY, Math.abs(deltaX), Math.abs(deltaY));
    //this.grid.scroll(-dirX, -dirY, Math.abs(deltaX), Math.abs(deltaY));
    this.grid.setPosition(this.viewX, this.viewY);
};

// TODO break down into multiple functions
Level.prototype.updateAndDraw = function(context, gameArea, secondsElapsed) {
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


