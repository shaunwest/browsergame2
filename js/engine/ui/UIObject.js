/**
 * User: shaun
 * Date: 9/3/13 7:54 PM
 */

RETRO.Engine.UIObject = (function() {

    function UIObject(x, y) {
        this.x = RETRO.def(x, 0);
        this.y = RETRO.def(y, 0);

        this.finalX = this.x;
        this.finalY = this.y;
    }

    UIObject.prototype.draw = function(context) {
    };

    UIObject.prototype.getWidth = function() {
        return 0;
    };

    UIObject.prototype.getHeight = function() {
        return 0;
    };

    return UIObject;
})();
