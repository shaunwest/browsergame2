/**
 * @author shaun
 */

function AnimationPlayer(animation) {
	this.animation          = animation;
    this.onComplete         = null;
    this.onFrameComplete    = null;

	this.reset();
}

AnimationPlayer.prototype.step = function() {
    if(this.currentStep >= this.animation.delay) {
        if(this.onFrameComplete) {
            this.onFrameComplete(this.currentFrame);
        }

        this.currentFrame++;

		if(this.currentFrame >= this.animation.frames.length) {
			this.currentFrame = 0;
            if(this.onComplete) {
                this.onComplete();
                this.onComplete = null; // FIXME: shouldn't onComplete fire on every complete loop?
            }
		}
		this.currentStep = 0;
	
	} else {
		this.currentStep++;
	}
};

AnimationPlayer.prototype.reset = function() {
	this.currentFrame = 0;
	this.currentStep = 0;
};


AnimationPlayer.prototype.play = function(animation, onComplete, onFrameComplete) {
	if(animation !== this.animation) {
		this.reset();
		this.animation          = animation;
        this.onFrameComplete    = onFrameComplete;
        this.onComplete         = onComplete;
	}
};

		
AnimationPlayer.prototype.getCurrentFrame = function() {
	return this.animation.getFrame(this.currentFrame);
};
