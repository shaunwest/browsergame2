/**
 * @author shaun
 */
const VMAX_VELOCITY_NORMAL = 5;
const VMAX_VELOCITY_SWIM = 1;

const HMAX_VELOCITY_NORMAL = 3;
const HMAX_VELOCITY_SWIM = 2;

const VACCEL_NORMAL = 0.2;
const VACCEL_SWIM = 1;

const HACCEL_NORMAL = 0.5;
const HACCEL_SWIM = 2;

function Player(animations, size) {
	if (arguments[0] === inheriting) return;
	
	PhysicsEntity.call(this, animations, size);
	
	this.onGround = false;
	
	this.bounds = {left: 10, top: 9, right: 10, bottom: 0};
			
	this.doMoveY = true;
	this.vMaxVelocity = VMAX_VELOCITY_NORMAL;
	this.vAcceleration = VACCEL_NORMAL;
	
	this.input = true;
	this.allowJump = false;
	this.ducking = false;
	this.rising = false;
	this.downPipe = false;
	this.upPipe = false;
	this.swimming = false;
}

Player.prototype = new PhysicsEntity(inheriting);
Player.prototype.constructor = PhysicsEntity;
Player.base = PhysicsEntity.prototype;

Player.prototype.swimMode = function() {
	this.vMaxVelocity = VMAX_VELOCITY_SWIM;
	this.hMaxVelocity = HMAX_VELOCITY_SWIM;
	
	this.vAcceleration = VACCEL_SWIM;
	this.hAcceleration = HACCEL_SWIM;
	
	this.vVelocity = 0;
	
	this.swimming = true;
}

Player.prototype.walkMode = function() {
	this.vMaxVelocity = VMAX_VELOCITY_NORMAL;
	this.hMaxVelocity = HMAX_VELOCITY_NORMAL;
	
	this.vAcceleration = VACCEL_NORMAL;
	this.hAcceleration = HACCEL_NORMAL;
	
	this.swimming = false;
}

Player.prototype.downPipeMode = function() {
	this.vMaxVelocity = 1;
	this.vAcceleration = 1;
	
	this.downPipe = true;
}

Player.prototype.startJump = function() {
	this.dirY = -1;
	this.vVelocity = -this.vMaxVelocity;
	this.doMoveY = false;
	this.allowJump = false;
	this.onGround = false;
}

Player.prototype.startFall = function() {
	this.dirY = 1;
	this.doMoveY = true;
}

Player.prototype.canJump = function() {
	this.allowJump = true;
	this.onGround = true;
}

Player.prototype.moveLeft = function() {
	this.doMoveX = true;
	this.dirX = -1;
}

Player.prototype.moveRight = function() {
	this.doMoveX = true;
	this.dirX = 1;
}

Player.prototype.swim = function() {
	this.dirY = -1;
	this.doMoveY = true;
	this.rising = true;
}

Player.prototype.sink = function() {
	this.dirY = 1;
	this.doMoveY = true;
	this.rising = false;
}

Player.prototype.stop = function() {
	this.doMoveX = false;
}

Player.prototype.updateEnd = function() {
	Player.base.updateEnd.call(this);
	
	if(!this.downPipe && this.x >= 0 && this.y >= 544 && this.x < 1008 && this.y < 768) {
		this.swimMode();
	} else {
		this.walkMode();
	}
	
	/*if(this.ducking && 
		((this.x > 330 && this.x < 346 && this.y == 432) ||
		(this.x > 682 && this.x < 698 && this.y == 400))) {
		this.downPipe = true;
		this.levelCollisions = false;
		this.doMoveY = false;
		this.onGround = false;
	} else if(this.downPipe && 
		((this.x > 330 && this.x < 346 && this.y > 608) ||
		(this.x > 682 && this.x < 698 && this.y > 576))) {
		this.downPipe = false;
		this.levelCollisions = true;
		this.doMoveY = true;*/
	if(this.downPipe) {
		this.y++;
		this.setCurrentAnimation(10);
	/*} else if(!this.upPipe && this.rising && 
		((this.x > 330 && this.x < 346 && this.y < 608) ||
		(this.x > 682 && this.x < 698 && this.y < 576))) {
		this.upPipe = true;
		this.doMoveY = false;
		this.levelCollisions = false;
		this.input = false;
	} else if(this.upPipe &&
		((this.x > 330 && this.x < 346 && this.y == 432) ||
		(this.x > 682 && this.x < 698 && this.y == 400))) {
		this.upPipe = false;
		this.levelCollisions = true;
		this.doMoveY = true;
		this.input = true;*/
	} else if(this.upPipe) {
		this.y--;
		this.setCurrentAnimation(10);
		
	// SWIM
	} else if(this.swimming && !this.onGround) {
		if(this.moveX < 0 || (this.moveY < 0 && this.dirX == -1)) {
			this.setCurrentAnimation(8);
		} else if(this.moveX > 0 || (this.moveY < 0 && this.dirX == 1)) {
			this.setCurrentAnimation(9);
		} else if(!this.onGround && this.dirX == -1) {
			this.setCurrentAnimation(6);
		} else if(!this.onGround && this.dirX == 1) {
			this.setCurrentAnimation(7);
		}
		
	// JUMP
	} else if(!this.onGround && this.dirX == -1) {
		this.setCurrentAnimation(2);
	} else if(!this.onGround && this.dirX == 1) {
		this.setCurrentAnimation(3);
	
	// WALK
	} else if(this.moveX < 0) {
		this.setCurrentAnimation(4);
	} else if(this.moveX > 0) {
		this.setCurrentAnimation(5);
	
	// IDLE
	} else if(this.dirX == -1) {
		this.setCurrentAnimation(0);
	} else {
		this.setCurrentAnimation(1);
	}
}

Player.prototype.levelCollisionY = function(direction, tileDef) {
	Player.base.levelCollisionY.call(this, direction, tileDef);
	
	// JUST USE FUCKING ENTITIES AS TRIGGERS I GUESS!?
	
	/*if(tileDef.type == "downPipe" && direction == 1) {
		var intersectX = this.x % 32;
		if(intersectX > 12 && intersectX < 18) {
			if(this.ducking) {
				this.downPipeMode();
				this.resolveCollisions = false;
				this.input = false;
			} else if(this.upPipe) {
				//this.upPipe = false;
				//this.resolveCollisions = true;
				//this.doMoveY = true;
				//this.input = true;
			}
		}
	} else if(tileDef.type == "endPipe") {
		this.downPipe = false;
		this.resolveCollisions = true;
		this.input = true;
	}*/
	
	/*if(tileDef.type == "downPipe" && direction == 1) {
		var intersectX = this.x % 32;
		if(intersectX > 12 && intersectX < 18) {
			if(this.ducking) {
				this.downPipe = true;
				this.resolveCollisions = false;
				this.doMoveY = false;
				this.onGround = false;
				this.input = false;
			} else if(this.upPipe) {
				this.upPipe = false;
				this.resolveCollisions = true;
				this.doMoveY = true;
				this.input = true;
			}
		}
	} else if(tileDef.type == "upPipe" && direction == -1) {
		var intersectX = this.x % 32;
		if(intersectX > 12 && intersectX < 18) {
			if(this.rising) {
				this.upPipe = true;
				this.resolveCollisions = false;
				this.doMoveY = false;
				this.onGround = false;
				this.input = false;
			} else if(this.downPipe) {
				this.downPipe = false;
				this.resolveCollisions = true;
				this.doMoveY = true;
				this.input = true;
			}
		}
	}*/
};
