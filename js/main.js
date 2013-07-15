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
        'config'            : data,
        'width'             : 768,
        'height'            : 768,
        'checkKeys'         : checkKeys,
        'createSprites'     : createSprites,
        'update'            : update,
        'statusArea'        : document.getElementById('status'),
        'traceArea'         : document.getElementById('trace'),
        'controls'          : {
            'left'          : document.getElementById('left'),
            'right'         : document.getElementById('right')
        }
    });

    engine.loadLevel("level1");
}


function update(secondsElapsed) {
}

function checkKeys(keys) {
    if(engine.player) {
        var player = engine.player;

        // MOVE
        if(keys[KEY_LEFT]) {
            player.moveLeft();
        } else if(keys[KEY_RIGHT]) {
            player.moveRight();
        } else {
            player.stop();
        }

        // JUMP
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
            entity = new Goblin1(engine.getAnimations(spriteSheet, width, defaultDelay), spriteDef);
            break;
    }

    return entity;
}
