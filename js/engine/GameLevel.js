/**
 * @author shaun
 */

function GameLevel(tileSet, filterTileSet, tileDefinitions, levelData, tileSize) {
	if (arguments[0] === inheriting) return;

    this.levelData = levelData;

	Level.call(this, tileSet, filterTileSet, tileDefinitions, this.levelData, tileSize);
}

GameLevel.prototype = new Level(inheriting);
GameLevel.prototype.constructor = Level;
GameLevel.base = Level.prototype;

GameLevel.prototype.handleEntityCollision = function(entity1, entity2, intersection) {
	GameLevel.base.handleEntityCollision.call(this, entity1, entity2, intersection);
	
	if(entity1.type == "player" && entity2.type == "goomba") {
		if(entity1.moveY > 0 && intersection.x > 2) {
			this.removeEntity(entity2);
		} else {
			this.removeEntity(entity1);
		}	
	}
}

GameLevel.prototype.handleTriggerCollision = function(entity, trigger, intersection) {
	GameLevel.base.handleTriggerCollision.call(this, entity, trigger, intersection);
	
	if(entity.type == "player") {
	}
}




