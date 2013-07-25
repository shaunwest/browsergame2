/**
 * User: shaun
 * Date: 7/18/13 3:45 PM
 */

Chrono.ONE_SECOND = 1000;

function Chrono(targetFps, updateFunc, drawFunc) {
    this.targetFps      = targetFps;
    this.updateFunc     = updateFunc;
    this.drawFunc       = drawFunc;
    this.frameFunc      = Util.call(this, this.frame);
    this.fps            = 0;
    this.ticks          = 0;
    this.frameCount     = 1;
    this.maxFrameCount  = 30;
    this.elapsedTotal   = 0;
    this.lastUpdateTime = new Date();
    this.averageElapsed = 0;
    this.elapsedSeconds = 0;
    this.elapsedMin     = 1;
    this.elapsedMax     = 0;
    this.frameLength    = Math.floor(Chrono.ONE_SECOND / this.targetFps);
    this.frameLengthSec = this.frameLength / Chrono.ONE_SECOND;
    this.frameTimerId   = 0;
    this.oneSecTimerId  = 0;
    this.running        = false;
    this.accumulator    = 0.0;
    this.maxFrameLength = this.frameLengthSec * 2;

    this.initRequestAnimationFrame(this.frameLength);
}

Chrono.prototype.start = function() {
    this.running = true;
    this.oneSecTimerId = window.setInterval(Util.call(this, this.oneSecondTick), Chrono.ONE_SECOND);
    this.frame();
};

Chrono.prototype.stop = function() {
    this.running = false;
    window.clearInterval(this.oneSecTimerId);
    window.cancelAnimationFrame(this.frameTimerId);
};

Chrono.prototype.frame = function() {
    var now = +new Date(),
        secondsElapsed = (now - this.lastUpdateTime) / Chrono.ONE_SECOND,
        deltaTime,
        alpha;

    /*if(secondsElapsed > this.maxFrameLength) {
        secondsElapsed = this.maxFrameLength;
    }*/

    this.lastUpdateTime = now;
    /*this.accumulator += secondsElapsed;

    while (this.accumulator >= this.frameLengthSec)
    {
        this.updateFunc(this.frameLengthSec);
        this.accumulator -= this.frameLengthSec;
    }

    alpha = this.accumulator / this.frameLengthSec;

    this.drawFunc(alpha);*/


    /*while (secondsElapsed > 0.0) {
        console.log(secondsElapsed);
        deltaTime = Math.min(secondsElapsed, this.frameLengthSec);
        this.updateFunc(deltaTime);

        secondsElapsed -= deltaTime;
    }

    this.drawFunc();*/


    /*if(this.elapsedSeconds > 0) {
        this.elapsedMin = Math.min(secondsElapsed, this.elapsedMin);
        this.elapsedMax = Math.max(secondsElapsed, this.elapsedMax);
    }*/
    secondsElapsed = this.getAverageElapsed(secondsElapsed);

    this.updateFunc(secondsElapsed);
    this.drawFunc();

    this.ticks++;

    if(this.running) {
        this.frameTimerId = window.requestAnimationFrame(this.frameFunc);
    }
};

Chrono.prototype.getAverageElapsed = function(elapsedSeconds) {
    if(++this.frameCount == this.maxFrameCount + 1) {
        this.averageElapsed = this.elapsedTotal / this.frameCount;
        this.frameCount = 1;
        this.elapsedTotal = 0;
    }

    this.elapsedTotal += elapsedSeconds;

    return (this.averageElapsed == 0) ? elapsedSeconds : this.averageElapsed;
};

Chrono.prototype.oneSecondTick = function() {
    this.fps = this.ticks.toString();
    this.ticks = 0;
    this.elapsedSeconds++;
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
