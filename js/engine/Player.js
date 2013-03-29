/**
 * @author shaun
 */
Player.VMAX_VELOCITY_NORMAL = 750; //12; //15;
Player.HMAX_VELOCITY_NORMAL = 312; //5; //9;
Player.VACCEL_NORMAL = 36; // Acceleration per second
Player.HACCEL_NORMAL = 20; //25; //45; //90; // Acceleration per second
Player.H_VELOCITY_HIT = 156;

Player.IDLE_LEFT    = 0;
Player.IDLE_RIGHT   = 1;
Player.SWORD_LEFT   = 0;
Player.SWORD_RIGHT  = 1;

Player.HIT_FRAME    = 0;

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
    this.isHitting          = false;

    this.swordAnimations    = [
        this.getAnimation(14),
        this.getAnimation(15)
    ];

    this.currentSwordAnim   = new AnimationPlayer(this.swordAnimations[Player.SWORD_LEFT]);
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

    return currentFrames;
};

Player.prototype.updateStart = function(secondsElapsed) {
    Player.base.updateStart.call(this, secondsElapsed);

    if(this.isAttacking) {
        this.currentSwordAnim.step();
    }
};

Player.prototype.updateEnd = function(secondsElapsed) {
	Player.base.updateEnd.call(this, secondsElapsed);

    var self = this;

	this.walkMode();

    // HIT
    if(this.isHit) {
        this.isHit      = false;
        this.isDamaged  = true;
        this.allowInput = false;
        this.doHorizontalVelocity = false;

        this.setTimer(1, function() {
            self.onDamagedComplete();
        });

        this.setRepeater(0.016, function() {
           self.onFlicker();
        });

    // DAMAGED
    } else if(this.isDamaged && this.dirX == Entity.DIR_LEFT) {
        if(this.lastIntersection.x > 0) {
            this.setCurrentAnimation(12);
            this.hVelocity = -Player.H_VELOCITY_HIT * secondsElapsed;
        } else {
            this.setCurrentAnimation(10);
            this.hVelocity = Player.H_VELOCITY_HIT * secondsElapsed;
        }

    } else if(this.isDamaged && this.dirX == Entity.DIR_RIGHT) {
        if(this.lastIntersection.x > 0) {
            this.setCurrentAnimation(11);
            this.hVelocity = -Player.H_VELOCITY_HIT * secondsElapsed;
        } else {
            this.setCurrentAnimation(13);
            this.hVelocity = Player.H_VELOCITY_HIT * secondsElapsed;
        }

	// JUMP
    } else if(!this.onGround && this.dirX == Entity.DIR_LEFT) {
		this.setCurrentAnimation(2);
	} else if(!this.onGround && this.dirX == Entity.DIR_RIGHT) {
		this.setCurrentAnimation(3);

    // ATTACK
    } else if(this.isAttacking && this.dirX == Entity.DIR_LEFT) {
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

    } else if(this.isAttacking && this.dirX == Entity.DIR_RIGHT) {
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

	// WALK
	} else if(this.moveX < 0) {
		this.setCurrentAnimation(4);
	} else if(this.moveX > 0) {
		this.setCurrentAnimation(5);

    } else if(this.isDucking && this.dirX == Entity.DIR_LEFT) {
        this.setCurrentAnimation(8);
    } else if(this.isDucking && this.dirX == Entity.DIR_RIGHT) {
        this.setCurrentAnimation(9);

	// IDLE
	} else if(this.dirX == Entity.DIR_LEFT) {
		this.setCurrentAnimation(Player.IDLE_LEFT);
	} else {
		this.setCurrentAnimation(Player.IDLE_RIGHT);
	}
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
};

Player.prototype.onFlicker = function() {
    this.isVisible = !this.isVisible;
};

Player.prototype.onDamagedComplete = function() {
    this.isDamaged      = false;
    this.isVisible      = true;
    this.allowInput     = true;
    this.doHorizontalVelocity = true;
    this.cancelRepeater();
};

Player.prototype.levelCollisionY = function(direction, tileDef) {
	Player.base.levelCollisionY.call(this, direction, tileDef);
};
