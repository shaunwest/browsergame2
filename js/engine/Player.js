/**
 * @author shaun
 */
Player.VMAX_VELOCITY_NORMAL = 750; //12; //15;
Player.HMAX_VELOCITY_NORMAL = 312; //5; //9;
Player.VACCEL_NORMAL    = 36; // Acceleration per second
Player.HACCEL_NORMAL    = 20; //25; //45; //90; // Acceleration per second
Player.H_VELOCITY_HIT   = 156;

Player.IDLE_LEFT        = 0;
Player.IDLE_RIGHT       = 1;
Player.JUMP_LEFT        = 2;
Player.JUMP_RIGHT       = 3;
Player.DUCK_LEFT        = 8;
Player.DUCK_RIGHT       = 9;
Player.SWORD_LEFT       = 0;
Player.SWORD_RIGHT      = 1;
Player.POW              = 16;

Player.DMG_NONE         = 0;
Player.DMG_LEFT_FRONT   = 1;
Player.DMG_LEFT_BACK    = 2;
Player.DMG_RIGHT_FRONT  = 3;
Player.DMG_RIGHT_BACK   = 4;

Player.HIT_FRAME        = 0;

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
	this.isDucking          = false;
    this.isHit              = false;
    this.isDamaged          = false;
    this.damagedState       = Player.DMG_NONE;
    this.isHitting          = false;
    this.didHit             = false;

    this.swordAnimations    = [
        this.getAnimation(14),
        this.getAnimation(15)
    ];

    this.currentSwordAnim   = new AnimationPlayer(this.swordAnimations[Player.SWORD_LEFT]);

    this.powAnimation       = this.getAnimation(Player.POW);

    var self = this;
    this.currentAnimation.onAnimationChange = function(animation) {
        self.onAnimationChange(animation);
    }
}

Player.prototype = new PhysicsEntity(inheriting);
Player.prototype.constructor = PhysicsEntity;
Player.base = PhysicsEntity.prototype;


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

    if(this.isAttacking) {
        var swordAnimation = this.currentSwordAnim;
        if(this.dirX == Entity.DIR_LEFT) {
            currentFrames.push({
                    'x': this.x - this.size,
                    'y': this.y,
                    'image': swordAnimation.getCurrentFrame()
                }
            );
        } else {
            currentFrames.push({
                    'x': this.x + this.size,
                    'y': this.y,
                    'image': swordAnimation.getCurrentFrame()
                }
            );
        }
    }

    if(this.didHit) {
        if(this.dirX == Entity.DIR_LEFT) {
            currentFrames.push({
                    'x': this.x - this.size,
                    'y': this.y,
                    'image': this.powAnimation.getFrame(0)
                }
            );
        } else {
            currentFrames.push({
                    'x': this.x + this.size,
                    'y': this.y,
                    'image': this.powAnimation.getFrame(0)
                }
            );
        }
    }

    return currentFrames;
};

Player.prototype.updateStart = function(secondsElapsed) {
    Player.base.updateStart.call(this, secondsElapsed);

    if(this.isAttacking) {
        this.currentSwordAnim.step(secondsElapsed);
    }
};

Player.prototype.updateEnd = function(secondsElapsed) {
	Player.base.updateEnd.call(this, secondsElapsed);

    var self = this;

	this.walkMode();

    // HIT
    if(this.isHit) {
        this.isHit      = false;
        this.isAttacking = false;
        this.isDamaged  = true;
        this.allowInput = false;
        this.doHorizontalVelocity = false;

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
                this.setCurrentAnimation(12);
                this.hVelocity = -Player.H_VELOCITY_HIT * secondsElapsed;
                break;

            case Player.DMG_LEFT_FRONT:
                this.setCurrentAnimation(10);
                this.hVelocity = Player.H_VELOCITY_HIT * secondsElapsed;
                break;

            case Player.DMG_RIGHT_FRONT:
                this.setCurrentAnimation(11);
                this.hVelocity = -Player.H_VELOCITY_HIT * secondsElapsed;
                break;

            case Player.DMG_RIGHT_BACK:
                this.setCurrentAnimation(13);
                this.hVelocity = Player.H_VELOCITY_HIT * secondsElapsed;
                break;
        }

        this.currentAnimation.startFrame = 1;
        this.didHit = false;

	// JUMP
    } else if(!this.onGround) {
        (this.dirX == Entity.DIR_LEFT) ? this.setCurrentAnimation(Player.JUMP_LEFT) : this.setCurrentAnimation(Player.JUMP_RIGHT);

    // ATTACK
    } else if(this.isAttacking) {
        if(this.dirX == Entity.DIR_LEFT) {
            this.currentSwordAnim.play(this.swordAnimations[Player.SWORD_LEFT]);
            this.setCurrentAnimation(
                6,
                function() {
                    self.onAttackComplete();
                },
                function(frameIndex) {
                    self.onAttackFrame(frameIndex);
                }
            );

        } else {
            this.currentSwordAnim.play(this.swordAnimations[Player.SWORD_RIGHT]);
            this.setCurrentAnimation(
                7,
                function() {
                    self.onAttackComplete();
                },
                function(frameIndex) {
                    self.onAttackFrame(frameIndex);
                }
            );
        }

	// WALK
	} else if(this.moveX < 0) {
		this.setCurrentAnimation(4);

	} else if(this.moveX > 0) {
		this.setCurrentAnimation(5);

    } else if(this.isDucking) {
        (this.dirX == Entity.DIR_LEFT) ?  this.setCurrentAnimation(Player.DUCK_LEFT) : this.setCurrentAnimation(Player.DUCK_RIGHT);

	// IDLE
	} else {
        (this.dirX == Entity.DIR_LEFT) ? this.setCurrentAnimation(Player.IDLE_LEFT) : this.setCurrentAnimation(Player.IDLE_RIGHT);
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
