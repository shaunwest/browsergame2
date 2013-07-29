/**
 * User: shaun
 * Date: 4/25/13
 * Time: 3:39 PM
 */

var inheriting = {};

function Engine(props) {
    this.init(props);
}

Engine.prototype.init = function(props) {
    this.fps                    = props.fps;
    this.config                 = props.config;
    this.actions                = props.actions;
    this.fixedWidth             = props.width;
    this.fixedHeight            = props.height;
    this.canvasContainer        = props.canvasContainer;
    this.gridContainer          = props.gridContainer;
    this.canvas                 = props.canvas;
    this.statusArea             = props.statusArea;
    Engine.traceArea            = props.traceArea;
    this.checkActionsCallback   = props.checkUserActions;
    this.updateCallback         = props.update;
    this.createSpritesCallback  = props.createSprites;

    this.context                = this.canvas.getContext('2d');

    this.width                  = 0;
    this.height                 = 0;

    this.resizeCanvas();

    this.gameFont               = null;

    this.tileSetList            = {};
    this.tileSet                = null;

    this.spriteSetList          = {};
    this.spriteSet              = null;

    this.triggerSetList         = {};
    this.triggerMap             = {};

    this.currentLevelId         = "";
    this.currentTileSetId       = "";
    this.currentSpriteSetId     = "";
    this.currentTriggerSetId    = "";

    this.level                  = null;
    this.player                 = null;

    this.updateFunc             = Util.call(this, this.update);
    this.drawFunc               = Util.call(this, this.draw);

    this.initSetList('tileSets', this.tileSetList);
    this.initSetList('spriteSets', this.spriteSetList);
    this.initSetList('triggerSets', this.triggerSetList);

    this.userAction             = new UserAction(this.actions);
    this.loadQueue              = new FuncQueue(this);
    this.chrono                 = new Chrono(this.fps, this.updateFunc, this.drawFunc);

    window.addEventListener('resize', Util.call(this, this.resizeCanvas), false);
};

Engine.prototype.resizeCanvas = function() {
    var newWidth = window.innerWidth,
        newHeight = window.innerHeight,
        canvasContainer = this.canvasContainer,
        canvas = this.canvas;

    canvas.width = this.width = (this.fixedWidth) ? this.fixedWidth : newWidth;
    canvas.height = this.height = (this.fixedHeight) ? this.fixedHeight : newHeight;

    canvasContainer.style.width = this.width + "px";
    canvasContainer.style.height = this.height + "px";
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

        this.loadQueue.go([
            [this.getFontSheet, "score_font.png"],
            [this.getTileSheet, this.tileSetList[this.currentTileSetId]['tileSheetPath']],
            [this.initTriggers],
            [this.initSprites],
            [this.loadSpriteAssets, this.spriteSetList[this.currentSpriteSetId]['spriteDefinitions']],
            [this.getSprites, levelConfig['sprites']],
            [this.startGame]
        ]);
    }
};

Engine.prototype.getFontSheet = function(fontSheetPath) {
    var fontSheet = new Image();
    fontSheet.src = "assets/" + fontSheetPath;
    fontSheet.onload = Util.call(this, function() {
        this.gameFont = new Font(fontSheet, true, 48, 48, 30);
        this.loadQueue.dequeue();
    });
};

Engine.prototype.getTileSheet = function(tileSheetPath) {
    var tileSheet = new Image();
    tileSheet.src = "assets/" + tileSheetPath;
    tileSheet.onload = Util.call(this, function() {
        this.tileSet = new TileSet(this.tileSetList[this.currentTileSetId], tileSheet, this.config.tileSize);
        this.loadQueue.dequeue();
    });
};

Engine.prototype.initTriggers = function() {
    var levelConfig = this.config['levels'][this.currentLevelId];

    this.createTriggerMap(this.triggerSetList[this.currentTriggerSetId]['triggerDefinitions']);
    this.getTriggers(levelConfig['triggers']);

    this.loadQueue.dequeue();
};

Engine.prototype.initSprites = function() {
    this.spriteSet = new SpriteSet(this.spriteSetList[this.currentSpriteSetId]);
    this.loadQueue.dequeue();
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

Engine.prototype.loadSpriteAssets = function(spriteDefinitions, index) {
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
                    this.loadQueue.dequeue();
                } else {
                    this.loadSpriteAssets(spriteDefinitions, index);
                }
            });
        }
    }
};

Engine.prototype.getSprites = function(sprites) {
    var levelConfig = this.config['levels'][this.currentLevelId],
        level = new GameLevel(this.tileSet, this.spriteSet, levelConfig['midground'], this.gridContainer, this.width, this.height),
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

    this.loadQueue.dequeue();
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
    this.userAction.enableAll();
    this.level.init();
    this.chrono.start();
};

Engine.prototype.pauseGame = function() {
    this.chrono.stop();
};

Engine.prototype.unpauseGame = function() {// FIXME: this doesn't quite work as expected. Re-think.
    this.chrono.start();
};

Engine.prototype.checkActions = function() {
    if(this.checkActionsCallback) {
        this.checkActionsCallback(this.userAction.actions);
    }
};

Engine.prototype.update = function(secondsElapsed) {
    this.checkActions();
    this.level.update(secondsElapsed);

    //this.gameFont.print(this.context, "16738", 100, 0);

    if(this.updateCallback) {
        this.updateCallback(secondsElapsed);
    }
};

Engine.prototype.draw = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.level.draw(this.context);
    this.displayStatus();
};

Engine.prototype.displayStatus = function() {
    if(this.statusArea) {
       this.statusArea.innerHTML =
            "<label>FPS:</label> " + this.chrono.fps;
            /*"<br><label>Pos:</label> " + this.level.viewX + ", " + this.level.viewY +
            "<br><label>Grid Pos:</label> " + this.level.grid.gridPositionX + ", " + this.level.grid.gridPositionX +*/
            /*"<br><label>PPos:</label> " + this.player.x + ", " + this.player.y +
            "<br><label>PMoveX:</label> " + this.player.moveX +
            "<br><label>Elapsed Min:</label> " + this.chrono.elapsedMin +
            "<br><label>Elapsed Max:</label> " + this.chrono.elapsedMax;*/

    }
};

Engine.trace = function(value) {
    if(Engine.traceArea) {
        Engine.traceArea.innerHTML = value;
    }
};



