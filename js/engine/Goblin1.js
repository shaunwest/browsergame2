/**
 * @author shaun
 */

function Goblin1(animations, def) {
	if (arguments[0] === inheriting) return;
	
	PhysicsEntity.call(this, animations, def);

	this.onGround               = false;
	
	this.bounds                 = {left: 30, top: 15, right: 30, bottom: 0};
			
	this.doMoveY                = true;
	this.doMoveX                = true;
    this.doHorizontalVelocity   = false;  // don't do physics for h-vel
	this.vMaxVelocity           = 750;
	this.hMaxVelocity           = 312; // don't need
    //this.hVelocity = 312; //5;
	this.dirX                   = -1;
	this.vAcceleration          = 36;
    this.hAcceleration          = 20; // don't need
    this.isHit                  = false;
    this.isDead                 = false;
    this.isDamaged              = false;
}

Goblin1.prototype = new PhysicsEntity(inheriting);
Goblin1.prototype.constructor = PhysicsEntity;
Goblin1.base = PhysicsEntity.prototype;

Goblin1.prototype.updateEnd = function(secondsElapsed) {
    Goblin1.base.updateEnd.call(this, secondsElapsed);

    var self = this;

    /*if(this.isHit && !this.isDead) {
        this.isHit = false;
        this.isDead = true;
        this.dirX = -this.dirX;
        this.vVelocity = (-375 * secondsElapsed);
        this.levelCollisions = 0;
    }*/

    if(this.isHit) {
        this.isHit      = false;
        this.isDamaged  = true;
        this.vVelocity = (-375 * secondsElapsed);

        this.setTimer(0.5, function() {
            self.onDamagedComplete();
        });
    }

    if(this.isDead) {
        if(this.dirX == -1) {
            this.setCurrentAnimation(5);
        } else {
            this.setCurrentAnimation(4);
        }

    } else if(this.isDamaged) {
        if(this.dirX == Entity.DIR_LEFT) {
            this.setCurrentAnimation(6);
        } else {
            this.setCurrentAnimation(7);
        }

    } else {
        // WALK
        if(this.moveX < 0) {
            this.setCurrentAnimation(2);
        } else if(this.moveX > 0) {
            this.setCurrentAnimation(3);

            // IDLE
        } else if(this.dirX == -1) {
            this.setCurrentAnimation(0);
        } else {
            this.setCurrentAnimation(1);
        }
    }

    // Manually set a constant velocity
    if(this.doMoveX) {
        if(this.isDamaged) {
            if(this.dirX == -1) {
                if(this.lastHitIntersection.x > 0) {
                    this.hVelocity = 312 * secondsElapsed;
                } else {
                    this.hVelocity = -312 * secondsElapsed;
                }
            } else {
                if(this.lastHitIntersection.x > 0) {
                    this.hVelocity = 312 * secondsElapsed;
                } else {
                    this.hVelocity = -312 * secondsElapsed;
                }
            }

        } else {
            this.hVelocity = 312 * this.dirX * secondsElapsed;
        }
    }
};

Goblin1.prototype.onDamagedComplete = function() {
    this.isDamaged = false;
};

Goblin1.prototype.levelCollisionX = function(direction, tileDef) {
    Goblin1.base.levelCollisionX.call(this, direction, tileDef);
	
	this.dirX = -this.dirX;
};



