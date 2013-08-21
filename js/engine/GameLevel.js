/**
 * @author shaun
 */

RETRO.GameLevel = (function() {

    RETRO.extend(RETRO.Level, GameLevel);

    function GameLevel(tileSet, spriteSet, foregroundData, backgroundData, gameArea, viewWidth, viewHeight) {
        //this.levelData = levelData;

        RETRO.Level.call(this, tileSet, spriteSet, foregroundData, backgroundData, gameArea, viewWidth, viewHeight);
    }

    GameLevel.prototype.handleEntityCollision = function(entity1, entity2, intersectionX, intersectionY) {
        GameLevel.base.handleEntityCollision.call(this, entity1, entity2, intersectionX, intersectionY);

        if(entity1.type == "player" && !entity1.isDamaged && !entity2.isDead) {
            //this.removeEntity(entity1);
            entity1.isHit = true;
        }
    };

    GameLevel.prototype.handleEntityAttackCollision = function(attackerEntity, attackedEntity, intersection) {
        GameLevel.base.handleEntityAttackCollision.call(this, attackerEntity, attackedEntity, intersection);

        if(attackerEntity.type == "player" && attackerEntity.isHitting) {
            attackerEntity.didHit = true;
            attackedEntity.isHit = true;
            console.log("hit");
            //this.removeEntity(entity2);
        }
    };

    GameLevel.prototype.handleTriggerCollision = function(entity, trigger, intersectionX, intersectionY) {
        GameLevel.base.handleTriggerCollision.call(this, entity, trigger, intersectionX, intersectionY);

        if(entity.type == "player") {
        }
    };

    return GameLevel;
})();




