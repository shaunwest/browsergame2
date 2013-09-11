/**
 * @author shaun
 */

RETRO.Entity = (function() {

    Entity.DIR_LEFT     = -1;
    Entity.DIR_RIGHT    = 1;
    Entity.DIR_UP       = -1;
    Entity.DIR_DOWN     = 1;

    function Entity(animations, def) {
        this.x                  = 0;
        this.y                  = 0;

        this.moveX              = 0;
        this.moveY              = 0;

        this.doMoveX            = false;
        this.doMoveY            = false;

        this.hVelocity          = 0.0;
        this.vVelocity          = 0.0;

        this.dirX               = Entity.DIR_RIGHT;
        this.dirY               = Entity.DIR_DOWN;

        this.haltXDir           = 0;
        this.haltYDir           = 0;

        this.animations         = animations;
        this.size               = def['width'];

        this.boundsDefinition   = {left: 0, top: 0, right: 0, bottom: 0};
        this.attackBounds       = {left: 0, top: 0, width: 34, height: 48};

        this.type               = def['type'];
        this.levelCollisions    = def['levelCollisions'];
        this.entityCollisions   = def['entityCollisions'];
        this.resolveCollisions  = def['resolveCollisions'];

        this.lastIntersectionX  = 0;
        this.lastIntersectionY  = 0;
        this.lastHitIntersection= null;
        this.lastAttackIntersection = null;

        this.timerCount         = 0;
        this.timerFunc          = null;

        this.repeaterCount      = 0;
        this.repeaterTarget     = 0;
        this.repeaterFunc       = null;

        this.isAttacking        = false;
        this.isVisible          = true;

        var animation           = (animations) ? animations[0] : new RETRO.Animation();

        this.currentAnimation   = new RETRO.AnimationPlayer(animation);
    }

    Entity.prototype.boundsLeft = function() {
        return this.x + this.boundsDefinition.left;
    };

    Entity.prototype.boundsTop = function() {
        return this.y + this.boundsDefinition.top;
    };

    Entity.prototype.boundsRight = function() {
        return this.x + (this.size - this.boundsDefinition.right);
    };

    Entity.prototype.boundsBottom = function() {
        return this.y + (this.size - this.boundsDefinition.bottom);
    };

    Entity.prototype.adjustedAttackBounds = function() {
        /*if(this.dirX == Entity.DIR_RIGHT) {
            return {
                left: this.x + this.size + this.attackBounds.left,
                top: this.y + this.attackBounds.top,
                right: this.x + this.size + this.attackBounds.width,
                bottom: this.y + this.attackBounds.top + this.attackBounds.height
            };

        } else {    // left
            return {
                left: this.x - this.attackBounds.width + this.attackBounds.left,
                top: this.y + this.attackBounds.top,
                right: this.x,
                bottom: this.y + this.attackBounds.top + this.attackBounds.height
            };
        }*/
        return {
            left: this.x + this.attackBounds.left,
            top: this.y + this.attackBounds.top,
            right: this.x + this.attackBounds.left + this.attackBounds.width,
            bottom: this.y + this.attackBounds.top + this.attackBounds.height
        };
    };

    Entity.prototype.intersects = function(entity) {
        if(entity.boundsLeft() > this.boundsRight() ||
            entity.boundsRight() < this.boundsLeft() ||
            entity.boundsTop() > this.boundsBottom() ||
            entity.boundsBottom() < this.boundsTop()) {
            return false;

        } else {
            this.lastIntersectionX = entity.x - this.x;
            this.lastIntersectionY = entity.y - this.y;
            return true;
        }
    };

    Entity.prototype.attackIntersects = function(entity) {
        if(this.isAttacking || this.isDownThrusting) { // TODO hmm
            var attackBounds    = this.adjustedAttackBounds();
            //var bounds2         = entity.adjustedBounds();

            if(entity.boundsLeft() > attackBounds.right ||
                entity.boundsRight() < attackBounds.left ||
                entity.boundsTop() > attackBounds.bottom ||
                entity.boundsBottom() < attackBounds.top) {
                return null;

            } else {
                return {
                    x: (entity.x - this.x),
                    y: (entity.y - this.y)
                };
            }
        }

        return null;
    };

    Entity.prototype.levelCollisionX = function(direction, tileDef) {
        this.moveX = 0;
        this.haltXDir = direction;
    };

    Entity.prototype.levelCollisionY = function(direction, tileDef) {
        this.moveY = 0;
        this.haltYDir = direction;
    };

    Entity.prototype.setCurrentAnimation = function(index, onComplete, onFrameComplete) {
        this.currentAnimation.play(this.animations[index], onComplete, onFrameComplete);
    };

    Entity.prototype.getAnimation = function(index) {
        if(this.animations[index]) {
            return this.animations[index];
        }

        return null;
    };

    Entity.prototype.getCurrentFrames = function() {
        return [
            {
             'x': this.x,
             'y': this.y,
             'image': this.currentAnimation.getCurrentFrame()
            }
        ];
    };

    Entity.prototype.setTimer = function(seconds, callback) {
        this.timerCount = seconds;
        this.timerFunc  = callback;
    };

    Entity.prototype.setRepeater = function(seconds, callback) {
        this.repeaterTarget = seconds;
        this.repeaterCount  = 0;
        this.repeaterFunc   = callback;
    };

    Entity.prototype.cancelRepeater = function() {
        this.repeaterCount  = 0;
        this.repeaterTarget = 0;
        this.repeaterFunc   = null;
    };

    // Called before collision checks, before entity position is
    // updated and before view position is updated
    Entity.prototype.updateStart = function(secondsElapsed) {
        this.currentAnimation.step(secondsElapsed);

        this.haltXDir = 0;
        this.haltYDir = 0;
    };

    // Called after collision checks, after entity position is
    // updated and after view position is updated
    Entity.prototype.updateEnd = function(secondsElapsed) {
        // Manage timer
        if(this.timerFunc) {
            if(this.timerCount > 0) {
                this.timerCount -= secondsElapsed;

            } else if(this.timerCount <= 0) {
                this.timerCount = 0;
                this.timerFunc();
                this.timerFunc = null;
            }
        }

        // Manage repeater
        if(this.repeaterFunc) {
            if(this.repeaterCount < this.repeaterTarget) {
                this.repeaterCount += secondsElapsed;

            } else if(this.repeaterCount >= this.repeaterTarget) {
                this.repeaterFunc();
                this.repeaterCount = 0;
            }
        }
    };

    return Entity;
})();
