/**
 * User: shaun
 * Date: 9/3/13 7:23 PM
 */


RETRO.Engine.Screen = (function(R) {

    function Screen(config) {
        config          = R.def(config, {});
        this.uiElements = [];
        this.color      = R.def(config.color, null);    // null color means 'transparent'
        this.center     = R.def(config.center, false);
        this.topMargin  = R.def(config.topMargin, 0);
        this.leftMargin = R.def(config.leftMargin, 0);
    }

    Screen.prototype.add = function(uiElement) {
        if(uiElement instanceof R.Engine.UIObject) {
            this.uiElements.push(uiElement);
        } else {
            R.log("RETRO::Engine::Screen: Screen element must be of type 'UIObject'.");
        }
    };

    Screen.prototype.draw = function(context, width, height) {
        var uiElements = this.uiElements,
            elementCount = uiElements.length,
            x = 0, y = 0,
            uiElement;

        if(this.color) {
            context.fillStyle = this.color;
            context.fillRect(0, 0, width, height);
        }

        for(var i = 0; i < elementCount; i++) {
            uiElement = uiElements[i];

            x = (this.center) ? ((width - this.leftMargin) / 2) - (uiElement.getWidth() / 2) : uiElement.x;
            y = uiElement.y;

            x += this.leftMargin;
            y += this.topMargin;

            uiElement.finalX = x;
            uiElement.finalY = y;
            uiElement.draw(context);
        }
    };

    return Screen;

})(RETRO);
