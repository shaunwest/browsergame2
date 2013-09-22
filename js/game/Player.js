/**
 * @author shaun
 * Date: 9/16/13
 */

ULTRADIAN.Player = (function() {

    Player.VMAX_VELOCITY_NORMAL     = 562; //750; //12; //15;
    Player.HMAX_VELOCITY_NORMAL     = 312; //5; //9;
    Player.VACCEL_NORMAL            = 36; // Acceleration per second
    Player.HACCEL_NORMAL            = 20; //25; //45; //90; // Acceleration per second
    Player.H_VELOCITY_HIT           = 156;
    Player.DAMAGE_TIMER             = 1.0;

    Player.ANIM_IDLE_LEFT           = 0;
    Player.ANIM_IDLE_RIGHT          = 1;
    Player.ANIM_JUMP_LEFT           = 2;
    Player.ANIM_JUMP_RIGHT          = 3;
    Player.ANIM_RUN_LEFT            = 4;
    Player.ANIM_RUN_RIGHT           = 5;
    Player.ANIM_DUCK_LEFT           = 6;
    Player.ANIM_DUCK_RIGHT          = 7;
    Player.ANIM_READY_LEFT          = 8;
    Player.ANIM_READY_RIGHT         = 9;
    Player.ANIM_PUNCH1_LEFT         = 10;
    Player.ANIM_PUNCH1_RIGHT        = 11;
    Player.ANIM_PUNCH2_LEFT         = 12;
    Player.ANIM_PUNCH2_RIGHT        = 13;
    Player.ANIM_DMG_FRONT_LEFT      = 14;
    Player.ANIM_DMG_FRONT_RIGHT     = 15;
    Player.ANIM_DMG_BACK_LEFT       = 16;
    Player.ANIM_DMG_BACK_RIGHT      = 17;
    Player.ANIM_POW                 = 26; //NOTE: 27 is unused

    Player.DMG_NONE                 = 0;
    Player.DMG_LEFT_FRONT           = 1;
    Player.DMG_LEFT_BACK            = 2;
    Player.DMG_RIGHT_FRONT          = 3;
    Player.DMG_RIGHT_BACK           = 4;

    Player.MODE_WALK                = 0;
    Player.MODE_FIGHT               = 1;

    Player.HIT_FRAME                = 0;

    RETRO.extend(RETRO.PhysicsEntity, Player);

    function Player(animations, def, engine) {
        RETRO.PhysicsEntity.call(this, animations, def);

        this.engine             = engine;
        this.onGround           = false;
        this.boundsDefinition   = {left: 50, top: 58, right: 50, bottom: 0};

        this.doMoveY            = true;
        this.doVerticalVelocity = true;
        this.vMaxVelocity       = Player.VMAX_VELOCITY_NORMAL;
        this.vAcceleration      = Player.VACCEL_NORMAL;

        this.allowInput         = true;
        this.allowJump          = false;
        this.allowAttack        = true;
        this.isDucking          = false;
        this.isFalling          = false;
        this.isFlipping         = false;
        this.isHit              = false;
        this.isDamaged          = false;
        this.damagedState       = Player.DMG_NONE;
        this.isHitting          = false;
        this.didHit             = false;
        this.isJumping          = false;
        this.jumpCount          = 0;
        this.jumpCountMax       = 10;

        this.attackAnim         = 1;

        this.hitX               = 0;

        this.mode               = Player.MODE_WALK;

        this.powAnimation       = this.getAnimation(Player.ANIM_POW);

        this.stamina            = 100;
        this.staminaBar         = new RETRO.FillBar(48, 3);

        var self = this;
        this.currentAnimation.onAnimationChange = function(animation) {
            self.onAnimationChange(animation);
        };

        this.walkMode();
    }

    Player.prototype.walkMode = function() {
        this.mode = Player.MODE_WALK;

        this.vMaxVelocity = Player.VMAX_VELOCITY_NORMAL;
        this.hMaxVelocity = Player.HMAX_VELOCITY_NORMAL;

        this.vAcceleration = Player.VACCEL_NORMAL;
        this.hAcceleration = Player.HACCEL_NORMAL;
    };

    Player.prototype.fightMode = function() {
        this.mode = Player.MODE_FIGHT;

        this.vMaxVelocity = Player.VMAX_VELOCITY_NORMAL;
        this.hMaxVelocity = Player.HMAX_VELOCITY_NORMAL;

        this.vAcceleration = Player.VACCEL_NORMAL;
        this.hAcceleration = Player.HACCEL_NORMAL;
    };

    Player.prototype.startJump = function() {
        if(this.allowJump) {
            this.jumpCount++;
            this.isJumping = true;
        }
    };

    Player.prototype.endJump = function() {
        if(this.isJumping) {
            this.allowJump = false;
            this.jumpCount = this.jumpCountMax;
        }

        if(this.onGround) {
            this.allowJump = true;
            this.isHitting = false;
        }
    };

    Player.prototype.moveLeft = function() {
        this.doMoveX = true;
        this.dirX = RETRO.Entity.DIR_LEFT;
    };

    Player.prototype.moveRight = function() {
        this.doMoveX = true;
        this.dirX = RETRO.Entity.DIR_RIGHT;
    };

    Player.prototype.stop = function() {
        this.doMoveX = false;
    };

    Player.prototype.getCurrentFrames = function() {
        var currentFrames = Player.base.getCurrentFrames.call(this);

        /*if(this.isAttacking) {
            if(this.didHit) {
                if(this.dirX == RETRO.Entity.DIR_LEFT) {
                    currentFrames.push({
                            'x': this.x + this.hitX,
                            'y': this.y,
                            'image': this.powAnimation.getFrame(0)
                        }
                    );
                } else {
                    currentFrames.push({
                            'x': this.x + this.hitX,
                            'y': this.y,
                            'image': this.powAnimation.getFrame(0)
                        }
                    );
                }

                this.didHit = false;
            }
        }*/

        if(this.mode == Player.MODE_FIGHT) {
            currentFrames.push({
               'x': this.x + 48,
               'y': this.y + 24,
               'image': this.staminaBar.getImage(this.stamina)
            });
        }

        return currentFrames;
    };

    Player.prototype.updateStart = function(secondsElapsed) {
        Player.base.updateStart.call(this, secondsElapsed);
    };

    Player.prototype.traceProperties = function() {
        RETRO.Engine.trace(
            "<label>onGround:</label> " + this.onGround +
                "<br><label>allowJump:</label> " + this.allowJump +
                "<br><label>isFalling:</label> " + this.isFalling +
                "<br><label>isDucking:</label> " + this.isDucking +
                "<br><label>isDownThrust:</label> " + this.isDownThrusting +
                "<br><label>isAttacking:</label> " + this.isAttacking +
                "<br><label>haltYDir:</label> " + this.haltYDir +
                "<br><label>isHitting:</label> " + this.isHitting +
                "<br><label>isJumping:</label> " + this.isJumping +
                "<br><label>moveX:</label> " + this.moveX
        );
    };

    Player.prototype.updateEnd = function(secondsElapsed) {
        Player.base.updateEnd.call(this, secondsElapsed);

        var self = this;

        if(this.mode == Player.MODE_WALK) {

            // Falling?
            if(this.dirY == RETRO.Entity.DIR_DOWN && this.vVelocity > 0) {
                this.isFalling = true;
            } else {
                this.isFalling = false;
            }

            // On ground?
            if(this.haltYDir == 1) {
                this.onGround = true;
            } else {
                this.onGround = false;
            }

            // Can jump?
            if(this.onGround) {
                //this.allowJump = true;
                this.jumpCount = 0;
            }

            if(this.isFalling) {
                this.allowJump = false;
            }

            if(this.isJumping) {
                if(this.jumpCount < this.jumpCountMax) {
                    this.vVelocity = -this.vMaxVelocity * secondsElapsed;
                } else {
                    this.allowJump = false;
                    this.isJumping = false;
                }
            }

            // Attacked and hit something?
            if(this.didHit) {
                this.isHitting  = false;
                this.hitX       = this.lastAttackIntersection.x;
            }

            // DEBUG
            //this.traceProperties();
            //console.log(this.moveX);
            //if(this.haltYDir == 0) {
            //    console.log(this.haltYDir + "; " + secondsElapsed + "; " + this.moveY);
            //}

            // GOT HIT
            if(this.isHit) {
                this.isHit                  = false;
                this.isAttacking            = false;
                this.isDamaged              = true;
                //this.allowInput             = false;
                //this.engine.disableAllKeys();
                this.doHorizontalVelocity   = false;

                this.setTimer(Player.DAMAGE_TIMER, function() {
                    self.onDamagedComplete();
                });

                this.setRepeater(0.016, function() {
                   self.onFlicker();
                });

                if(this.dirX == RETRO.Entity.DIR_LEFT) {
                    this.damagedState = (this.lastIntersectionX > 0) ?
                        Player.DMG_LEFT_BACK : this.damagedState = Player.DMG_LEFT_FRONT;

                } else {
                    this.damagedState = (this.lastIntersectionX > 0) ?
                        Player.DMG_RIGHT_FRONT : this.damagedState = Player.DMG_RIGHT_BACK;
                }

            // DAMAGED
            } else if(this.isDamaged) {
                switch(this.damagedState) {
                    case Player.DMG_LEFT_BACK:
                        this.playAnimation(Player.ANIM_DMG_BACK_LEFT);
                        this.hVelocity = -Player.H_VELOCITY_HIT * secondsElapsed;
                        break;

                    case Player.DMG_LEFT_FRONT:
                        this.playAnimation(Player.ANIM_DMG_FRONT_LEFT);
                        this.hVelocity = Player.H_VELOCITY_HIT * secondsElapsed;
                        break;

                    case Player.DMG_RIGHT_FRONT:
                        this.playAnimation(Player.ANIM_DMG_FRONT_RIGHT);
                        this.hVelocity = -Player.H_VELOCITY_HIT * secondsElapsed;
                        break;

                    case Player.DMG_RIGHT_BACK:
                        this.playAnimation(Player.ANIM_DMG_BACK_RIGHT);
                        this.hVelocity = Player.H_VELOCITY_HIT * secondsElapsed;
                        break;
                }

                this.currentAnimation.startFrame = 1;
                this.didHit = false;


            // JUMP
            } else if(!this.onGround) {
                if(this.isFlipping) {
                    if(this.dirX == RETRO.Entity.DIR_LEFT) {
                        this.playAnimation(Player.ANIM_FLIP_LEFT);

                    } else {
                        this.playAnimation(Player.ANIM_FLIP_RIGHT);
                    }

                } else {
                    (this.dirX == RETRO.Entity.DIR_LEFT) ? this.playAnimation(Player.ANIM_JUMP_LEFT) : this.playAnimation(Player.ANIM_JUMP_RIGHT);
                }

            // WALK
            } else if(this.moveX < 0) {
                this.playAnimation(Player.ANIM_RUN_LEFT);

            } else if(this.moveX > 0) {
                this.playAnimation(Player.ANIM_RUN_RIGHT);

            // DUCK
            } else if(this.isDucking) {
                (this.dirX == RETRO.Entity.DIR_LEFT) ?  this.playAnimation(Player.ANIM_DUCK_LEFT) : this.playAnimation(Player.ANIM_DUCK_RIGHT);

            // IDLE
            } else {
                (this.dirX == RETRO.Entity.DIR_LEFT) ? this.playAnimation(Player.ANIM_IDLE_LEFT) : this.playAnimation(Player.ANIM_IDLE_RIGHT);
            }

        } else { // FIGHT MODE

            // ATTACK
            if(this.isAttacking) {
                var anim;
                if(this.attackAnim == 2) {
                    anim = (this.dirX == RETRO.Entity.DIR_LEFT) ? Player.ANIM_PUNCH2_LEFT : Player.ANIM_PUNCH2_RIGHT;
                } else {
                    anim = (this.dirX == RETRO.Entity.DIR_LEFT) ? Player.ANIM_PUNCH1_LEFT : Player.ANIM_PUNCH1_RIGHT;
                }

                this.playAnimation(anim, function() { self.onAttackComplete() });

            // IDLE
            } else {
                (this.dirX == RETRO.Entity.DIR_LEFT) ? this.playAnimation(Player.ANIM_READY_LEFT) : this.playAnimation(Player.ANIM_READY_RIGHT);
            }
        }
    };

    Player.prototype.onAnimationChange = function(animation) {
    };

    /*Player.prototype.onAttackFrame = function(frameIndex) {
        if(frameIndex == Player.HIT_FRAME) {
            this.isHitting = true;
        } else {
            this.isHitting = false;
        }
    };*/

    Player.prototype.onAttackComplete = function() {
        this.isAttacking = false;
        this.didHit = false;

        // determine next attack animation
        if(Math.floor(Math.random() * 3) == 2) {
            this.attackAnim = 2;
        } else {
            this.attackAnim = 1;
        }
    };

    Player.prototype.onFlicker = function() {
        this.isVisible = !this.isVisible;
    };

    Player.prototype.onDamagedComplete = function() {
        this.isDamaged      = false;
        this.isVisible      = true;

        //this.engine.enableAllKeys();
        this.doHorizontalVelocity = true;

        this.cancelHorizontalMovement();
        this.cancelRepeater();
    };

    Player.prototype.levelCollisionY = function(direction, tileDef) {
        Player.base.levelCollisionY.call(this, direction, tileDef);
    };

    Player.prototype.levelCollisionX = function(direction, tileDef, tileX, tileY) {
        var level = this.engine.level,
            tile1, tile2, tile3;

        Player.base.levelCollisionX.call(this, direction, tileDef, tileX, tileY);

        if(direction == RETRO.Entity.DIR_RIGHT) {
            tile1 = level.getTile(tileX, tileY - 1);
            tile2 = level.getTile(tileX + 1, tileY - 2);
            tile3 = level.getTile(tileX + 1, tileY - 1);
            if(tile1['solid'] == 0 && tile2['solid'] == 0 && tile3['solid'] == 1) {
                var targetX = ((tileX) * level.tileSize);
                var targetY = ((tileY - 4) * level.tileSize);

                this.doMoveY = false;
                this.stop();

                engine.userAction.disable('left');
                engine.userAction.disable('right');

                engine.auto.setTarget(this, 3, RETRO.call(this, this.hopComplete));
                engine.auto.addPoint(targetX, targetY);
            }

        } else if(direction == RETRO.Entity.DIR_LEFT) {

        }
    };

    Player.prototype.hopComplete = function() {
        this.doMoveY = true;

        engine.userAction.enable('left');
        engine.userAction.enable('right');
    };

    return Player;
})();