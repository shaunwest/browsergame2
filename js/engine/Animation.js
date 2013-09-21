/**
 * @author shaun
 */

RETRO.Animation = (function(){
    Animation.DEFAULT_SPRITE_SIZE = 48;

    function Animation(spriteSheet, row, spriteSize, delay) {
        this.delay          = RETRO.def(delay, 1);
        this.spriteSheet    = spriteSheet;
        this.row            = RETRO.def(row, 0);
        this.spriteSize     = RETRO.def(spriteSize, Animation.DEFAULT_SPRITE_SIZE);

        if(spriteSheet) {
            this.parseSheet(spriteSheet, row);
        } else {
            this.frames = [null];
        }
    }

    Animation.prototype.parseSheet = function(spriteSheet, row) {
        var frameCount = spriteSheet.width / this.spriteSize;

        this.frames = [];
        for(var j = 0; j < frameCount; j++) {
            var frame = document.createElement("canvas");
            frame.width = this.spriteSize;
            frame.height = this.spriteSize;

            var frameContext = frame.getContext('2d');
            frameContext.drawImage(spriteSheet, j * this.spriteSize, row * this.spriteSize,
                this.spriteSize, this.spriteSize,
                0, 0,
                this.spriteSize, this.spriteSize);

            if(!this.isBlank(frameContext)) {
                this.frames.push(frame);
            }
        }
    };

    Animation.prototype.flip = function() {
        var reversedFrames = [];

        for(var i = 0; i < this.frames.length; i++) {
            var frame = this.frames[i];

            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            context.translate(frame.width, 0);
            context.scale(-1, 1);
            context.drawImage(frame, 0, 0);

            reversedFrames.push(canvas);
        }

        var animation = new Animation(this.spriteSheet, this.row, this.spriteSize, this.delay);
        animation.frames = reversedFrames;

        return animation;
    }

    Animation.prototype.getFrame = function(frameNumber) {
        return this.frames[frameNumber];
    };

    Animation.prototype.isBlank = function(context) {
        var imageData = context.getImageData(0, 0, this.spriteSize, this.spriteSize);

        for(var i = 0; i < imageData.height; i++) {
            for(var j = 0; j < imageData.width; j++) {
                var index=(j*4)*imageData.width+(i*4);
                var alpha = imageData.data[index + 3];
                if(alpha != 0) {
                    return false;
                }
            }
        }

        return true;
    };

    return Animation;
})();