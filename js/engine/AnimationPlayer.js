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
        this.frameSpeedMult     = 62.5;
        this.reset();
    }

    AnimationPlayer.prototype.step = function(secondsElapsed) {
        if(this.currentStep >= this.animation.delay) {
            if(this.onFrameComplete) {
                this.onFrameComplete(this.currentFrame);
            }

            this.currentFrame++;

            if(this.currentFrame >= this.animation.frames.length) {
                this.currentFrame = this.startFrame;
                if(this.onComplete) {
                    this.onComplete();
                    this.onComplete = null; // FIXME: shouldn't onComplete fire on every complete loop?
                }
            }
            this.currentStep = 0;

        } else {
            this.currentStep += (secondsElapsed * this.frameSpeedMult);
        }
    };

    AnimationPlayer.prototype.reset = function() {
        this.startFrame = 0;
        this.currentFrame = 0;
        this.currentStep = 0;
    };


    AnimationPlayer.prototype.play = function(animation, onComplete, onFrameComplete) {
        if(animation !== this.animation) {
            this.reset();
            this.animation          = animation;
            this.onFrameComplete    = onFrameComplete;
            this.onComplete         = onComplete;

            if(this.onAnimationChange) {
                this.onAnimationChange(animation);
            }
        }
    };

    AnimationPlayer.prototype.playFrame = function(frame) {
        this.currentFrame = frame;
    };


    AnimationPlayer.prototype.getCurrentFrame = function() {
        return this.animation.getFrame(this.currentFrame);
    };

    return AnimationPlayer;
})();