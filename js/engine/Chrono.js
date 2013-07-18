/**
 * User: shaun
 * Date: 7/18/13 3:45 PM
 */

Chrono.ONE_SECOND = 1000;

function Chrono(targetFps, updateFunc) {
    this.targetFps      = targetFps;
    this.updateFunc     = updateFunc;
    this.frameFunc      = Util.call(this, this.frame);
    this.fps            = 0;
    this.ticks          = 0;
    this.lastUpdateTime = new Date();
    this.secondsElapsed = 0;
    this.frameLength    = Math.floor(Chrono.ONE_SECOND / this.targetFps);
    this.frameTimerId   = 0;
    this.oneSecTimerId  = 0;

    this.initRequestAnimationFrame(this.frameLength);
}

Chrono.prototype.start = function() {
    this.oneSecTimerId = window.setInterval(Util.call(this, this.oneSecondTick), Chrono.ONE_SECOND);
    this.frame();
};

Chrono.prototype.stop = function() {
    window.clearInterval(this.oneSecTimerId);
    window.cancelAnimationFrame(this.frameTimerId);
};

Chrono.prototype.frame = function() {
    var now = new Date();

    this.secondsElapsed = (now - this.lastUpdateTime) / Chrono.ONE_SECOND;
    this.lastUpdateTime = now;
    this.updateFunc(this.secondsElapsed);
    this.ticks++;
    this.frameTimerId = window.requestAnimationFrame(this.frameFunc);
};

Chrono.prototype.oneSecondTick = function() {
    this.fps = this.ticks.toString();
    this.ticks = 0;
};

Chrono.prototype.initRequestAnimationFrame = function(frameLength) {
    var vendors = ['ms', 'moz', 'webkit', 'o'];

    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            return window.setTimeout(callback, frameLength);
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            window.clearTimeout(id);
        };
    }
};
