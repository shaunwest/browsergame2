/**
 * @author shaun
 */

function Level(tileSet, filterTileSet, tileDefinitions, levelData, tileSize) {
	if (arguments[0] === inheriting) return;

    this.tileSet            = tileSet;
    this.filterTileSet      = filterTileSet;
	this.tileDefinitions    = tileDefinitions;
	this.levelData          = levelData;
	this.tileSize           = tileSize;
	this.filterMode         = false;

	this.height             = levelData.length;
	this.width              = levelData[0].length;
	
	this.pixelHeight        = this.height * tileSize;
	this.pixelWidth         = this.width * tileSize;

    this.viewTarget         = null;

    this.viewX              = 0;
    this.viewY              = 0;

    this.viewWidth          = 17;
    this.viewHeight         = 17;

    this.viewMarginLeft     = 192; //64;
    this.viewMarginRight    = 480; //160;

	this.entities           = [];
	this.triggers           = [];
}

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

        this.filterMode = false;

        if(moveX > 0) {
            if(newX < this.pixelWidth - this.viewMarginRight && newX - this.viewX > this.viewMarginRight) {
                this.moveView(moveX, 0);
                this.filterMode = true;
            }

            entity.x = newX;

        } else if(moveX < 0) {
            if(newX > this.viewMarginLeft && newX - this.viewX < this.viewMarginLeft) {
                this.moveView(moveX, 0);
                this.filterMode = true;
            }

            entity.x = newX;
        }

        entity.y = newY;

    } else {
        entity.x += moveX;
        entity.y += moveY;
    }

	entity.updateEnd();
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
				this.handleEntityCollision(entity1, entity2, intersection);
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

Level.prototype.checkXCollision = function(entity) {
    var moveX = entity.moveX;
    var bounds = entity.adjustedBounds();

    var x1 = bounds.left + moveX;
    var tx1 = Math.floor(x1 / this.tileSize);

    var x2 = bounds.right + moveX;
    var tx2 = Math.floor((x2 - 1) / this.tileSize);

    var y1 = bounds.top;
    var ty1 = Math.floor(y1 / this.tileSize);

    var y2 = bounds.bottom;
    var ty2 = Math.floor((y2 - 1) / this.tileSize);

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
	
	var x1 = bounds.left;
	var tx1 = Math.floor(x1 / this.tileSize);
	
	var x2 = bounds.right;
	var tx2 = Math.floor((x2 - 1) / this.tileSize);
	
	var y1 = bounds.top + moveY;
	var ty1 = Math.floor(y1 / this.tileSize);
	
	var y2 = bounds.bottom + moveY;
	var ty2 = Math.floor((y2 - 1) / this.tileSize);

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
	return this.tileDefinitions[tileId];
};

Level.prototype.moveView = function(deltaX, deltaY) {
    this.viewX += deltaX;
    this.viewY += deltaY;

    if(this.viewX < 0) {
        this.viewX = 0;
    }

    if(this.viewY < 0) {
        this.viewY = 0;
    }
};

Level.prototype.getView = function() {
    return {
        'x': this.viewX,
        'y': this.viewY
    };
};

Level.prototype.updateAndDraw = function(context, secondsElapsed) {
    var startX = Math.floor(this.viewX / this.tileSize)
    var startY = Math.floor(this.viewY / this.tileSize)

    var endX   = startX + this.viewWidth;
    var endY   = startY + this.viewHeight;

    // Draw level
    for(var y = startY; y < endY; y++) {
        for(var x = startX; x < endX; x++) {
            var tileId = this.levelData[y][x];
            var tile = (this.filterMode) ? this.tileSet.getTile(tileId) : this.tileSet.getTile(tileId); //debug

            context.drawImage(tile, (x * this.tileSize) - this.viewX, (y * this.tileSize) - this.viewY);
        }
    }

    // Draw entities
    for(var i = 0; i < this.entities.length; i++) {
		var entity = this.entities[i];
		if(entity) {
			this.updateEntity(entity, secondsElapsed);

			context.drawImage(entity.getCurrentFrame(), entity.x - this.viewX, entity.y - this.viewY);
		}
	}
};


