/* Author:

TODO:
-vertical scrolling

FIXME:
-change flip into "power jump"
-variable height jumps may not make sense... maybe add a super jump by tapping up twice?
-player should regain control 0.5 seconds into damage invincibility
-make sure sword animation doesn't play at disallowed times
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

/*var config;

var gameFont;

var tileSetList = {};
var tileSheet;
var tileSet;

var spriteSetList = {};
var spriteSheetsLoading = 0;
var spriteSet;

var triggerSetList = {};
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
var enabledKeys = {};

var lastUpdateTime = new Date();*/

//var inheriting = {};

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

//init();

var engine;

$.ajax({
    type: "get",
    url: "assets/test4.conf",
    dataType: "json",
    success: configReady
});

function configReady(data) {
    engine = new Engine({
        'canvas'            : document.getElementById('display'),
        'canvasContainer'   : document.getElementById('displayContainer'),
        'config'            : data,
        'width'             : 768,
        'height'            : 768,
        'checkKeys'         : checkKeys,
        'update'            : update,
        'fps'               : document.getElementById('fps'),
        'debug'             : document.getElementById('debug')
    });

    engine.loadLevel("level1");
}


function update(secondsElapsed) {
}

function checkKeys() {
    if(engine.player) {
        var player = engine.player,
            keys = engine.keys;

        // MOVE
        if(keys[KEY_LEFT]) {
            player.moveLeft();

        } else if(keys[KEY_RIGHT]) {
            player.moveRight();

        } else {
            player.stop();
        }

        // JUMP
        /*if(keys[KEY_UP] && player.allowJump) {
         player.startJump(secondsElapsed);
         } else if(player.vVelocity == 0 && player.dirY == -1) {
         player.startFall();
         } else if(!keys[KEY_UP] && player.haltYDir == 1) {
         player.canJump();
         } else if(player.haltYDir == 1) {
         player.onGround = true;
         } else if(player.moveY > 1 || player.moveY < -1){
         player.onGround = false;
         }*/

        if(keys[KEY_UP]) {
            player.startJump();
        } else {
            player.endJump();
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
        /*if(keys[KEY_UP] && player.isDownThrusting && player.didHit) {
         //this.startJump(secondsElapsed);
         player.vVelocity = -player.vMaxVelocity * 1.5 * secondsElapsed;
         player.isFlipping = true;
         player.allowDownThrust = true;
         }*/

        // ATTACK
        if(keys[KEY_X] && !player.isDownThrusting) {
            if(player.allowAttack) {
                player.isAttacking = true;
                player.allowAttack = false;
            }
        } else {
            player.allowAttack = true;
        }
    }

    /*} else {
     player.stop();
     //player.startFall(); // FIXME!
     }*/
}
