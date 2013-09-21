/**
 * User: shaun
 * Date: 9/3/13 7:23 PM
 */


RETRO.UI.Screen = (function() {

    function Screen(config) {
        config          = RETRO.def(config, {});
        this.uiElements = [];
        this.color      = RETRO.def(config.color, null);    // null color means 'transparent'
        this.center     = RETRO.def(config.center, false);
        this.topMargin  = RETRO.def(config.topMargin, 0);
        this.leftMargin = RETRO.def(config.leftMargin, 0);
    }

    Screen.prototype.add = function(uiElement) {
        if(uiElement instanceof RETRO.UI.UIObject) {
            this.uiElements.push(uiElement);
        } else {
            RETRO.log("RETRO::UI::Screen: Screen element must be of type 'UIObject'.");
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
