/* Author:

TODO:
-clean up dir, check in
-clean up code (race condition, comments, etc)

FIXME:
-player disappears when FPS falls too low?

*/
const ONE_SECOND = 1000;
const FPS = 60;
const FRAME_LENGTH = ONE_SECOND / FPS;

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

var lastUpdateTime = new Date();


if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function () {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback, fps) {
                window.setTimeout(callback, 1000 / 60); // frames per second
            };
    })();
}

init();

function init(spriteSheet) {
    window.addEventListener('resize', resizeCanvas, false);

    canvasContainer = document.getElementById('displayContainer');

    canvas = document.getElementById('display');
	canvas.width    = 768; //256;
	canvas.height   = 768; //256;

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
		url: "assets/game.conf",
		dataType: "json",
		success: configReady
	});
}

function configReady(data) {
    config = data;

    getTileSheet("level1_tilesheet.png", "level1_tilesheet_bi.png");

	window.addEventListener('keydown', onKeyDown, true);
	window.addEventListener('keyup', onKeyUp, true);
	
	//setInterval(update, Math.floor(ONE_SECOND / FPS));
	setInterval(tick, ONE_SECOND);
}

function getTileSheet(tileSheetPath, filterTileSheetPath) {
    tileSheet = new Image();
    tileSheet.src = "assets/" + tileSheetPath;
    //tileSheet.onload = function() { tileSheetReady() };

    filterTileSheet = new Image();
    filterTileSheet.src = "assets/" + filterTileSheetPath;
    filterTileSheet.onload = function() { tileSheetReady() }; // FIXME race condition
}

function tileSheetReady() {
    var tileSet = new TileSet(config.tileDefinitions, tileSheet, config.tileSize);
    var filterTileSet = new TileSet(config.tileDefinitions, filterTileSheet, config.tileSize);

    level = new GameLevel(tileSet, filterTileSet, config.tileDefinitions, config.levels.level1.midground, config.tileSize);

    getSpriteSheets(config.levels.level1.sprites, config.spriteDefinitions);
    getTriggers(config.levels.level1.triggers, config.triggerDefinitions);
}

function getSpriteSheets(sprites, spriteDefinitions) {
	for(var spriteId in spriteDefinitions) {
		var spriteDef = spriteDefinitions[spriteId];
		
		if(!spriteSheets.hasOwnProperty(spriteId)) {
			spriteSheetsLoading++;
			
			var spriteSheet = new Image();
			spriteSheet.src = "assets/" + spriteDef.filePath;
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

    update();
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
	if(player && player.input) {
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
    var now = new Date();
    var secondsElapsed = (now - lastUpdateTime) / 1000;
    lastUpdateTime = now;

    checkKeys();

	context.clearRect(0, 0, canvas.width, canvas.height);
	
	level.updateAndDraw(context, secondsElapsed);

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
