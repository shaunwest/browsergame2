/**
 * @author shaun
 */

function SMBLevel(tileSet, tileDefinitions, levelData, tileSize) {
	if (arguments[0] === inheriting) return;
	
	Level.call(this, tileSet, tileDefinitions, levelData, tileSize);
}

SMBLevel.prototype = new Level(inheriting);
SMBLevel.prototype.constructor = Level;
SMBLevel.base = Level.prototype;

SMBLevel.prototype.handleEntityCollision = function(entity1, entity2, intersection) {
	SMBLevel.base.handleEntityCollision.call(this, entity1, entity2, intersection);
	
	if(entity1.type == "player" && entity2.type == "goomba") {
		if(entity1.moveY > 0 && intersection.x > 2) {
			//debug.innerHTML = "KILL!<br />";
            console.log("KILL!");
			this.removeEntity(entity2);
		} else {
			//debug.innerHTML = "ARGH!<br />";
            console.log("ARGH!");
			this.removeEntity(entity1);
		}	
	}
}

SMBLevel.prototype.handleTriggerCollision = function(entity, trigger, intersection) {
	SMBLevel.base.handleTriggerCollision.call(this, entity, trigger, intersection);
	
	if(entity.type == "player") {
		if(trigger.type == "downPipe") {
			//trace(intersection.x + ", " + intersection.y);
			if(intersection.x < 5 && entity.ducking) {
				entity.downPipe = true;
				entity.resolveCollisions = false;
				entity.input = false;
				entity.onGround = false;
				entity.doMoveY = false;
				entity.doMoveX = false;
			} else if(entity.upPipe && intersection.y == 0) {
				entity.upPipe = false;
				entity.resolveCollisions = true;
				entity.input = true;
				entity.onGround = true;
				entity.doMoveY = true;
				entity.rising = false;
			}
		} else if(trigger.type == "upPipe") {
			//trace(intersection.x + " " + intersection.y + " " + entity.rising);
			if(entity.downPipe && intersection.y == 20) {
				entity.downPipe = false;
				entity.resolveCollisions = true;
				entity.input = true;
				entity.doMoveY = true;
			} else if(intersection.x < 5 && intersection.y >= 24 && entity.rising) {
				entity.upPipe = true;
				entity.resolveCollisions = false;
				entity.input = false;
				entity.doMoveX = false;
				entity.doMoveY = false;
				entity.onGround = false;
			}
		}
	}
}




