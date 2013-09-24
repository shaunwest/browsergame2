/**
 * User: shaun
 * Date: 4/25/13
 * Time: 3:39 PM
 */

RETRO.Engine = (function() {

    function Engine(props) {
        this.init(props);
    }

    Engine.prototype.init = function(props) {
        this.fps                    = props.fps;
        this.config                 = props.config;
        this.actions                = props.actions;
        this.fonts                  = props.fonts;
        this.fixedWidth             = props.fixedWidth;
        this.fixedHeight            = props.fixedHeight;
        this.maxWidth               = props.maxWidth;
        this.maxHeight              = props.maxHeight;
        this.canvasContainer        = props.canvasContainer;
        this.gridContainer          = props.gridContainer;
        this.canvas                 = props.canvas;
        this.statusArea             = props.statusArea;
        Engine.traceArea            = props.traceArea;
        this.checkActionsCallback   = props.checkUserActions;
        this.updateCallback         = props.update;
        this.createSpritesCallback  = props.createSprites;
        this.collisionHandlers      = props.collisions;

        this.context                = this.canvas.getContext('2d');

        this.width                  = 0;
        this.height                 = 0;

        this.resizeCanvas(false);

        this.loadedFonts            = {};

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
        this.screen                 = null;
        this.screenVisible          = false;
        this.levelVisible           = false;

        this.initSetList('tileSets', this.tileSetList);
        this.initSetList('spriteSets', this.spriteSetList);
        this.initSetList('triggerSets', this.triggerSetList);

        this.userAction             = new RETRO.UserAction(this.actions);
        this.loadQueue              = new RETRO.FuncQueue(this);
        this.chrono                 = new RETRO.Chrono(this.fps);
        this.auto                   = new RETRO.Auto();

        // TODO re-write to be a little cleaner
        window.addEventListener('resize', RETRO.call(this, function() {
            this.chrono.setTimeout(1, RETRO.call(this, function() {
                this.resizeCanvas(true);
            }));
        }), false);
    };

    Engine.prototype.resizeCanvas = function(resizeView) {
        var newWidth = Math.min(window.innerWidth, this.maxWidth),
            newHeight = Math.min(window.innerHeight, this.maxHeight),
            canvasContainer = this.canvasContainer,
            canvas = this.canvas;

        canvas.width = this.width = (this.fixedWidth) ? this.fixedWidth : newWidth - 48;
        canvas.height = this.height = (this.fixedHeight) ? this.fixedHeight : newHeight - 48;

        canvasContainer.style.width = this.width + "px";
        canvasContainer.style.height = this.height + "px";

        if(resizeView) {
            this.level.setViewDimensions(this.width, this.height);
        }
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

    Engine.prototype.loadLevel = function(levelId, ready) {
        var levels = this.config['levels'],
            levelConfig,
            fontId;

        if(levels.hasOwnProperty(levelId)) {
            this.chrono.stop();
            this.currentLevelId = levelId;

            levelConfig = levels[this.currentLevelId];

            this.currentTileSetId = levelConfig['tileSetId'];
            this.currentSpriteSetId = levelConfig['spriteSetId'];
            this.currentTriggerSetId = levelConfig['triggerSetId'];

            for(fontId in this.fonts) {
                if(this.fonts.hasOwnProperty(fontId)) {
                    this.loadQueue.queue([this.getFontSheet, fontId, this.fonts[fontId]]);
                }
            }

            this.loadQueue.go([
                [this.getTileSheet, this.tileSetList[this.currentTileSetId]['export']['tileSheetPath']],
                [this.initTriggers],
                [this.initSprites],
                [this.loadSpriteAssets, this.spriteSetList[this.currentSpriteSetId]['spriteDefinitions']],
                [this.getSprites, levelConfig['sprites']],
                [ready]
            ]);
        }
    };

    Engine.prototype.getFontSheet = function(fontId, config) {
        var fontSheet = new Image();
        fontSheet.src = "assets/" + config.path;
        fontSheet.onload = RETRO.call(this, function() {
            this.loadedFonts[fontId] = new RETRO.Font(fontSheet, config.numeric, config.tileSize, config.lineHeight, config.tracking);
            this.loadQueue.dequeue();
        });
    };

    Engine.prototype.getTileSheet = function(tileSheetPath) {
        var tileSheet = new Image();
        tileSheet.src = "assets/" + tileSheetPath;
        tileSheet.onload = RETRO.call(this, function() {
            this.tileSet = new RETRO.TileSet(this.tileSetList[this.currentTileSetId]['export'], tileSheet, this.config.tileSize);
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
        this.spriteSet = new RETRO.SpriteSet(this.spriteSetList[this.currentSpriteSetId]);
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
        var levelConfig = this.config['levels'][this.currentLevelId],
            triggerMap = this.triggerMap,
            numTriggers = triggers.length,
            level = new RETRO.Level(
                this.tileSet,
                this.spriteSet,
                levelConfig['export']['foreground'],
                levelConfig['export']['background'],
                this.gridContainer,
                this.width,
                this.height
            ),
            trigger, triggerDef,
            collisionHandlers = this.collisionHandlers,
            entity;

        level.handleEntityCollision = collisionHandlers.entity;
        level.handleEntityAttackCollision = collisionHandlers.attack;
        level.handleTriggerCollision = collisionHandlers.trigger;

        for(var i = 0; i < numTriggers; i++) {
            trigger = triggers[i];
            triggerDef = triggerMap[trigger['triggerId']];

            entity = new RETRO.Entity(null, triggerDef);
            entity.x = trigger.x;
            entity.y = trigger.y;

            level.addTrigger(entity);
        }

        this.level = level;
    };

    Engine.prototype.loadSpriteAssets = function(spriteDefinitions, index) {
        index = RETRO.def(index, 0);

        var spriteDef = spriteDefinitions[index],
            spriteSet = this.spriteSet,
            spriteId,
            spriteSheet;

        if(spriteDef) {
            spriteId = spriteDef['id'];

            if(!spriteSet.getSpriteSheet(spriteId)) {
                spriteSheet = new Image();
                spriteSheet.src = "assets/" + spriteDef['filePath'];
                spriteSheet.onload = RETRO.call(this, function() {
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
        var level = this.level,
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
                entity = new RETRO.Entity(this.getAnimations(spriteSheet, width, defaultDelay), spriteDef);
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

        this.loadQueue.dequeue();
    };

    Engine.prototype.getAnimations = function(spriteSheet, size, defaultDelay) {
        var rowCount = spriteSheet.height / size,
            animations = [];

        for(var i = 0; i < rowCount; i++) {
            var animation = new RETRO.Animation(spriteSheet, i, size, defaultDelay);
            animations.push(animation);
            animations.push(animation.flip());
        }

        return animations;
    };

    Engine.prototype.start = function() {
        this.userAction.enableAll();
        this.level.init();
        this.chrono.updateFunc = RETRO.call(this, this.update);
        this.chrono.drawFunc = RETRO.call(this, this.draw);
        this.chrono.start();
    };

    Engine.prototype.checkActions = function() {
        if(this.checkActionsCallback) {
            this.checkActionsCallback(this.userAction.actions);
        }
    };

    Engine.prototype.showScreen = function(screen, seconds, func) {
        this.screen = screen;
        this.screenVisible = true;
        if(seconds && typeof func === "function") {
            this.chrono.setTimeout(seconds, func);
        }
    };

    Engine.prototype.hideScreen = function(seconds, func) {
        if(seconds) {
            this.chrono.setTimeout(seconds, RETRO.call(this, function() {
                this.screen = null;
                this.screenVisible = false;
                if(typeof func === "function") {
                    func();
                }
            }));
        }
    };

    Engine.prototype.showLevel = function() {
        this.levelVisible = true;
    };

    Engine.prototype.hideLevel = function() {
        this.levelVisible = false;
    };

    Engine.prototype.update = function(secondsElapsed) {
        this.checkActions();
        this.auto.update(secondsElapsed);

        if(this.levelVisible) {
            this.level.update(secondsElapsed);
        }

        if(this.updateCallback) {
            this.updateCallback(secondsElapsed);
        }
    };

    Engine.prototype.draw = function() {
        var context = this.context,
            width = this.width,
            height = this.height,
            screen = this.screen,
            level = this.level;

        context.clearRect(0, 0, width, height);

        if(this.levelVisible) {
            level.draw(context);
        }

        if(this.screenVisible && screen) {
            screen.draw(context, width, height);
        }

        this.displayStatus();
    };

    Engine.prototype.displayStatus = function() {
        if(this.statusArea) {
           this.statusArea.innerHTML =
                "<label>FPS:</label> " + this.chrono.fps +
                "<br><label>Pos:</label> " + this.level.viewX + ", " + this.level.viewY +
                /*"<br><label>Grid Pos:</label> " + this.level.grid.gridPositionX + ", " + this.level.grid.gridPositionX +*/
                "<br><label>PPos:</label> " + this.player.x + ", " + this.player.y +
                "<br><label>Level Width:</label> " + this.level.pixelWidth;
                /*"<br><label>MRight:</label> " + this.level.viewMarginRight +
                "<br><label>PMoveX:</label> " + this.player.moveX +
                "<br><label>PVelX:</label> " + this.player.hVelocity;*/
                /*"<br><label>Elapsed Min:</label> " + this.chrono.elapsedMin +
                "<br><label>Elapsed Max:</label> " + this.chrono.elapsedMax;*/

        }
    };

    Engine.trace = function(value) {
        if(Engine.traceArea) {
            Engine.traceArea.innerHTML = value;
        }
    };

    Engine.prototype.getFont = function(fontId) {
        if(this.loadedFonts.hasOwnProperty(fontId)) {
            return this.loadedFonts[fontId];
        }

        console.log("RETRO::Engine: Font '" + fontId + "' not found.");

        return null;
    };

    return Engine;
})();



