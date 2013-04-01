/**
 * @author shaun
 */

function PhysicsEntity(animations, def) {
	if (arguments[0] === inheriting) return;
	
	Entity.call(this, animations, def);
	
	this.vMaxVelocity           = 3;
	this.hMaxVelocity           = 3;

	this.vAcceleration          = 0.5;
	this.hAcceleration          = 0.5;

    this.doVerticalVelocity     = true;
    this.doHorizontalVelocity   = true;
}

PhysicsEntity.prototype = new Entity(inheriting);
PhysicsEntity.prototype.constructor = Entity;
PhysicsEntity.base = Entity.prototype;

PhysicsEntity.prototype.calculateVerticalVelocity = function(secondsElapsed) {
    var vAccel = (this.vAcceleration * secondsElapsed);
    var vMaxVel = (this.vMaxVelocity * secondsElapsed);

    if(this.doMoveY) {
		if(this.dirY > 0 && this.vVelocity < vMaxVel) {
			this.vVelocity += vAccel;
		} else if(this.dirY < 0 && this.vVelocity > -vMaxVel) {
			this.vVelocity -= vAccel;
		}
		
	} else {
		if(Math.abs(this.vVelocity) > 0) {
			this.vVelocity += (-this.dirY * vAccel);
			if((this.dirY > 0 && this.vVelocity < 0) || (this.dirY < 0 && this.vVelocity > 0)) {
				this.vVelocity = 0;
			}
		}
	}
};
		
PhysicsEntity.prototype.calculateHorizontalVelocity = function(secondsElapsed) {
    var hAccel = (this.hAcceleration * secondsElapsed);
    var hMaxVel = (this.hMaxVelocity * secondsElapsed);

    if(this.doMoveX) {
		if(this.dirX > 0) {
            if(this.hVelocity < hMaxVel) {
        	    this.hVelocity += hAccel;
            } else {
                this.hVelocity = hMaxVel;
            }
		} else if(this.dirX < 0) {
            if(this.hVelocity > -hMaxVel) {
			    this.hVelocity -= hAccel;
            } else {
                this.hVelocity = -hMaxVel;
            }
		}
	
	} else {
		if(Math.abs(this.hVelocity) > 0) {
			this.hVelocity += (-this.dirX * hAccel);
			if((this.dirX > 0 && this.hVelocity < 0) || (this.dirX < 0 && this.hVelocity > 0)) {
				this.hVelocity = 0;
			}
		}
	}
};

PhysicsEntity.prototype.cancelHorizontalMovement = function() {
    this.moveX = 0;
    this.hVelocity = 0;
};

PhysicsEntity.prototype.cancelVerticalMovement = function() {
    this.moveY = 0;
    this.vVelocity = 0;
};

PhysicsEntity.prototype.updateStart = function(secondsElapsed) {
    PhysicsEntity.base.updateStart.call(this, secondsElapsed);
    //this.currentAnimation.step();

    this.haltXDir = 0;
    this.haltYDir = 0;

    if(this.doVerticalVelocity) {
	    this.calculateVerticalVelocity(secondsElapsed);
    }

    if(this.doHorizontalVelocity) {
	    this.calculateHorizontalVelocity(secondsElapsed);
    }
	
	this.moveY = Math.round(this.vVelocity);
	this.moveX = Math.round(this.hVelocity);
};

PhysicsEntity.prototype.levelCollisionX = function(direction, tileDef) {
	PhysicsEntity.base.levelCollisionX.call(this, direction, tileDef);
	
	this.hVelocity = 0;
};

PhysicsEntity.prototype.levelCollisionY = function(direction, tileDef) {
	PhysicsEntity.base.levelCollisionY.call(this, direction, tileDef);
	
	this.vVelocity = 0;
};