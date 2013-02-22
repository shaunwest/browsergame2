/**
 * @author shaun
 */

function PhysicsEntity(animations, size) {
	if (arguments[0] === inheriting) return;
	
	Entity.call(this, animations, size);
	
	this.vMaxVelocity = 3;
	this.hMaxVelocity = 3;
			
	this.hVelocity = 0.0;
	this.vVelocity = 0.0;
			
	this.vAcceleration = 0.5;
	this.hAcceleration = 0.5;
	
	this.doMoveX = false;
	this.doMoveY = false;
}

PhysicsEntity.prototype = new Entity(inheriting);
PhysicsEntity.prototype.constructor = Entity;
PhysicsEntity.base = Entity.prototype;

PhysicsEntity.prototype.calculateVerticalVelocity = function(secondsElapsed) {
	var vAccel = (this.vAcceleration * secondsElapsed);

    if(this.doMoveY) {
		if(this.dirY > 0 && this.vVelocity < this.vMaxVelocity) {
			this.vVelocity += vAccel;
		} else if(this.dirY < 0 && this.vVelocity > -this.vMaxVelocity) {
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

    if(this.doMoveX) {
		if(this.dirX > 0 && this.hVelocity < this.hMaxVelocity) {
			this.hVelocity += hAccel;
		} else if(this.dirX < 0 && this.hVelocity > -this.hMaxVelocity) {
			this.hVelocity -= hAccel;
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

PhysicsEntity.prototype.updateStart = function(secondsElapsed) {
	PhysicsEntity.base.updateStart.call(this);
	
	this.calculateVerticalVelocity(secondsElapsed);
	this.calculateHorizontalVelocity(secondsElapsed);
	
	this.moveY = Math.floor(this.vVelocity);
	this.moveX = Math.floor(this.hVelocity);
};

PhysicsEntity.prototype.levelCollisionX = function(direction, tileDef) {
	PhysicsEntity.base.levelCollisionX.call(this, direction, tileDef);
	
	this.hVelocity = 0;
};

PhysicsEntity.prototype.levelCollisionY = function(direction, tileDef) {
	PhysicsEntity.base.levelCollisionY.call(this, direction, tileDef);
	
	this.vVelocity = 0;
};