/**
 * @author shaun
 */

Entity.DIR_LEFT     = -1;
Entity.DIR_RIGHT    = 1;
Entity.DIR_UP       = -1;
Entity.DIR_DOWN     = 1;

function Entity(animations, def) {
	if (arguments[0] === inheriting) return;
	
	this.x                  = 0;
	this.y                  = 0;
	
	this.moveX              = 0;
	this.moveY              = 0;

    this.doMoveX            = false;
    this.doMoveY            = false;

    this.hVelocity          = 0.0;
    this.vVelocity          = 0.0;

	this.dirX               = Entity.DIR_RIGHT;
	this.dirY               = Entity.DIR_DOWN;
	
	this.haltXDir           = 0;
	this.haltYDir           = 0;
	
	this.animations         = animations;
	this.size               = def.width;
	
	this.bounds             = {left: 0, top: 0, right: 0, bottom: 0};
    this.attackBounds       = {top: 0, width: 34, height: 96};
	
	this.type               = def.type;
	this.levelCollisions    = def.levelCollisions;
	this.entityCollisions   = def.entityCollisions;
	this.resolveCollisions  = def.resolveCollisions;

    this.lastIntersection   = null;
    this.lastAttackIntersection = null;

    this.timerCount         = 0;
    this.timerFunc          = null;

    this.repeaterCount      = 0;
    this.repeaterTarget     = 0;
    this.repeaterFunc       = null;

    this.isAttacking        = false;
    this.isVisible          = true;

	var animation           = (animations) ? animations[0] : new Animation();

	this.currentAnimation   = new AnimationPlayer(animation);
}

Entity.prototype.adjustedBounds = function() {
	return {
		left: this.x + this.bounds.left,
		top: this.y + this.bounds.top, 
		right: this.x + (this.size - this.bounds.right), 
		bottom: this.y + (this.size - this.bounds.bottom)
	};
};

Entity.prototype.adjustedAttackBounds = function() {
    if(this.dirX == Entity.DIR_RIGHT) {
        return {
            left: this.x + this.size,
            top: this.y + this.attackBounds.top,
            right: this.x + this.size + this.attackBounds.width,
            bottom: this.y + this.size + this.attackBounds.height
        };
    } else {    // left
        return {
            left: this.x - this.attackBounds.width,
            top: this.y + this.attackBounds.top,
            right: this.x,
            bottom: this.y + this.size + this.attackBounds.height
        };
    }
};

Entity.prototype.intersects = function(entity) {
    var bounds1 = this.adjustedBounds();
    var bounds2 = entity.adjustedBounds();
    
    if(bounds2.left > bounds1.right || 
       bounds2.right < bounds1.left ||
       bounds2.top > bounds1.bottom ||
       bounds2.bottom < bounds1.top) {
    	return null;    	
    
    } else {
    	return {
    		x: (entity.x - this.x),
    		y: (entity.y - this.y)
    	};	
    }
};

Entity.prototype.attackIntersects = function(entity) {
    if(this.isAttacking) {
        var attackBounds    = this.adjustedAttackBounds();
        var bounds2         = entity.adjustedBounds();

        if(bounds2.left > attackBounds.right ||
            bounds2.right < attackBounds.left ||
            bounds2.top > attackBounds.bottom ||
            bounds2.bottom < attackBounds.top) {
            return null;

        } else {
            return {
                x: (entity.x - this.x),
                y: (entity.y - this.y)
            };
        }
    }

    return null;
};

Entity.prototype.levelCollisionX = function(direction, tileDef) {
	this.moveX = 0;
	this.haltXDir = direction;
};

Entity.prototype.levelCollisionY = function(direction, tileDef) {
	this.moveY = 0;
	this.haltYDir = direction;
};

Entity.prototype.setCurrentAnimation = function(index, onComplete, onFrameComplete) {
	this.currentAnimation.play(this.animations[index], onComplete, onFrameComplete);
};

Entity.prototype.getAnimation = function(index) {
    if(this.animations[index]) {
        return this.animations[index];
    }

    return null;
};

Entity.prototype.getCurrentFrames = function() {
	return [
        {
         'x': this.x,
         'y': this.y,
         'image': this.currentAnimation.getCurrentFrame()
        }
    ];
};

Entity.prototype.setTimer = function(seconds, callback) {
    this.timerCount = seconds;
    this.timerFunc  = callback;
};

Entity.prototype.setRepeater = function(seconds, callback) {
    this.repeaterTarget = seconds;
    this.repeaterCount  = 0;
    this.repeaterFunc   = callback;
};

Entity.prototype.cancelRepeater = function() {
    this.repeaterCount  = 0;
    this.repeaterTarget = 0;
    this.repeaterFunc   = null;
};

Entity.prototype.updateStart = function(secondsElapsed) {
	this.currentAnimation.step();
	
	this.haltXDir = 0;
	this.haltYDir = 0;

    /*if(this.doMoveY) {
        this.moveY = this.dirY * Math.round(this.vVelocity * secondsElapsed);
    }

    if(this.doMoveX) {
        this.moveX = this.dirX * Math.round(this.hVelocity * secondsElapsed);
    }*/
};

Entity.prototype.updateEnd = function(secondsElapsed) {
    // Manage timer
    if(this.timerFunc) {
        if(this.timerCount > 0) {
            this.timerCount -= secondsElapsed;

        } else if(this.timerCount <= 0) {
            this.timerCount = 0;
            this.timerFunc();
            this.timerFunc = null;
        }
    }

    // Manage repeater
    if(this.repeaterFunc) {
        if(this.repeaterCount < this.repeaterTarget) {
            this.repeaterCount += secondsElapsed;

        } else if(this.repeaterCount >= this.repeaterTarget) {
            this.repeaterFunc();
            this.repeaterCount = 0;
        }
    }
};
