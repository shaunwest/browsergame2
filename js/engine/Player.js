/**
 * @author shaun
 */
const VMAX_VELOCITY_NORMAL = 12; //15;
const HMAX_VELOCITY_NORMAL = 5; //9;
const VACCEL_NORMAL = 36; // Acceleration per second
const HACCEL_NORMAL = 20; //25; //45; //90; // Acceleration per second

function Player(animations, def) {
	if (arguments[0] === inheriting) return;
	
	PhysicsEntity.call(this, animations, def);
	
	this.onGround       = false;
	
	this.bounds         = {left: 30, top: 15, right: 30, bottom: 0};
			
	this.doMoveY        = true;
	this.vMaxVelocity   = VMAX_VELOCITY_NORMAL;
	this.vAcceleration  = VACCEL_NORMAL;
	
	this.input          = true;
	this.allowJump      = false;
	this.ducking        = false;
    this.attacking      = false;
}

Player.prototype = new PhysicsEntity(inheriting);
Player.prototype.constructor = PhysicsEntity;
Player.base = PhysicsEntity.prototype;


Player.prototype.walkMode = function() {
	this.vMaxVelocity = VMAX_VELOCITY_NORMAL;
	this.hMaxVelocity = HMAX_VELOCITY_NORMAL;
	
	this.vAcceleration = VACCEL_NORMAL;
	this.hAcceleration = HACCEL_NORMAL;
};

Player.prototype.startJump = function() {
	this.dirY = -1;
	this.vVelocity = -this.vMaxVelocity;
	this.doMoveY = false;
	this.allowJump = false;
	this.onGround = false;
};

Player.prototype.startFall = function() {
	this.dirY = 1;
	this.doMoveY = true;
};

Player.prototype.canJump = function() {
	this.allowJump = true;
	this.onGround = true;
};

Player.prototype.moveLeft = function() {
	this.doMoveX = true;
	this.dirX = -1;
};

Player.prototype.moveRight = function() {
	this.doMoveX = true;
	this.dirX = 1;
};

Player.prototype.stop = function() {
	this.doMoveX = false;
};

Player.prototype.updateEnd = function() {
	Player.base.updateEnd.call(this);

	this.walkMode();

	// JUMP
	if(!this.onGround && this.dirX == -1) {
		this.setCurrentAnimation(2);
	} else if(!this.onGround && this.dirX == 1) {
		this.setCurrentAnimation(3);

    // ATTACK
    } else if(this.attacking && this.dirX == -1) {
        this.setCurrentAnimation(6);
    } else if(this.attacking && this.dirX == 1) {
        this.setCurrentAnimation(7);

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
};

Player.prototype.levelCollisionY = function(direction, tileDef) {
	Player.base.levelCollisionY.call(this, direction, tileDef);
};
