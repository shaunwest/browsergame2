/**
 * @author shaun
 */
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
Player.ANIM_JUMP_THRUST_LEFT    = 4;
Player.ANIM_JUMP_THRUST_RIGHT   = 5;
Player.ANIM_RUN_LEFT            = 6;
Player.ANIM_RUN_RIGHT           = 7;
Player.ANIM_ATTACK_LEFT         = 8;
Player.ANIM_ATTACK_RIGHT        = 9;
Player.ANIM_JUMP_ATTACK_LEFT    = 10;
Player.ANIM_JUMP_ATTACK_RIGHT   = 11;
Player.ANIM_DUCK_LEFT           = 12;
Player.ANIM_DUCK_RIGHT          = 13;
Player.ANIM_DMG_FRONT_LEFT      = 14;
Player.ANIM_DMG_FRONT_RIGHT     = 15;
Player.ANIM_DMG_BACK_LEFT       = 16;
Player.ANIM_DMG_BACK_RIGHT      = 17;
Player.ANIM_FLIP_LEFT           = 18;
Player.ANIM_FLIP_RIGHT          = 19;
Player.ANIM_PJUMP_SWORD_LEFT    = 20;
Player.ANIM_PJUMP_SWORD_RIGHT   = 21;
Player.ANIM_SWORD_LEFT          = 22;
Player.ANIM_SWORD_RIGHT         = 23;
Player.ANIM_JUMP_SWORD_LEFT     = 24;
Player.ANIM_JUMP_SWORD_RIGHT    = 25;
Player.ANIM_POW                 = 26; //NOTE: 27 is unused
Player.ANIM_DOWN_SWORD_LEFT     = 28;
Player.ANIM_DOWN_SWORD_RIGHT    = 29;

Player.SWORD_LEFT               = 0;
Player.SWORD_RIGHT              = 1;
Player.SWORD_JUMP_LEFT          = 2;
Player.SWORD_JUMP_RIGHT         = 3;
Player.SWORD_DOWN_LEFT          = 4;
Player.SWORD_DOWN_RIGHT         = 5;
Player.SWORD_PJUMP_LEFT         = 6;
Player.SWORD_PJUMP_RIGHT        = 7;

Player.DMG_NONE                 = 0;
Player.DMG_LEFT_FRONT           = 1;
Player.DMG_LEFT_BACK            = 2;
Player.DMG_RIGHT_FRONT          = 3;
Player.DMG_RIGHT_BACK           = 4;

Player.HIT_FRAME                = 0;

function Player(animations, def, engine) {
	if (arguments[0] === inheriting) return;
	
	PhysicsEntity.call(this, animations, def);

    this.engine             = engine;
	this.onGround           = false;
	
	this.boundsDefinition   = {left: 30, top: 15, right: 30, bottom: 0};
			
	this.doMoveY            = true;

	this.vMaxVelocity       = Player.VMAX_VELOCITY_NORMAL;
	this.vAcceleration      = Player.VACCEL_NORMAL;

	this.allowInput         = true;
	this.allowJump          = false;
    this.allowAttack        = true;
    this.allowDownThrust    = false;
	this.isDucking          = false;
    this.isFalling          = false;
    this.isFlipping         = false;
    this.isHit              = false;
    this.isDamaged          = false;
    this.damagedState       = Player.DMG_NONE;
    this.isHitting          = false;
    this.isDownThrusting    = false;
    this.didHit             = false;
    this.isJumping          = false;
    this.jumpCount          = 0;
    this.jumpCountMax       = 10;

    this.hitX               = 0;

    this.swordAnimations    = [
        this.getAnimation(Player.ANIM_SWORD_LEFT),
        this.getAnimation(Player.ANIM_SWORD_RIGHT),
        this.getAnimation(Player.ANIM_JUMP_SWORD_LEFT),
        this.getAnimation(Player.ANIM_JUMP_SWORD_RIGHT),
        this.getAnimation(Player.ANIM_DOWN_SWORD_LEFT),
        this.getAnimation(Player.ANIM_DOWN_SWORD_RIGHT),
        this.getAnimation(Player.ANIM_PJUMP_SWORD_LEFT),
        this.getAnimation(Player.ANIM_PJUMP_SWORD_RIGHT)
    ];

    this.currentSwordAnim   = new AnimationPlayer(this.swordAnimations[Player.SWORD_LEFT]);

    this.powAnimation       = this.getAnimation(Player.ANIM_POW);

    var self = this;
    this.currentAnimation.onAnimationChange = function(animation) {
        self.onAnimationChange(animation);
    };

    this.standardAttackMode();
}

Player.prototype = new PhysicsEntity(inheriting);
Player.prototype.constructor = PhysicsEntity;
Player.base = PhysicsEntity.prototype;


Player.prototype.standardAttackMode = function() {
    if(this.dirX == Entity.DIR_LEFT) {
                                    //34
        this.attackBounds = {left: -48, top: 0, width: 48, height: 48};

    } else {
        this.attackBounds = {left: 96, top: 0, width: 48, height: 48};
    }
};

Player.prototype.downThrustAttackMode = function() {
    this.attackBounds = {left: 24, top: 48, width: 48, height: 96};

    /*if(this.dirX == Entity.DIR_LEFT) {
        //                                            48            60
        this.attackBounds = {left: 0, top: 39, width: 24, height: 70};

    } else {               //      48                  48
        this.attackBounds = {left: 72, top: 39, width: 24, height: 70};
        //this.attackBounds = {left: 24, top: 39, width: 72, height: 60};
    }*/
};

Player.prototype.walkMode = function() {
	this.vMaxVelocity = Player.VMAX_VELOCITY_NORMAL;
	this.hMaxVelocity = Player.HMAX_VELOCITY_NORMAL;
	
	this.vAcceleration = Player.VACCEL_NORMAL;
	this.hAcceleration = Player.HACCEL_NORMAL;
};

Player.prototype.startJump = function() {
    if(this.allowJump) {
        this.jumpCount++;
        this.isJumping = true;

    } else if(this.isDownThrusting && this.didHit) {
        this.isJumping = true;
        this.jumpCount = 0;
        this.allowJump = true;
    }
};

Player.prototype.endJump = function() {
    if(this.isJumping) {
        this.allowJump = false;
        this.jumpCount = this.jumpCountMax;
    }

    if(this.onGround) {
        this.allowJump = true;

        // cancel down thrust
        this.isDownThrusting = false;
        this.isHitting = false;
        this.standardAttackMode();
    }
};

Player.prototype.moveLeft = function() {
	this.doMoveX = true;
	this.dirX = Entity.DIR_LEFT;
};

Player.prototype.moveRight = function() {
	this.doMoveX = true;
	this.dirX = Entity.DIR_RIGHT;
};

Player.prototype.stop = function() {
	this.doMoveX = false;
};

Player.prototype.getCurrentFrames = function() {
    var currentFrames = Player.base.getCurrentFrames.call(this);

    if(this.isDownThrusting || this.isFlipping) {
        currentFrames.push({
                'x': this.x,
                'y': this.y + this.size,
                'image': this.currentSwordAnim.getCurrentFrame()
            }
        );

    } else if(this.isAttacking) {
        if(this.dirX == Entity.DIR_LEFT) {
            currentFrames.push({
                    'x': this.x - this.size,
                    'y': this.y,
                    'image': this.currentSwordAnim.getCurrentFrame()
                }
            );
        } else {
            currentFrames.push({
                    'x': this.x + this.size,
                    'y': this.y,
                    'image': this.currentSwordAnim.getCurrentFrame()
                }
            );
        }

        if(this.didHit) {
            if(this.dirX == Entity.DIR_LEFT) {
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
    }

    return currentFrames;
};

Player.prototype.updateStart = function(secondsElapsed) {
    Player.base.updateStart.call(this, secondsElapsed);

    if(this.isAttacking || this.isDownThrusting || this.isFlipping) {
        this.currentSwordAnim.step(secondsElapsed);
    }
};

Player.prototype.traceProperties = function() {
    Engine.trace(
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

	this.walkMode();


    // Falling?
    if(this.dirY == Entity.DIR_DOWN && this.vVelocity > 0) {
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
        this.isDownThrusting = false;
    }

    // If we're down slashing, hover in the air
    if(this.isDownThrusting) {
        this.doMoveY = false;
    } else {
        this.doMoveY = true;
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
    this.traceProperties();
    //console.log(this.moveX);
    //if(this.haltYDir == 0) {
    //    console.log(this.haltYDir + "; " + secondsElapsed + "; " + this.moveY);
    //}

    // GOT HIT
    if(this.isHit) {
        this.isHit                  = false;
        this.isAttacking            = false;
        this.isDownThrusting        = false;
        this.isDamaged              = true;
        //this.allowInput             = false;
        this.engine.disableAllKeys();
        this.doHorizontalVelocity   = false;

        this.setTimer(Player.DAMAGE_TIMER, function() {
            self.onDamagedComplete();
        });

        this.setRepeater(0.016, function() {
           self.onFlicker();
        });

        if(this.dirX == Entity.DIR_LEFT) {
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
                this.setCurrentAnimation(Player.ANIM_DMG_BACK_LEFT);
                this.hVelocity = -Player.H_VELOCITY_HIT * secondsElapsed;
                break;

            case Player.DMG_LEFT_FRONT:
                this.setCurrentAnimation(Player.ANIM_DMG_FRONT_LEFT);
                this.hVelocity = Player.H_VELOCITY_HIT * secondsElapsed;
                break;

            case Player.DMG_RIGHT_FRONT:
                this.setCurrentAnimation(Player.ANIM_DMG_FRONT_RIGHT);
                this.hVelocity = -Player.H_VELOCITY_HIT * secondsElapsed;
                break;

            case Player.DMG_RIGHT_BACK:
                this.setCurrentAnimation(Player.ANIM_DMG_BACK_RIGHT);
                this.hVelocity = Player.H_VELOCITY_HIT * secondsElapsed;
                break;
        }

        this.currentAnimation.startFrame = 1;
        this.didHit = false;

    // DOWN SLASH
    } else if(this.isDownThrusting) {
        this.isHitting  = true;

        if(this.dirX == Entity.DIR_LEFT) {
            this.currentSwordAnim.play(this.swordAnimations[Player.SWORD_DOWN_LEFT]);
            this.setCurrentAnimation(
                Player.ANIM_JUMP_THRUST_LEFT,
                function() {
                    self.onAttackComplete();
                }
            );
        } else {
            this.currentSwordAnim.play(this.swordAnimations[Player.SWORD_DOWN_RIGHT]);
            this.setCurrentAnimation(
                Player.ANIM_JUMP_THRUST_RIGHT,
                function() {
                    self.onAttackComplete();
                }
            );
        }

    // ATTACK
    } else if(this.isAttacking) {
        var animations = (this.onGround) ? {
            'leftAnim': Player.ANIM_ATTACK_LEFT,
            'rightAnim': Player.ANIM_ATTACK_RIGHT,
            'leftSwordAnim': Player.SWORD_LEFT,
            'rightSwordAnim': Player.SWORD_RIGHT
        } : {
            'leftAnim': Player.ANIM_JUMP_ATTACK_LEFT,
            'rightAnim': Player.ANIM_JUMP_ATTACK_RIGHT,
            'leftSwordAnim': Player.SWORD_JUMP_LEFT,
            'rightSwordAnim': Player.SWORD_JUMP_RIGHT
        };

        if(this.dirX == Entity.DIR_LEFT) {
            this.currentSwordAnim.play(this.swordAnimations[animations['leftSwordAnim']]);
            this.setCurrentAnimation(
                animations['leftAnim'],
                function() {
                    self.onAttackComplete();
                },
                function(frameIndex) {
                    self.onAttackFrame(frameIndex);
                }
            );

        } else {
            this.currentSwordAnim.play(this.swordAnimations[animations['rightSwordAnim']]);
            this.setCurrentAnimation(
                animations['rightAnim'],
                function() {
                    self.onAttackComplete();
                },
                function(frameIndex) {
                    self.onAttackFrame(frameIndex);
                }
            );
        }

    // JUMP
    } else if(!this.onGround) {
        if(this.isFlipping) {
            if(this.dirX == Entity.DIR_LEFT) {
                this.currentSwordAnim.play(this.swordAnimations[Player.SWORD_PJUMP_LEFT]);
                this.setCurrentAnimation(Player.ANIM_FLIP_LEFT);

            } else {
                this.currentSwordAnim.play(this.swordAnimations[Player.SWORD_PJUMP_RIGHT]);
                this.setCurrentAnimation(Player.ANIM_FLIP_RIGHT);
            }

        } else {
            (this.dirX == Entity.DIR_LEFT) ? this.setCurrentAnimation(Player.ANIM_JUMP_LEFT) : this.setCurrentAnimation(Player.ANIM_JUMP_RIGHT);
        }

	// WALK
	} else if(this.moveX < 0) {
		this.setCurrentAnimation(Player.ANIM_RUN_LEFT);

	} else if(this.moveX > 0) {
		this.setCurrentAnimation(Player.ANIM_RUN_RIGHT);

    // DUCK
    } else if(this.isDucking) {
        (this.dirX == Entity.DIR_LEFT) ?  this.setCurrentAnimation(Player.ANIM_DUCK_LEFT) : this.setCurrentAnimation(Player.ANIM_DUCK_RIGHT);

	// IDLE
	} else {
        (this.dirX == Entity.DIR_LEFT) ? this.setCurrentAnimation(Player.ANIM_IDLE_LEFT) : this.setCurrentAnimation(Player.ANIM_IDLE_RIGHT);
    }
};

Player.prototype.onAnimationChange = function(animation) {
    this.currentSwordAnim.reset();
};

Player.prototype.onAttackFrame = function(frameIndex) {
    if(frameIndex == Player.HIT_FRAME) {
        this.isHitting = true;
    } else {
        this.isHitting = false;
    }
};

Player.prototype.onAttackComplete = function() {
    this.isAttacking = false;
    this.isDownThrusting = false;
    this.didHit = false;
};

Player.prototype.onFlicker = function() {
    this.isVisible = !this.isVisible;
};

Player.prototype.onDamagedComplete = function() {
    this.isDamaged      = false;
    this.isVisible      = true;

    this.engine.enableAllKeys();
    this.doHorizontalVelocity = true;

    this.cancelHorizontalMovement();
    this.cancelRepeater();
};

Player.prototype.levelCollisionY = function(direction, tileDef) {
	Player.base.levelCollisionY.call(this, direction, tileDef);
};
