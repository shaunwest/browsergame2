/**
 * @author shaun
 */

function Goomba(animations, size) {
	if (arguments[0] === inheriting) return;
	
	PhysicsEntity.call(this, animations, size);
	
	this.onGround = false;
	
	this.bounds = {left: 8, top: 16, right: 8, bottom: 0};
			
	this.doMoveY = false; //true;
	this.doMoveX = false; //true;
	this.vMaxVelocity = 3;
	this.hMaxVelocity = 1;
	this.dirX = -1;
	this.vAcceleration = 0.2;
}

Goomba.prototype = new PhysicsEntity(inheriting);
Goomba.prototype.constructor = PhysicsEntity;
Goomba.base = PhysicsEntity.prototype;

Goomba.prototype.updateEnd = function() {
	Goomba.base.updateEnd.call(this);
}

Goomba.prototype.levelCollisionX = function(direction, tileDef) {
	Goomba.base.levelCollisionX.call(this, direction, tileDef);
	
	this.dirX = -this.dirX;
};



