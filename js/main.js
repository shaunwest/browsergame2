/* Author:

TODO:
-vertical scrolling

FIXME:
-player should regain control 0.5 seconds into damage invincibility
-hitting jump while attacking seems to make the player jump super high
-make sure sword animation doesn't play at disallowed times
-allowed to jump in mid-air while falling from a higher location
-also landing while damaged does not set "onGround" to true, because "allowInput" is false
-player disappears when FPS falls too low?

*/
const ONE_SECOND = 1000;
const FPS = 60;
const FRAME_LENGTH = ONE_SECOND / FPS;

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_X = 88;

var config;

var gameFont;

var tileSetList;
var tileSheet;
var tileSet;

var spriteSetList;
var spriteSheetsLoading = 0;
var spriteSet;

var triggerSetList;
var triggerMap = {};

var canvasContainer;
var canvas;
var context;
var debug;

var currentLevelId;
var currentTileSetId;
var currentSpriteSetId;
var currentTriggerSetId;
var level;
var player;

var ticks = 0;
var keys = {};

var inheriting = {};

var lastUpdateTime = new Date();


if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function () {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback, fps) {
                window.setTimeout(callback, FRAME_LENGTH); // frames per second
            };
    })();
}

init();

function init(spriteSheet) {
    window.addEventListener('resize', resizeCanvas, false);

    canvasContainer = document.getElementById('displayContainer');

    canvas = document.getElementById('display');
	canvas.width    = 768;
	canvas.height   = 768;

    resizeCanvas();

    context         = canvas.getContext('2d');
    fpsDisplay      = document.getElementById('fps');
    debug           = document.getElementById('debug');
	
	getConfig();
}

function resizeCanvas() {
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;

    if(newWidth > newHeight) {
        canvasContainer.style.width = canvasContainer.style.height = canvas.style.width = canvas.style.height = "768px"; //newHeight + "px";
    } else {
        canvasContainer.style.width = canvasContainer.style.height = canvas.style.width = canvas.style.height = "768px"; //newWidth + "px";
    }
}

function onKeyDown(e){
	keys[e.keyCode] = true;
}

function onKeyUp(e) {
	keys[e.keyCode] = false;
}

function getConfig() {
	$.ajax({
		type: "get",
		url: "assets/test4.conf",
		dataType: "json",
		success: configReady
	});
}

function configReady(data) {
    config = data;

    initTileSetList();
    initSpriteSetList();
    initTriggerSetList();
    loadLevel("level1");
}

// TODO: combine these three functions into one
function initTileSetList() {
    tileSetList = {};

    for(var i in config['tileSets']) {
        var tileSetConfig = config['tileSets'][i];
        if(tileSetConfig.hasOwnProperty('setId')) {
            tileSetList[tileSetConfig['setId']] = tileSetConfig;
        }
    }
}

function initSpriteSetList() {
    spriteSetList = {};

    for(var i in config['spriteSets']) {
        var spriteSetConfig = config['spriteSets'][i];
        if(spriteSetConfig.hasOwnProperty('setId')) {
            spriteSetList[spriteSetConfig['setId']] = spriteSetConfig;
        }
    }
}

function initTriggerSetList() {
    triggerSetList = {};

    for(var i in config['triggerSets']) {
        var triggerSetConfig = config['triggerSets'][i];
        if(triggerSetConfig.hasOwnProperty('setId')) {
            triggerSetList[triggerSetConfig['setId']] = triggerSetConfig;
        }
    }
}

function loadLevel(levelId) {
    if(config['levels'].hasOwnProperty(levelId)) {
        currentLevelId = levelId;

        var levelConfig = config['levels'][currentLevelId];

        currentTileSetId = levelConfig['tileSetId'];
        currentSpriteSetId = levelConfig['spriteSetId'];
        currentTriggerSetId = levelConfig['triggerSetId'];

        //var tileSetConfig = tileSetList[currentTileSetId];

        //getTileSheet(tileSetConfig['tileSheetPath']);
        getFontSheet("score_font.png");
    }
}

function getFontSheet(fontSheetPath) {
    var fontSheet = new Image();
    fontSheet.src = "assets/" + fontSheetPath;
    fontSheet.onload = function() {
        gameFont = new Font(fontSheet, true, 48, 48, 30);

        var tileSetConfig = tileSetList[currentTileSetId];
        getTileSheet(tileSetConfig['tileSheetPath']);
    };
}

function getTileSheet(tileSheetPath) {
    // TODO: make these local vars
    // TODO: don't assume 'assets/'
    tileSheet = new Image();
    tileSheet.src = "assets/" + tileSheetPath;
    tileSheet.onload = function() {
        tileSet = new TileSet(tileSetList[currentTileSetId], tileSheet, config.tileSize);
        tileSheetReady();
    };
}

function tileSheetReady() {
    var levelConfig = config['levels'][currentLevelId];

    createTriggerMap(triggerSetList[currentTriggerSetId]['triggerDefinitions']);
    getTriggers(levelConfig['triggers']);

    spriteSet = new SpriteSet(spriteSetList[currentSpriteSetId]);
    getSpriteSheets(levelConfig['sprites'], spriteSetList[currentSpriteSetId]['spriteDefinitions']);
}

function createTriggerMap(triggerDefinitions) {
    triggerMap = {};

    for(var i in triggerDefinitions) {
        var triggerDef = triggerDefinitions[i];
        triggerMap[triggerDef.id] = triggerDef;
    }
}

function getSpriteSheets(sprites, spriteDefinitions) {
	for(var i in spriteDefinitions) {
		if(spriteDefinitions.hasOwnProperty(i)) {
            var spriteDef = spriteDefinitions[i];
            var spriteId = spriteDef['id'];

            if(!spriteSet.getSpriteSheet(spriteId)) {
                spriteSheetsLoading++;

                var spriteSheet = new Image();
                spriteSheet.src = "assets/" + spriteDef['filePath'];
                spriteSheet.onload = function() {
                    spriteSheetReady(sprites, spriteDefinitions);
                };

                spriteSet.addSpriteSheet(spriteId, spriteSheet);
            }
        }
	}
}

function spriteSheetReady(sprites, spriteDefinitions) {
	spriteSheetsLoading--;
	
	if(spriteSheetsLoading == 0) {
		getSprites(sprites, spriteDefinitions);
	}	
}

function getSprites(sprites, spriteDefinitions) {
    var levelConfig = config['levels'][currentLevelId];
    level = new GameLevel(tileSet, spriteSet, levelConfig['midground']);

    for(var i = 0; i < sprites.length; i++) {
		var sprite = sprites[i];
        var spriteId = sprite['spriteId'];
        var spriteDef = spriteSet.getSpriteDefinition(spriteId);
		var spriteSheet = spriteSet.getSpriteSheet(spriteId);
		
		var entity;
		switch(spriteDef.type) {
            case 'player':
				player = new Player(getAnimations(spriteSheet, spriteDef.width, spriteDef.defaultDelay), spriteDef);
                player.x = sprite.x;
                player.y = sprite.y;
				break;
				
			case 'goblin1':
				entity = new Goblin1(getAnimations(spriteSheet, spriteDef.width, spriteDef.defaultDelay), spriteDef);
				break;
			
			default:
				entity = new Entity(getAnimations(spriteSheet, spriteDef.width, spriteDef.defaultDelay), spriteDef);	
		}

        if(entity) {
            entity.x = sprite.x;
            entity.y = sprite.y;

            level.addEntity(entity);
        }
	}

    if(player) {
        level.addEntity(player);
        level.setViewTarget(player);
    }

    startGame();
}

function startGame() {
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);

    setInterval(tick, ONE_SECOND);
    update(); //setInterval(update, Math.floor(ONE_SECOND / FPS));
}

function getAnimations(spriteSheet, size, defaultDelay) {
    var rowCount = spriteSheet.height / size;
    var animations = [];
    for(var i = 0; i < rowCount; i++) {
        var animation = new Animation(spriteSheet, i, size, defaultDelay);
        animations.push(animation);
        animations.push(animation.flip());
    }

    return animations;
}

function getTriggers(triggers) {
	for(var i = 0; i < triggers.length; i++) {
		var trigger = triggers[i];
		var triggerDef = triggerMap[trigger.triggerId];
		var entity = new Entity(null, triggerDef);
		entity.x = trigger.x;
		entity.y = trigger.y;
		
		level.addTrigger(entity);
	}
}

function checkKeys(secondsElapsed) {
	if(player) {
        if(player.allowInput) {
            // MOVE
            if(keys[KEY_LEFT]) {
                player.moveLeft();

            } else if(keys[KEY_RIGHT]) {
                player.moveRight();

            } else {
                player.stop();
            }

            // JUMP
            if(keys[KEY_UP] && player.allowJump) {
                player.startJump(secondsElapsed);
            } else if(player.vVelocity == 0 && player.dirY == -1) {
                player.startFall();
            } else if(!keys[KEY_UP] && player.haltYDir == 1) {
                player.canJump();
            } else if(player.haltYDir == 1) {
                player.onGround = true;
            } else if(player.moveY > 1 || player.moveY < -1){
                player.onGround = false;
            }

            // DUCK
            if(player.onGround) {
                if(keys[KEY_DOWN]) {
                    player.isDucking = true;
                } else {
                    player.isDucking = false;
                }

                player.allowDownThrust = true;
            }

            // DOWN ATTACK
            if(keys[KEY_DOWN] && !player.isAttacking && !player.onGround) {
                if(player.allowDownThrust) {
                    player.isDownThrusting = true;
                    player.allowDownThrust = false;
                    player.downThrustAttackMode();
                }
            }

            // FLIP
            if(keys[KEY_UP] && player.isDownThrusting && player.didHit) {
                //this.startJump(secondsElapsed);
                player.vVelocity = -player.vMaxVelocity * secondsElapsed;
                player.isFlipping = true;
                player.allowDownThrust = true;
            }

            // ATTACK
            if(keys[KEY_X] && !player.isDownThrusting) {
                if(player.allowAttack) {
                    player.isAttacking = true;
                    player.allowAttack = false;
                }
            } else {
                player.allowAttack = true;
            }

        } else {
            player.stop();
            player.startFall();
        }
	}
}

function update() {
    var now = new Date();
    var secondsElapsed = (now - lastUpdateTime) / 1000;
    lastUpdateTime = now;

    checkKeys(secondsElapsed);

	context.clearRect(0, 0, canvas.width, canvas.height);
	
	level.updateAndDraw(context, secondsElapsed);
    //gameFont.print(context, "16738", 100, 0);

	ticks++;

    requestAnimationFrame(update);
    //setTimeout( function() { update(); }, FRAME_LENGTH );
}

function tick() {
	fpsDisplay.textContent = ticks;
	
	ticks = 0;
}

function trace(value) {
    debug.innerHTML = value;
}
