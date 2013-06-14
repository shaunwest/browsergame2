/**
 * User: shaun
 * Date: 4/25/13
 * Time: 3:39 PM
 */

var inheriting = {};

const ONE_SECOND = 1000;

function Engine(props) {
    this.init(props);
}

function setRequestAnimationFrame(frameLength) {
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (function () {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback, fps) {
                    window.setTimeout(callback, frameLength); // frames per second
                };
        })();
    }
}

Engine.prototype.init = function(props) {
    var self = this;

    this.fps                    = props.fps;
    this.frameLength            = ONE_SECOND / this.fps;

    this.config                 = props.config;

    this.gameFont               = null;

    this.tileSetList            = {};
    this.tileSet                = null;

    this.spriteSetList          = {};
    this.spriteSheetsLoading    = 0;
    this.spriteSet              = null;

    this.triggerSetList         = {};
    this.triggerMap             = {};

    this.keys                   = {};
    this.enabledKeys            = {};

    this.currentLevelId         = "";
    this.currentTileSetId       = "";
    this.currentSpriteSetId     = "";
    this.currentTriggerSetId    = "";

    this.level                  = null;
    this.player                 = null;

    this.canvasContainer        = props.canvasContainer;

    this.canvas                 = props.canvas;
    this.canvas.width           = props.width;
    this.canvas.height          = props.height;

    this.resizeCanvas();

    this.context                = this.canvas.getContext('2d');
    this.fpsDisplay             = props.fpsDisplay;
    Engine.debugDisplay         = props.debugDisplay;

    this.lastUpdateTime         = new Date();
    this.ticks                  = 0;

    this.checkKeysCallback      = props.checkKeys;
    this.updateCallback         = props.update;
    this.createSpritesCallback  = props.createSprites;

    this.initSetList('tileSets', this.tileSetList);
    this.initSetList('spriteSets', this.spriteSetList);
    this.initSetList('triggerSets', this.triggerSetList);

    setRequestAnimationFrame(this.frameLength);

    window.addEventListener('resize', function() { self.resizeCanvas() }, false);
};

Engine.prototype.resizeCanvas = function() {
    var newWidth = window.innerWidth,
        newHeight = window.innerHeight,
        canvasContainer = this.canvasContainer,
        canvas = this.canvas;

    if(newWidth > newHeight) {
        canvasContainer.style.width = canvasContainer.style.height = canvas.style.width = canvas.style.height = "768px"; //newHeight + "px";
    } else {
        canvasContainer.style.width = canvasContainer.style.height = canvas.style.width = canvas.style.height = "768px"; //newWidth + "px";
    }
};

Engine.prototype.enableAllKeys = function() {
    var enabledKeys = this.enabledKeys;

    enabledKeys[KEY_LEFT]   = true;
    enabledKeys[KEY_UP]     = true;
    enabledKeys[KEY_RIGHT]  = true;
    enabledKeys[KEY_DOWN]   = true;
    enabledKeys[KEY_X]      = true;
};

Engine.prototype.disableAllKeys = function() {
    var enabledKeys = this.enabledKeys;

    enabledKeys[KEY_LEFT]   = false;
    enabledKeys[KEY_UP]     = false;
    enabledKeys[KEY_RIGHT]  = false;
    enabledKeys[KEY_DOWN]   = false;
    enabledKeys[KEY_X]      = false;
};

Engine.prototype.onKeyDown = function(e){
    var keyCode = e.keyCode,
        enabledKeys = this.enabledKeys;

    if(enabledKeys.hasOwnProperty(keyCode)) {
        this.keys[keyCode] = enabledKeys[keyCode];
    }
};

Engine.prototype.onKeyUp = function(e) {
    this.keys[e.keyCode] = false;
};

Engine.prototype.initSetList = function(configId, list) {
    var sets = this.config[configId],
        setCount = sets.length;

    for(var i = 0; i < setCount; i++) {
        var setConfig = sets[i];
        if(setConfig.hasOwnProperty('setId')) {
            list[setConfig['setId']] = setConfig;
        }
    }
};

Engine.prototype.loadLevel = function(levelId) {
    var levels = this.config['levels'];

    if(levels.hasOwnProperty(levelId)) {
        this.currentLevelId = levelId;

        var levelConfig = levels[this.currentLevelId];

        this.currentTileSetId = levelConfig['tileSetId'];
        this.currentSpriteSetId = levelConfig['spriteSetId'];
        this.currentTriggerSetId = levelConfig['triggerSetId'];

        this.getFontSheet("score_font.png");
    }
};

Engine.prototype.getFontSheet = function(fontSheetPath) {
    var self = this;

    var fontSheet = new Image();
    fontSheet.src = "assets/" + fontSheetPath;
    fontSheet.onload = function() {
        self.gameFont = new Font(fontSheet, true, 48, 48, 30);

        var tileSetConfig = self.tileSetList[self.currentTileSetId];
        self.getTileSheet(tileSetConfig['tileSheetPath']);
    };
};

Engine.prototype.getTileSheet = function(tileSheetPath) {
    var self = this;

    var tileSheet = new Image();
    tileSheet.src = "assets/" + tileSheetPath;
    tileSheet.onload = function() {
        self.tileSet = new TileSet(self.tileSetList[self.currentTileSetId], tileSheet, self.config.tileSize);
        self.tileSheetReady();
    };
};

Engine.prototype.tileSheetReady = function() {
    var levelConfig = this.config['levels'][this.currentLevelId];

    this.createTriggerMap(this.triggerSetList[this.currentTriggerSetId]['triggerDefinitions']);
    this.getTriggers(levelConfig['triggers']);

    this.spriteSet = new SpriteSet(this.spriteSetList[this.currentSpriteSetId]);
    this.getSpriteSheets(levelConfig['sprites'], this.spriteSetList[this.currentSpriteSetId]['spriteDefinitions']);
};

Engine.prototype.createTriggerMap = function(triggerDefinitions) {
    var triggerMap = {},
        numTriggers = triggerDefinitions.length;

    for(var i = 0; i < numTriggers; i++) {
        var triggerDef = triggerDefinitions[i];
        triggerMap[triggerDef.id] = triggerDef;
    }

    this.triggerMap = triggerMap;
};

Engine.prototype.getTriggers = function(triggers) {
    var triggerMap = this.triggerMap,
        numTriggers = triggers.length,
        level = this.level;

    for(var i = 0; i < numTriggers; i++) {
        var trigger = triggers[i];
        var triggerDef = triggerMap[trigger.triggerId];

        var entity = new Entity(null, triggerDef);
        entity.x = trigger.x;
        entity.y = trigger.y;

        level.addTrigger(entity);
    }
};

Engine.prototype.getSpriteSheets = function(sprites, spriteDefinitions) {
    var self = this,
        numSpriteDefs = spriteDefinitions.length,
        spriteSet = this.spriteSet;

    for(var i = 0; i < numSpriteDefs; i++) {
        var spriteDef = spriteDefinitions[i];
        var spriteId = spriteDef['id'];

        if(!spriteSet.getSpriteSheet(spriteId)) {
            this.spriteSheetsLoading++;

            var spriteSheet = new Image();
            spriteSheet.src = "assets/" + spriteDef['filePath'];
            spriteSheet.onload = function() {
                self.spriteSheetReady(sprites);
            };

            spriteSet.addSpriteSheet(spriteId, spriteSheet);
        }
    }
};

Engine.prototype.spriteSheetReady = function(sprites) {
    this.spriteSheetsLoading--;

    if(this.spriteSheetsLoading == 0) {
        this.getSprites(sprites);
    }
};

Engine.prototype.getSprites = function(sprites) {
    var levelConfig = this.config['levels'][this.currentLevelId],
        level = new GameLevel(this.tileSet, this.spriteSet, levelConfig['midground']),
        spriteSet = this.spriteSet,
        numSprites = sprites.length;

    for(var i = 0; i < numSprites; i++) {
        var sprite = sprites[i],
            spriteId = sprite['spriteId'],
            spriteDef = spriteSet.getSpriteDefinition(spriteId),
            width = spriteDef.width,
            defaultDelay = spriteDef['defaultDelay'],
            spriteSheet = spriteSet.getSpriteSheet(spriteId),
            entity;

        if(this.createSpritesCallback) {
            entity = this.createSpritesCallback(sprite, spriteDef, spriteSheet);
        }

        if(!entity) {
            entity = new Entity(this.getAnimations(spriteSheet, width, defaultDelay), spriteDef);
        }

        if(entity.type == "player") {
            this.player = entity;
            this.player.x = sprite.x;
            this.player.y = sprite.y;

        } else {
            entity.x = sprite.x;
            entity.y = sprite.y;

            level.addEntity(entity);
        }
    }

    // Add "player" last so it's rendered above
    // other sprites on the z-axis
    if(this.player) {
        level.addEntity(this.player);
        level.setViewTarget(this.player);
    }

    this.level = level;

    this.startGame();
};

Engine.prototype.getAnimations = function(spriteSheet, size, defaultDelay) {
    var rowCount = spriteSheet.height / size,
        animations = [];

    for(var i = 0; i < rowCount; i++) {
        var animation = new Animation(spriteSheet, i, size, defaultDelay);
        animations.push(animation);
        animations.push(animation.flip());
    }

    return animations;
};

Engine.prototype.startGame = function() {
    var self = this;

    window.addEventListener('keydown', function(e) { self.onKeyDown(e); }, true);
    window.addEventListener('keyup', function(e) { self.onKeyUp(e); }, true);

    this.enableAllKeys();

    setInterval(function() { self.tick(); }, ONE_SECOND);

    this.update();
};

Engine.prototype.checkKeys = function(secondsElapsed) {
    if(this.checkKeysCallback) {
        this.checkKeysCallback(this.keys);
    }
};

Engine.prototype.update = function() {
    var self = this;

    var now = new Date();
    var secondsElapsed = (now - this.lastUpdateTime) / ONE_SECOND;

    this.lastUpdateTime = now;

    this.checkKeys(secondsElapsed);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.level.updateAndDraw(this.context, secondsElapsed);
    //this.gameFont.print(this.context, "16738", 100, 0);

    this.ticks++;

    if(this.updateCallback) {
        this.updateCallback(secondsElapsed);
    }

    requestAnimationFrame(function() { self.update(); });
};

Engine.prototype.tick = function() {
    if(this.fpsDisplay) {
        this.fpsDisplay.textContent = this.ticks.toString();
    }

    this.ticks = 0;
};

Engine.trace = function(value) {
    if(Engine.debugDisplay) {
        Engine.debugDisplay.innerHTML = value;
    }
};



