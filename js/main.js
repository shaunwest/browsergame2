/* Author: shaun

TODO:
-vertical scrolling
-do some code cleanup. Especially relating to Level/Segment code.
-add fullscreen support to make iPad testing easier
-add touch controls for iPad

FIXME:
-change flip into "power jump"
-variable height jumps may not make sense... maybe add a super jump by tapping up twice?
-player should regain control 0.5 seconds into damage invincibility
-make sure sword animation doesn't play at disallowed times
-player disappears when FPS falls too low?

*/

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_X = 88;
const KEY_F = 70;
const KEY_G = 71;

var engine;

$.ajax({
    type: "get",
    url: "assets/test5.conf",
    dataType: "json",
    success: configReady
});

function configReady(data) {
    engine = new Engine({
        'fps'               : 60,
        'gameArea'          : document.getElementById('main'),
        'canvas'            : document.getElementById('display'),
        'canvasContainer'   : document.getElementById('displayContainer'),
        'gridContainer'     : document.getElementById('grid'),
        'config'            : data,
        'width'             : 640, //1024,
        'height'            : 960, //768,
        'checkUserActions'  : checkUserActions,
        'createSprites'     : createSprites,
        'update'            : update,
        'statusArea'        : document.getElementById('status'),
        'traceArea'         : document.getElementById('trace'),
        'actions'          :
        {
            'left'          : {'key': KEY_LEFT, 'el': document.getElementById('left')},
            'right'         : {'key': KEY_RIGHT, 'el': document.getElementById('right')},
            'up'            : {'key': KEY_UP},
            'down'          : {'key': KEY_DOWN},
            'attack'        : {'key': KEY_X}
        }
    });

    engine.loadLevel("level1");
}


function update(secondsElapsed) {
}

function checkUserActions(actions) {
    if(engine.player) {
        var player = engine.player;

        // MOVE
        if(actions['left']) {
            player.moveLeft();
        } else if(actions['right']) {
            player.moveRight();
        } else {
            player.stop();
        }

        // JUMP
        if(actions['up']) {
            player.startJump();
        } else {
            player.endJump();
        }

        // DUCK
        if(player.onGround) {
            if(actions['down']) {
                player.isDucking = true;
            } else {
                player.isDucking = false;
            }

            player.allowDownThrust = true;
        }

        // DOWN ATTACK
        if(actions['down'] && !player.isAttacking && !player.onGround) {
            if(player.allowDownThrust) {
                player.isDownThrusting = true;
                player.allowDownThrust = false;
                player.downThrustAttackMode();
            }
        }

        // ATTACK
        if(actions['attack'] && !player.isDownThrusting) {
            if(player.allowAttack) {
                player.isAttacking = true;
                player.allowAttack = false;
            }
        } else {
            player.allowAttack = true;
        }
    }
}

function createSprites(sprite, spriteDef, spriteSheet) {
    var width = spriteDef['width'],
        defaultDelay = spriteDef['defaultDelay'],
        entity;

    switch(spriteDef.type) {
        case 'player':
            entity = new Player(engine.getAnimations(spriteSheet, width, defaultDelay), spriteDef, engine);
            break;

        case 'goblin1':
            //entity = new Goblin1(engine.getAnimations(spriteSheet, width, defaultDelay), spriteDef);
            break;
    }

    return entity;
}
