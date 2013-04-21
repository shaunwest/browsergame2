/**
 * @author shaun
 */
Player.VMAX_VELOCITY_NORMAL     = 750; //12; //15;
Player.HMAX_VELOCITY_NORMAL     = 312; //5; //9;
Player.VACCEL_NORMAL            = 36; // Acceleration per second
Player.HACCEL_NORMAL            = 20; //25; //45; //90; // Acceleration per second
Player.H_VELOCITY_HIT           = 156;

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
Player.ANIM_SWORD_LEFT          = 18;
Player.ANIM_SWORD_RIGHT         = 19;
Player.ANIM_JUMP_SWORD_LEFT     = 20;
Player.ANIM_JUMP_SWORD_RIGHT    = 21;
Player.ANIM_POW                 = 22; //NOTE: 23 is unused
Player.ANIM_DOWN_SWORD_LEFT     = 24;
Player.ANIM_DOWN_SWORD_RIGHT    = 25;

Player.SWORD_LEFT               = 0;
Player.SWORD_RIGHT              = 1;
Player.SWORD_JUMP_LEFT          = 2;
Player.SWORD_JUMP_RIGHT         = 3;
Player.SWORD_DOWN_LEFT          = 4;
Player.SWORD_DOWN_RIGHT         = 5;

Player.DMG_NONE                 = 0;
Player.DMG_LEFT_FRONT           = 1;
Player.DMG_LEFT_BACK            = 2;
Player.DMG_RIGHT_FRONT          = 3;
Player.DMG_RIGHT_BACK           = 4;

Player.HIT_FRAME                = 0;

function Player(animations, def) {
	if (arguments[0] === inheriting) return;
	
	PhysicsEntity.call(this, animations, def);
	
	this.onGround           = false;
	
	this.bounds             = {left: 30, top: 15, right: 30, bottom: 0};
			
	this.doMoveY            = true;

	this.vMaxVelocity       = Player.VMAX_VELOCITY_NORMAL;
	this.vAcceleration      = Player.VACCEL_NORMAL;

	this.allowInput         = true;
	this.allowJump          = false;
    this.allowAttack        = true;
    this.allowDownThrust    = false;
	this.isDucking          = false;
    this.isHit              = false;
    this.isDamaged          = false;
    this.damagedState       = Player.DMG_NONE;
    this.isHitting          = false;
    this.isDownThrusting    = false;
    this.didHit             = false;

    this.hitX               = 0;

    this.swordAnimations    = [
        this.getAnimation(Player.ANIM_SWORD_LEFT),
        this.getAnimation(Player.ANIM_SWORD_RIGHT),
        this.getAnimation(Player.ANIM_JUMP_SWORD_LEFT),
        this.getAnimation(Player.ANIM_JUMP_SWORD_RIGHT),
        this.getAnimation(Player.ANIM_DOWN_SWORD_LEFT),
        this.getAnimation(Player.ANIM_DOWN_SWORD_RIGHT)
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

    if(this.dirX == Entity.DIR_LEFT) {
        //                                            48            60
        this.attackBounds = {left: 0, top: 39, width: 24, height: 70};

    } else {               //      48                  48
        this.attackBounds = {left: 72, top: 39, width: 24, height: 70};
        //this.attackBounds = {left: 24, top: 39, width: 72, height: 60};
    }
};

Player.prototype.walkMode = function() {
	this.vMaxVelocity = Player.VMAX_VELOCITY_NORMAL;
	this.hMaxVelocity = Player.HMAX_VELOCITY_NORMAL;
	
	this.vAcceleration = Player.VACCEL_NORMAL;
	this.hAcceleration = Player.HACCEL_NORMAL;
};

Player.prototype.startJump = function(secondsElapsed) {
	this.dirY = Entity.DIR_UP;
	this.vVelocity = -this.vMaxVelocity * secondsElapsed;
	this.doMoveY = false;
	this.allowJump = false;
	this.onGround = false;
};

Player.prototype.startFall = function() {
	this.dirY = Entity.DIR_DOWN;
	this.doMoveY = true;
};

Player.prototype.canJump = function() {
	this.allowJump = true;
	this.onGround = true;

    // cancel down thrust
    this.isDownThrusting = false;
    this.isHitting = false;
    this.standardAttackMode();
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

    if(this.isDownThrusting) {
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

    return currentFrames;
};

Player.prototype.updateStart = function(secondsElapsed) {
    Player.base.updateStart.call(this, secondsElapsed);

    if(this.isAttacking || this.isDownThrusting) {
        this.currentSwordAnim.step(secondsElapsed);
    }
};

Player.prototype.updateEnd = function(secondsElapsed) {
	Player.base.updateEnd.call(this, secondsElapsed);

    var self = this;

	this.walkMode();

    if(this.didHit) {
        if(this.isDownThrusting) {
            //this.startJump(secondsElapsed);
            //this.vVelocity = -this.vMaxVelocity * secondsElapsed;
        }
        this.isHitting  = false;
        this.hitX       = this.lastAttackIntersection.x;
    }

    // HIT
    if(this.isHit) {
        this.isHit                  = false;
        this.isAttacking            = false;
        this.isDamaged              = true;
        this.allowInput             = false;
        this.doHorizontalVelocity   = false;

        this.setTimer(1, function() {
            self.onDamagedComplete();
        });

        this.setRepeater(0.016, function() {
           self.onFlicker();
        });

        if(this.dirX == Entity.DIR_LEFT) {
            this.damagedState = (this.lastIntersection.x > 0) ?
                Player.DMG_LEFT_BACK : this.damagedState = Player.DMG_LEFT_FRONT;

        } else {
            this.damagedState = (this.lastIntersection.x > 0) ?
                Player.DMG_RIGHT_FRONT : this.damagedState = Player.DMG_RIGHT_BACK;
        }

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

    } else if(this.isDownThrusting) {
        this.isHitting = true;

        //(this.dirX == Entity.DIR_LEFT) ? this.setCurrentAnimation(Player.ANIM_JUMP_THRUST_LEFT) : this.setCurrentAnimation(Player.ANIM_JUMP_THRUST_RIGHT);
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
        (this.dirX == Entity.DIR_LEFT) ? this.setCurrentAnimation(Player.ANIM_JUMP_LEFT) : this.setCurrentAnimation(Player.ANIM_JUMP_RIGHT);

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
    this.allowInput     = true;
    this.doHorizontalVelocity = true;

    this.cancelHorizontalMovement();
    this.cancelRepeater();
};

Player.prototype.levelCollisionY = function(direction, tileDef) {
	Player.base.levelCollisionY.call(this, direction, tileDef);
};
