/* Author: shaun

TODO:
-vertical scrolling
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
    url: "assets/test7.conf",
    dataType: "json",
    success: configReady
});

function configReady(data) {
    engine = new RETRO.Engine({
        'fps'               : 60,
        'canvas'            : document.getElementById('display'),
        'canvasContainer'   : document.getElementById('displayContainer'),
        'gridContainer'     : document.getElementById('grid'),
        'config'            : data,
        'fixedWidth'        : 1024,
        'fixedHeight'       : 768,
        //'maxWidth'          : 1280,
        //'maxHeight'         : 960,
        'checkUserActions'  : checkUserActions,
        'createSprites'     : createSprites,
        'update'            : update,
        'statusArea'        : document.getElementById('status'),
        'traceArea'         : document.getElementById('trace'),
        'collisions'        :
        {
            'entity'        : handleEntityCollision,
            'attack'        : handleEntityAttackCollision,
            'trigger'       : handleTriggerCollision
        },
        'actions'           :
        {
            'left'          : {'key': KEY_LEFT, 'el': document.getElementById('left')},
            'right'         : {'key': KEY_RIGHT, 'el': document.getElementById('right')},
            'up'            : {'key': KEY_UP},
            'down'          : {'key': KEY_DOWN},
            'attack'        : {'key': KEY_X},
            'walkMode'      : {'key': KEY_F},
            'fightMode'     : {'key': KEY_G}
        },
        'fonts'             : {
            'basic'         : {'path': 'font.png'},
            'score'         : {'path': 'score_font.png', 'numeric': true, 'tileSize': 48, 'lineHeight': 48, 'tracking': 0}
        }
    });

    engine.loadLevel("level1", function() {
        showLevel();
        engine.start();
    });
}

function levelReady() {
    var demoScreen = new RETRO.UI.Screen({'topMargin': 48, 'leftMargin': 48}),
        text = new RETRO.UI.Text(engine.getFont('basic'), "ULTRADIAN DEMO 1", 0, 0);

    demoScreen.add(text);

    engine.showScreen(demoScreen, 2, showCaption);
}

function showCaption() {
    var captionScreen = new RETRO.UI.Screen({'topMargin': 48, 'leftMargin': 48}),
        text = new RETRO.UI.Text(engine.getFont('basic'), "THE CITY BY THE LAKE", 0, 0);

    captionScreen.add(text);

    engine.showScreen(captionScreen, 2, showLevel);
}

function showLevel() {
    engine.showLevel();
    engine.hideScreen(2);
}

function update(secondsElapsed) {
}

function checkUserActions(actions) {
    if(engine.player) {
        var player = engine.player;

        if(player.mode == ULTRADIAN.Player.MODE_FIGHT) {
            // MOVE
            if(actions['left']) {
                player.moveLeft();
            } else if(actions['right']) {
                player.moveRight();
            } else {
                player.stop();
            }

            // ATTACK
            if(actions['attack']) {
                if(player.allowAttack) {
                    player.isAttacking = true;
                    player.allowAttack = false;
                }
            } else {
                player.allowAttack = true;
            }

            if(actions['walkMode']) {
                player.walkMode();
            }

        } else {
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
            }

            if(actions['fightMode']) {
                player.fightMode();
            }
        }
    }
}

function createSprites(sprite, spriteDef, spriteSheet) {
    var width = spriteDef['width'],
        defaultDelay = spriteDef['defaultDelay'],
        entity;

    switch(spriteDef.type) {
        case 'player':
            entity = new ULTRADIAN.Player(engine.getAnimations(spriteSheet, width, defaultDelay), spriteDef, engine);
            break;

        case 'goblin1':
            //entity = new Goblin1(engine.getAnimations(spriteSheet, width, defaultDelay), spriteDef);
            break;
    }

    return entity;
}

function handleEntityCollision(entity1, entity2, intersectionX, intersectionY) {
    if(entity1.type == "player" && !entity1.isDamaged && !entity2.isDead) {
        //this.removeEntity(entity1);
        entity1.isHit = true;
    }
}

function handleEntityAttackCollision(attackerEntity, attackedEntity, intersection) {
    if(attackerEntity.type == "player" && attackerEntity.isHitting) {
        attackerEntity.didHit = true;
        attackedEntity.isHit = true;
        console.log("hit");
        //this.removeEntity(entity2);
    }
}

function handleTriggerCollision(entity, trigger, intersectionX, intersectionY) {
    if(entity.type == "player" && trigger.type == "door1") {
        console.log("trigger!");
        engine.hideLevel();
        engine.loadLevel("level1", function() {
            showCaption();
            engine.start();
        });
    }
}