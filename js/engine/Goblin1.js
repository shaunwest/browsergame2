/**
 * @author shaun
 */

function Goblin1(animations, def) {
	if (arguments[0] === inheriting) return;
	
	//PhysicsEntity.call(this, animations, def);
	Entity.call(this, animations, def);

	this.onGround = false;
	
	this.bounds = {left: 8, top: 16, right: 8, bottom: 0};
			
	this.doMoveY = false; //true;
	this.doMoveX = true;
	this.vMaxVelocity = 12;
	this.hMaxVelocity = 5;
    this.hVelocity = 5;
	this.dirX = -1;
	this.vAcceleration = 36;
    this.hAcceleration = 20;
}

Goblin1.prototype = new Entity(inheriting);
Goblin1.prototype.constructor = Entity;
Goblin1.base = Entity.prototype;

Goblin1.prototype.updateEnd = function() {
    Goblin1.base.updateEnd.call(this);

    // WALK
    if(this.moveX < 0) {
        this.setCurrentAnimation(2);
    } else if(this.moveX > 0) {
        this.setCurrentAnimation(3);

    // IDLE
    } else if(this.dirX == -1) {
        this.setCurrentAnimation(0);
    } else {
        this.setCurrentAnimation(1);
    }
}

Goblin1.prototype.levelCollisionX = function(direction, tileDef) {
    Goblin1.base.levelCollisionX.call(this, direction, tileDef);
	
	this.dirX = -this.dirX;
};



