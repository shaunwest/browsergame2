/* Author:

*/
const ONE_SECOND = 1000;
const FPS = 60;

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

var config;

var tileSheet;
var spriteSheets = {};
var spriteSheetsLoading = 0;

var canvasContainer;
var canvas;
var context;
var debug;

var level;
var player;

var ticks = 0;
var keys = {};

var inheriting = {};

init();

function init(spriteSheet) {
    window.addEventListener('resize', resizeCanvas, false);

    canvasContainer = document.getElementById('displayContainer');

    canvas = document.getElementById('display');
	canvas.width    = 256;
	canvas.height   = 256;

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
        canvasContainer.style.width = canvasContainer.style.height = canvas.style.width = canvas.style.height = newHeight + "px";
    } else {
        canvasContainer.style.width = canvasContainer.style.height = canvas.style.width = canvas.style.height = newWidth + "px";
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
		url: "data/mario3.conf.js",
		dataType: "json",
		success: configReady
	});
}

function configReady(data) {
    config = data;

    getTileSheet("tilesheet.png");

	window.addEventListener('keydown', onKeyDown, true);
	window.addEventListener('keyup', onKeyUp, true);
	
	setInterval(update, Math.floor(ONE_SECOND / FPS));
	setInterval(tick, ONE_SECOND);
}

function getTileSheet(tileSheetPath) {
    tileSheet = new Image();
    tileSheet.src = "data/" + tileSheetPath;
    tileSheet.onload = function() { tileSheetReady() };
}

function tileSheetReady() {
    var tileSet = new TileSet(config.tileDefinitions, tileSheet, config.tileSize);

    level = new SMBLevel(tileSet, config.tileDefinitions, config.levels.level1.midground, config.tileSize);

    getSpriteSheets(config.levels.level1.sprites, config.spriteDefinitions);
    getTriggers(config.levels.level1.triggers, config.triggerDefinitions);
}

function getSpriteSheets(sprites, spriteDefinitions) {
	for(var spriteId in spriteDefinitions) {
		var spriteDef = spriteDefinitions[spriteId];
		
		if(!spriteSheets.hasOwnProperty(spriteId)) {
			spriteSheetsLoading++;
			
			var spriteSheet = new Image();
			spriteSheet.src = "data/" + spriteDef.filePath;
			spriteSheet.onload = function() { spriteSheetReady(sprites, spriteDefinitions) };
			
			spriteSheets[spriteId] = spriteSheet;
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
	for(var i = 0; i < sprites.length; i++) {
		var sprite = sprites[i];
		var spriteDef = spriteDefinitions[sprite.spriteId];
		var spriteSheet = spriteSheets[sprite.spriteId];
		
		var entity;
		switch(spriteDef.type) {
			case 'player':
				player = entity = new Player(getAnimations(spriteSheet, spriteDef.width, spriteDef.defaultDelay), spriteDef);
                level.setViewTarget(player);
				break;
				
			case 'goomba':
				entity = new Goomba(getAnimations(spriteSheet, spriteDef.width, spriteDef.defaultDelay), spriteDef);
				break;
			
			case 'sun':
				entity = new Sun(getAnimations(spriteSheet, spriteDef.width, spriteDef.defaultDelay), spriteDef);
				break;
			
			default:
				entity = new Entity(getAnimations(spriteSheet, spriteDef.width, spriteDef.defaultDelay), spriteDef);	
		}
		
		entity.x = sprite.x;
		entity.y = sprite.y;
		
		level.addEntity(entity);
	}
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

function getTriggers(triggers, triggerDefinitions) {
	for(var i = 0; i < triggers.length; i++) {
		var trigger = triggers[i];
		var triggerDef = triggerDefinitions[trigger.triggerId];
		var entity = new Entity(null, triggerDef);
		entity.x = trigger.x;
		entity.y = trigger.y;
		
		level.addTrigger(entity);
	}
}

function checkKeys() {
	// MOVE
	if(player && player.input) {

        //var view = level.getView();

		if(keys[KEY_LEFT]) {
            /*if(player.x - view.x < 64) {
                level.moveView(-2, 0);
            }*/

            player.moveLeft();

		} else if(keys[KEY_RIGHT]) {
            /*if(player.x - view.x > 192) {
                level.moveView(2, 0);
            }*/

            player.moveRight();

		} else {
			player.stop();
		}
		
		// JUMP
        if(keys[KEY_UP] && player.allowJump) {
            player.startJump();
        } else if(player.vVelocity == 0 && player.dirY == -1) {
            player.startFall();
        } else if(!keys[KEY_UP] && player.haltYDir == 1) {
            player.canJump();
        } else if(player.haltYDir == 1) {
            player.onGround = true;
        } else if(player.moveY > 1 || player.moveY < -1){
            player.onGround = false;
        }
		
		if(keys[KEY_DOWN]) {
			player.ducking = true;
		} else {
			player.ducking = false;
		}
	}
}

function update() {
	checkKeys();

	context.clearRect(0, 0, canvas.width, canvas.height);
	
	level.updateAndDraw(context);

	ticks++;
}

function tick() {
	fpsDisplay.textContent = ticks;
	
	ticks = 0;
}

function trace(value) {
    debug.innerHTML = value;
}
