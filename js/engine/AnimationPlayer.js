/**
 * @author shaun
 */

function AnimationPlayer(animation) {
	this.animation = animation;

	this.reset();
}

AnimationPlayer.prototype.step = function() {
	if(this.currentStep >= this.animation.delay) {
		this.currentFrame++;
		
		if(this.currentFrame >= this.animation.frames.length) {
			this.currentFrame = 0;
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


AnimationPlayer.prototype.play = function(animation) {
	if(animation !== this.animation) {
		this.reset();
		this.animation = animation;
	}
};

		
AnimationPlayer.prototype.getCurrentFrame = function() {
	return this.animation.getFrame(this.currentFrame);
};
