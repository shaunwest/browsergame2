/**
 * @author shaun
 */

RETRO.PhysicsEntity = (function() {

    RETRO.extend(RETRO.Entity, PhysicsEntity);

    function PhysicsEntity(animations, def) {
        RETRO.Entity.call(this, animations, def);

        // FIXME: these defaults are completely wrong. Need to account for secondsElapsed...
        this.vMaxVelocity           = 3;
        this.hMaxVelocity           = 3;

        this.vComputedMaxVelocity   = 0;
        this.hComputedMaxVelocity   = 0;

        this.vAcceleration          = 0.5;
        this.hAcceleration          = 0.5;

        this.doVerticalVelocity     = true;
        this.doHorizontalVelocity   = true;
    }

    PhysicsEntity.prototype.calculateVerticalVelocity = function(secondsElapsed) {
        var vAccel = (this.vAcceleration * secondsElapsed),
            vComputedMaxVel = (this.vMaxVelocity * secondsElapsed);

        if(this.doMoveY) {
            if(this.dirY > 0) {
                this.vVelocity += vAccel;
                if(this.vVelocity > vComputedMaxVel) {
                    this.vVelocity = vComputedMaxVel;
                }

            } else if(this.dirY < 0) {
                this.vVelocity -= vAccel;
                if(this.vVelocity < -vComputedMaxVel) {
                    this.vVelocity = -vComputedMaxVel;
                }
            }

        } else {
            if(Math.abs(this.vVelocity) > 0) {
                this.vVelocity += (-this.dirY * vAccel);
                if((this.dirY > 0 && this.vVelocity < 0) || (this.dirY < 0 && this.vVelocity > 0)) {
                    this.vVelocity = 0;
                }
            }
        }

        this.vComputedMaxVelocity = vComputedMaxVel;
    };

    PhysicsEntity.prototype.calculateHorizontalVelocity = function(secondsElapsed) {
        var hAccel = this.hAcceleration * secondsElapsed,
            hComputedMaxVel = this.hMaxVelocity * secondsElapsed;

        if(this.doMoveX) {
            if(this.dirX > 0) {
                this.hVelocity += hAccel;
                if(this.hVelocity > hComputedMaxVel) {
                    this.hVelocity = hComputedMaxVel;
                }

            } else if(this.dirX < 0) {
                this.hVelocity -= hAccel;
                if(this.hVelocity < -hComputedMaxVel) {
                    this.hVelocity = -hComputedMaxVel;
                }
            }

        } else {
            if(Math.abs(this.hVelocity) > 0) {
                this.hVelocity += (-this.dirX * hAccel);
                if((this.dirX > 0 && this.hVelocity < 0) || (this.dirX < 0 && this.hVelocity > 0)) {
                    this.hVelocity = 0;
                }
            }
        }

        this.hComputedMaxVelocity = hComputedMaxVel;
    };

    PhysicsEntity.prototype.cancelHorizontalMovement = function() {
        this.moveX = 0;
        this.hVelocity = 0;
    };

    PhysicsEntity.prototype.cancelVerticalMovement = function() {
        this.moveY = 0;
        this.vVelocity = 0;
    };

    PhysicsEntity.prototype.updateStart = function(secondsElapsed) {
        PhysicsEntity.base.updateStart.call(this, secondsElapsed);
        //this.currentAnimation.step();

        this.haltXDir = 0;
        this.haltYDir = 0;

        if(this.doVerticalVelocity) {
            this.calculateVerticalVelocity(secondsElapsed);
        }

        if(this.doHorizontalVelocity) {
            this.calculateHorizontalVelocity(secondsElapsed);
        }

        //this.moveY = (this.vVelocity >= 0) ? Math.floor(this.vVelocity) : Math.ceil(this.vVelocity);
        //this.moveX = (this.hVelocity >= 0) ? Math.floor(this.hVelocity) : Math.ceil(this.hVelocity);

        this.moveY = Math.round(this.vVelocity);
        this.moveX = Math.round(this.hVelocity);
        //console.log(this.vVelocity + "; " +this.moveY);
    };

    PhysicsEntity.prototype.levelCollisionX = function(direction, tileDef) {
        PhysicsEntity.base.levelCollisionX.call(this, direction, tileDef);

        this.hVelocity = 0;
    };

    PhysicsEntity.prototype.levelCollisionY = function(direction, tileDef) {
        PhysicsEntity.base.levelCollisionY.call(this, direction, tileDef);

        this.vVelocity = 0;
    };

    return PhysicsEntity;
})();