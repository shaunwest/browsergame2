/**
 * @author shaun
 */

ULTRADIAN.Goblin = (function() {

    RETRO.extend(RETRO.PhysicsEntity, Goblin1);

    function Goblin1(animations, def) {
        RETRO.PhysicsEntity.call(this, animations, def);

        this.onGround               = false;

        this.boundsDefinition       = {left: 30, top: 15, right: 30, bottom: 0};

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
            (this.dirX == Entity.DIR_LEFT) ? this.playAnimation(5) : this.playAnimation(4);

        } else if(this.isDamaged) {
            (this.dirX == Entity.DIR_LEFT) ? this.playAnimation(6) : this.playAnimation(7);

        } else {
            // WALK
            if(this.moveX != 0) {
                (this.dirX == Entity.DIR_LEFT) ? this.playAnimation(2) :  this.playAnimation(3);

                // IDLE
            } else {
                (this.dirX == Entity.DIR_LEFT) ? this.playAnimation(0) : this.playAnimation(1);
            }
        }

        // Manually set a constant velocity
        if(this.doMoveX) {
            if(this.isDamaged) {
                if(this.lastHitIntersection.x > 0) {
                    this.hVelocity = 312 * secondsElapsed;
                } else {
                    this.hVelocity = -312 * secondsElapsed;
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

        if(!this.isDamaged) {
            this.dirX = -this.dirX;
        }
    };

})();



