/**
 * @author shaun
 */

function Entity(animations, def) {
	if (arguments[0] === inheriting) return;
	
	this.x = 0;
	this.y = 0;
	
	this.moveX = 0;
	this.moveY = 0;
	
	this.dirX = 1;
	this.dirY = 1;
	
	this.haltXDir = 0;
	this.haltYDir = 0;
	
	this.animations = animations;
	this.size = def.width;
	
	this.bounds = {left: 0, top: 0, right: 0, bottom: 0};
	
	this.type = def.type;
	this.levelCollisions = def.levelCollisions;
	this.entityCollisions = def.entityCollisions;
	this.resolveCollisions = def.resolveCollisions;
	
	var animation;
	if(animations) {
		animation = animations[0];
	} else {
		animation = new Animation();
	}

	this.currentAnimation = new AnimationPlayer(animation);
}

Entity.prototype.adjustedBounds = function() {
	return {
		left: this.x + this.bounds.left,
		top: this.y + this.bounds.top, 
		right: this.x + (this.size - this.bounds.right), 
		bottom: this.y + (this.size - this.bounds.bottom)
	};
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
    		x: Math.abs(entity.x - this.x),
    		y: Math.abs(entity.y - this.y)
    	};	
    }
};

Entity.prototype.levelCollisionX = function(direction, tileDef) {
	this.moveX = 0;
	this.haltXDir = direction;
};

Entity.prototype.levelCollisionY = function(direction, tileDef) {
	this.moveY = 0;
	this.haltYDir = direction;
};

Entity.prototype.setCurrentAnimation = function(index) {
	this.currentAnimation.play(this.animations[index]);
};

Entity.prototype.getCurrentFrame = function() {
	return this.currentAnimation.getCurrentFrame();
};

Entity.prototype.updateStart = function() {
	this.currentAnimation.step();
	
	this.haltXDir = 0;
	this.haltYDir = 0;
};

Entity.prototype.updateEnd = function() {
};
