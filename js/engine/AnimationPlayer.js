/**
 * @author shaun
 */

RETRO.AnimationPlayer = (function(){

    function AnimationPlayer(animation) {
        this.animation          = animation;
        this.currentStep        = 0.0;
        this.onComplete         = null;
        this.onFrameComplete    = null;
        this.onAnimationChange  = null;
        this.startFrame         = 0;
        this.stopOnComplete     = false;
        this.playing            = false;
        this.frameSpeedMult     = 62.5;
        this.reset();
    }

    AnimationPlayer.prototype.step = function(secondsElapsed) {
        if(this.playing) {
            if(this.currentStep >= this.animation.delay) {
                if(this.onFrameComplete) {
                    this.onFrameComplete(this.currentFrame);
                }

                this.currentFrame++;

                if(this.currentFrame >= this.animation.frames.length) {
                    this.currentFrame = this.startFrame;
                    if(this.onComplete) {
                        this.onComplete();
                        //this.onComplete = null; // FIXME: shouldn't onComplete fire on every complete loop?
                    }

                    if(this.stopOnComplete) {
                        this.stop();
                    }
                }
                this.currentStep = 0;

            } else {
                this.currentStep += (secondsElapsed * this.frameSpeedMult);
            }
        }
    };

    AnimationPlayer.prototype.reset = function() {
        this.startFrame = 0;
        this.stopOnComplete = false;
        this.currentFrame = 0;
        this.currentStep = 0;
        this.onFrameComplete = null;
        this.onComplete = null;
    };


    AnimationPlayer.prototype.play = function(animation, onComplete, onFrameComplete) {
        if(animation !== this.animation) {
            this.reset();

            this.playing            = true;
            this.animation          = animation;
            this.onFrameComplete    = onFrameComplete;
            this.onComplete         = onComplete;

            if(this.onAnimationChange) {
                this.onAnimationChange(animation);
            }
        }
    };

    AnimationPlayer.prototype.playOnce = function(animation, onComplete, onFrameComplete) {
        this.play(animation, onComplete, onFrameComplete);
        this.stopOnComplete = true;
    };

    AnimationPlayer.prototype.stop = function() {
        this.playing = false;
        this.reset();
    };

    AnimationPlayer.prototype.pause = function() {
        this.playing = false;
    };

    AnimationPlayer.prototype.unpause = function() {
        this.playing = true;
    };

    AnimationPlayer.prototype.setFrame = function(frame) {
        this.currentFrame = frame;
    };


    AnimationPlayer.prototype.getCurrentFrame = function() {
        return this.animation.getFrame(this.currentFrame);
    };

    return AnimationPlayer;
})();