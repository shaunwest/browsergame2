/**
 * User: shaun
 * Date: 9/21/13 8:23 PM
 */

RETRO.Auto = (function() {

    Auto.DEFAULT_SPEED      = 1;

    function Auto() {
        this._targetEntity  = null;
        this._points        = [];
        this._currentPoint  = null;
        this._distanceX     = 0;
        this._distanceY     = 0;
        this._active        = false;
        this._complete      = null;
        this._speed         = Auto.DEFAULT_SPEED;
    }

    Auto.prototype.setTarget = function(entity, speed, complete) {
        this._targetEntity = entity;
        this._complete = complete;
        this._points.length = 0;
        this._speed = RETRO.def(speed, Auto.DEFAULT_SPEED);
    };

    Auto.prototype.addPoint = function(x, y) {
        if(this._targetEntity) {
            this._points.push({x: x, y: y});
            this._active = true;

        } else {
            RETRO.log("RETRO::Auto: target entity not set.");
        }
    };

    Auto.prototype.update = function() {
        if(this._active) {
            this._update();
        }
    };

    Auto.prototype._update = function() {
        var target = this._targetEntity,
            currentPoint = this._currentPoint,
            distanceX = this._distanceX,
            distanceY = this._distanceY,
            speed = this._speed;

        if(!currentPoint || (distanceX <= 0 && distanceY <= 0)) {
            currentPoint = this._points.shift();
            if(currentPoint) {
                this._currentPoint = currentPoint;
                this._distanceX = Math.abs(currentPoint.x - target.x);
                this._distanceY = Math.abs(currentPoint.y - target.y);

            } else { // All done!
                this._active = false;
                if(typeof this._complete === "function") {
                    this._complete();
                }
            }

        } else {
            if(target.x < currentPoint.x) {
                target.x += speed;
                distanceX -= speed;
            } else if(target.x > currentPoint.x) {
                target.x -= speed;
                distanceX -= speed;
            }

            if(target.y < currentPoint.y) {
                target.y += speed;
                distanceY -= speed;
            } else if(target.y > currentPoint.y) {
                target.y -= speed;
                distanceY -= speed;
            }

            this._distanceX = distanceX;
            this._distanceY = distanceY;
        }
    };


    return Auto;

})();
