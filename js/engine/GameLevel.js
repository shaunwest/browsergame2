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
	
	if(entity1.type == "player" && !entity1.isDamaged && !entity2.isDead) {
		//this.removeEntity(entity1);
        entity1.isHit = true;
        //entity1.lastIntersection = intersection; // FIXME: move assignment to Level
    }
};

GameLevel.prototype.handleEntityAttackCollision = function(attackerEntity, attackedEntity, intersection) {
    GameLevel.base.handleEntityAttackCollision.call(this, attackerEntity, attackedEntity, intersection);

    if(attackerEntity.type == "player" && attackerEntity.isHitting) {
        attackedEntity.isHit = true;
        //this.removeEntity(entity2);
    }
};

GameLevel.prototype.handleTriggerCollision = function(entity, trigger, intersection) {
	GameLevel.base.handleTriggerCollision.call(this, entity, trigger, intersection);
	
	if(entity.type == "player") {
	}
}




