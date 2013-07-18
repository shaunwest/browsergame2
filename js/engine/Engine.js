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

Engine.prototype.init = function(props) {
    this.fps                    = props.fps;
    this.config                 = props.config;
    this.controls               = props.controls;
    this.leftButton             = this.controls.left;
    this.rightButton            = this.controls.right;

    this.gameFont               = null;

    this.tileSetList            = {};
    this.tileSet                = null;

    this.spriteSetList          = {};
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

    this.gameArea               = props.gameArea,
    this.canvasContainer        = props.canvasContainer;

    this.canvas                 = props.canvas;
    this.canvas.width           = props.width;
    this.canvas.height          = props.height;

    this.resizeCanvas();

    this.context                = this.canvas.getContext('2d');
    this.statusArea             = props.statusArea;
    Engine.traceArea            = props.traceArea;

    this.checkKeysCallback      = props.checkKeys;
    this.updateCallback         = props.update;
    this.createSpritesCallback  = props.createSprites;

    this.updateFunc             = Util.call(this, this.update);

    this.initSetList('tileSets', this.tileSetList);
    this.initSetList('spriteSets', this.spriteSetList);
    this.initSetList('triggerSets', this.triggerSetList);

    this.chrono                 = new Chrono(this.fps, this.updateFunc);

    window.addEventListener('resize', Util.call(this, this.resizeCanvas), false);
};

Engine.prototype.resizeCanvas = function() {
    var newWidth = window.innerWidth,
        newHeight = window.innerHeight,
        canvasContainer = this.canvasContainer,
        canvas = this.canvas;

    /*if(newWidth > newHeight) {
        canvasContainer.style.width = canvasContainer.style.height = canvas.style.width = canvas.style.height = "1024px"; //"768px"; //newHeight + "px";
    } else {
        canvasContainer.style.width = canvasContainer.style.height = canvas.style.width = canvas.style.height = "1024px"; //"768px"; //newWidth + "px";
    }*/

    /*if(newWidth > newHeight) {
        canvasContainer.style.width = canvasContainer.style.height = canvas.width + "px"; //"1024px"; //"768px"; //newHeight + "px";
    } else {
        canvasContainer.style.width = canvasContainer.style.height = canvas.width + "px"; //"1024px"; //"768px"; //newWidth + "px";
    }*/

    canvasContainer.style.width = canvas.width + "px";
    canvasContainer.style.height = canvas.height + "px";
};

Engine.prototype.enableAllKeys = function() {
    var enabledKeys = this.enabledKeys;

    enabledKeys[KEY_LEFT]   = true;
    enabledKeys[KEY_UP]     = true;
    enabledKeys[KEY_RIGHT]  = true;
    enabledKeys[KEY_DOWN]   = true;
    enabledKeys[KEY_X]      = true;
    enabledKeys[KEY_F]      = true;
};

Engine.prototype.disableAllKeys = function() {
    var enabledKeys = this.enabledKeys;

    enabledKeys[KEY_LEFT]   = false;
    enabledKeys[KEY_UP]     = false;
    enabledKeys[KEY_RIGHT]  = false;
    enabledKeys[KEY_DOWN]   = false;
    enabledKeys[KEY_X]      = false;
    enabledKeys[KEY_F]      = false;
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

Engine.prototype.onTouchStart = function(e) {
    var touch = e.touches[0];

    e.preventDefault();

    switch(touch.target) {
        case this.leftButton:
            this.keys[KEY_LEFT] = true;
            break;

        case this.rightButton:
            this.keys[KEY_RIGHT] = true;
            break;
    }
};

Engine.prototype.onTouchEnd = function(e) {
    e.preventDefault();

    this.keys[KEY_LEFT] = false;
    this.keys[KEY_RIGHT] = false;
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
    var tileSheet = new Image();
    tileSheet.src = "assets/" + tileSheetPath;
    tileSheet.onload = Util.call(this, function() {
        this.tileSet = new TileSet(this.tileSetList[this.currentTileSetId], tileSheet, this.config.tileSize);
        this.tileSheetReady();
    });
};

Engine.prototype.tileSheetReady = function() {
    var levelConfig = this.config['levels'][this.currentLevelId];

    this.createTriggerMap(this.triggerSetList[this.currentTriggerSetId]['triggerDefinitions']);
    this.getTriggers(levelConfig['triggers']);

    this.spriteSet = new SpriteSet(this.spriteSetList[this.currentSpriteSetId]);
    this.loadSpriteAssets(this.spriteSetList[this.currentSpriteSetId]['spriteDefinitions'], Util.call(this, this.getSprites, levelConfig['sprites']));
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
        level = this.level,
        trigger, triggerDef,
        entity;

    for(var i = 0; i < numTriggers; i++) {
        trigger = triggers[i];
        triggerDef = triggerMap[trigger.triggerId];

        entity = new Entity(null, triggerDef);
        entity.x = trigger.x;
        entity.y = trigger.y;

        level.addTrigger(entity);
    }
};

Engine.prototype.loadSpriteAssets = function(spriteDefinitions, ready, index) {
    index = Util.def(index, 0);

    var spriteDef = spriteDefinitions[index],
        spriteSet = this.spriteSet,
        spriteId,
        spriteSheet;

    if(spriteDef) {
        spriteId = spriteDef['id'];

        if(!spriteSet.getSpriteSheet(spriteId)) {
            spriteSheet = new Image();
            spriteSheet.src = "assets/" + spriteDef['filePath'];
            spriteSheet.onload = Util.call(this, function() {
                spriteSet.addSpriteSheet(spriteId, spriteSheet);

                if(++index >= spriteDefinitions.length) {
                    ready();
                } else {
                    this.loadSpriteAssets(spriteDefinitions, ready, index);
                }
            });
        }
    }
};

Engine.prototype.getSprites = function(sprites) {
    var levelConfig = this.config['levels'][this.currentLevelId],
        level = new GameLevel(this.tileSet, this.spriteSet, levelConfig['midground'], this.canvasContainer),
        spriteSet = this.spriteSet,
        numSprites = sprites.length;

    for(var i = 0; i < numSprites; i++) {
        var sprite = sprites[i],
            spriteId = sprite['spriteId'],
            spriteDef = spriteSet.getSpriteDefinition(spriteId),
            width = spriteDef['width'],
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
    window.addEventListener('keydown', Util.call(this, this.onKeyDown), true);
    window.addEventListener('keyup', Util.call(this, this.onKeyUp), true);

    window.addEventListener("touchstart", Util.call(this, this.onTouchStart), true);
    window.addEventListener("touchend", Util.call(this, this.onTouchEnd), true);

    this.enableAllKeys();

    this.level.init();
    this.chrono.start();
};

Engine.prototype.checkKeys = function(secondsElapsed) {
    if(this.checkKeysCallback) {
        this.checkKeysCallback(this.keys);
    }
};

Engine.prototype.update = function(secondsElapsed) {
    this.level.grid.queue.update(); //todo: re-write

    this.checkKeys(secondsElapsed);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.level.updateAndDraw(this.context, this.canvasContainer, secondsElapsed);
    //this.gameFont.print(this.context, "16738", 100, 0);

    if(this.updateCallback) {
        this.updateCallback(secondsElapsed);
    }

    this.displayStatus();
};

Engine.prototype.displayStatus = function() {
    if(this.statusArea) {
       this.statusArea.innerHTML =
            "<label>FPS:</label> " + this.chrono.fps + "<br>" +
            "<label>Pos:</label> " + this.level.viewX + ", " + this.level.viewY +
            "<label>Grid Pos:</label> " + this.level.grid.gridPositionX + ", " + this.level.grid.gridPositionX +
            "<label>PPos:</label> " + this.player.x + ", " + this.player.y;
    }
};

Engine.trace = function(value) {
    if(Engine.traceArea) {
        Engine.traceArea.innerHTML = value;
    }
};



