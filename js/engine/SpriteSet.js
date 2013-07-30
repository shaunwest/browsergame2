/**
 * User: shaun
 * Date: 3/28/13
 * Time: 9:30 PM
 */

RETRO.SpriteSet = (function(){
    function SpriteSet(spriteSetConfig) {
        this.spriteSetConfig    = spriteSetConfig;
        this.spriteDefinitions  = spriteSetConfig.spriteDefinitions;
        this.spriteDefMap       = {};
        this.spriteSheets       = {};

        this.initSpriteDefMap();
    }

    SpriteSet.prototype.initSpriteDefMap = function() {
        this.spriteDefMap = {};

        for(var i = 0; i < this.spriteDefinitions.length; i++){
            var spriteDef = this.spriteDefinitions[i];
            this.spriteDefMap[spriteDef.id] = spriteDef;
        }
    };

    SpriteSet.prototype.getSpriteDefinition = function(spriteId) {
        if(this.spriteDefMap.hasOwnProperty(spriteId)) {
            return this.spriteDefMap[spriteId];
        }

        return null;
    };

    SpriteSet.prototype.getSpriteDefinitions = function() {
        return this.spriteDefinitions;
    };

    SpriteSet.prototype.addSpriteSheet = function(spriteId, spriteSheet) {
        this.spriteSheets[spriteId] = spriteSheet;
    };

    SpriteSet.prototype.getSpriteSheet = function(spriteId) {
        if(this.spriteSheets.hasOwnProperty(spriteId)) {
            return this.spriteSheets[spriteId];
        }

        return null;
    };

    return SpriteSet;
})();