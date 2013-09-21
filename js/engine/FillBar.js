/**
 * User: shaun
 * Date: 9/21/13 6:04 PM
 */

RETRO.FillBar = (function() {

    function FillBar(width, height, fillMax) {
        this.width          = RETRO.def(width, 96);
        this.height         = RETRO.def(height, 1);
        this.fillMax        = RETRO.def(fillMax, 100);
        this.fillRatio      = this.width / this.fillMax;
        this.canvas         = document.createElement('canvas');
        this.canvas.width   = this.width + 6;
        this.canvas.height  = this.height + 6;
        this.context        = this.canvas.getContext('2d');
        this.lastFillAmount = -1;

        this.context.beginPath();
        this.context.rect(0, 0, this.width + 6, this.height + 6);
        this.context.fillStyle = '#2C2C2C';
        this.context.fill();
    }

    FillBar.prototype.getImage = function(fillAmount) {
        if(fillAmount !== this.lastFillAmount) {
            this.lastFillAmount = fillAmount;
            return this._createImage(fillAmount);
        } else {
            return this.canvas;
        }
    };

    FillBar.prototype._createImage = function(fillAmount) {
        var context = this.context,
            filledWidth =  Math.round(Math.min(fillAmount, this.fillMax) * this.fillRatio),
            emptyWidth = this.width - filledWidth,
            height  = this.height;

        context.beginPath();
        context.rect(3, 3, filledWidth, height);
        context.fillStyle = '#00A800';
        context.fill();

        context.beginPath();
        context.rect(filledWidth + 3, 3, emptyWidth, height);
        context.fillStyle = '#E46018';
        context.fill();

        return this.canvas;
    };

    return FillBar;

})();
