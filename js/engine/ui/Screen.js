/**
 * User: shaun
 * Date: 9/3/13 7:23 PM
 */


RETRO.Engine.Screen = (function() {

    function Screen(config) {
        config          = RETRO.def(config, {});
        this.uiElements = [];
        this.color      = RETRO.def(config.color, "#000000");
        this.center     = RETRO.def(config.center, false);
        this.topMargin  = RETRO.def(config.topMargin, 0);
        this.leftMargin = RETRO.def(config.leftMargin, 0);
    }

    Screen.prototype.add = function(uiElement) {
        if(uiElement instanceof RETRO.Engine.UIObject) {
            this.uiElements.push(uiElement);
        }
    };

    Screen.prototype.draw = function(context, width, height) {
        var uiElements = this.uiElements,
            elementCount = uiElements.length,
            x = 0, y = 0,
            uiElement;

        for(var i = 0; i < elementCount; i++) {
            uiElement = uiElements[i];

            x = (this.center) ? ((width - this.leftMargin) / 2) - (uiElement.getWidth() / 2) : 0;
            y = 0;

            x += this.leftMargin;
            y += this.topMargin;

            uiElement.x = x;
            uiElement.y = y;
            uiElement.draw(context);
        }
    };

    return Screen;

})();
